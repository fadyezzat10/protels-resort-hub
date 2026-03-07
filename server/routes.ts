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
import * as pdfParsePkg from "pdf-parse";
const PDFParse = (pdfParsePkg as any).PDFParse || (pdfParsePkg as any).default?.PDFParse;
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

  app.get("/robots.txt", (_req, res) => {
    res.set("Content-Type", "text/plain");
    res.send(`User-agent: *
Allow: /

Disallow: /admin
Disallow: /admin/*
Disallow: /controlpanal
Disallow: /controlpanal/*
Disallow: /api/

Sitemap: https://protels.com/sitemap.xml
`);
  });

  app.get("/sitemap.xml", async (_req, res) => {
    const baseUrl = "https://protels.com";
    const today = new Date().toISOString().split("T")[0];

    const staticPages = [
      { path: "/", priority: "1.0", changefreq: "daily" },
      { path: "/hotels", priority: "0.9", changefreq: "weekly" },
      { path: "/about", priority: "0.7", changefreq: "monthly" },
      { path: "/contact", priority: "0.8", changefreq: "monthly" },
      { path: "/careers", priority: "0.6", changefreq: "monthly" },
      { path: "/gallery", priority: "0.7", changefreq: "weekly" },
      { path: "/blog", priority: "0.8", changefreq: "daily" },
      { path: "/company-profile", priority: "0.5", changefreq: "monthly" },
    ];

    const hotelData = [
      { slug: "crystal-beach", sections: ["overview", "accommodation", "dining", "gallery", "facilities", "contact"] },
      { slug: "beach-club", sections: ["overview", "accommodation", "dining", "gallery", "facilities", "contact"] },
      { slug: "la-plage", sections: ["overview", "accommodation", "dining", "gallery", "facilities", "contact"] },
      { slug: "royal-bay", sections: ["overview"] },
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
    xml += `        xmlns:xhtml="http://www.w3.org/1999/xhtml"\n`;
    xml += `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

    for (const page of staticPages) {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}${page.path}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += `  </url>\n`;
    }

    for (const hotel of hotelData) {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/hotels/${hotel.slug}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.9</priority>\n`;
      xml += `  </url>\n`;

      for (const section of hotel.sections) {
        if (section === "overview") continue;
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/hotels/${hotel.slug}/${section}</loc>\n`;
        xml += `    <lastmod>${today}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.7</priority>\n`;
        xml += `  </url>\n`;
      }
    }

    try {
      const publishedPosts = (await storage.getBlogPosts()).filter(p => p.status === "published");
      for (const post of publishedPosts) {
        const encodedSlug = encodeURIComponent(post.slug);
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/blog/${encodedSlug}</loc>\n`;
        xml += `    <lastmod>${post.updatedAt ? new Date(post.updatedAt).toISOString().split("T")[0] : today}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.7</priority>\n`;
        xml += `  </url>\n`;
      }
    } catch (e) {
      console.error("Sitemap: error loading blog posts", e);
    }

    xml += `</urlset>`;

    res.set("Content-Type", "application/xml");
    res.set("Cache-Control", "public, max-age=3600");
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

  const publicApiCache = new Map<string, { data: any; time: number }>();
  const PUBLIC_CACHE_TTL = 60 * 1000;

  function getCached(key: string) {
    const entry = publicApiCache.get(key);
    if (entry && Date.now() - entry.time < PUBLIC_CACHE_TTL) return entry.data;
    return null;
  }

  function setCache(key: string, data: any) {
    publicApiCache.set(key, { data, time: Date.now() });
  }

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

  app.get("/api/public/hotels", async (req, res) => {
    const cacheKey = req.query.full === "true" ? "hotels-full" : "hotels-light";
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    const all = await storage.getHotels();
    const published = all.filter(h => h.status === "published");
    if (req.query.full === "true") {
      setCache(cacheKey, published);
      res.json(published);
    } else {
      const light = published.map(h => ({
        id: h.id,
        slug: h.slug,
        name: h.name,
        location: h.location,
        image: h.image,
        description: h.description,
        features: h.features,
        rooms: h.rooms,
        discount: h.discount,
        sortOrder: h.sortOrder,
        bookingLink: h.bookingLink,
        heroVideo: h.heroVideo,
        theme: h.theme,
      }));
      setCache(cacheKey, light);
      res.json(light);
    }
  });

  app.get("/api/public/hotels/:slug", async (req, res) => {
    const cacheKey = `hotel-${req.params.slug}`;
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    const hotel = await storage.getHotelBySlug(req.params.slug);
    if (!hotel || hotel.status !== "published") return res.status(404).json({ message: "Not found" });
    setCache(cacheKey, hotel);
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

  function detectHotelFromMessage(text: string): string | "ask-marsa-alam" | null {
    const lower = text.toLowerCase();
    if (lower.includes("crystal") || lower.includes("كريستال")) return "crystal-beach";
    if (lower.includes("beach club") || lower.includes("بيتش كلاب") || lower.includes("بيتش كلوب")) return "beach-club";
    if (lower.includes("la plage") || lower.includes("لا بلاج")) return "la-plage";
    if (lower.includes("زنجبار") || lower.includes("zanzibar")) return "la-plage";
    if (lower.includes("royal bay") || lower.includes("رويال باي")) return "royal-bay";
    if (lower.includes("hurghada") || lower.includes("الغردقة") || lower.includes("الغردقه") || lower.includes("هرغادة") || lower.includes("هرغاده")) return "royal-bay";
    if (lower.includes("aqua") || lower.includes("slide") || lower.includes("زحاليق") || lower.includes("زحليقه") || lower.includes("اكوا") || lower.includes("أكوا")) return "beach-club";
    if (lower.includes("kids") || lower.includes("اطفال") || lower.includes("أطفال") || lower.includes("عيال") || lower.includes("family") || lower.includes("عائل") || lower.includes("عائلة") || lower.includes("أسرة")) return "beach-club";
    if (lower.includes("honeymoon") || lower.includes("شهر عسل") || lower.includes("شهر العسل") || lower.includes("romantic") || lower.includes("رومانس") || lower.includes("رومانسي")) return "la-plage";
    if (lower.includes("relax") || lower.includes("quiet") || lower.includes("هدوء") || lower.includes("استرخاء") || lower.includes("هادي") || lower.includes("هادئ")) return "crystal-beach";
    if (lower.includes("مرسى علم") || lower.includes("marsa alam") || lower.includes("مرسي علم")) return "ask-marsa-alam";
    return null;
  }

  function buildSystemPrompt(hotel: string | null): string {
    let prompt = `You are the top luxury hotel concierge at Protels Hotels & Resorts. You think deeply, understand context, read between the lines, and respond like a brilliant human who genuinely cares about helping guests find their perfect vacation.

INTELLIGENCE RULES:
- READ THE FULL CONVERSATION before replying. Understand what was already discussed, what the guest wants, and what they haven't said yet
- INFER intent from context. If someone says "عايزين مكان هادي أنا ومراتي" → they want a quiet couples resort (Crystal Beach or La Plage), NOT a family resort
- REMEMBER everything the guest said. If they mentioned 2 adults earlier, don't ask again
- CONNECT the dots: if they said "honeymoon" + "July" → recommend the best option for that combo and explain WHY
- If someone asks a vague question, give a smart, specific answer based on what you know about them so far
- Think like a real travel expert: consider season, group type, budget hints, and preferences to make the BEST recommendation
- If the guest is comparing hotels, give a clear honest comparison with pros of each for THEIR specific situation

PERSONALITY:
- You are a CLOSER — guide guests toward booking naturally, never pushy
- Be conversational and brief. Max 2-3 short sentences unless giving detailed hotel info
- NEVER repeat information you already said
- Ask ONE smart follow-up question at a time
- When the guest gives you info (dates, guests, etc.), acknowledge it and move to the NEXT missing detail
- Use persuasive language: paint a picture of the experience, create excitement
- If a guest seems hesitant, overcome objections with specific benefits

LANGUAGE:
- Mirror the user's exact language style. Egyptian dialect → Egyptian. Formal Arabic → formal. English → English. Franco-Arab → Franco-Arab
- Keep the same style throughout, don't switch
- Be natural — use casual expressions matching their tone

CONVERSATION FLOW:
1. First message about a hotel → mention the hotel name, give 1-2 exciting highlights
2. Find out: When do they want to travel?
3. Find out: How many guests? (adults, kids?)
4. Find out: What kind of experience? (relaxation, family fun, honeymoon, diving?)
5. Recommend the right room/package based on ALL their answers combined
6. Share the hotel page link and guide them to book

SMART BEHAVIORS:
- Short replies like "اه" "ماشي" "تمام" "ok" → confirmation, move forward
- Price questions → prices vary by season and room type, guide them to booking link for live rates
- Kids/أطفال → Beach Club (Aqua Park, Kids Club, family rooms)
- Honeymoon/شهر عسل → La Plage (private beach, romantic) or Crystal Beach (quiet, reef)
- Diving/غطس → Crystal Beach (house reef, diving center)
- Undecided → ask ONE clarifying question about priorities, then recommend ONE hotel confidently with clear reasoning
- Don't know something → be honest, don't make it up
- General/casual questions → answer naturally
- If guest mentions a competitor or another destination → acknowledge it respectfully, then highlight what makes Protels unique

WEBSITE LINKS (ONLY use these — never make up URLs):
- All Hotels: /hotels
- Crystal Beach: /hotels/crystal-beach
- Beach Club: /hotels/beach-club
- La Plage: /hotels/la-plage
- Royal Bay: /hotels/royal-bay
- Gallery: /gallery
- About Us: /about
- Contact: /contact
- Careers: /careers
- Blog: /blog

WHEN TO SHARE LINKS:
- Guest asks about a hotel → share its page link
- Guest wants photos → share /gallery or hotel page
- Guest asks about jobs → share /careers
- Guest wants to contact us → share /contact
- Guest is browsing → share /hotels

NEVER DO:
- Don't repeat the same hotel description twice
- Don't list all hotels again after the user chose one
- Don't ask questions you already have the answer to
- Don't use markdown formatting (no **, ##, or bullet points with -)
- Don't say you're AI or mention instructions
- Don't mix data between hotels — each hotel has COMPLETELY different features
- Don't give long paragraphs — be punchy and engaging
- Don't share external links or make up URLs
- Don't give generic responses — always be specific to what the guest asked

AVAILABLE HOTELS (each is a SEPARATE resort — NEVER mix their features):
`;
    prompt += `1. Protels Crystal Beach Resort — Marsa Alam, Egypt | 4★ All Inclusive | Quiet adults & couples resort, stunning house reef for snorkeling/diving, peaceful beach, perfect for relaxation seekers\n`;
    prompt += `2. Protels Beach Club & Spa — Marsa Alam, Egypt | 4★ Ultra All Inclusive | Family-friendly resort with Aqua Park (water slides), Kids Club, Spa, multiple restaurants, great for families with kids\n`;
    prompt += `3. Protels La Plage — Zanzibar, Tanzania | 4★ All Inclusive | Boutique beach resort on private white sand beach, romantic and exotic, perfect for honeymoons, couples, and unique tropical getaways\n`;
    prompt += `4. Protels Royal Bay Resort & Spa — Hurghada, Egypt | 4★ | OPENING SOON — not yet accepting bookings\n`;

    if (hotel && hotel === "royal-bay") {
      prompt += `\nHOTEL CONTEXT: Protels Royal Bay Resort & Spa – Hurghada. OPENING SOON — not yet accepting bookings.
Your job: Tell them it's opening soon with excitement. Ask for their name and phone/email so we can notify them first when bookings open. If they already gave contact info, thank them warmly and confirm. If they want to travel now, suggest Crystal Beach or Beach Club in Marsa Alam or La Plage in Zanzibar as alternatives.`;
    } else if (hotel && hotelInfoMap[hotel]) {
      const info = hotelInfoMap[hotel];
      prompt += `\nHOTEL CONTEXT: The guest is asking about ${info.name} – ${info.location} (${info.category}, ${info.concept}).
CRITICAL: ONLY talk about THIS hotel's features, rooms, restaurants, and amenities. Do NOT mention features from other hotels. If the knowledge base below has specific details (room types, restaurant names, facilities), use those EXACT details. Be specific — mention actual room names, restaurant names, pool details etc.`;
    } else {
      prompt += `\nNo hotel selected yet. Welcome them briefly and present the 3 destinations in a concise, exciting way:
مرسى علم: Crystal Beach (هدوء وغطس) أو Beach Club (عائلات وأكوا بارك)
زنجبار: La Plage (منتجع على شاطئ خاص)
الغردقة: Royal Bay (قريباً!)
Then ask: "إيه اللي في بالك؟" — keep it short and inviting.`;
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

      let selectedHotel: string | null = null;
      for (const msg of trimmedMessages) {
        if (msg.role === "user") {
          const detected = detectHotelFromMessage(msg.content);
          if (detected && detected !== "ask-marsa-alam") {
            selectedHotel = detected;
          }
        }
      }

      const systemPrompt = buildSystemPrompt(selectedHotel);
      const chatMessages: OpenAI.ChatCompletionMessageParam[] = [
        { role: "system", content: systemPrompt },
      ];

      if (selectedHotel && hotelKnowledgeMap[selectedHotel]) {
        const knowledge = hotelKnowledgeMap[selectedHotel];
        if (knowledge.length > 0) {
          chatMessages.push({
            role: "system",
            content: `HOTEL KNOWLEDGE BASE for ${hotelInfoMap[selectedHotel]?.name || selectedHotel}:\n${knowledge}\n\nUse this data to answer accurately. Do NOT mix information between hotels. If asked about a different hotel, only use that hotel's data.`,
          });
        }
      }

      chatMessages.push(...trimmedMessages);

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const stream = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: chatMessages,
        stream: true,
        max_tokens: 500,
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

  const bookingLinkMap: Record<string, string | null> = {
    "crystal-beach": "https://protels-crystal.book-onlinenow.net/",
    "la-plage": "https://protels-laplage.book-onlinenow.net/",
    "beach-club": "https://protels-beachclub.book-onlinenow.net/",
    "royal-bay": null,
  };

  function detectBookingSignals(text: string): string[] {
    const lower = text.toLowerCase();
    const signals: string[] = [];
    if (/يوم|يومين|ليال|ليله|ليلة|ليلتين|nights?|days?/i.test(lower)) signals.push("nights");
    if (/\d+\s*(أشخاص|شخص|ضيوف|ضيف|guests?|persons?|people|adults?|أفراد|فرد)/i.test(lower)) signals.push("guests");
    if (/(يناير|فبراير|مارس|أبريل|ابريل|مايو|يونيو|يوليو|أغسطس|اغسطس|سبتمبر|أكتوبر|اكتوبر|نوفمبر|ديسمبر|january|february|march|april|may|june|july|august|september|october|november|december)/i.test(lower)) signals.push("month");
    if (/\d{1,2}[\/\-]\d{1,2}/.test(lower)) signals.push("date");
    if (/(تمام|كويس|مناسب|اوك|أوك|ok|okay|ماشي|موافق|يلا|احجز|عايز احجز|ابوك|book)/i.test(lower)) signals.push("confirm");
    return signals;
  }

  let cachedChatbotConfig: Record<string, string> = {};
  let cachedFaqs: Array<{ question: string; answer: string }> = [];
  let cachedOffers: Array<{ title: string; description: string; hotelSlug: string | null }> = [];
  let chatbotCacheTime = 0;

  async function loadChatbotCmsData() {
    if (Date.now() - chatbotCacheTime < 60000) return;
    try {
      const configs = await storage.getChatbotConfigs();
      cachedChatbotConfig = {};
      for (const c of configs) cachedChatbotConfig[c.key] = c.value;

      const faqs = await storage.getChatbotFaqs();
      cachedFaqs = faqs.filter(f => f.isActive).map(f => ({ question: f.question, answer: f.answer }));

      const offers = await storage.getChatbotOffers();
      const now = new Date().toISOString().split("T")[0];
      cachedOffers = offers.filter(o => {
        if (!o.isActive) return false;
        if (o.startDate && o.startDate > now) return false;
        if (o.endDate && o.endDate < now) return false;
        return true;
      }).map(o => ({ title: o.title, description: o.description, hotelSlug: o.hotelSlug }));

      chatbotCacheTime = Date.now();
    } catch (e) {
      console.error("[chatbot] Failed to load CMS data:", e);
    }
  }

  function detectLeadInfo(text: string): { name?: string; contact?: string } {
    const result: { name?: string; contact?: string } = {};
    const phoneMatch = text.match(/(?:0[0-9]{10}|(?:\+|00)[0-9]{10,13})/);
    if (phoneMatch) result.contact = phoneMatch[0];
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) result.contact = emailMatch[0];
    const nameMatch = text.match(/(?:اسمي|اسمى|name is|my name)\s+([^\s,\.ورقم]{2,}(?:\s+[^\s,\.ورقم]{2,})?)/i);
    if (nameMatch) result.name = nameMatch[1].trim();
    return result;
  }

  const conversations: Record<string, { messages: Array<{ role: "user" | "assistant"; content: string }>; hotel: string | null; lastActive: number; bookingSignals: Set<string>; bookingLinkSent: boolean }> = {};

  setInterval(() => {
    const now = Date.now();
    for (const id of Object.keys(conversations)) {
      if (now - conversations[id].lastActive > 30 * 60 * 1000) {
        delete conversations[id];
      }
    }
  }, 5 * 60 * 1000);

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

      const { message, hotel, sessionId } = req.body;
      if (!message || typeof message !== "string") {
        return res.status(400).json({ reply: "Message is required." });
      }

      const sid = sessionId && typeof sessionId === "string" ? sessionId : clientIp;

      if (!conversations[sid]) {
        conversations[sid] = { messages: [], hotel: null, lastActive: Date.now(), bookingSignals: new Set(), bookingLinkSent: false };
      }
      const session = conversations[sid];
      session.lastActive = Date.now();

      let selectedHotel: string | null = session.hotel;

      if (!selectedHotel && hotel && hotelInfoMap[hotel]) {
        selectedHotel = hotel;
      }

      const detected = detectHotelFromMessage(message);

      if (detected === "ask-marsa-alam" && !selectedHotel) {
        const marsaReply = "عندنا في مرسى علم فندقين رائعين:\n\n" +
          "1. Protels Crystal Beach Resort – منتجع هادي وفخم على البحر الأحمر، مثالي للاسترخاء والغطس.\n\n" +
          "2. Protels Beach Club & Spa – منتجع Ultra All Inclusive فيه أكوا بارك و6 حمامات سباحة، مثالي للعائلات.\n\n" +
          "أنهي واحد يناسبك أكتر؟ 😉";
        session.messages.push({ role: "user", content: message });
        session.messages.push({ role: "assistant", content: marsaReply });
        return res.json({ reply: marsaReply });
      }

      if (!selectedHotel && detected && detected !== "ask-marsa-alam") {
        selectedHotel = detected;
      }

      if (selectedHotel) {
        session.hotel = selectedHotel;
      }

      const newSignals = detectBookingSignals(message);
      for (const s of newSignals) {
        session.bookingSignals.add(s);
      }

      session.messages.push({ role: "user", content: message.slice(0, MAX_CONTENT_LENGTH) });

      const recentMessages = session.messages.slice(-MAX_MESSAGES);

      await loadChatbotCmsData();

      let systemPrompt = buildSystemPrompt(selectedHotel);

      const cmsConfig = cachedChatbotConfig;
      if (cmsConfig.tone) systemPrompt += `\nTONE OVERRIDE: Use a ${cmsConfig.tone} tone.`;
      if (cmsConfig.responseLength) systemPrompt += `\nRESPONSE LENGTH: Keep responses ${cmsConfig.responseLength}.`;
      if (cmsConfig.language) systemPrompt += `\nLANGUAGE PREFERENCE: ${cmsConfig.language}.`;
      if (cmsConfig.customInstructions) systemPrompt += `\nADDITIONAL INSTRUCTIONS FROM MANAGEMENT:\n${cmsConfig.customInstructions}`;

      if (cachedFaqs.length > 0) {
        systemPrompt += `\n\nFREQUENTLY ASKED QUESTIONS — If the user asks something similar, use these answers:\n`;
        for (const faq of cachedFaqs) {
          systemPrompt += `Q: ${faq.question}\nA: ${faq.answer}\n\n`;
        }
      }

      const relevantOffers = cachedOffers.filter(o => !o.hotelSlug || o.hotelSlug === selectedHotel);
      if (relevantOffers.length > 0) {
        systemPrompt += `\n\nCURRENT ACTIVE OFFERS — Mention these naturally when relevant:\n`;
        for (const offer of relevantOffers) {
          systemPrompt += `- ${offer.title}: ${offer.description}\n`;
        }
      }

      const chatMessages: OpenAI.ChatCompletionMessageParam[] = [
        { role: "system", content: systemPrompt },
      ];
      if (selectedHotel && hotelKnowledgeMap[selectedHotel]) {
        chatMessages.push({ role: "system", content: hotelKnowledgeMap[selectedHotel] });
      }
      chatMessages.push(...recentMessages);

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: chatMessages,
        max_tokens: 350,
        temperature: 0.7,
      });

      let reply = completion.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";

      if (selectedHotel === "royal-bay" && session.bookingSignals.size >= 2) {
        reply = "Protels Royal Bay Resort & Spa – Hurghada قيد الافتتاح قريبًا ✨\nنقدر نسجل بياناتك (اسمك ورقم تليفونك أو الإيميل) عشان نبلغك أول ما الحجز يفتح!";
      } else if (selectedHotel && session.bookingSignals.size >= 2 && !session.bookingLinkSent && bookingLinkMap[selectedHotel]) {
        reply += "\n\n🔗 يمكنك إتمام الحجز مباشرة من خلال الرابط التالي:\n" + bookingLinkMap[selectedHotel];
        session.bookingLinkSent = true;
      }

      session.messages.push({ role: "assistant", content: reply });

      // Save conversation to DB for CMS viewing
      try {
        const leadInfo = detectLeadInfo(message);
        const msgEntry = { role: "assistant" as const, content: reply, timestamp: Date.now() };
        const userMsgEntry = { role: "user" as const, content: message.slice(0, MAX_CONTENT_LENGTH), timestamp: Date.now() };

        const existingConv = await storage.getChatbotConversationBySession(sid);
        if (existingConv) {
          const msgs = [...(existingConv.messages || []), userMsgEntry, msgEntry];
          const updateData: any = { messages: msgs, hotelSlug: selectedHotel || existingConv.hotelSlug };
          if (leadInfo.name) updateData.leadName = leadInfo.name;
          if (leadInfo.contact) updateData.leadContact = leadInfo.contact;
          if (leadInfo.name || leadInfo.contact) updateData.hasLead = true;
          await storage.updateChatbotConversation(existingConv.id, updateData);
        } else {
          await storage.saveChatbotConversation({
            sessionId: sid,
            hotelSlug: selectedHotel,
            messages: [userMsgEntry, msgEntry],
            hasLead: !!(leadInfo.name || leadInfo.contact),
            leadName: leadInfo.name || null,
            leadContact: leadInfo.contact || null,
          });
        }
      } catch (dbErr) {
        console.error("[chatbot] DB save error:", dbErr);
      }

      res.json({ reply });
    } catch (error: any) {
      console.error("Chat endpoint error:", error);
      res.status(500).json({ reply: "حدث خطأ، حاول مرة أخرى." });
    }
  });

  // ──────── IMAGE OPTIMIZATION ANALYZER ────────
  app.get("/api/cms/image-analysis", requireAuth, async (_req, res) => {
    try {
      const images: any[] = [];
      const seen = new Set<string>();

      const addImage = (url: string, page: string, category: string) => {
        if (!url || seen.has(url)) return;
        seen.add(url);
        images.push({ url, page, category });
      };

      const allHotels = await storage.getHotels();
      for (const h of allHotels) {
        if (h.image) addImage(h.image, `/hotels/${h.slug}`, "hero");
        if (Array.isArray(h.gallery)) {
          for (const g of h.gallery) addImage(g, `/hotels/${h.slug}/gallery`, "gallery");
        }
        if (h.room_details && Array.isArray(h.room_details)) {
          for (const room of h.room_details as any[]) {
            if (room.images && Array.isArray(room.images)) {
              for (const img of room.images) addImage(img, `/hotels/${h.slug}/accommodation`, "room");
            }
          }
        }
      }

      const blogPosts = await storage.getBlogPosts();
      for (const post of blogPosts) {
        if (post.featuredImage) addImage(post.featuredImage, `/blog/${post.slug}`, "blog");
      }

      const mediaFiles = await storage.getMediaFiles();
      for (const m of mediaFiles) {
        if (m.mimeType?.startsWith("image/") && m.url) {
          addImage(m.url, "/media-library", "media");
        }
      }

      const results: any[] = [];
      for (const img of images) {
        let fileSize = 0;
        let exists = false;
        let filePath = "";

        if (img.url.startsWith("/images/")) {
          filePath = path.join(process.cwd(), "client/public", img.url);
        } else if (img.url.startsWith("/uploads/")) {
          filePath = path.join(process.cwd(), img.url.replace(/^\//, ""));
        }

        if (filePath && fs.existsSync(filePath)) {
          const stat = fs.statSync(filePath);
          fileSize = stat.size;
          exists = true;
        }

        const ext = path.extname(img.url).toLowerCase();
        const isWebp = ext === ".webp";
        const sizeKB = Math.round(fileSize / 1024);
        const status = fileSize > 300 * 1024 ? "heavy" : "ok";

        let recommendedRes = "800x600";
        if (img.category === "hero") recommendedRes = "1920x1080";
        else if (img.category === "gallery") recommendedRes = "1200x800";
        else if (img.category === "room") recommendedRes = "1000x667";
        else if (img.category === "blog") recommendedRes = "1200x630";

        results.push({
          url: img.url,
          page: img.page,
          category: img.category,
          fileSize: sizeKB,
          fileSizeBytes: fileSize,
          status,
          isWebp,
          exists,
          recommendedRes,
          canOptimize: exists && !isWebp && fileSize > 0,
        });
      }

      results.sort((a, b) => b.fileSizeBytes - a.fileSizeBytes);

      const totalImages = results.length;
      const heavyCount = results.filter(r => r.status === "heavy").length;
      const nonWebpCount = results.filter(r => !r.isWebp && r.exists).length;
      const totalSizeKB = results.reduce((sum, r) => sum + r.fileSize, 0);

      res.json({
        images: results,
        summary: { totalImages, heavyCount, nonWebpCount, totalSizeMB: Math.round(totalSizeKB / 1024) },
      });
    } catch (err: any) {
      console.error("Image analysis error:", err);
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/cms/optimize-image", requireAuth, async (req, res) => {
    try {
      const sharp = (await import("sharp")).default;
      const { url, quality = 80, maxWidth = 1920 } = req.body;
      if (!url) return res.status(400).json({ message: "URL required" });

      let filePath = "";
      if (url.startsWith("/images/")) {
        filePath = path.join(process.cwd(), "client/public", url);
      } else if (url.startsWith("/uploads/")) {
        filePath = path.join(process.cwd(), url.replace(/^\//, ""));
      }

      if (!filePath || !fs.existsSync(filePath)) {
        return res.status(404).json({ message: "File not found on disk" });
      }

      const originalStat = fs.statSync(filePath);
      const originalSize = originalStat.size;

      const webpPath = filePath.replace(/\.(png|jpe?g|gif|bmp|tiff?)$/i, ".webp");

      await sharp(filePath)
        .resize({ width: maxWidth, withoutEnlargement: true })
        .webp({ quality })
        .toFile(webpPath);

      const newStat = fs.statSync(webpPath);
      const newSize = newStat.size;

      const newUrl = url.replace(/\.(png|jpe?g|gif|bmp|tiff?)$/i, ".webp");

      res.json({
        originalUrl: url,
        newUrl,
        originalSize: Math.round(originalSize / 1024),
        newSize: Math.round(newSize / 1024),
        savings: Math.round(((originalSize - newSize) / originalSize) * 100),
      });
    } catch (err: any) {
      console.error("Image optimization error:", err);
      res.status(500).json({ message: err.message });
    }
  });

  // ──────── WEBSITE PERFORMANCE ANALYZER ────────
  app.get("/api/cms/performance-analysis", requireAuth, async (_req, res) => {
    try {
      const sharp = (await import("sharp")).default;

      interface PageImage {
        url: string;
        page: string;
        renderPosition: "Hero" | "Section" | "Gallery";
        isFirstOnPage: boolean;
      }

      const pageImages: PageImage[] = [];
      const seen = new Set<string>();
      const pageFirstTracker = new Map<string, boolean>();

      const addImg = (url: string, page: string, renderPosition: PageImage["renderPosition"]) => {
        if (!url || seen.has(url + page)) return;
        seen.add(url + page);
        const isFirst = !pageFirstTracker.has(page);
        if (isFirst) pageFirstTracker.set(page, true);
        pageImages.push({ url, page, renderPosition, isFirstOnPage: isFirst });
      };

      const allHotels = await storage.getHotels();
      for (const h of allHotels) {
        const hotelPage = `/hotels/${h.slug}`;
        if (h.image) addImg(h.image, hotelPage, "Hero");
        if (Array.isArray(h.gallery)) {
          for (const g of h.gallery) addImg(g, hotelPage, "Gallery");
        }
        if (h.room_details && Array.isArray(h.room_details)) {
          for (const room of h.room_details as any[]) {
            if (room.images && Array.isArray(room.images)) {
              for (const img of room.images) addImg(img, hotelPage, "Section");
            }
          }
        }
      }

      const settings = await storage.getSettings();
      const heroImagesRaw = settings.find((s: any) => s.key === "hero_images");
      if (heroImagesRaw?.value) {
        try {
          const heroArr = typeof heroImagesRaw.value === "string" ? JSON.parse(heroImagesRaw.value) : heroImagesRaw.value;
          if (Array.isArray(heroArr)) {
            for (const img of heroArr) addImg(img, "/", "Hero");
          }
        } catch {}
      }

      const blogPosts = await storage.getBlogPosts();
      for (const post of blogPosts) {
        if (post.featuredImage) addImg(post.featuredImage, `/blog/${post.slug}`, "Hero");
      }

      const mediaFiles = await storage.getMediaFiles();
      for (const m of mediaFiles) {
        if (m.mimeType?.startsWith("image/") && m.url) {
          addImg(m.url, "/media-library", "Section");
        }
      }

      interface AnalyzedImage {
        type: "image";
        url: string;
        page: string;
        renderPosition: string;
        fileSize: number;
        fileSizeBytes: number;
        width: number | null;
        height: number | null;
        format: string;
        isWebp: boolean;
        exists: boolean;
        isLCP: boolean;
        impactLevel: "High" | "Medium" | "Low";
        impactReason: string;
        recommendations: string[];
        recommendedRes: string;
        canOptimize: boolean;
      }

      const imageResults: AnalyzedImage[] = [];

      for (const img of pageImages) {
        let filePath = "";
        if (img.url.startsWith("/images/")) {
          filePath = path.join(process.cwd(), "client/public", img.url);
        } else if (img.url.startsWith("/uploads/")) {
          filePath = path.join(process.cwd(), img.url.replace(/^\//, ""));
        }

        let fileSize = 0;
        let exists = false;
        let width: number | null = null;
        let height: number | null = null;
        let format = path.extname(img.url).replace(".", "").toLowerCase();

        if (filePath && fs.existsSync(filePath)) {
          const stat = fs.statSync(filePath);
          fileSize = stat.size;
          exists = true;
          try {
            const meta = await sharp(filePath).metadata();
            width = meta.width || null;
            height = meta.height || null;
            if (meta.format) format = meta.format;
          } catch {}
        } else if (img.url.startsWith("http")) {
          try {
            const ctrl = new AbortController();
            const timer = setTimeout(() => ctrl.abort(), 5000);
            const headRes = await fetch(img.url, { method: "HEAD", signal: ctrl.signal });
            clearTimeout(timer);
            if (headRes.ok) {
              exists = true;
              const cl = headRes.headers.get("content-length");
              if (cl) fileSize = parseInt(cl, 10);
              const ct = headRes.headers.get("content-type");
              if (ct?.includes("webp")) format = "webp";
              else if (ct?.includes("png")) format = "png";
              else if (ct?.includes("jpeg") || ct?.includes("jpg")) format = "jpeg";
            }
          } catch {}
        }

        const sizeKB = Math.round(fileSize / 1024);
        const isWebp = format === "webp";
        const isLCP = img.isFirstOnPage && img.renderPosition === "Hero";

        let recWidth = 800;
        let recHeight = 600;
        if (img.renderPosition === "Hero") { recWidth = 1920; recHeight = 1080; }
        else if (img.renderPosition === "Gallery") { recWidth = 1200; recHeight = 800; }
        else if (img.renderPosition === "Section") { recWidth = 1000; recHeight = 667; }

        const recommendations: string[] = [];
        let impactLevel: "High" | "Medium" | "Low" = "Low";
        let impactReason = "Image is within acceptable parameters";

        if (!isWebp && exists && format !== "svg") {
          recommendations.push("Convert to WebP for 25-80% smaller file size");
        }

        if (fileSize > 500 * 1024) {
          recommendations.push(`Compress image (currently ${sizeKB} KB, target < 200 KB)`);
        } else if (fileSize > 200 * 1024) {
          recommendations.push(`Consider compressing (currently ${sizeKB} KB, target < 200 KB)`);
        }

        if (width && height) {
          if (width > recWidth * 1.5 || height > recHeight * 1.5) {
            recommendations.push(`Resize to ${recWidth}x${recHeight} (currently ${width}x${height})`);
          }
        }

        if (isLCP && fileSize > 200 * 1024) {
          impactLevel = "High";
          impactReason = "LCP image — slowing the page";
        } else if (isLCP && !isWebp) {
          impactLevel = "High";
          impactReason = "LCP image — not in WebP format";
        } else if (isLCP) {
          impactLevel = "Medium";
          impactReason = "LCP image — monitor for performance";
        } else if (fileSize > 500 * 1024) {
          impactLevel = "High";
          impactReason = "Very large file size slowing the page";
        } else if (fileSize > 300 * 1024) {
          impactLevel = "Medium";
          impactReason = "Large file size may affect load time";
        } else if (!isWebp && exists && fileSize > 100 * 1024) {
          impactLevel = "Medium";
          impactReason = "Not using WebP — larger than necessary";
        }

        if (recommendations.length === 0 && exists) {
          impactReason = "Well optimized";
        }

        const canOptimize = exists && !isWebp && fileSize > 0 && !!filePath;

        imageResults.push({
          type: "image",
          url: img.url,
          page: img.page,
          renderPosition: img.renderPosition,
          fileSize: sizeKB,
          fileSizeBytes: fileSize,
          width,
          height,
          format,
          isWebp,
          exists,
          isLCP,
          impactLevel,
          impactReason,
          recommendations,
          recommendedRes: `${recWidth}x${recHeight}`,
          canOptimize,
        });
      }

      imageResults.sort((a, b) => {
        const order = { High: 0, Medium: 1, Low: 2 };
        if (order[a.impactLevel] !== order[b.impactLevel]) return order[a.impactLevel] - order[b.impactLevel];
        return b.fileSizeBytes - a.fileSizeBytes;
      });

      interface ScriptEntry {
        type: "script";
        fileName: string;
        filePath: string;
        fileSize: number;
        fileSizeBytes: number;
        gzipSize: number | null;
        chunkType: "entry" | "vendor" | "page" | "component";
        impactLevel: "High" | "Medium" | "Low";
        impactReason: string;
        recommendations: string[];
      }

      const scriptResults: ScriptEntry[] = [];
      const distDir = path.join(process.cwd(), "dist/public/assets");
      if (fs.existsSync(distDir)) {
        const jsFiles = fs.readdirSync(distDir).filter(f => f.endsWith(".js"));
        for (const jsFile of jsFiles) {
          const jsPath = path.join(distDir, jsFile);
          const stat = fs.statSync(jsPath);
          const sizeBytes = stat.size;
          const sizeKB = Math.round(sizeBytes / 1024);

          let gzipSize: number | null = null;
          try {
            const zlib = await import("zlib");
            const buf = fs.readFileSync(jsPath);
            const gzipped = zlib.gzipSync(buf);
            gzipSize = Math.round(gzipped.length / 1024);
          } catch {}

          const nameBase = jsFile.replace(/[-_][A-Za-z0-9]+\.js$/, "").toLowerCase();
          let chunkType: ScriptEntry["chunkType"] = "component";
          if (nameBase.includes("index") || nameBase.includes("vendor") || nameBase.includes("chunk")) {
            chunkType = "vendor";
          } else if (["home", "hotels", "about", "contact", "gallery", "careers", "blog", "blogarticle", "hoteldetails", "companyprofile"].some(p => nameBase.includes(p))) {
            chunkType = "page";
          } else if (nameBase.includes("cms") || nameBase.includes("admin")) {
            chunkType = "vendor";
          }

          const jsRecs: string[] = [];
          let jsImpact: ScriptEntry["impactLevel"] = "Low";
          let jsReason = "Script size is acceptable";

          if (sizeBytes > 500 * 1024) {
            jsImpact = "High";
            jsReason = "Very large bundle — blocks rendering";
            jsRecs.push("Split into smaller chunks using code splitting");
            jsRecs.push("Use dynamic import() for non-critical modules");
          } else if (sizeBytes > 200 * 1024) {
            jsImpact = "Medium";
            jsReason = "Large bundle — may delay interactivity";
            jsRecs.push("Consider code splitting to reduce initial load");
          } else if (sizeBytes > 100 * 1024) {
            jsReason = "Moderate bundle size";
            jsRecs.push("Monitor size — consider lazy loading if it grows");
          }

          if (gzipSize && gzipSize > 100) {
            jsRecs.push(`Enable gzip compression (${sizeKB} KB → ~${gzipSize} KB gzipped)`);
          }

          if (jsRecs.length === 0) jsReason = "Well optimized";

          scriptResults.push({
            type: "script",
            fileName: jsFile,
            filePath: `/assets/${jsFile}`,
            fileSize: sizeKB,
            fileSizeBytes: sizeBytes,
            gzipSize,
            chunkType,
            impactLevel: jsImpact,
            impactReason: jsReason,
            recommendations: jsRecs,
          });
        }
      }

      scriptResults.sort((a, b) => b.fileSizeBytes - a.fileSizeBytes);

      const imgHighCount = imageResults.filter(r => r.impactLevel === "High").length;
      const imgMediumCount = imageResults.filter(r => r.impactLevel === "Medium").length;
      const lcpCount = imageResults.filter(r => r.isLCP).length;
      const imgAffecting = imageResults.filter(r => r.recommendations.length > 0).length;
      const imgTotalKB = imageResults.reduce((s, r) => s + r.fileSize, 0);

      const jsHighCount = scriptResults.filter(r => r.impactLevel === "High").length;
      const jsMediumCount = scriptResults.filter(r => r.impactLevel === "Medium").length;
      const jsAffecting = scriptResults.filter(r => r.recommendations.length > 0).length;
      const jsTotalKB = scriptResults.reduce((s, r) => s + r.fileSize, 0);

      res.json({
        images: imageResults,
        scripts: scriptResults,
        summary: {
          totalImages: imageResults.length,
          totalScripts: scriptResults.length,
          imgHighCount,
          imgMediumCount,
          lcpCount,
          imgAffecting,
          imgTotalSizeMB: Math.round(imgTotalKB / 1024),
          jsHighCount,
          jsMediumCount,
          jsAffecting,
          jsTotalSizeKB: jsTotalKB,
          overallHighCount: imgHighCount + jsHighCount,
          overallAffecting: imgAffecting + jsAffecting,
        },
      });
    } catch (err: any) {
      console.error("Performance analysis error:", err);
      res.status(500).json({ message: err.message });
    }
  });

  // ──────── CMS CHATBOT MANAGEMENT ────────
  app.get("/api/cms/chatbot-config", requireAuth, async (_req, res) => {
    const configs = await storage.getChatbotConfigs();
    const result: Record<string, string> = {};
    for (const c of configs) result[c.key] = c.value;
    res.json(result);
  });

  app.put("/api/cms/chatbot-config", requireAuth, async (req, res) => {
    const data = req.body as Record<string, string>;
    for (const [key, value] of Object.entries(data)) {
      await storage.upsertChatbotConfig(key, value);
    }
    res.json({ success: true });
  });

  app.get("/api/cms/chatbot-faq", requireAuth, async (_req, res) => {
    const faqs = await storage.getChatbotFaqs();
    res.json(faqs);
  });
  app.post("/api/cms/chatbot-faq", requireAuth, async (req, res) => {
    const faq = await storage.createChatbotFaq(req.body);
    res.json(faq);
  });
  app.put("/api/cms/chatbot-faq/:id", requireAuth, async (req, res) => {
    const faq = await storage.updateChatbotFaq(Number(req.params.id), req.body);
    res.json(faq);
  });
  app.delete("/api/cms/chatbot-faq/:id", requireAuth, async (req, res) => {
    await storage.deleteChatbotFaq(Number(req.params.id));
    res.json({ success: true });
  });

  app.get("/api/cms/chatbot-offers", requireAuth, async (_req, res) => {
    const offers = await storage.getChatbotOffers();
    res.json(offers);
  });
  app.post("/api/cms/chatbot-offers", requireAuth, async (req, res) => {
    const offer = await storage.createChatbotOffer(req.body);
    res.json(offer);
  });
  app.put("/api/cms/chatbot-offers/:id", requireAuth, async (req, res) => {
    const offer = await storage.updateChatbotOffer(Number(req.params.id), req.body);
    res.json(offer);
  });
  app.delete("/api/cms/chatbot-offers/:id", requireAuth, async (req, res) => {
    await storage.deleteChatbotOffer(Number(req.params.id));
    res.json({ success: true });
  });

  app.get("/api/cms/chatbot-conversations", requireAuth, async (_req, res) => {
    const conversations_list = await storage.getChatbotConversations();
    res.json(conversations_list);
  });
  app.get("/api/cms/chatbot-conversations/:id", requireAuth, async (req, res) => {
    const conv = await storage.getChatbotConversation(Number(req.params.id));
    if (!conv) return res.status(404).json({ error: "Not found" });
    res.json(conv);
  });
  app.delete("/api/cms/chatbot-conversations/:id", requireAuth, async (req, res) => {
    await storage.deleteChatbotConversation(Number(req.params.id));
    res.json({ success: true });
  });

  app.get("/api/cms/chatbot-unseen-leads", requireAuth, async (_req, res) => {
    const all = await storage.getChatbotConversations();
    const unseen = all.filter((c: any) => c.hasLead && !c.seen);
    res.json({ count: unseen.length });
  });

  app.put("/api/cms/chatbot-conversations/:id/seen", requireAuth, async (req, res) => {
    await storage.updateChatbotConversation(Number(req.params.id), { seen: true } as any);
    res.json({ success: true });
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
