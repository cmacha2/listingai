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
--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "sku" text;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "condition" text DEFAULT 'NEW';--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "quantity" integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "image_urls" json;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "product_aspects" json;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "marketplace_id" text DEFAULT 'EBAY_US';--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "format" text DEFAULT 'FIXED_PRICE';--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "listing_description" text;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "quantity_limit_per_buyer" integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "category_id" text;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "category_name" text;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "merchant_location_key" text;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "fulfillment_policy_id" text;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "payment_policy_id" text;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "return_policy_id" text;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "vat_percentage" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "apply_tax" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "third_party_tax_category" text;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "seo_score" integer;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "seo_analysis" json;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "ebay_offer_id" text;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "ebay_sku" text;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "ebay_listing_id" text;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "ebay_url" text;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "ebay_fees" json;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "ebay_warnings" json;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "views" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "watchers" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "questions" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "ebay_status" text;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "publish_to_ebay" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "last_synced_at" timestamp;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "ended_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "selected_marketplace" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "ebay_marketplace_country" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "ebay_marketplace_name" text;