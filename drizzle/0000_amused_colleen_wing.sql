CREATE TABLE "content_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"collection" varchar(40) NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"data" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(120) NOT NULL,
	"company" varchar(160),
	"email" varchar(180) NOT NULL,
	"phone" varchar(40),
	"service" varchar(100) NOT NULL,
	"message" text NOT NULL,
	"status" varchar(20) DEFAULT 'nouveau' NOT NULL,
	"notes" text,
	"handled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "messages_status_check" CHECK ("messages"."status" in ('nouveau','lu','traite','archive'))
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"key" varchar(60) PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "content_items_collection_idx" ON "content_items" USING btree ("collection","position");--> statement-breakpoint
CREATE INDEX "messages_status_idx" ON "messages" USING btree ("status");--> statement-breakpoint
CREATE INDEX "messages_created_at_idx" ON "messages" USING btree ("created_at");