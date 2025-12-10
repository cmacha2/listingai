CREATE TABLE "customization_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"store_assets" text,
	"store_policies" text,
	"description_settings" text,
	"footer_settings" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "customization_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "listings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"product_name" text NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"category" text NOT NULL,
	"features" text,
	"tone" text NOT NULL,
	"image_url" text,
	"generated_title" text,
	"generated_description" text,
	"ebay_item_id" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"published_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"name" text NOT NULL,
	"is_ebay_connected" boolean DEFAULT false,
	"ebay_access_token" text,
	"ebay_refresh_token" text,
	"ebay_token_expiry" timestamp,
	"ebay_user_id" text,
	"ebay_user_name" text,
	"oauth_state" text,
	"brand_settings" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
