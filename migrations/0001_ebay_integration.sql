-- Add eBay-specific fields to the existing listings table
ALTER TABLE "listings" ADD COLUMN "sku" text;
ALTER TABLE "listings" ADD COLUMN "condition" text DEFAULT 'NEW';
ALTER TABLE "listings" ADD COLUMN "quantity" integer DEFAULT 1;
ALTER TABLE "listings" ADD COLUMN "image_urls" json;
ALTER TABLE "listings" ADD COLUMN "product_aspects" json;
ALTER TABLE "listings" ADD COLUMN "marketplace_id" text DEFAULT 'EBAY_US';
ALTER TABLE "listings" ADD COLUMN "format" text DEFAULT 'FIXED_PRICE';
ALTER TABLE "listings" ADD COLUMN "listing_description" text;
ALTER TABLE "listings" ADD COLUMN "quantity_limit_per_buyer" integer DEFAULT 1;
ALTER TABLE "listings" ADD COLUMN "category_id" text;
ALTER TABLE "listings" ADD COLUMN "merchant_location_key" text;
ALTER TABLE "listings" ADD COLUMN "fulfillment_policy_id" text;
ALTER TABLE "listings" ADD COLUMN "payment_policy_id" text;
ALTER TABLE "listings" ADD COLUMN "return_policy_id" text;
ALTER TABLE "listings" ADD COLUMN "vat_percentage" numeric(5, 2);
ALTER TABLE "listings" ADD COLUMN "apply_tax" boolean DEFAULT false;
ALTER TABLE "listings" ADD COLUMN "third_party_tax_category" text;
ALTER TABLE "listings" ADD COLUMN "ebay_offer_id" text;
ALTER TABLE "listings" ADD COLUMN "ebay_sku" text;
ALTER TABLE "listings" ADD COLUMN "ebay_status" text;
ALTER TABLE "listings" ADD COLUMN "publish_to_ebay" boolean DEFAULT false;
ALTER TABLE "listings" ADD COLUMN "last_synced_at" timestamp;

-- Create eBay settings table for user-specific defaults
CREATE TABLE "ebay_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"fulfillment_policy_id" text,
	"payment_policy_id" text,
	"return_policy_id" text,
	"merchant_location_key" text,
	"default_category_id" text,
	"default_condition" text DEFAULT 'NEW',
	"default_vat_percentage" numeric(5, 2),
	"default_apply_tax" boolean DEFAULT false,
	"default_third_party_tax_category" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "ebay_settings_user_id_unique" UNIQUE("user_id")
); 