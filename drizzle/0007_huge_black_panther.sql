CREATE TABLE "catalog_edits" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"target_type" text NOT NULL,
	"target_id" integer NOT NULL,
	"action" text NOT NULL,
	"field_changed" text,
	"old_value" text,
	"new_value" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "watch_families" ADD COLUMN "created_by" integer;--> statement-breakpoint
ALTER TABLE "watch_families" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "watch_families" ADD COLUMN "updated_by" integer;--> statement-breakpoint
ALTER TABLE "watch_families" ADD COLUMN "edit_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "watch_references" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "watch_references" ADD COLUMN "updated_by" integer;--> statement-breakpoint
ALTER TABLE "watch_references" ADD COLUMN "edit_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "catalog_edits" ADD CONSTRAINT "catalog_edits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watch_families" ADD CONSTRAINT "watch_families_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watch_families" ADD CONSTRAINT "watch_families_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watch_references" ADD CONSTRAINT "watch_references_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;