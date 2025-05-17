CREATE TABLE "properties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"upload_id" uuid,
	"address" varchar(255),
	"city" varchar(100),
	"state" varchar(100),
	"zip_code" varchar(20),
	"country" varchar(100) DEFAULT 'United Kingdom',
	"price" integer,
	"bedrooms" integer,
	"bathrooms" integer,
	"square_feet" integer,
	"description" text,
	"features" jsonb,
	"status" varchar(50) DEFAULT 'available',
	"type" varchar(50),
	"date_sold" timestamp,
	"embedding" jsonb,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	"created_by" varchar(100),
	"updated_by" varchar(100)
);
--> statement-breakpoint
CREATE TABLE "upload_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"uploader_id" text,
	"filename" text,
	"status" text DEFAULT 'pending',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "uploads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"filename" text,
	"original_name" text,
	"mime_type" text,
	"size" integer,
	"status" text DEFAULT 'pending',
	"processing_errors" jsonb,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE INDEX "address_idx" ON "properties" USING btree ("address");--> statement-breakpoint
CREATE INDEX "city_idx" ON "properties" USING btree ("city");--> statement-breakpoint
CREATE INDEX "zip_code_idx" ON "properties" USING btree ("zip_code");--> statement-breakpoint
CREATE INDEX "price_idx" ON "properties" USING btree ("price");--> statement-breakpoint
CREATE INDEX "bedrooms_idx" ON "properties" USING btree ("bedrooms");--> statement-breakpoint
CREATE INDEX "status_idx" ON "properties" USING btree ("status");--> statement-breakpoint
CREATE INDEX "type_idx" ON "properties" USING btree ("type");--> statement-breakpoint
CREATE INDEX "location_idx" ON "properties" USING btree ("city","state");--> statement-breakpoint
CREATE INDEX "property_type_bedrooms_idx" ON "properties" USING btree ("type","bedrooms");