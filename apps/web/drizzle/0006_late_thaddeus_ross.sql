CREATE TABLE "post_tldr" (
	"slug" text PRIMARY KEY NOT NULL,
	"bullets" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
