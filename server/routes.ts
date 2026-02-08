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
import OpenAI from "openai";

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

  // Dashboard stats
  app.get("/api/cms/dashboard", requireAuth, async (_req, res) => {
    const [allPages, allHotels, allMedia, allUsers] = await Promise.all([
      storage.getPages(),
      storage.getHotels(),
      storage.getMediaFiles(),
      storage.getUsers(),
    ]);
    res.json({
      pages: { total: allPages.length, published: allPages.filter(p => p.status === "published").length, draft: allPages.filter(p => p.status === "draft").length },
      hotels: { total: allHotels.length, published: allHotels.filter(h => h.status === "published").length },
      media: { total: allMedia.length, totalSize: allMedia.reduce((s, m) => s + m.size, 0) },
      users: { total: allUsers.length },
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

  const BOOKING_ASSISTANT_SYSTEM = `You are the Protels Booking Assistant — a polished, warm, and knowledgeable luxury concierge for PROTELS Hotels & Resorts. You help website visitors choose the perfect destination and guide them toward booking.

BRAND & TONE:
- Speak like a five-star hotel concierge: warm, elegant, professional, and genuinely helpful.
- Keep replies concise (2-4 sentences max). Never write long paragraphs.
- Use refined, welcoming language. Avoid slang, emojis, or overly casual expressions.

LANGUAGE:
- Auto-detect the visitor's language from their first message.
- If they write in Arabic, reply entirely in Arabic with a natural, luxurious tone.
- If they write in English (or any other language), reply in English.
- Stay consistent in whichever language the conversation starts in.

PROPERTIES YOU KNOW:
1. Protels Crystal Beach Resort — Marsa Alam, Egypt. All-inclusive luxury. Private beach, PADI diving center, spa, kids club, infinity pools. Room types: Standard, Superior, Family, Suite. Great for families & couples.
2. Protels Beach Club & SPA — Marsa Alam, Egypt. Vibrant all-inclusive resort. Aquapark, multiple pools, private beach, wellness center. Perfect for families, couples & friends.
3. Protels Royal Bay Resort & Spa — Hurghada, Egypt. Premium beachfront resort with full spa, private beach, and lively entertainment. Ideal for a Red Sea holiday.
4. Protels La Plage — Zanzibar, Tanzania. Boutique beachfront escape on the Indian Ocean. Intimate, serene, perfect for couples and honeymooners seeking tropical luxury.

CONVERSATION FLOW:
1. Greet warmly and ask what kind of holiday they're looking for (beach relaxation, diving, family fun, romantic getaway, etc.).
2. Based on their answer, recommend ONE or TWO properties with a brief reason why.
3. Ask ONE short follow-up if needed (e.g., "Will you be traveling as a couple, with family, or solo?").
4. End with a clear call-to-action: invite them to click the "Book Now" button on the website or visit the resort page for more details.

STRICT RULES:
- NEVER discuss pricing, payment, or process any transaction.
- NEVER invent facts about the hotels. Only share what's listed above.
- If asked about pricing, politely say: "For the best rates and availability, please click the Book Now button above — our booking engine has all the latest offers."
- If asked something unrelated to travel/hotels, gently steer back: "I'd love to help you find the perfect Protels getaway. What kind of holiday are you dreaming of?"
- Do NOT use markdown formatting (no **, no ##, no bullet points). Write in plain flowing text.`;

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

  return httpServer;
}
