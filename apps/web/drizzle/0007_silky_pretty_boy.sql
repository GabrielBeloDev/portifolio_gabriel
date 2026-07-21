CREATE TYPE "public"."draft_type" AS ENUM('post', 'study', 'project');--> statement-breakpoint
ALTER TABLE "draft" ADD COLUMN "type" "draft_type" DEFAULT 'post' NOT NULL;--> statement-breakpoint
ALTER TABLE "draft" ADD COLUMN "project_slug" text;