import { db } from "./db";
import { eq } from "drizzle-orm";
import {
  users, pages, hotels, media, globalSettings, seoSettings,
  type User, type InsertUser,
  type Page, type InsertPage,
  type Hotel, type InsertHotel,
  type Media, type InsertMedia,
  type GlobalSetting, type InsertGlobalSetting,
  type SeoSetting, type InsertSeoSetting,
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
}

export const storage = new DatabaseStorage();
