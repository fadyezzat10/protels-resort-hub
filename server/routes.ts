import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { pool } from "./db";
import { seedAdmin, seedContent, verifyPassword, hashPassword } from "./auth";
import { insertBlogPostSchema } from "@shared/schema";
import OpenAI from "openai";
import { findRuleBasedResponse, detectArabicText } from "@shared/chatResponses";

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
  limits: { fileSize: 10 * 1024 * 1024 },
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

  app.use("/uploads", (req, res, next) => {
    const filePath = path.join(uploadDir, req.path);
    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }
    next();
  });

  await seedAdmin();
  await seedContent();

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
  app.get("/api/cms/users", requireAuth, async (_req, res) => {
    const all = await storage.getUsers();
    res.json(all.map(u => ({ id: u.id, username: u.username, role: u.role, createdAt: u.createdAt })));
  });

  app.post("/api/cms/users", requireAuth, async (req, res) => {
    try {
      const { username, password, role } = req.body;
      const hashed = await hashPassword(password);
      const user = await storage.createUser({ username, password: hashed, role: role || "admin" });
      res.json({ id: user.id, username: user.username, role: user.role });
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.delete("/api/cms/users/:id", requireAuth, async (req, res) => {
    await storage.deleteUser(Number(req.params.id));
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

  app.post("/api/cms/media", requireAuth, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "No file uploaded" });
      const file = await storage.createMedia({
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url: `/uploads/${req.file.filename}`,
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
    storage: multer.diskStorage({
      destination: (_req, _file, cb) => cb(null, uploadDir),
      filename: (_req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
      },
    }),
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
      const url = `/uploads/${req.file.filename}`;
      await storage.upsertSetting("company_profile_pdf", url);
      res.json({ url });
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  // ──────── PUBLIC API (for website consumption) ────────
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
    apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  });

  const chatRateLimit = new Map<string, { count: number; resetAt: number }>();
  const RATE_LIMIT_WINDOW = 60 * 1000;
  const RATE_LIMIT_MAX = 10;
  const MAX_MESSAGES = 20;
  const MAX_CONTENT_LENGTH = 500;

  const BOOKING_ASSISTANT_SYSTEM = `You are Protels Booking Assistant, an AI chat assistant for Protels Hotels & Resorts.

Your role is to help website visitors (guests) with booking guidance and hotel-related questions only.
You do NOT complete bookings, do NOT collect payments, and do NOT modify any website content.

LANGUAGE RULE:
- Always respond in the same language as the user.
- Arabic input → Arabic reply.
- English input → English reply.
- Do not ask which language to use.

SCOPE OF KNOWLEDGE:
You can answer questions about:
- Protels Hotels & Resorts
- Destinations (Egypt / Zanzibar)
- Available resorts, facilities, dining, bars, rooms, activities
- Children policy, check-in/out, dress code
- Cancellation policy
- General stay experience

PROPERTIES (DETAILED FACTSHEET DATA):

1. PROTELS CRYSTAL BEACH RESORT — Marsa Alam, Egypt.
All-inclusive luxury resort. Private sandy beach, PADI diving center, spa and wellness center, kids club, infinity pools.
Dining: Main Restaurant serving Oriental food (breakfast 07:00-10:00, lunch 13:00-15:00, dinner 19:00-22:00). Italian Restaurant (pizza, pasta, etc.).
Room types: Standard, Superior, Family, Suite. Great for families and couples.

2. PROTELS BEACH CLUB & SPA — Marsa Alam, Egypt. 4-star Ultra All-Inclusive resort.
Location: 35 mins from Marsa Alam International Airport, 30 mins to Port Ghalib, 15 mins from Marsa Alam city.
112 Rooms & Suites. 350-meter private sandy beach (beach walks up to 2km). Near Dolphin House and sea turtle habitats.
Ultra All-Inclusive includes: premium alcoholic beverages, house wine, soft drinks, juices, beer, cocktails, coffee & tea, 24-hour Lobby Bar, half an hour free massage per stay.
DINING:
- SeaBreeze Main Restaurant: Breakfast 07:00-10:00, Lunch 13:00-15:00, Dinner 19:00-22:00, Late Dinner 22:00-00:00
- El Dokka International Restaurant: Breakfast 07:00-10:00, Lunch 13:00-15:00, Dinner 19:00-22:00, Late Dinner 22:00-00:00
- Il Forno Italian Pizzeria: A la Carte, Dinner 19:00-22:00, Reservation Required
- Genghis Khan Mongolian Restaurant: Dinner 19:00-22:00, Reservation Required
BARS:
- Lobby Bar: 24 Hours. Snacks 10:30-12:00
- Pool Bar: 10:00-Sunset. Snacks 15:00-17:00
- Beach Bar: 10:00-Sunset. Snacks 13:00-Sunset
RECREATION:
- Aqua Park: 6 slides for adults & kids, 10:00-12:00 and 15:00-17:00
- 6 Swimming Pools: 09:00-Sunset
- Private Sandy Beach
- Spa (+16, extra charge): Sauna, Jacuzzi, Steam Bath & Massage, 10:00-19:00
- Gym (+16): 10:00-19:00
- Kids Club: 10:00-12:00 and 15:00-17:00, ages 3-9, English/German/Russian/Polish staff
- Evening Entertainment: Daily animation shows at Romanian Theater with weekly program
ACCOMMODATION: All rooms include A/C, private balcony/terrace, satellite TV, direct dial telephone, private bathroom, minibar (refilled daily), safe box. All non-smoking, 220V.
Room Types: Standard (garden/pool/partial sea view), Superior (sea view), Family (garden/pool/partial sea view), Junior Suite (garden/pool/partial sea view)
HOTEL FACILITIES: Free Wi-Fi, 24h Front Desk, Express Check-in/Out, Multilingual Staff, Concierge, Guest Service, Luggage Room, Mini-Market, Taxi/Limousine, Parking, Laundry & Valet, ATM/Exchange, 24h Doctor & Pharmacy, Beauty Salon & Barber, Gift/Jewelry Shop, Disabled Rooms, Room Service (extra charge)

3. PROTELS ROYAL BAY RESORT & SPA — Hurghada, Egypt.
Premium beachfront resort with full spa, private beach, and lively entertainment. Ideal for a Red Sea holiday.

4. PROTELS LA PLAGE — Zanzibar, Tanzania. 4-star All-Inclusive beachfront resort.
Location: East coast of Zanzibar, white sandy shores with breathtaking ocean views and direct beach access.
DINING:
- La Cabana Main Restaurant: Breakfast 07:00-10:00, Lunch 12:30-14:30, Dinner 19:30-21:30, daily theme night dinners
- Ocean Breeze Beach Restaurant: Reservation Only
BARS:
- Beach Bar: 10:00-18:30 (cocktails, cold drinks, beachfront view)
- Pool Bar: 10:00-18:30 (swim-up bar)
- Jaz Bar: 16:00-00:00 (hot & cold beverages, cozy evening spot)
- Terrace Bar: 10:00-23:00
ALL-INCLUSIVE PACKAGE: Check-in 14:00, Check-out 12:00 (late check-out available, extra charge). All beverages served by glass. Minibar refilled daily with soft drinks & mineral water.
FREE ACTIVITIES: Animation programs, Swimming pool access (08:00-18:00), Beach access (08:00-18:00)
EXTRA CHARGE: Doctor, Laundry, Limousine, International calls, Massage, Shisha, Imported alcoholic beverages
FACILITIES: Free Wi-Fi all areas, 24h Reception, In-room safe free of charge, Breakfast boxes on request (24h advance), Luggage service (call 100), Taxi daily 10:00-21:00
DRESS CODE: Swimming wear outdoors only, proper attire indoors, proper swimwear in pools, rubber shoes recommended on beach
GENERAL: Sunbeds cannot be reserved before 07:00. Lost room key charge $50. Lost towel card charge $20.

CHILDREN POLICY:
- Children are welcome in Protels resorts, especially at Beach Club & Spa with Kids Club (ages 3-9) and Family rooms.
- Policies may vary by resort and room type.
- Exact details are shown during booking.

CANCELLATION POLICY:
- Cancellation policies depend on the selected resort and rate.
- Some rates are flexible, others may be non-refundable.
- Exact cancellation rules are always displayed during booking.

STRICT RULES:
- Do NOT change or suggest changes to the website.
- Do NOT guarantee prices, availability, or offers.
- Do NOT collect personal or payment information.
- Do NOT act as customer support or ticketing system.
- Do NOT use markdown formatting (no **, no ##, no bullet points). Write in plain flowing text.
- If asked something unrelated to travel/hotels, gently steer back to helping them find the perfect Protels getaway.

CALL TO ACTION (ALWAYS):
When relevant, guide the guest to click the "Book Now" button on the website to complete their reservation.

TONE:
- Friendly
- Professional
- Luxury hospitality style
- Clear and concise

GOAL:
Help guests feel confident, informed, and ready to book by clicking "Book Now".`;

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

      const lastUserMsg = trimmedMessages.filter((m: any) => m.role === "user").pop();
      const userText = lastUserMsg?.content || "";
      const isArabic = detectArabicText(userText);

      const ruleMatch = findRuleBasedResponse(userText);
      if (ruleMatch) {
        const reply = isArabic ? ruleMatch.ar : ruleMatch.en;
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.write(`data: ${JSON.stringify({ content: reply })}\n\n`);
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();
        return;
      }

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

  return httpServer;
}
