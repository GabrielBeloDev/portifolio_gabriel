-- post_view and draft.share_token were pushed to the database before this
-- migration existed; IF NOT EXISTS reconciles that drift so the file applies
-- both on the live database and on a fresh one
CREATE TABLE IF NOT EXISTS "post_view" (
	"slug" text PRIMARY KEY NOT NULL,
	"count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "comment" ADD COLUMN "reported_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "draft" ADD COLUMN IF NOT EXISTS "share_token" uuid;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "draft_share_token_uq" ON "draft" USING btree ("share_token");
