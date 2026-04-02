import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp, jsonb, integer, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("admin"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const pages = pgTable("pages", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: jsonb("title").notNull().$type<Record<string, string>>(),
  content: jsonb("content").notNull().$type<Record<string, string>>(),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  status: text("status").notNull().default("draft"),
  builderEnabled: boolean("builder_enabled").default(false),
  builderDraft: jsonb("builder_draft").$type<any>(),
  builderPublished: jsonb("builder_published").$type<any>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const pageVersions = pgTable("page_versions", {
  id: serial("id").primaryKey(),
  pageId: integer("page_id").notNull(),
  versionNumber: integer("version_number").notNull(),
  sections: jsonb("sections").notNull().$type<any>(),
  status: text("status").notNull().default("draft"),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const hotels = pgTable("hotels", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  image: text("image"),
  description: jsonb("description").notNull().$type<Record<string, string>>(),
  features: text("features").array().notNull().default(sql`'{}'::text[]`),
  rooms: text("rooms").array().notNull().default(sql`'{}'::text[]`),
  discount: text("discount"),
  dining: jsonb("dining").$type<any>(),
  roomDetails: jsonb("room_details").$type<any[]>(),
  gallery: text("gallery").array().default(sql`'{}'::text[]`),
  mapLink: text("map_link"),
  heroVideo: text("hero_video"),
  theme: jsonb("theme").$type<Record<string, any>>(),
  tabConfig: jsonb("tab_config").$type<{ tabs: { id: string; label: string; visible: boolean; order: number }[] }>(),
  bookingLink: text("booking_link"),
  phone: text("phone"),
  email: text("email"),
  mapEmbed: text("map_embed"),
  ratings: jsonb("ratings").$type<{ platform: string; rating: number; maxRating: number; reviewCount?: number; reviewUrl: string }[]>(),
  status: text("status").notNull().default("draft"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const media = pgTable("media", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  url: text("url").notNull(),
  alt: text("alt"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const globalSettings = pgTable("global_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: jsonb("value").notNull().$type<any>(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const seoSettings = pgTable("seo_settings", {
  id: serial("id").primaryKey(),
  pagePath: text("page_path").notNull().unique(),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  ogTitle: text("og_title"),
  ogDescription: text("og_description"),
  ogImage: text("og_image"),
  canonicalUrl: text("canonical_url"),
  robots: text("robots").default("index, follow"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: jsonb("title").notNull().$type<Record<string, string>>(),
  content: jsonb("content").notNull().$type<Record<string, string>>(),
  excerpt: jsonb("excerpt").$type<Record<string, string>>(),
  featuredImage: text("featured_image"),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  hotelSlug: text("hotel_slug"),
  status: text("status").notNull().default("draft"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const pageContents = pgTable("page_contents", {
  id: serial("id").primaryKey(),
  pagePath: text("page_path").notNull(),
  contentKey: text("content_key").notNull(),
  contentType: text("content_type").notNull().default("text"),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const chatbotConfig = pgTable("chatbot_config", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const chatbotFaq = pgTable("chatbot_faq", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatbotOffers = pgTable("chatbot_offers", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  hotelSlug: text("hotel_slug"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatbotConversations = pgTable("chatbot_conversations", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  hotelSlug: text("hotel_slug"),
  messages: jsonb("messages").notNull().$type<Array<{ role: string; content: string; timestamp: number }>>().default(sql`'[]'::jsonb`),
  hasLead: boolean("has_lead").notNull().default(false),
  leadName: text("lead_name"),
  leadContact: text("lead_contact"),
  seen: boolean("seen").notNull().default(false),
  startedAt: timestamp("started_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const contactSubmissions = pgTable("contact_submissions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  hotel: text("hotel"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertContactSubmissionSchema = createInsertSchema(contactSubmissions).omit({ id: true, createdAt: true });
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertPageSchema = createInsertSchema(pages).omit({ id: true, createdAt: true, updatedAt: true });
export const chatConversations = pgTable("chat_conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  messages: jsonb("messages").notNull().$type<any[]>().default(sql`'[]'::jsonb`),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertChatConversationSchema = createInsertSchema(chatConversations).omit({ id: true, updatedAt: true });
export const insertChatbotConfigSchema = createInsertSchema(chatbotConfig).omit({ id: true, updatedAt: true });
export const insertChatbotFaqSchema = createInsertSchema(chatbotFaq).omit({ id: true, createdAt: true });
export const insertChatbotOfferSchema = createInsertSchema(chatbotOffers).omit({ id: true, createdAt: true });
export const insertChatbotConversationSchema = createInsertSchema(chatbotConversations).omit({ id: true, startedAt: true, updatedAt: true });

export const insertPageVersionSchema = createInsertSchema(pageVersions).omit({ id: true, createdAt: true });
export const insertHotelSchema = createInsertSchema(hotels).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMediaSchema = createInsertSchema(media).omit({ id: true, createdAt: true });
export const insertGlobalSettingSchema = createInsertSchema(globalSettings).omit({ id: true, updatedAt: true });
export const insertSeoSettingSchema = createInsertSchema(seoSettings).omit({ id: true, updatedAt: true });
export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPageContentSchema = createInsertSchema(pageContents).omit({ id: true, updatedAt: true });

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertPage = z.infer<typeof insertPageSchema>;
export type Page = typeof pages.$inferSelect;
export type InsertHotel = z.infer<typeof insertHotelSchema>;
export type Hotel = typeof hotels.$inferSelect;
export type InsertMedia = z.infer<typeof insertMediaSchema>;
export type Media = typeof media.$inferSelect;
export type InsertGlobalSetting = z.infer<typeof insertGlobalSettingSchema>;
export type GlobalSetting = typeof globalSettings.$inferSelect;
export type InsertSeoSetting = z.infer<typeof insertSeoSettingSchema>;
export type SeoSetting = typeof seoSettings.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertPageVersion = z.infer<typeof insertPageVersionSchema>;
export type PageVersion = typeof pageVersions.$inferSelect;
export type InsertPageContent = z.infer<typeof insertPageContentSchema>;
export type PageContent = typeof pageContents.$inferSelect;
export type InsertChatConversation = z.infer<typeof insertChatConversationSchema>;
export type ChatConversation = typeof chatConversations.$inferSelect;
export type InsertChatbotConfig = z.infer<typeof insertChatbotConfigSchema>;
export type ChatbotConfig = typeof chatbotConfig.$inferSelect;
export type InsertChatbotFaq = z.infer<typeof insertChatbotFaqSchema>;
export type ChatbotFaq = typeof chatbotFaq.$inferSelect;
export type InsertChatbotOffer = z.infer<typeof insertChatbotOfferSchema>;
export type ChatbotOffer = typeof chatbotOffers.$inferSelect;
export type InsertChatbotConversation = z.infer<typeof insertChatbotConversationSchema>;
export type ChatbotConversation = typeof chatbotConversations.$inferSelect;
export type InsertContactSubmission = z.infer<typeof insertContactSubmissionSchema>;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;
