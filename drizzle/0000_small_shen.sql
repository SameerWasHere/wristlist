CREATE TABLE "user_watches" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"watch_reference_id" integer NOT NULL,
	"status" text NOT NULL,
	"model_year" integer,
	"modifications" jsonb,
	"notes" text,
	"date_added" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"clerk_id" text NOT NULL,
	"username" text NOT NULL,
	"display_name" text,
	"bio" text,
	"collecting_since" integer,
	"show_value_publicly" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "watch_references" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"brand" text NOT NULL,
	"model" text NOT NULL,
	"reference" text NOT NULL,
	"size_mm" real,
	"movement" text,
	"material" text,
	"color" text,
	"category" text,
	"bracelet_type" text,
	"shape" text,
	"water_resistance_m" integer,
	"crystal" text,
	"case_back" text,
	"origin" text,
	"lug_width_mm" real,
	"complications" jsonb,
	"retail_price" integer,
	"description" text,
	"image_url" text
);
--> statement-breakpoint
ALTER TABLE "user_watches" ADD CONSTRAINT "user_watches_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_watches" ADD CONSTRAINT "user_watches_watch_reference_id_watch_references_id_fk" FOREIGN KEY ("watch_reference_id") REFERENCES "public"."watch_references"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "users_clerk_id_idx" ON "users" USING btree ("clerk_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_username_idx" ON "users" USING btree ("username");--> statement-breakpoint
CREATE UNIQUE INDEX "watch_references_slug_idx" ON "watch_references" USING btree ("slug");