import { db } from "./db";
import { eq } from "drizzle-orm";
import { desc } from "drizzle-orm";
import { and } from "drizzle-orm";
import {
  users, pages, hotels, media, globalSettings, seoSettings, blogPosts, pageVersions, pageContents, chatConversations,
  chatbotConfig, chatbotFaq, chatbotOffers, chatbotConversations,
  type User, type InsertUser,
  type Page, type InsertPage,
  type Hotel, type InsertHotel,
  type Media, type InsertMedia,
  type GlobalSetting, type InsertGlobalSetting,
  type SeoSetting, type InsertSeoSetting,
  type BlogPost, type InsertBlogPost,
  type PageVersion, type InsertPageVersion,
  type PageContent, type InsertPageContent,
  type ChatConversation,
  type ChatbotConfig, type InsertChatbotConfig,
  type ChatbotFaq, type InsertChatbotFaq,
  type ChatbotOffer, type InsertChatbotOffer,
  type ChatbotConversation, type InsertChatbotConversation,
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(): Promise<User[]>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<void>;

  // Pages
  getPages(): Promise<Page[]>;
  getPage(id: number): Promise<Page | undefined>;
  getPageBySlug(slug: string): Promise<Page | undefined>;
  createPage(page: InsertPage): Promise<Page>;
  updatePage(id: number, data: Partial<InsertPage>): Promise<Page | undefined>;
  deletePage(id: number): Promise<void>;

  // Hotels
  getHotels(): Promise<Hotel[]>;
  getHotel(id: number): Promise<Hotel | undefined>;
  getHotelBySlug(slug: string): Promise<Hotel | undefined>;
  createHotel(hotel: InsertHotel): Promise<Hotel>;
  updateHotel(id: number, data: Partial<InsertHotel>): Promise<Hotel | undefined>;
  deleteHotel(id: number): Promise<void>;

  // Media
  getMediaFiles(): Promise<Media[]>;
  getMediaFile(id: number): Promise<Media | undefined>;
  createMedia(file: InsertMedia): Promise<Media>;
  updateMedia(id: number, data: Partial<InsertMedia>): Promise<Media | undefined>;
  deleteMedia(id: number): Promise<void>;

  // Global Settings
  getSettings(): Promise<GlobalSetting[]>;
  getSetting(key: string): Promise<GlobalSetting | undefined>;
  upsertSetting(key: string, value: any): Promise<GlobalSetting>;

  // SEO
  getSeoSettings(): Promise<SeoSetting[]>;
  getSeoByPath(path: string): Promise<SeoSetting | undefined>;
  upsertSeo(data: InsertSeoSetting): Promise<SeoSetting>;
  deleteSeo(id: number): Promise<void>;

  // Blog Posts
  getBlogPosts(): Promise<BlogPost[]>;
  getBlogPost(id: number): Promise<BlogPost | undefined>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: number, data: Partial<InsertBlogPost>): Promise<BlogPost | undefined>;
  deleteBlogPost(id: number): Promise<void>;

  // Page Versions
  getPageVersions(pageId: number): Promise<PageVersion[]>;
  createPageVersion(version: InsertPageVersion): Promise<PageVersion>;

  // Page Contents (Live Edit)
  getPageContents(pagePath: string): Promise<PageContent[]>;
  getAllPageContents(): Promise<PageContent[]>;
  upsertPageContent(pagePath: string, contentKey: string, contentType: string, value: string): Promise<PageContent>;
  deletePageContent(id: number): Promise<void>;

  // Chat Conversations
  getChatConversation(userId: number): Promise<ChatConversation | undefined>;
  saveChatConversation(userId: number, messages: any[]): Promise<ChatConversation>;
  clearChatConversation(userId: number): Promise<void>;

  // Chatbot Config
  getChatbotConfigs(): Promise<ChatbotConfig[]>;
  upsertChatbotConfig(key: string, value: string): Promise<ChatbotConfig>;

  // Chatbot FAQ
  getChatbotFaqs(): Promise<ChatbotFaq[]>;
  createChatbotFaq(faq: InsertChatbotFaq): Promise<ChatbotFaq>;
  updateChatbotFaq(id: number, data: Partial<InsertChatbotFaq>): Promise<ChatbotFaq | undefined>;
  deleteChatbotFaq(id: number): Promise<void>;

  // Chatbot Offers
  getChatbotOffers(): Promise<ChatbotOffer[]>;
  createChatbotOffer(offer: InsertChatbotOffer): Promise<ChatbotOffer>;
  updateChatbotOffer(id: number, data: Partial<InsertChatbotOffer>): Promise<ChatbotOffer | undefined>;
  deleteChatbotOffer(id: number): Promise<void>;

  // Chatbot Conversations
  getChatbotConversations(): Promise<ChatbotConversation[]>;
  getChatbotConversation(id: number): Promise<ChatbotConversation | undefined>;
  getChatbotConversationBySession(sessionId: string): Promise<ChatbotConversation | undefined>;
  saveChatbotConversation(data: InsertChatbotConversation): Promise<ChatbotConversation>;
  updateChatbotConversation(id: number, data: Partial<InsertChatbotConversation>): Promise<ChatbotConversation | undefined>;
  deleteChatbotConversation(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async getUserByUsername(username: string) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  async createUser(user: InsertUser) {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }
  async getUsers() {
    return db.select().from(users);
  }
  async updateUser(id: number, data: Partial<InsertUser>) {
    const [updated] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return updated;
  }
  async deleteUser(id: number) {
    await db.delete(users).where(eq(users.id, id));
  }

  // Pages
  async getPages() {
    return db.select().from(pages);
  }
  async getPage(id: number) {
    const [page] = await db.select().from(pages).where(eq(pages.id, id));
    return page;
  }
  async getPageBySlug(slug: string) {
    const [page] = await db.select().from(pages).where(eq(pages.slug, slug));
    return page;
  }
  async createPage(page: InsertPage) {
    const [created] = await db.insert(pages).values(page).returning();
    return created;
  }
  async updatePage(id: number, data: Partial<InsertPage>) {
    const [updated] = await db.update(pages).set({ ...data, updatedAt: new Date() }).where(eq(pages.id, id)).returning();
    return updated;
  }
  async deletePage(id: number) {
    await db.delete(pages).where(eq(pages.id, id));
  }

  // Hotels
  async getHotels() {
    return db.select().from(hotels);
  }
  async getHotel(id: number) {
    const [hotel] = await db.select().from(hotels).where(eq(hotels.id, id));
    return hotel;
  }
  async getHotelBySlug(slug: string) {
    const [hotel] = await db.select().from(hotels).where(eq(hotels.slug, slug));
    return hotel;
  }
  async createHotel(hotel: InsertHotel) {
    const [created] = await db.insert(hotels).values(hotel).returning();
    return created;
  }
  async updateHotel(id: number, data: Partial<InsertHotel>) {
    const [updated] = await db.update(hotels).set({ ...data, updatedAt: new Date() }).where(eq(hotels.id, id)).returning();
    return updated;
  }
  async deleteHotel(id: number) {
    await db.delete(hotels).where(eq(hotels.id, id));
  }

  // Media
  async getMediaFiles() {
    return db.select().from(media);
  }
  async getMediaFile(id: number) {
    const [file] = await db.select().from(media).where(eq(media.id, id));
    return file;
  }
  async createMedia(file: InsertMedia) {
    const [created] = await db.insert(media).values(file).returning();
    return created;
  }
  async updateMedia(id: number, data: Partial<InsertMedia>) {
    const [updated] = await db.update(media).set(data).where(eq(media.id, id)).returning();
    return updated;
  }
  async deleteMedia(id: number) {
    await db.delete(media).where(eq(media.id, id));
  }

  // Global Settings
  async getSettings() {
    return db.select().from(globalSettings);
  }
  async getSetting(key: string) {
    const [setting] = await db.select().from(globalSettings).where(eq(globalSettings.key, key));
    return setting;
  }
  async upsertSetting(key: string, value: any) {
    const existing = await this.getSetting(key);
    if (existing) {
      const [updated] = await db.update(globalSettings)
        .set({ value, updatedAt: new Date() })
        .where(eq(globalSettings.key, key))
        .returning();
      return updated;
    }
    const [created] = await db.insert(globalSettings).values({ key, value }).returning();
    return created;
  }

  // SEO
  async getSeoSettings() {
    return db.select().from(seoSettings);
  }
  async getSeoByPath(path: string) {
    const [seo] = await db.select().from(seoSettings).where(eq(seoSettings.pagePath, path));
    return seo;
  }
  async upsertSeo(data: InsertSeoSetting) {
    const existing = await this.getSeoByPath(data.pagePath);
    if (existing) {
      const [updated] = await db.update(seoSettings)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(seoSettings.pagePath, data.pagePath))
        .returning();
      return updated;
    }
    const [created] = await db.insert(seoSettings).values(data).returning();
    return created;
  }
  async deleteSeo(id: number) {
    await db.delete(seoSettings).where(eq(seoSettings.id, id));
  }

  // Blog Posts
  async getBlogPosts() {
    return db.select().from(blogPosts);
  }
  async getBlogPost(id: number) {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return post;
  }
  async getBlogPostBySlug(slug: string) {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    return post;
  }
  async createBlogPost(post: InsertBlogPost) {
    const [created] = await db.insert(blogPosts).values(post).returning();
    return created;
  }
  async updateBlogPost(id: number, data: Partial<InsertBlogPost>) {
    const [updated] = await db.update(blogPosts).set({ ...data, updatedAt: new Date() }).where(eq(blogPosts.id, id)).returning();
    return updated;
  }
  async deleteBlogPost(id: number) {
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
  }

  // Page Versions
  async getPageVersions(pageId: number) {
    return db.select().from(pageVersions)
      .where(eq(pageVersions.pageId, pageId))
      .orderBy(desc(pageVersions.versionNumber));
  }
  async createPageVersion(version: InsertPageVersion) {
    const [created] = await db.insert(pageVersions).values(version).returning();
    return created;
  }

  // Page Contents (Live Edit)
  async getPageContents(pagePath: string) {
    return db.select().from(pageContents).where(eq(pageContents.pagePath, pagePath));
  }
  async getAllPageContents() {
    return db.select().from(pageContents);
  }
  async upsertPageContent(pagePath: string, contentKey: string, contentType: string, value: string) {
    const [existing] = await db.select().from(pageContents)
      .where(and(eq(pageContents.pagePath, pagePath), eq(pageContents.contentKey, contentKey)));
    if (existing) {
      const [updated] = await db.update(pageContents)
        .set({ value, contentType, updatedAt: new Date() })
        .where(eq(pageContents.id, existing.id))
        .returning();
      return updated;
    }
    const [created] = await db.insert(pageContents).values({ pagePath, contentKey, contentType, value }).returning();
    return created;
  }
  async deletePageContent(id: number) {
    await db.delete(pageContents).where(eq(pageContents.id, id));
  }

  async getChatConversation(userId: number) {
    const [conv] = await db.select().from(chatConversations).where(eq(chatConversations.userId, userId));
    return conv;
  }
  async saveChatConversation(userId: number, messages: any[]) {
    const existing = await this.getChatConversation(userId);
    if (existing) {
      const [updated] = await db.update(chatConversations)
        .set({ messages, updatedAt: new Date() })
        .where(eq(chatConversations.id, existing.id))
        .returning();
      return updated;
    }
    const [created] = await db.insert(chatConversations).values({ userId, messages }).returning();
    return created;
  }
  async clearChatConversation(userId: number) {
    await db.delete(chatConversations).where(eq(chatConversations.userId, userId));
  }

  // Chatbot Config
  async getChatbotConfigs() {
    return db.select().from(chatbotConfig);
  }
  async upsertChatbotConfig(key: string, value: string) {
    const [existing] = await db.select().from(chatbotConfig).where(eq(chatbotConfig.key, key));
    if (existing) {
      const [updated] = await db.update(chatbotConfig).set({ value, updatedAt: new Date() }).where(eq(chatbotConfig.id, existing.id)).returning();
      return updated;
    }
    const [created] = await db.insert(chatbotConfig).values({ key, value }).returning();
    return created;
  }

  // Chatbot FAQ
  async getChatbotFaqs() {
    return db.select().from(chatbotFaq);
  }
  async createChatbotFaq(faq: InsertChatbotFaq) {
    const [created] = await db.insert(chatbotFaq).values(faq).returning();
    return created;
  }
  async updateChatbotFaq(id: number, data: Partial<InsertChatbotFaq>) {
    const [updated] = await db.update(chatbotFaq).set(data).where(eq(chatbotFaq.id, id)).returning();
    return updated;
  }
  async deleteChatbotFaq(id: number) {
    await db.delete(chatbotFaq).where(eq(chatbotFaq.id, id));
  }

  // Chatbot Offers
  async getChatbotOffers() {
    return db.select().from(chatbotOffers);
  }
  async createChatbotOffer(offer: InsertChatbotOffer) {
    const [created] = await db.insert(chatbotOffers).values(offer).returning();
    return created;
  }
  async updateChatbotOffer(id: number, data: Partial<InsertChatbotOffer>) {
    const [updated] = await db.update(chatbotOffers).set(data).where(eq(chatbotOffers.id, id)).returning();
    return updated;
  }
  async deleteChatbotOffer(id: number) {
    await db.delete(chatbotOffers).where(eq(chatbotOffers.id, id));
  }

  // Chatbot Conversations
  async getChatbotConversations() {
    return db.select().from(chatbotConversations).orderBy(desc(chatbotConversations.updatedAt));
  }
  async getChatbotConversation(id: number) {
    const [conv] = await db.select().from(chatbotConversations).where(eq(chatbotConversations.id, id));
    return conv;
  }
  async getChatbotConversationBySession(sessionId: string) {
    const [conv] = await db.select().from(chatbotConversations).where(eq(chatbotConversations.sessionId, sessionId));
    return conv;
  }
  async saveChatbotConversation(data: InsertChatbotConversation) {
    const [created] = await db.insert(chatbotConversations).values(data).returning();
    return created;
  }
  async updateChatbotConversation(id: number, data: Partial<InsertChatbotConversation>) {
    const [updated] = await db.update(chatbotConversations).set({ ...data, updatedAt: new Date() }).where(eq(chatbotConversations.id, id)).returning();
    return updated;
  }
  async deleteChatbotConversation(id: number) {
    await db.delete(chatbotConversations).where(eq(chatbotConversations.id, id));
  }
}

export const storage = new DatabaseStorage();
