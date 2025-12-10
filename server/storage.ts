import { users, listings, customizationSettings, ebaySettings, type User, type InsertUser, type Listing, type InsertListing, type CustomizationSettings, type EbaySettings, type InsertEbaySettings } from "@shared/schema";
import { db } from "./db";
import { eq, and, isNotNull } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  getAllUsersWithEbayTokens(): Promise<User[]>;

  // Listing operations
  createListing(listing: InsertListing & { userId: number }): Promise<Listing>;
  updateListing(id: number, updates: Partial<Listing>): Promise<Listing | undefined>;
  getListingsByUserId(userId: number): Promise<Listing[]>;
  getListing(id: number): Promise<Listing | undefined>;
  deleteListing(id: number): Promise<boolean>;

  // Customization settings operations
  saveUserCustomization(userId: number, settings: any): Promise<CustomizationSettings>;
  getUserCustomization(userId: number): Promise<CustomizationSettings | undefined>;

  // eBay settings operations
  saveEbaySettings(userId: number, settings: InsertEbaySettings): Promise<EbaySettings>;
  getEbaySettings(userId: number): Promise<EbaySettings | undefined>;
  updateEbaySettings(userId: number, updates: Partial<EbaySettings>): Promise<EbaySettings | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db
      .insert(users)
      .values(user)
      .returning();
    return newUser;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async createListing(listing: InsertListing & { userId: number }): Promise<Listing> {
    // Generate SKU if not provided
    if (!listing.sku) {
      listing.sku = `sku-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    }
    
    const [newListing] = await db
      .insert(listings)
      .values(listing as any) // Type assertion to handle JSON field typing
      .returning();
    return newListing;
  }

  async updateListing(id: number, updates: Partial<Listing>): Promise<Listing | undefined> {
    const [listing] = await db
      .update(listings)
      .set(updates)
      .where(eq(listings.id, id))
      .returning();
    return listing || undefined;
  }

  async getListingsByUserId(userId: number): Promise<Listing[]> {
    return await db.select().from(listings).where(eq(listings.userId, userId));
  }

  async getListing(id: number): Promise<Listing | undefined> {
    const [listing] = await db.select().from(listings).where(eq(listings.id, id));
    return listing || undefined;
  }

  async deleteListing(id: number): Promise<boolean> {
    const result = await db.delete(listings).where(eq(listings.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async saveUserCustomization(userId: number, settings: any): Promise<CustomizationSettings> {
    const existingSettings = await this.getUserCustomization(userId);
    
    if (existingSettings) {
      const [updated] = await db
        .update(customizationSettings)
        .set({
          ...settings,
          updatedAt: new Date(),
        })
        .where(eq(customizationSettings.userId, userId))
        .returning();
      return updated;
    } else {
      const [newSettings] = await db
        .insert(customizationSettings)
        .values({
          userId,
          ...settings,
        })
        .returning();
      return newSettings;
    }
  }

  async getUserCustomization(userId: number): Promise<CustomizationSettings | undefined> {
    const [settings] = await db
      .select()
      .from(customizationSettings)
      .where(eq(customizationSettings.userId, userId));
    return settings || undefined;
  }

  async saveEbaySettings(userId: number, settings: InsertEbaySettings): Promise<EbaySettings> {
    const existingSettings = await this.getEbaySettings(userId);
    
    if (existingSettings) {
      const [updated] = await db
        .update(ebaySettings)
        .set({
          ...settings,
          updatedAt: new Date(),
        })
        .where(eq(ebaySettings.userId, userId))
        .returning();
      return updated;
    } else {
      const [newSettings] = await db
        .insert(ebaySettings)
        .values({
          userId,
          ...settings,
        })
        .returning();
      return newSettings;
    }
  }

  async getEbaySettings(userId: number): Promise<EbaySettings | undefined> {
    const [settings] = await db
      .select()
      .from(ebaySettings)
      .where(eq(ebaySettings.userId, userId));
    return settings || undefined;
  }

  async updateEbaySettings(userId: number, updates: Partial<EbaySettings>): Promise<EbaySettings | undefined> {
    const [settings] = await db
      .update(ebaySettings)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(ebaySettings.userId, userId))
      .returning();
    return settings || undefined;
  }

  async getAllUsersWithEbayTokens(): Promise<User[]> {
    const usersWithTokens = await db
      .select()
      .from(users)
      .where(and(
        isNotNull(users.ebayAccessToken), 
        isNotNull(users.ebayRefreshToken),
        isNotNull(users.ebayTokenExpiry)
      ));
    return usersWithTokens;
  }
}

export const storage = new DatabaseStorage();
