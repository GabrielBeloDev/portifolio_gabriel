DROP INDEX "like_reader_target_uq";--> statement-breakpoint
ALTER TABLE "like" ADD COLUMN "kind" text DEFAULT 'like' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "like_reader_target_kind_uq" ON "like" USING btree ("reader_id","target_type","target_id","kind");