CREATE TABLE "deletion_flags" (
	"id" serial PRIMARY KEY NOT NULL,
	"watch_reference_id" integer NOT NULL,
	"flagged_by" integer NOT NULL,
	"reason" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"reviewed_at" timestamp,
	"reviewed_by" integer,
	"review_note" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "watch_references" ADD COLUMN IF NOT EXISTS "bezel_type" text;--> statement-breakpoint
ALTER TABLE "deletion_flags" ADD CONSTRAINT "deletion_flags_watch_reference_id_watch_references_id_fk" FOREIGN KEY ("watch_reference_id") REFERENCES "public"."watch_references"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deletion_flags" ADD CONSTRAINT "deletion_flags_flagged_by_users_id_fk" FOREIGN KEY ("flagged_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deletion_flags" ADD CONSTRAINT "deletion_flags_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "deletion_flags_user_watch_idx" ON "deletion_flags" USING btree ("flagged_by","watch_reference_id");