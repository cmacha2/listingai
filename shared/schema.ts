import { pgTable, text, serial, integer, boolean, timestamp, decimal, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  isEbayConnected: boolean("is_ebay_connected").default(false),
  ebayAccessToken: text("ebay_access_token"),
  ebayRefreshToken: text("ebay_refresh_token"),
  ebayTokenExpiry: timestamp("ebay_token_expiry"),
  ebayUserId: text("ebay_user_id"),
  ebayUserName: text("ebay_user_name"),
  
  // Marketplace selection and configuration
  selectedMarketplace: text("selected_marketplace"), // EBAY_US, EBAY_GB, EBAY_DE, etc.
  ebayMarketplaceCountry: text("ebay_marketplace_country"), // US, GB, DE, FR, etc.
  ebayMarketplaceName: text("ebay_marketplace_name"), // "United States", "United Kingdom", etc.
  
  oauthState: text("oauth_state"), // For CSRF protection during OAuth flow
  brandSettings: text("brand_settings"), // JSON string for brand customization
  createdAt: timestamp("created_at").defaultNow(),
});

export const listings = pgTable("listings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  
  // Basic product info
  productName: text("product_name").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  features: text("features"),
  tone: text("tone").notNull(),
  imageUrl: text("image_url"), // Legacy single image
  
  // eBay-specific fields for createOrReplaceInventoryItem
  sku: text("sku"), // Auto-generated unique SKU
  condition: text("condition").default("NEW"), // NEW, USED, etc.
  quantity: integer("quantity").default(1),
  imageUrls: json("image_urls").$type<string[]>(), // Multiple images for eBay (up to 12)
  productAspects: json("product_aspects").$type<Record<string, string[]>>(), // Brand, Type, Model, etc.
  
  // eBay-specific fields for createOffer
  marketplaceId: text("marketplace_id").default("EBAY_US"),
  format: text("format").default("FIXED_PRICE"),
  listingDescription: text("listing_description"), // Full HTML description for eBay
  quantityLimitPerBuyer: integer("quantity_limit_per_buyer").default(1),
  categoryId: text("category_id"), // eBay category ID (e.g., "11724")
  categoryName: text("category_name"), // Human-readable category name
  merchantLocationKey: text("merchant_location_key"), // eBay merchant location
  
  // eBay policies (these will be user-specific defaults)
  fulfillmentPolicyId: text("fulfillment_policy_id"),
  paymentPolicyId: text("payment_policy_id"),
  returnPolicyId: text("return_policy_id"),
  
  // Tax settings
  vatPercentage: decimal("vat_percentage", { precision: 5, scale: 2 }),
  applyTax: boolean("apply_tax").default(false),
  thirdPartyTaxCategory: text("third_party_tax_category"),
  
  // Generated content
  generatedTitle: text("generated_title"),
  generatedDescription: text("generated_description"),
  
  // SEO and Analytics
  seoScore: integer("seo_score"), // SEO score from 0-100
  seoAnalysis: json("seo_analysis").$type<{
    titleScore: number;
    descriptionScore: number;
    keywordDensity: number;
    readabilityScore: number;
    suggestions: string[];
  }>(),
  
  // eBay integration and response data
  ebayItemId: text("ebay_item_id"), // eBay item ID from published listing
  ebayOfferId: text("ebay_offer_id"), // From createOffer step
  ebaySku: text("ebay_sku"), // SKU used on eBay
  ebayListingId: text("ebay_listing_id"), // eBay listing ID from publish response
  ebayUrl: text("ebay_url"), // Direct URL to eBay listing
  ebayFees: json("ebay_fees").$type<{
    insertionFee?: number;
    finalValueFee?: number;
    listingUpgradeFee?: number;
    totalFees?: number;
  }>(),
  ebayWarnings: json("ebay_warnings").$type<string[]>(), // Warnings from eBay API
  
  // Performance tracking
  views: integer("views").default(0),
  watchers: integer("watchers").default(0),
  questions: integer("questions").default(0),
  
  // Status and metadata
  status: text("status").notNull().default("draft"), // draft, published, error, ended
  ebayStatus: text("ebay_status"), // unpublished, published, ended, sold
  publishToEbay: boolean("publish_to_ebay").default(false), // User intent to publish to eBay
  createdAt: timestamp("created_at").defaultNow(),
  publishedAt: timestamp("published_at"),
  lastSyncedAt: timestamp("last_synced_at"), // Last eBay sync
  endedAt: timestamp("ended_at"), // When listing ended/sold
});

export const customizationSettings = pgTable("customization_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  storeAssets: text("store_assets"), // JSON string for logo, banner, etc.
  storePolicies: text("store_policies"), // JSON string for policies
  descriptionSettings: text("description_settings"), // JSON string for layout settings
  footerSettings: text("footer_settings"), // JSON string for footer configuration
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// eBay user settings table for storing policy IDs and merchant location
export const ebaySettings = pgTable("ebay_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  fulfillmentPolicyId: text("fulfillment_policy_id"),
  paymentPolicyId: text("payment_policy_id"),
  returnPolicyId: text("return_policy_id"),
  merchantLocationKey: text("merchant_location_key"),
  defaultCategoryId: text("default_category_id"),
  defaultCondition: text("default_condition").default("NEW"),
  defaultVatPercentage: decimal("default_vat_percentage", { precision: 5, scale: 2 }),
  defaultApplyTax: boolean("default_apply_tax").default(false),
  defaultThirdPartyTaxCategory: text("default_third_party_tax_category"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  name: true,
});

export const insertListingSchema = createInsertSchema(listings).pick({
  productName: true,
  price: true,
  category: true,
  features: true,
  tone: true,
  imageUrl: true,
  // eBay-specific fields
  sku: true,
  condition: true,
  quantity: true,
  imageUrls: true,
  productAspects: true,
  marketplaceId: true,
  format: true,
  listingDescription: true,
  quantityLimitPerBuyer: true,
  categoryId: true,
  categoryName: true,
  merchantLocationKey: true,
  fulfillmentPolicyId: true,
  paymentPolicyId: true,
  returnPolicyId: true,
  vatPercentage: true,
  applyTax: true,
  thirdPartyTaxCategory: true,
  publishToEbay: true,
  // Generated content fields
  generatedTitle: true,
  generatedDescription: true,
  // SEO fields
  seoScore: true,
  seoAnalysis: true,
  // eBay response fields
  ebayItemId: true,
  ebayOfferId: true,
  ebaySku: true,
  ebayListingId: true,
  ebayUrl: true,
  ebayFees: true,
  ebayWarnings: true,
  // Performance tracking
  views: true,
  watchers: true,
  questions: true,
  // Status fields
  status: true,
  ebayStatus: true,
  publishedAt: true,
  lastSyncedAt: true,
  endedAt: true,
});

export const insertEbaySettingsSchema = createInsertSchema(ebaySettings).pick({
  fulfillmentPolicyId: true,
  paymentPolicyId: true,
  returnPolicyId: true,
  merchantLocationKey: true,
  defaultCategoryId: true,
  defaultCondition: true,
  defaultVatPercentage: true,
  defaultApplyTax: true,
  defaultThirdPartyTaxCategory: true,
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const generateContentSchema = z.object({
  productName: z.string().min(1),
  price: z.string().min(1),
  categories: z.array(z.string()).min(1),
  features: z.string().optional(),
  tone: z.string().min(1),
  language: z.string().default("en"),
  imageUrls: z.array(z.string()).optional(),
});

// Enhanced schema for eBay-specific listing creation
export const ebayListingSchema = z.object({
  // Basic product info
  productName: z.string().min(1),
  price: z.number().positive(),
  category: z.string().min(1),
  features: z.string().optional(),
  tone: z.string().min(1),
  
  // eBay-specific fields
  sku: z.string().optional(), // Will be auto-generated if not provided
  condition: z.enum(["NEW", "LIKE_NEW", "VERY_GOOD", "GOOD", "ACCEPTABLE", "FOR_PARTS_OR_NOT_WORKING"]).default("NEW"),
  quantity: z.number().int().positive().default(1),
  imageUrls: z.array(z.string()).max(12).optional(),
  productAspects: z.record(z.array(z.string())).optional(),
  
  // eBay marketplace settings
  marketplaceId: z.string().default("EBAY_US"),
  format: z.enum(["FIXED_PRICE", "AUCTION"]).default("FIXED_PRICE"),
  quantityLimitPerBuyer: z.number().int().positive().default(1),
  categoryId: z.string().min(1),
  
  // Tax settings
  vatPercentage: z.number().min(0).max(100).optional(),
  applyTax: z.boolean().default(false),
  thirdPartyTaxCategory: z.string().optional(),
  
  // Publish settings
  publishToEbay: z.boolean().default(false),
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Listing = typeof listings.$inferSelect;
export type InsertListing = z.infer<typeof insertListingSchema>;
export type EbayListing = z.infer<typeof ebayListingSchema>;
export type EbaySettings = typeof ebaySettings.$inferSelect;
export type InsertEbaySettings = z.infer<typeof insertEbaySettingsSchema>;
export type CustomizationSettings = typeof customizationSettings.$inferSelect;
