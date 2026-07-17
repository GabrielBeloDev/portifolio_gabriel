CREATE TABLE "post_view_daily" (
	"slug" text NOT NULL,
	"day" date NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "post_view_daily_slug_day_pk" PRIMARY KEY("slug","day")
);
