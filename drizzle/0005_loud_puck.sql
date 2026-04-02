CREATE TABLE "watch_families" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"brand" text NOT NULL,
	"model" text NOT NULL,
	"description" text,
	"image_url" text,
	"is_community_submitted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "watch_references" ADD COLUMN "family_id" integer;--> statement-breakpoint
CREATE UNIQUE INDEX "watch_families_slug_idx" ON "watch_families" USING btree ("slug");--> statement-breakpoint
ALTER TABLE "watch_references" ADD CONSTRAINT "watch_references_family_id_watch_families_id_fk" FOREIGN KEY ("family_id") REFERENCES "public"."watch_families"("id") ON DELETE no action ON UPDATE no action;