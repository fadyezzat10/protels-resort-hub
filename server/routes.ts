import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { pool, db } from "./db";
import { seedAdmin, seedContent, verifyPassword, hashPassword } from "./auth";
import { insertBlogPostSchema, pageVersions } from "@shared/schema";
import { eq } from "drizzle-orm";
import OpenAI from "openai";
import { createRequire } from "module";
const _require = createRequire(import.meta.url);
const { PDFParse } = _require("pdf-parse");
import { registerObjectStorageRoutes, ObjectStorageService } from "./replit_integrations/object_storage";

declare module "express-session" {
  interface SessionData {
    userId: number;
    username: string;
    role: string;
  }
}

const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  }),
  limits: { fileSize: 100 * 1024 * 1024 },
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const PgStore = connectPgSimple(session);
  app.use(
    session({
      store: new PgStore({ pool, createTableIfMissing: true }),
      secret: process.env.SESSION_SECRET || "protels-cms-secret-key-2024",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      },
    })
  );

  app.use("/uploads", async (req, res, next) => {
    const filePath = path.join(uploadDir, req.path);
    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }

    try {
      const objService = new ObjectStorageService();
      const fileName = req.path.startsWith("/") ? req.path.slice(1) : req.path;
      const file = await objService.searchPublicObject(fileName);
      if (file) {
        res.set({
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=86400",
        });
        return await objService.downloadObject(file, res, 86400);
      }
    } catch {}

    next();
  });

  Promise.all([seedAdmin(), seedContent()]).catch(err => {
    console.error("Seed error (non-fatal):", err);
  });

  registerObjectStorageRoutes(app);

  // Health
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/sitemap.xml", async (_req, res) => {
    const baseUrl = "https://protels.com";
    const staticPages = [
      { path: "/", priority: "1.0", changefreq: "weekly" },
      { path: "/hotels", priority: "0.9", changefreq: "weekly" },
      { path: "/about", priority: "0.7", changefreq: "monthly" },
      { path: "/contact", priority: "0.7", changefreq: "monthly" },
      { path: "/careers", priority: "0.6", changefreq: "monthly" },
      { path: "/gallery", priority: "0.6", changefreq: "monthly" },
      { path: "/blog", priority: "0.8", changefreq: "weekly" },
      { path: "/company-profile", priority: "0.6", changefreq: "monthly" },
    ];
    const hotelSlugs = ["crystal-beach", "beach-club", "la-plage", "royal-bay"];
    const today = new Date().toISOString().split("T")[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    for (const page of staticPages) {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}${page.path}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += `  </url>\n`;
    }

    for (const slug of hotelSlugs) {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/hotels/${slug}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    }

    const publishedPosts = (await storage.getBlogPosts()).filter(p => p.status === "published");
    for (const post of publishedPosts) {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/blog/${post.slug}</loc>\n`;
      xml += `    <lastmod>${post.updatedAt ? new Date(post.updatedAt).toISOString().split("T")[0] : today}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.7</priority>\n`;
      xml += `  </url>\n`;
    }

    xml += `</urlset>`;

    res.set("Content-Type", "application/xml");
    res.send(xml);
  });

  // ──────── AUTH ────────
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) return res.status(400).json({ message: "Username and password required" });
      const user = await storage.getUserByUsername(username);
      if (!user) return res.status(401).json({ message: "Invalid credentials" });
      const valid = await verifyPassword(password, user.password);
      if (!valid) return res.status(401).json({ message: "Invalid credentials" });
      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.role = user.role;
      res.json({ id: user.id, username: user.username, role: user.role });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => res.json({ ok: true }));
  });

  app.get("/api/auth/me", (req, res) => {
    if (!req.session.userId) return res.status(401).json({ message: "Not authenticated" });
    res.json({ id: req.session.userId, username: req.session.username, role: req.session.role });
  });

  // ──────── USERS (admin) ────────
  app.get("/api/cms/users", requireAuth, async (req, res) => {
    if (req.session.role !== "super_admin") return res.status(403).json({ message: "Forbidden" });
    const all = await storage.getUsers();
    res.json(all.map(u => ({ id: u.id, username: u.username, role: u.role, createdAt: u.createdAt })));
  });

  app.post("/api/cms/users", requireAuth, async (req, res) => {
    if (req.session.role !== "super_admin") return res.status(403).json({ message: "Forbidden" });
    try {
      const { username, password, role } = req.body;
      if (!username || !password) return res.status(400).json({ message: "Username and password required" });
      const hashed = await hashPassword(password);
      const user = await storage.createUser({ username, password: hashed, role: role || "admin" });
      res.json({ id: user.id, username: user.username, role: user.role });
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.patch("/api/cms/users/:id", requireAuth, async (req, res) => {
    if (req.session.role !== "super_admin") return res.status(403).json({ message: "Forbidden" });
    try {
      const id = Number(req.params.id);
      const { username, password, role } = req.body;
      const updateData: any = {};
      if (username) updateData.username = username;
      if (password) updateData.password = await hashPassword(password);
      if (role) updateData.role = role;
      const user = await storage.updateUser(id, updateData);
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json({ id: user.id, username: user.username, role: user.role });
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.delete("/api/cms/users/:id", requireAuth, async (req, res) => {
    if (req.session.role !== "super_admin") return res.status(403).json({ message: "Forbidden" });
    const id = Number(req.params.id);
    if (id === req.session.userId) return res.status(400).json({ message: "Cannot delete yourself" });
    await storage.deleteUser(id);
    res.json({ ok: true });
  });

  // ──────── PAGES ────────
  app.get("/api/cms/pages", requireAuth, async (_req, res) => {
    res.json(await storage.getPages());
  });

  app.get("/api/cms/pages/:id", requireAuth, async (req, res) => {
    const page = await storage.getPage(Number(req.params.id));
    if (!page) return res.status(404).json({ message: "Not found" });
    res.json(page);
  });

  app.post("/api/cms/pages", requireAuth, async (req, res) => {
    try {
      const page = await storage.createPage(req.body);
      res.json(page);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.patch("/api/cms/pages/:id", requireAuth, async (req, res) => {
    const page = await storage.updatePage(Number(req.params.id), req.body);
    if (!page) return res.status(404).json({ message: "Not found" });
    res.json(page);
  });

  app.delete("/api/cms/pages/:id", requireAuth, async (req, res) => {
    await storage.deletePage(Number(req.params.id));
    res.json({ ok: true });
  });

  // ──────── HOTELS ────────
  app.get("/api/cms/hotels", requireAuth, async (_req, res) => {
    res.json(await storage.getHotels());
  });

  app.get("/api/cms/hotels/:id", requireAuth, async (req, res) => {
    const hotel = await storage.getHotel(Number(req.params.id));
    if (!hotel) return res.status(404).json({ message: "Not found" });
    res.json(hotel);
  });

  app.post("/api/cms/hotels", requireAuth, async (req, res) => {
    try {
      const hotel = await storage.createHotel(req.body);
      res.json(hotel);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.patch("/api/cms/hotels/:id", requireAuth, async (req, res) => {
    const hotel = await storage.updateHotel(Number(req.params.id), req.body);
    if (!hotel) return res.status(404).json({ message: "Not found" });
    res.json(hotel);
  });

  app.delete("/api/cms/hotels/:id", requireAuth, async (req, res) => {
    await storage.deleteHotel(Number(req.params.id));
    res.json({ ok: true });
  });

  // ──────── MEDIA ────────
  app.get("/api/cms/media", requireAuth, async (_req, res) => {
    res.json(await storage.getMediaFiles());
  });

  app.post("/api/cms/video-upload-url", requireAuth, async (req, res) => {
    try {
      const { filename, contentType } = req.body;
      if (!filename) return res.status(400).json({ message: "filename required" });

      const objService = new ObjectStorageService();
      const publicPaths = objService.getPublicObjectSearchPaths();
      if (!publicPaths.length) return res.status(500).json({ message: "Object Storage not configured" });

      const bucketPath = publicPaths[0];
      const safeName = `video-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(filename)}`;
      const fullPath = `${bucketPath}/${safeName}`;
      const p = fullPath.startsWith("/") ? fullPath : `/${fullPath}`;
      const parts = p.split("/");
      const bucketName = parts[1];
      const objectName = parts.slice(2).join("/");

      const REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";
      const signRes = await fetch(
        `${REPLIT_SIDECAR_ENDPOINT}/object-storage/signed-object-url`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bucket_name: bucketName,
            object_name: objectName,
            method: "PUT",
            expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
          }),
        }
      );
      if (!signRes.ok) throw new Error(`Failed to sign URL: ${signRes.status}`);
      const { signed_url: uploadUrl } = await signRes.json();

      const serveUrl = `/uploads/${safeName}`;

      res.json({ uploadUrl, serveUrl, filename: safeName });
    } catch (e: any) {
      console.error("[video-upload-url] Error:", e.message);
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/cms/media", requireAuth, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "No file uploaded" });

      let fileUrl = `/uploads/${req.file.filename}`;

      try {
        const objService = new ObjectStorageService();
        const publicPaths = objService.getPublicObjectSearchPaths();
        if (publicPaths.length > 0) {
          const bucketPath = publicPaths[0];
          const { bucketName, objectName } = (() => {
            const fullPath = `${bucketPath}/${req.file!.filename}`;
            const p = fullPath.startsWith("/") ? fullPath : `/${fullPath}`;
            const parts = p.split("/");
            return { bucketName: parts[1], objectName: parts.slice(2).join("/") };
          })();

          const { objectStorageClient } = await import("./replit_integrations/object_storage/objectStorage");
          const bucket = objectStorageClient.bucket(bucketName);
          const objFile = bucket.file(objectName);

          const localPath = path.join(uploadDir, req.file!.filename);
          await new Promise<void>((resolve, reject) => {
            fs.createReadStream(localPath)
              .pipe(objFile.createWriteStream({ metadata: { contentType: req.file!.mimetype } }))
              .on("finish", () => resolve())
              .on("error", (err: Error) => reject(err));
          });

          fileUrl = `/uploads/${req.file!.filename}`;
          console.log(`[media] Uploaded to Object Storage: ${req.file!.filename}`);
        }
      } catch (objErr: any) {
        console.warn(`[media] Object Storage upload failed, using local: ${objErr.message}`);
      }

      const file = await storage.createMedia({
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url: fileUrl,
        alt: req.body.alt || "",
      });
      res.json(file);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.patch("/api/cms/media/:id", requireAuth, async (req, res) => {
    const file = await storage.updateMedia(Number(req.params.id), req.body);
    if (!file) return res.status(404).json({ message: "Not found" });
    res.json(file);
  });

  app.delete("/api/cms/media/:id", requireAuth, async (req, res) => {
    const file = await storage.getMediaFile(Number(req.params.id));
    if (file) {
      const filePath = path.join(uploadDir, file.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await storage.deleteMedia(Number(req.params.id));
    res.json({ ok: true });
  });

  // ──────── GLOBAL SETTINGS ────────
  app.get("/api/cms/settings", requireAuth, async (_req, res) => {
    res.json(await storage.getSettings());
  });

  app.get("/api/cms/settings/:key", requireAuth, async (req, res) => {
    const setting = await storage.getSetting(req.params.key as string);
    if (!setting) return res.status(404).json({ message: "Not found" });
    res.json(setting);
  });

  app.put("/api/cms/settings/:key", requireAuth, async (req, res) => {
    const setting = await storage.upsertSetting(req.params.key as string, req.body.value);
    res.json(setting);
  });

  // ──────── SEO ────────
  app.get("/api/cms/seo", requireAuth, async (_req, res) => {
    res.json(await storage.getSeoSettings());
  });

  app.put("/api/cms/seo", requireAuth, async (req, res) => {
    const seo = await storage.upsertSeo(req.body);
    res.json(seo);
  });

  app.delete("/api/cms/seo/:id", requireAuth, async (req, res) => {
    await storage.deleteSeo(Number(req.params.id));
    res.json({ ok: true });
  });

  // ──────── BLOG POSTS ────────
  app.get("/api/cms/blog", requireAuth, async (_req, res) => {
    res.json(await storage.getBlogPosts());
  });

  app.get("/api/cms/blog/:id", requireAuth, async (req, res) => {
    const post = await storage.getBlogPost(Number(req.params.id));
    if (!post) return res.status(404).json({ message: "Not found" });
    res.json(post);
  });

  app.post("/api/cms/blog", requireAuth, async (req, res) => {
    try {
      const parsed = insertBlogPostSchema.parse(req.body);
      const post = await storage.createBlogPost(parsed);
      res.json(post);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.patch("/api/cms/blog/:id", requireAuth, async (req, res) => {
    try {
      const parsed = insertBlogPostSchema.partial().parse(req.body);
      const post = await storage.updateBlogPost(Number(req.params.id), parsed);
      if (!post) return res.status(404).json({ message: "Not found" });
      res.json(post);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.delete("/api/cms/blog/:id", requireAuth, async (req, res) => {
    await storage.deleteBlogPost(Number(req.params.id));
    res.json({ ok: true });
  });

  // ──────── COMPANY PROFILE PDF UPLOAD (50MB limit) ────────
  const pdfUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (file.mimetype === "application/pdf") {
        cb(null, true);
      } else {
        cb(new Error("Only PDF files are allowed"));
      }
    },
  });

  app.post("/api/cms/company-profile/upload", requireAuth, pdfUpload.single("file"), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "No file uploaded" });

      const objService = new ObjectStorageService();
      const searchPaths = objService.getPublicObjectSearchPaths();
      const publicPath = searchPaths[0];
      const sanitizedName = req.file.originalname
        .replace(/[^a-zA-Z0-9._-]/g, "_")
        .replace(/_+/g, "_");
      const fileName = `company-profile-${Date.now()}-${sanitizedName}`;
      const fullObjectPath = `${publicPath}/${fileName}`;

      const parts = fullObjectPath.split("/").filter(Boolean);
      const bucketName = parts[0];
      const objectName = parts.slice(1).join("/");

      const { objectStorageClient } = await import("./replit_integrations/object_storage/objectStorage");
      const bucket = objectStorageClient.bucket(bucketName);
      const file = bucket.file(objectName);

      await file.save(req.file.buffer, {
        metadata: { contentType: "application/pdf" },
      });

      const serveUrl = `/public/uploads/${encodeURIComponent(fileName)}`;
      await storage.upsertSetting("company_profile_pdf", serveUrl);
      res.json({ url: serveUrl });
    } catch (e: any) {
      console.error("PDF upload error:", e);
      res.status(400).json({ message: e.message });
    }
  });

  // ──────── COMPANY PROFILE FONT UPLOAD (5MB limit) ────────
  const fontUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      const allowed = [".ttf", ".woff", ".woff2"];
      const ext = path.extname(file.originalname).toLowerCase();
      if (allowed.includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error("Only .ttf, .woff, .woff2 font files are allowed"));
      }
    },
  });

  app.post("/api/cms/company-profile/upload-font", requireAuth, fontUpload.single("file"), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "No file uploaded" });

      const objService = new ObjectStorageService();
      const searchPaths = objService.getPublicObjectSearchPaths();
      const publicPath = searchPaths[0];
      const ext = path.extname(req.file.originalname).toLowerCase();
      const sanitizedName = req.file.originalname
        .replace(/[^a-zA-Z0-9._-]/g, "_")
        .replace(/_+/g, "_");
      const fileName = `font-${Date.now()}-${sanitizedName}`;
      const fullObjectPath = `${publicPath}/fonts/${fileName}`;

      const parts = fullObjectPath.split("/").filter(Boolean);
      const bucketName = parts[0];
      const objectName = parts.slice(1).join("/");

      const { objectStorageClient } = await import("./replit_integrations/object_storage/objectStorage");
      const bucket = objectStorageClient.bucket(bucketName);
      const file = bucket.file(objectName);

      const mimeMap: Record<string, string> = {
        ".ttf": "font/ttf",
        ".woff": "font/woff",
        ".woff2": "font/woff2",
      };
      await file.save(req.file.buffer, {
        metadata: { contentType: mimeMap[ext] || "application/octet-stream" },
      });

      const fontName = req.body.fontName || sanitizedName.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
      const serveUrl = `/public/uploads/fonts/${encodeURIComponent(fileName)}`;

      await storage.upsertSetting("company_profile_custom_font_url", serveUrl);
      await storage.upsertSetting("company_profile_custom_font_name", fontName);
      await storage.upsertSetting("company_profile_hero_font_family", fontName);

      res.json({ url: serveUrl, fontName });
    } catch (e: any) {
      console.error("Font upload error:", e);
      res.status(400).json({ message: e.message });
    }
  });

  // ──────── SERVE UPLOADED FILES AS STATIC ────────
  app.get("/public/uploads/:filename", async (req, res) => {
    try {
      const objService = new ObjectStorageService();
      const fileName = decodeURIComponent(req.params.filename);
      const file = await objService.searchPublicObject(fileName);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      res.set({
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Range",
        "Access-Control-Expose-Headers": "Content-Length, Content-Range, Accept-Ranges",
        "Accept-Ranges": "bytes",
      });
      await objService.downloadObject(file, res, 86400);
    } catch (e: any) {
      console.error("Static file serve error:", e);
      res.status(500).json({ message: "Error serving file" });
    }
  });

  app.get("/public/uploads/fonts/:filename", async (req, res) => {
    try {
      const objService = new ObjectStorageService();
      const fileName = decodeURIComponent(req.params.filename);
      const file = await objService.searchPublicObject(`fonts/${fileName}`);
      if (!file) {
        return res.status(404).json({ message: "Font file not found" });
      }
      res.set({
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=31536000, immutable",
      });
      await objService.downloadObject(file, res, 31536000);
    } catch (e: any) {
      console.error("Font file serve error:", e);
      res.status(500).json({ message: "Error serving font file" });
    }
  });

  // ──────── PAGE BUILDER ────────
  app.get("/api/cms/pages/:id/builder", requireAuth, async (req, res) => {
    try {
      const page = await storage.getPage(Number(req.params.id));
      if (!page) return res.status(404).json({ message: "Not found" });

      let builderDraft = page.builderDraft;
      if (!builderDraft || !builderDraft.sections || builderDraft.sections.length === 0) {
        const autoSections: any[] = [];
        const titleEn = page.title?.en || page.slug;
        const titleAr = page.title?.ar || "";
        const contentEn = page.content?.en || "";
        const contentAr = page.content?.ar || "";

        autoSections.push({
          id: "auto_hero_" + page.id,
          type: "hero",
          label: "Hero Section",
          hidden: false,
          content: {
            title: titleEn,
            titleAr: titleAr,
            subtitle: "",
            buttonText: "",
            buttonLink: "",
            backgroundImage: "",
          },
          styles: {
            paddingTop: "120px",
            paddingBottom: "80px",
            backgroundColor: "#0c1c2c",
            backgroundOverlay: 0.3,
            textAlign: "center",
          },
        });

        if (contentEn) {
          autoSections.push({
            id: "auto_text_" + page.id,
            type: "text_block",
            label: "Page Content",
            hidden: false,
            content: {
              heading: titleEn,
              headingAr: titleAr,
              body: contentEn,
              bodyAr: contentAr,
              alignment: "left",
            },
            styles: {
              paddingTop: "60px",
              paddingBottom: "60px",
              backgroundColor: "#ffffff",
            },
          });
        }

        builderDraft = { sections: autoSections };
      }

      res.json({ page, builderDraft });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.put("/api/cms/pages/:id/builder", requireAuth, async (req, res) => {
    try {
      const { sections } = req.body;
      if (!sections) return res.status(400).json({ message: "sections is required" });
      const page = await storage.updatePage(Number(req.params.id), {
        builderDraft: { sections } as any,
        builderEnabled: true,
      } as any);
      if (!page) return res.status(404).json({ message: "Not found" });
      res.json(page);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/cms/pages/:id/builder/publish", requireAuth, async (req, res) => {
    try {
      const pageId = Number(req.params.id);
      const page = await storage.getPage(pageId);
      if (!page) return res.status(404).json({ message: "Not found" });
      if (!page.builderDraft) return res.status(400).json({ message: "No builder draft to publish" });

      const updatedPage = await storage.updatePage(pageId, {
        builderPublished: page.builderDraft,
        status: "published",
      });

      const existingVersions = await storage.getPageVersions(pageId);
      const nextVersionNumber = existingVersions.length > 0
        ? Math.max(...existingVersions.map(v => v.versionNumber)) + 1
        : 1;

      const version = await storage.createPageVersion({
        pageId,
        versionNumber: nextVersionNumber,
        sections: page.builderDraft.sections || [],
        status: "published",
        createdBy: req.session.username || null,
      });

      res.json({ page: updatedPage, version });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/cms/pages/:id/versions", requireAuth, async (req, res) => {
    try {
      const versions = await storage.getPageVersions(Number(req.params.id));
      res.json(versions);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/cms/pages/:id/versions/:versionId/restore", requireAuth, async (req, res) => {
    try {
      const pageId = Number(req.params.id);
      const versionId = Number(req.params.versionId);

      const [version] = await db.select().from(pageVersions).where(eq(pageVersions.id, versionId));
      if (!version) return res.status(404).json({ message: "Version not found" });

      const page = await storage.updatePage(pageId, {
        builderDraft: { sections: version.sections },
      } as any);
      if (!page) return res.status(404).json({ message: "Page not found" });
      res.json(page);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // ──────── PAGE CONTENTS (Live Edit) ────────
  app.get("/api/cms/page-contents", requireAuth, async (_req, res) => {
    try {
      const all = await storage.getAllPageContents();
      res.json(all);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/cms/page-contents/:pagePath", requireAuth, async (req, res) => {
    try {
      const pagePath = Array.isArray(req.params.pagePath) ? req.params.pagePath[0] : req.params.pagePath;
      const contents = await storage.getPageContents(decodeURIComponent(pagePath));
      res.json(contents);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.put("/api/cms/page-contents", requireAuth, async (req, res) => {
    try {
      const { pagePath, contentKey, contentType, value } = req.body;
      if (!pagePath || !contentKey || value === undefined) {
        return res.status(400).json({ message: "pagePath, contentKey, and value are required" });
      }
      const result = await storage.upsertPageContent(pagePath, contentKey, contentType || "text", value);
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.put("/api/cms/page-contents/batch", requireAuth, async (req, res) => {
    try {
      const { items } = req.body;
      if (!Array.isArray(items)) {
        return res.status(400).json({ message: "items array required" });
      }
      const results = [];
      for (const item of items) {
        const result = await storage.upsertPageContent(item.pagePath, item.contentKey, item.contentType || "text", item.value);
        results.push(result);
      }
      res.json(results);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.delete("/api/cms/page-contents/:id", requireAuth, async (req, res) => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await storage.deletePageContent(parseInt(id));
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // Public page content API (for website rendering)
  app.get("/api/public/page-content/:pagePath", async (req, res) => {
    try {
      const pagePath = Array.isArray(req.params.pagePath) ? req.params.pagePath[0] : req.params.pagePath;
      const contents = await storage.getPageContents(decodeURIComponent(pagePath));
      const result: Record<string, string> = {};
      for (const c of contents) {
        result[c.contentKey] = c.value;
      }
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // ──────── PUBLIC API (for website consumption) ────────
  app.get("/api/public/pages/:slug/builder", async (req, res) => {
    try {
      const page = await storage.getPageBySlug(req.params.slug);
      if (!page || !page.builderEnabled || !page.builderPublished) {
        return res.status(404).json({ message: "Not found" });
      }
      res.json({ sections: page.builderPublished.sections });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/public/pages/:slug", async (req, res) => {
    const page = await storage.getPageBySlug(req.params.slug);
    if (!page || page.status !== "published") return res.status(404).json({ message: "Not found" });
    res.json(page);
  });

  app.get("/api/public/hotels", async (_req, res) => {
    const all = await storage.getHotels();
    res.json(all.filter(h => h.status === "published"));
  });

  app.get("/api/public/hotels/:slug", async (req, res) => {
    const hotel = await storage.getHotelBySlug(req.params.slug);
    if (!hotel || hotel.status !== "published") return res.status(404).json({ message: "Not found" });
    res.json(hotel);
  });

  app.get("/api/public/settings", async (_req, res) => {
    const settings = await storage.getSettings();
    const result: Record<string, any> = {};
    for (const s of settings) {
      result[s.key] = s.value;
    }
    res.json(result);
  });

  app.get("/api/public/settings/:key", async (req, res) => {
    const setting = await storage.getSetting(req.params.key);
    if (!setting) return res.status(404).json({ message: "Not found" });
    res.json(setting);
  });

  app.get("/api/public/seo/:path", async (req, res) => {
    const seo = await storage.getSeoByPath(req.params.path);
    if (!seo) return res.status(404).json({ message: "Not found" });
    res.json(seo);
  });

  app.get("/api/public/media", async (_req, res) => {
    const files = await storage.getMediaFiles();
    res.json(files);
  });

  app.get("/api/public/company-profile", async (_req, res) => {
    const settings = await storage.getSettings();
    const findVal = (key: string) => {
      const s = settings.find((s: any) => s.key === key);
      if (!s) return null;
      const v = s.value;
      if (typeof v === "string") return v;
      return v ?? null;
    };
    const status = findVal("company_profile_status");
    if (status !== "active") {
      return res.status(404).json({ message: "Company profile is not active" });
    }
    res.json({
      pdfUrl: findVal("company_profile_pdf") || null,
      coverImage: findVal("company_profile_cover") || null,
      title: findVal("company_profile_title") || null,
      status: status,
      heroSubtitle: findVal("company_profile_hero_subtitle") || null,
      heroTitleSizeDesktop: findVal("company_profile_hero_title_size_desktop") || null,
      heroTitleSizeMobile: findVal("company_profile_hero_title_size_mobile") || null,
      heroLetterSpacing: findVal("company_profile_hero_letter_spacing") || null,
      heroFontFamily: findVal("company_profile_hero_font_family") || null,
      heroFontWeight: findVal("company_profile_hero_font_weight") || null,
      heroTextTransform: findVal("company_profile_hero_text_transform") || null,
      customFontUrl: findVal("company_profile_custom_font_url") || null,
      customFontName: findVal("company_profile_custom_font_name") || null,
    });
  });

  app.get("/api/public/blog", async (_req, res) => {
    const all = await storage.getBlogPosts();
    res.json(all.filter(p => p.status === "published"));
  });

  app.get("/api/public/blog/:slug", async (req, res) => {
    const post = await storage.getBlogPostBySlug(req.params.slug);
    if (!post || post.status !== "published") return res.status(404).json({ message: "Not found" });
    res.json(post);
  });

  // Dashboard stats
  app.get("/api/cms/dashboard", requireAuth, async (_req, res) => {
    const [allPages, allHotels, allMedia, allUsers, allBlogPosts] = await Promise.all([
      storage.getPages(),
      storage.getHotels(),
      storage.getMediaFiles(),
      storage.getUsers(),
      storage.getBlogPosts(),
    ]);
    res.json({
      pages: { total: allPages.length, published: allPages.filter(p => p.status === "published").length, draft: allPages.filter(p => p.status === "draft").length },
      hotels: { total: allHotels.length, published: allHotels.filter(h => h.status === "published").length },
      media: { total: allMedia.length, totalSize: allMedia.reduce((s, m) => s + m.size, 0) },
      users: { total: allUsers.length },
      blogPosts: { total: allBlogPosts.length, published: allBlogPosts.filter(p => p.status === "published").length, draft: allBlogPosts.filter(p => p.status === "draft").length },
    });
  });

  // ──────── BOOKING ASSISTANT CHATBOT ────────
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const hotelKnowledgeMap: Record<string, string> = {
    "crystal-beach": "",
    "beach-club": "",
    "la-plage": "",
    "royal-bay": "Protels Royal Bay Resort & Spa – Hurghada, Egypt. This resort is currently under preparation and will be opening soon. Stay tuned for updates!",
  };

  const pdfFiles: Record<string, string> = {
    "crystal-beach": "attached_assets/Fact_sheet_Crystal_beach_(3)_1772360362683.pdf",
    "beach-club": "attached_assets/Fact_Sheet_PROTELS_Beach_Club_(1)_1772361501233.pdf",
    "la-plage": "attached_assets/FACTSHEET_LA_PLGE_1772361518905.pdf",
  };

  async function loadPdf(filePath: string): Promise<string> {
    const pdfBuffer = fs.readFileSync(path.resolve(filePath));
    const uint8 = new Uint8Array(pdfBuffer);
    const parser = new PDFParse(uint8);
    await parser.load();
    const result = await parser.getText();
    return result.text || "";
  }

  for (const [slug, filePath] of Object.entries(pdfFiles)) {
    try {
      hotelKnowledgeMap[slug] = await loadPdf(filePath);
      console.log(`[pdf] Loaded knowledge for ${slug}`);
    } catch (err) {
      console.error(`[pdf] Failed to load PDF for ${slug}:`, err);
    }
  }

  const hotelInfoMap: Record<string, { name: string; location: string; category: string; concept: string }> = {
    "crystal-beach": {
      name: "Protels Crystal Beach Resort",
      location: "Marsa Alam, Egypt",
      category: "4 Stars",
      concept: "All Inclusive",
    },
    "beach-club": {
      name: "Protels Beach Club & Spa",
      location: "Marsa Alam, Egypt",
      category: "4 Stars",
      concept: "Ultra All Inclusive",
    },
    "la-plage": {
      name: "Protels La Plage",
      location: "Zanzibar, Tanzania",
      category: "4 Stars",
      concept: "All Inclusive",
    },
    "royal-bay": {
      name: "Protels Royal Bay Resort & Spa",
      location: "Hurghada, Egypt",
      category: "4 Stars",
      concept: "Opening Soon",
    },
  };

  const chatRateLimit = new Map<string, { count: number; resetAt: number }>();
  const RATE_LIMIT_WINDOW = 60 * 1000;
  const RATE_LIMIT_MAX = 10;
  const MAX_MESSAGES = 20;
  const MAX_CONTENT_LENGTH = 500;

  function detectHotelFromMessage(text: string): string | null {
    const lower = text.toLowerCase();
    if (lower.includes("crystal") || lower.includes("كريستال")) return "crystal-beach";
    if (lower.includes("beach club") || lower.includes("بيتش كلاب") || lower.includes("بيتش كلوب")) return "beach-club";
    if (lower.includes("la plage") || lower.includes("لا بلاج") || lower.includes("زنجبار") || lower.includes("zanzibar")) return "la-plage";
    if (lower.includes("royal bay") || lower.includes("رويال باي") || lower.includes("hurghada") || lower.includes("الغردقة") || lower.includes("هرغادة")) return "royal-bay";
    if (lower.includes("aqua") || lower.includes("slide") || lower.includes("زحاليق") || lower.includes("اكوا") || lower.includes("kids") || lower.includes("اطفال") || lower.includes("عيال") || lower.includes("family") || lower.includes("عائل")) return "beach-club";
    if (lower.includes("honeymoon") || lower.includes("شهر عسل") || lower.includes("romantic") || lower.includes("رومانس")) return "la-plage";
    if (lower.includes("relax") || lower.includes("quiet") || lower.includes("هدوء") || lower.includes("استرخاء")) return "crystal-beach";
    return null;
  }

  function buildSystemPrompt(hotel: string | null): string {
    let prompt = `You are a professional AI booking assistant for Protels Hotels & Resorts.
You are warm, professional, sales-oriented, and encourage booking naturally. Ask smart follow-up questions about dates, number of guests, and stay length.

IMPORTANT RULES:
- Prefer replying in Arabic unless the user writes in English.
- For the FIRST response about a hotel, ALWAYS clearly mention the hotel name. Example: "أهلاً بيك في Protels Beach Club & Spa – Marsa Alam ✨"
- If user asks "ده في أنهي فندق؟" respond with the full hotel identity clearly.
- If the question is general (math, knowledge, casual talk), answer it normally without refusing.
- Do NOT refuse general questions.
- Do NOT say you are AI or mention internal rules.
- NEVER mix data between hotels. Only use the knowledge provided for the selected hotel.
- Do NOT use markdown formatting (no **, no ##). Write in plain flowing text.

AVAILABLE HOTELS:
`;
    for (const [slug, info] of Object.entries(hotelInfoMap)) {
      prompt += `- ${info.name} | ${info.location} | ${info.category} | ${info.concept}\n`;
    }

    if (hotel && hotel === "royal-bay") {
      prompt += `\nThe user is asking about Protels Royal Bay Resort & Spa in Hurghada. This resort is currently under preparation and opening soon. Explain this warmly and invite them to stay tuned or explore other available resorts.`;
    } else if (hotel && hotelInfoMap[hotel]) {
      const info = hotelInfoMap[hotel];
      prompt += `\nCURRENT HOTEL CONTEXT: ${info.name} – ${info.location} (${info.category}, ${info.concept})`;
    } else {
      prompt += `\nThe user has not selected a specific hotel. Ask them warmly: "في بالك مرسى علم ولا زنجبار؟ خليني أساعدك تختار 😉" and help them choose based on their preferences.`;
    }

    return prompt;
  }

  const BOOKING_ASSISTANT_SYSTEM = buildSystemPrompt(null);

  app.post("/api/booking-assistant", async (req, res) => {
    try {
      const clientIp = req.ip || req.socket.remoteAddress || "unknown";
      const now = Date.now();
      const entry = chatRateLimit.get(clientIp);
      if (entry && now < entry.resetAt) {
        if (entry.count >= RATE_LIMIT_MAX) {
          return res.status(429).json({ error: "Too many requests. Please wait a moment." });
        }
        entry.count++;
      } else {
        chatRateLimit.set(clientIp, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
      }

      const { messages } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "messages array is required" });
      }

      const trimmedMessages = messages.slice(-MAX_MESSAGES).map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: typeof m.content === "string" ? m.content.slice(0, MAX_CONTENT_LENGTH) : "",
      }));

      const chatMessages: OpenAI.ChatCompletionMessageParam[] = [
        { role: "system", content: BOOKING_ASSISTANT_SYSTEM },
        ...trimmedMessages,
      ];

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const stream = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: chatMessages,
        stream: true,
        max_tokens: 300,
        temperature: 0.7,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error: any) {
      console.error("Booking assistant error:", error);
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: "Something went wrong. Please try again." })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ error: "Failed to get response" });
      }
    }
  });

  app.post("/chat", async (req, res) => {
    try {
      const clientIp = req.ip || req.socket.remoteAddress || "unknown";
      const now = Date.now();
      const entry = chatRateLimit.get(clientIp);
      if (entry && now < entry.resetAt) {
        if (entry.count >= RATE_LIMIT_MAX) {
          return res.status(429).json({ reply: "Too many requests. Please wait a moment." });
        }
        entry.count++;
      } else {
        chatRateLimit.set(clientIp, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
      }

      const { message, hotel } = req.body;
      if (!message || typeof message !== "string") {
        return res.status(400).json({ reply: "Message is required." });
      }

      let selectedHotel: string | null = hotel && hotelInfoMap[hotel] ? hotel : null;
      if (!selectedHotel) {
        selectedHotel = detectHotelFromMessage(message);
      }

      const systemPrompt = buildSystemPrompt(selectedHotel);
      const chatMessages: OpenAI.ChatCompletionMessageParam[] = [
        { role: "system", content: systemPrompt },
      ];
      if (selectedHotel && hotelKnowledgeMap[selectedHotel]) {
        chatMessages.push({ role: "system", content: hotelKnowledgeMap[selectedHotel] });
      }
      chatMessages.push({ role: "user", content: message.slice(0, MAX_CONTENT_LENGTH) });

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: chatMessages,
        max_tokens: 300,
        temperature: 0.7,
      });

      const reply = completion.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";
      res.json({ reply });
    } catch (error: any) {
      console.error("Chat endpoint error:", error);
      res.status(500).json({ reply: "حدث خطأ، حاول مرة أخرى." });
    }
  });

  // ──────── CMS AI ASSISTANT ────────
  const CMS_ASSISTANT_SYSTEM = `You are the PROTELS CMS AI Assistant — an expert-level intelligent content management system for the PROTELS Hotels & Resorts website. You are extremely capable and proactive.

CAPABILITIES:
1. **Content Writing** — Write professional, SEO-optimized hotel descriptions, page content, blog articles in any of 8 languages (EN, AR, FR, DE, ES, RU, PL, CS). Use luxury hospitality tone.
2. **Translation** — Translate content between any languages. Maintain brand voice and cultural nuance. Can bulk-translate hotel descriptions to ALL languages at once.
3. **Content Creation** — Create new pages, blog articles with full multilingual support.
4. **Content Editing** — Directly update any CMS content: hotels, pages, blog posts, settings, SEO, inline page content.
5. **SEO Optimization** — Write meta titles, descriptions, OG tags. Audit and improve SEO across pages.
6. **CMS Guidance** — Expert knowledge of every CMS feature. Guide users step-by-step.
7. **Data Analysis** — Read and analyze current content, find missing translations, suggest improvements.

LANGUAGE RULE:
- ALWAYS respond in the same language the user writes in.
- Arabic/Egyptian input → Arabic reply. English → English. Mixed → use the dominant language.
- When writing content for the website, use formal Modern Standard Arabic (not Egyptian dialect).

PERSONALITY: You are like a senior content manager + developer assistant combined. You are proactive — when asked to do something, you do it thoroughly. If asked to translate, translate to ALL requested languages. If asked to create a blog post, fill in ALL fields including SEO. If something is missing, fix it without being asked.

RESPONSE FORMAT: Use **markdown** formatting for readability — bold, bullet points, headers, code blocks when showing data.

CMS STRUCTURE:
- **Dashboard** (/controlpanal/dashboard): Overview stats — pages, hotels, media, users, blog posts counts
- **Pages** (/controlpanal/pages): CMS pages with multilingual title & content (JSONB with language keys like {"en": "...", "ar": "..."}). Status: draft/published. Slug-based routing.
- **Hotels** (/controlpanal/hotels): 4 properties:
  - Crystal Beach Resort (slug: crystal-beach) — Marsa Alam, Egypt. All-inclusive beach resort.
  - Beach Club & SPA (slug: beach-club) — Marsa Alam, Egypt. Modern resort with aquapark.
  - La Plage (slug: la-plage) — Zanzibar, Tanzania. Boutique barefoot luxury.
  - Royal Bay Resort & Spa (slug: royal-bay) — Hurghada, Egypt. Grand family resort.
  Each hotel has: description (multilingual JSONB), features (string[]), rooms (string[]), roomDetails (JSON array with name, size, bed, view, amenities, images, description), dining (JSON with main restaurant + specialty + bars), gallery (string[]), mapLink, heroVideo (MP4 URL), theme (JSONB colors), tabConfig (JSONB tab visibility/order).
- **Blog** (/controlpanal/blog): Articles with multilingual title/content/excerpt (JSONB), slug, featured image, hotel linking, SEO fields (metaTitle, metaDescription), status draft/published.
- **Media Library** (/controlpanal/media): Upload images/files, get URLs.
- **SEO** (/controlpanal/seo): Per-URL-path meta titles, descriptions, OG tags (title/desc/image), robots directives, canonical URLs.
- **Settings** (/controlpanal/settings): site_name, contact_email, contact_phone, contact_address, hero_title (JSONB multilingual), hero_subtitle (JSONB multilingual), hero_images, booking_link, header_logo, footer_description (JSONB multilingual), social_links (JSONB: facebook/instagram/linkedin), gtm_id, favicon_url.
- **Theme** (/controlpanal/theme): Global CSS colors (primary, secondary, accent, background, text), font families (heading, body), logo dimensions.
- **Users** (/controlpanal/users): Roles — super_admin (full access), content_manager (content but no settings/users), editor (edit only, no delete), viewer (read-only).

SUPPORTED LANGUAGES with codes: English (en), Arabic (ar), French (fr), German (de), Spanish (es), Russian (ru), Polish (pl), Czech (cs)

IMAGE/SCREENSHOT ANALYSIS:
- Users can send you screenshots and images. Analyze them carefully.
- When a user sends a screenshot of a page, identify what they want to change and use the appropriate tools to make the changes.
- When a user sends an image to replace something, note the image URL/content and help them update the CMS accordingly.
- Be specific about what you see in the image — mention colors, text, layout, issues.

PROACTIVE BEHAVIOR:
- When updating content, always use tools to make changes directly — don't just suggest.
- When translating, offer to translate to ALL missing languages if only some are filled.
- When creating content, fill in all possible fields including SEO metadata.
- After making changes, provide a clear summary of what was done with ✅ checkmarks.
- If you detect missing translations or content gaps, mention them proactively.`;

  const cmsAssistantTools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
    {
      type: "function",
      function: {
        name: "update_hotel",
        description: "Update a hotel's data. Can update description (multilingual), features, rooms, dining, gallery, mapLink, heroVideo, theme, tabConfig, or status.",
        parameters: {
          type: "object",
          properties: {
            hotel_slug: { type: "string", description: "Hotel slug: crystal-beach, beach-club, la-plage, or royal-bay" },
            updates: {
              type: "object",
              description: "Fields to update. For description, use {\"en\": \"...\", \"ar\": \"...\", ...} format. For features, use string array.",
              additionalProperties: true,
            },
          },
          required: ["hotel_slug", "updates"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "update_setting",
        description: "Update a global CMS setting. Keys include: site_name, contact_email, contact_phone, contact_address, hero_title (JSONB), hero_subtitle (JSONB), hero_images, booking_link, header_logo, footer_description (JSONB), social_links (JSONB), gtm_id, favicon_url.",
        parameters: {
          type: "object",
          properties: {
            key: { type: "string", description: "Setting key" },
            value: { description: "Setting value (string or JSON object)" },
          },
          required: ["key", "value"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "update_page_content",
        description: "Update live page content. Used for inline-editable text on the website. The contentKey format is typically the element identifier, and pagePath includes language suffix like /__en, /__ar.",
        parameters: {
          type: "object",
          properties: {
            pagePath: { type: "string", description: "Page path with language, e.g. /__en, /hotels__ar" },
            contentKey: { type: "string", description: "Content key identifier" },
            value: { type: "string", description: "New content value (can include HTML)" },
          },
          required: ["pagePath", "contentKey", "value"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "update_page",
        description: "Update a CMS page's title or content. Title and content are multilingual JSONB objects.",
        parameters: {
          type: "object",
          properties: {
            page_id: { type: "number", description: "Page ID" },
            updates: {
              type: "object",
              properties: {
                title: { type: "object", description: "Multilingual title {\"en\": \"...\", \"ar\": \"...\", ...}" },
                content: { type: "object", description: "Multilingual content {\"en\": \"...\", \"ar\": \"...\", ...}" },
                status: { type: "string", enum: ["draft", "published"] },
              },
            },
          },
          required: ["page_id", "updates"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "update_blog_post",
        description: "Update a blog post. Title, content, excerpt are multilingual JSONB.",
        parameters: {
          type: "object",
          properties: {
            post_id: { type: "number", description: "Blog post ID" },
            updates: {
              type: "object",
              additionalProperties: true,
              description: "Fields to update: title, content, excerpt (JSONB), status, slug, featuredImage, metaTitle, metaDescription",
            },
          },
          required: ["post_id", "updates"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "update_seo",
        description: "Update SEO settings for a specific page path.",
        parameters: {
          type: "object",
          properties: {
            pagePath: { type: "string", description: "Page path like /, /hotels, /about" },
            metaTitle: { type: "string" },
            metaDescription: { type: "string" },
            ogTitle: { type: "string" },
            ogDescription: { type: "string" },
            ogImage: { type: "string" },
            robots: { type: "string" },
            canonicalUrl: { type: "string" },
          },
          required: ["pagePath"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "get_hotels",
        description: "Get all hotels data to review current content before making changes.",
        parameters: { type: "object", properties: {} },
      },
    },
    {
      type: "function",
      function: {
        name: "get_pages",
        description: "Get all CMS pages to review current content.",
        parameters: { type: "object", properties: {} },
      },
    },
    {
      type: "function",
      function: {
        name: "get_settings",
        description: "Get all global CMS settings.",
        parameters: { type: "object", properties: {} },
      },
    },
    {
      type: "function",
      function: {
        name: "get_blog_posts",
        description: "Get all blog posts to review.",
        parameters: { type: "object", properties: {} },
      },
    },
    {
      type: "function",
      function: {
        name: "translate_text",
        description: "Translate given text to a target language while maintaining luxury hospitality tone.",
        parameters: {
          type: "object",
          properties: {
            text: { type: "string", description: "Text to translate" },
            targetLanguage: { type: "string", description: "Target language code: en, ar, fr, de, es, ru, pl, cs" },
            context: { type: "string", description: "Context hint: hotel_description, page_content, blog, marketing" },
          },
          required: ["text", "targetLanguage"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "create_page",
        description: "Create a new CMS page with multilingual title and content.",
        parameters: {
          type: "object",
          properties: {
            slug: { type: "string", description: "URL slug for the page (lowercase, hyphens)" },
            title: { type: "object", description: "Multilingual title {\"en\": \"...\", \"ar\": \"...\", ...}" },
            content: { type: "object", description: "Multilingual content {\"en\": \"...\", \"ar\": \"...\", ...}" },
            status: { type: "string", enum: ["draft", "published"], description: "Page status" },
          },
          required: ["slug", "title", "content"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "create_blog_post",
        description: "Create a new blog post with multilingual title, content, excerpt and SEO fields.",
        parameters: {
          type: "object",
          properties: {
            slug: { type: "string", description: "URL slug" },
            title: { type: "object", description: "Multilingual title JSONB" },
            content: { type: "object", description: "Multilingual content JSONB" },
            excerpt: { type: "object", description: "Multilingual excerpt/summary JSONB" },
            featuredImage: { type: "string", description: "Featured image URL" },
            metaTitle: { type: "string", description: "SEO meta title" },
            metaDescription: { type: "string", description: "SEO meta description" },
            status: { type: "string", enum: ["draft", "published"] },
          },
          required: ["slug", "title", "content"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "bulk_translate_hotel",
        description: "Translate a hotel's description to ALL missing languages at once. Reads current description, identifies missing languages, and translates to fill them all.",
        parameters: {
          type: "object",
          properties: {
            hotel_slug: { type: "string", description: "Hotel slug: crystal-beach, beach-club, la-plage, or royal-bay" },
            source_language: { type: "string", description: "Source language to translate FROM (default: en)" },
          },
          required: ["hotel_slug"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "get_seo_settings",
        description: "Get all SEO settings to review and audit.",
        parameters: { type: "object", properties: {} },
      },
    },
    {
      type: "function",
      function: {
        name: "get_page_contents",
        description: "Get all inline page content (live edit content) to review.",
        parameters: { type: "object", properties: {} },
      },
    },
  ];

  async function executeCmsToolCall(name: string, args: any): Promise<string> {
    try {
      switch (name) {
        case "get_hotels": {
          const hotels = await storage.getHotels();
          return JSON.stringify(hotels.map(h => ({ id: h.id, slug: h.slug, name: h.name, description: h.description, features: h.features, status: h.status })));
        }
        case "get_pages": {
          const pages = await storage.getPages();
          return JSON.stringify(pages.map(p => ({ id: p.id, slug: p.slug, title: p.title, status: p.status })));
        }
        case "get_settings": {
          const settings = await storage.getSettings();
          const result: Record<string, any> = {};
          for (const s of settings) result[s.key] = s.value;
          return JSON.stringify(result);
        }
        case "get_blog_posts": {
          const posts = await storage.getBlogPosts();
          return JSON.stringify(posts.map(p => ({ id: p.id, slug: p.slug, title: p.title, status: p.status })));
        }
        case "update_hotel": {
          const hotel = await storage.getHotelBySlug(args.hotel_slug);
          if (!hotel) return JSON.stringify({ error: `Hotel '${args.hotel_slug}' not found` });
          const updates = args.updates || {};
          const { hotel_slug, ...rest } = args;
          const mergedUpdates = { ...rest, ...updates };
          delete mergedUpdates.updates;
          if (mergedUpdates.description && typeof mergedUpdates.description === "object") {
            const existing = (hotel.description as Record<string, string>) || {};
            mergedUpdates.description = { ...existing, ...mergedUpdates.description };
          }
          const updated = await storage.updateHotel(hotel.id, mergedUpdates);
          return JSON.stringify({ success: true, hotel: updated?.name });
        }
        case "update_setting": {
          const result = await storage.upsertSetting(args.key, args.value);
          return JSON.stringify({ success: true, key: result.key });
        }
        case "update_page_content": {
          const result = await storage.upsertPageContent(args.pagePath, args.contentKey, "text", args.value);
          return JSON.stringify({ success: true, id: result.id });
        }
        case "update_page": {
          const pageUpdates = args.updates || {};
          const { page_id, ...pageRest } = args;
          const pageMerged = { ...pageRest, ...pageUpdates };
          delete pageMerged.updates;
          const updated = await storage.updatePage(args.page_id, pageMerged);
          if (!updated) return JSON.stringify({ error: "Page not found" });
          return JSON.stringify({ success: true, page: updated.slug });
        }
        case "update_blog_post": {
          const postUpdates = args.updates || {};
          const { post_id, ...postRest } = args;
          const postMerged = { ...postRest, ...postUpdates };
          delete postMerged.updates;
          const updated = await storage.updateBlogPost(args.post_id, postMerged);
          if (!updated) return JSON.stringify({ error: "Blog post not found" });
          return JSON.stringify({ success: true, post: updated.slug });
        }
        case "update_seo": {
          const { pagePath, ...seoData } = args;
          const result = await storage.upsertSeo({ pagePath, ...seoData });
          return JSON.stringify({ success: true, id: result.id });
        }
        case "translate_text": {
          const langNames: Record<string, string> = { en: "English", ar: "Arabic", fr: "French", de: "German", es: "Spanish", ru: "Russian", pl: "Polish", cs: "Czech" };
          const resp = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: `You are a professional translator for a luxury hotel brand. Translate the following text to ${langNames[args.targetLanguage] || args.targetLanguage}. Maintain the luxury hospitality tone. Context: ${args.context || "general"}. Return ONLY the translated text, nothing else.` },
              { role: "user", content: args.text },
            ],
            max_tokens: 2000,
            temperature: 0.3,
          });
          return resp.choices[0]?.message?.content || "Translation failed";
        }
        case "create_page": {
          const page = await storage.createPage({
            slug: args.slug,
            title: args.title,
            content: args.content,
            status: args.status || "draft",
          });
          return JSON.stringify({ success: true, page: { id: page.id, slug: page.slug } });
        }
        case "create_blog_post": {
          const post = await storage.createBlogPost({
            slug: args.slug,
            title: args.title,
            content: args.content,
            excerpt: args.excerpt || {},
            featuredImage: args.featuredImage || null,
            metaTitle: args.metaTitle || null,
            metaDescription: args.metaDescription || null,
            status: args.status || "draft",
          });
          return JSON.stringify({ success: true, post: { id: post.id, slug: post.slug } });
        }
        case "bulk_translate_hotel": {
          const allLangs = ["en", "ar", "fr", "de", "es", "ru", "pl", "cs"];
          const langNames: Record<string, string> = { en: "English", ar: "Arabic", fr: "French", de: "German", es: "Spanish", ru: "Russian", pl: "Polish", cs: "Czech" };
          const hotel = await storage.getHotelBySlug(args.hotel_slug);
          if (!hotel) return JSON.stringify({ error: `Hotel '${args.hotel_slug}' not found` });
          const desc = (hotel.description as Record<string, string>) || {};
          const sourceLang = args.source_language || "en";
          const sourceText = desc[sourceLang];
          if (!sourceText) return JSON.stringify({ error: `No ${sourceLang} description found to translate from` });
          const missingLangs = allLangs.filter(l => l !== sourceLang && (!desc[l] || desc[l].trim().length < 10));
          if (missingLangs.length === 0) return JSON.stringify({ success: true, message: "All languages already have descriptions", existing: Object.keys(desc) });
          const newDesc = { ...desc };
          for (const lang of missingLangs) {
            const resp = await openai.chat.completions.create({
              model: "gpt-4o-mini",
              messages: [
                { role: "system", content: `You are a professional translator for a luxury hotel brand. Translate the following hotel description to ${langNames[lang]}. Maintain the luxury hospitality tone and marketing appeal. Return ONLY the translated text.` },
                { role: "user", content: sourceText },
              ],
              max_tokens: 2000,
              temperature: 0.3,
            });
            newDesc[lang] = resp.choices[0]?.message?.content || "";
          }
          await storage.updateHotel(hotel.id, { description: newDesc });
          return JSON.stringify({ success: true, hotel: hotel.name, translated: missingLangs, total_languages: Object.keys(newDesc).length });
        }
        case "get_seo_settings": {
          const seoSettings = await storage.getSeoSettings();
          return JSON.stringify(seoSettings);
        }
        case "get_page_contents": {
          const contents = await storage.getAllPageContents();
          return JSON.stringify(contents.slice(0, 100));
        }
        default:
          return JSON.stringify({ error: `Unknown tool: ${name}` });
      }
    } catch (e: any) {
      return JSON.stringify({ error: e.message });
    }
  }

  app.get("/api/chat-history", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const conv = await storage.getChatConversation(userId);
      res.json({ messages: conv?.messages || [] });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/chat-history", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const { messages } = req.body;
      if (!Array.isArray(messages)) {
        return res.status(400).json({ error: "messages array required" });
      }
      await storage.saveChatConversation(userId, messages);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/chat-history", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      await storage.clearChatConversation(userId);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/cms-assistant", requireAuth, async (req, res) => {
    try {
      const { messages } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "messages array is required" });
      }

      const trimmedMessages = messages.slice(-20).map((m: { role: string; content: string | any[]; images?: string[] }) => {
        if (m.role === "user" && m.images && m.images.length > 0) {
          const contentParts: any[] = [];
          if (typeof m.content === "string" && m.content.trim()) {
            contentParts.push({ type: "text", text: m.content.slice(0, 2000) });
          }
          for (const img of m.images.slice(0, 5)) {
            contentParts.push({
              type: "image_url",
              image_url: { url: img, detail: "high" },
            });
          }
          return { role: "user" as const, content: contentParts };
        }
        return {
          role: m.role as "user" | "assistant",
          content: typeof m.content === "string" ? m.content.slice(0, 2000) : "",
        };
      });

      const chatMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: "system", content: CMS_ASSISTANT_SYSTEM },
        ...trimmedMessages,
      ];

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Accel-Buffering", "no");
      res.flushHeaders();

      const sendSSE = (data: any) => {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
        if (typeof (res as any).flush === "function") (res as any).flush();
      };

      let continueLoop = true;
      let currentMessages = chatMessages;
      let iterations = 0;
      const MAX_ITERATIONS = 10;

      while (continueLoop && iterations < MAX_ITERATIONS) {
        iterations++;
        
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: currentMessages,
          tools: cmsAssistantTools,
          tool_choice: "auto",
          stream: false,
          max_tokens: 4000,
          temperature: 0.7,
        });

        const choice = response.choices[0];
        const msg = choice.message;

        if (msg.tool_calls && msg.tool_calls.length > 0) {
          currentMessages.push(msg as any);

          for (const toolCall of msg.tool_calls) {
            try {
              const tc = toolCall as any;
              const fnName = tc.function.name;
              const fnArgs = JSON.parse(tc.function.arguments);
              
              console.log(`[cms-assistant] Executing tool: ${fnName}`, JSON.stringify(fnArgs).substring(0, 200));
              sendSSE({ tool_call: fnName, args: fnArgs });
              
              const result = await executeCmsToolCall(fnName, fnArgs);
              console.log(`[cms-assistant] Tool ${fnName} result:`, result.substring(0, 300));

              currentMessages.push({
                role: "tool",
                tool_call_id: toolCall.id,
                content: result,
              } as any);
            } catch (toolError: any) {
              console.error(`[cms-assistant] Tool execution error:`, toolError);
              currentMessages.push({
                role: "tool",
                tool_call_id: toolCall.id,
                content: JSON.stringify({ error: toolError.message || "Tool execution failed" }),
              } as any);
            }
          }
        } else {
          const content = msg.content || "";
          sendSSE({ content });
          continueLoop = false;
        }

        if (choice.finish_reason === "stop" || choice.finish_reason === "length") {
          continueLoop = false;
        }
      }

      sendSSE({ done: true });
      res.end();
    } catch (error: any) {
      console.error("CMS assistant error:", error?.message || error);
      if (res.headersSent) {
        try {
          res.write(`data: ${JSON.stringify({ error: "Something went wrong. Please try again." })}\n\n`);
          res.end();
        } catch {}
      } else {
        res.status(500).json({ error: "Failed to get response" });
      }
    }
  });

  return httpServer;
}
