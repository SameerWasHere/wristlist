CREATE TABLE "watch_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"requested_by" text,
	"brand" text NOT NULL,
	"model" text NOT NULL,
	"reference" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
