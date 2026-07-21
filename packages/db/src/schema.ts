import {
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const likeTargetType = pgEnum("like_target_type", ["post", "comment"]);

export const comment = pgTable(
  "comment",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    postSlug: text("post_slug").notNull(),
    // No cascade: deleting a mid-thread author's rows would orphan replies;
    // account deletion flow is deliberately unresolved until it exists
    authorId: text("author_id")
      .notNull()
      .references(() => user.id),
    parentId: uuid("parent_id").references((): AnyPgColumn => comment.id),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    // Soft delete: removing a mid-thread comment must not orphan its subtree
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    // Moderation flag: any signed-in reader can raise it once (globally idempotent);
    // admin clears it by dismissing or soft-deleting. No reporter identity by design.
    reportedAt: timestamp("reported_at", { withTimezone: true }),
  },
  (table) => [
    index("comment_post_slug_idx").on(table.postSlug),
    index("comment_parent_id_idx").on(table.parentId),
  ],
);

// Which collection a draft publishes to; drives serializer, path and validation.
// All three values ship together so adding "project" later needs no ALTER TYPE
// (Postgres can't add an enum value inside the migration transaction)
export const draftType = pgEnum("draft_type", ["post", "study", "project"]);

export const draft = pgTable(
  "draft",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    authorId: text("author_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    // Default keeps every existing draft a post, so the column backfills safely
    type: draftType("type").notNull().default("post"),
    // Permissive on purpose: autosave must never lose text, so validation
    // only gates publishing (ADR-0007), not saving
    title: text("title").notNull().default(""),
    slug: text("slug").notNull().default(""),
    summary: text("summary").notNull().default(""),
    // Reused per type: tags for a post, stack for a project, unused for a study
    tags: text("tags").notNull().default(""),
    body: text("body").notNull().default(""),
    // Study-only: optional pointer to a Project, mirrors caseStudies.projectSlug
    projectSlug: text("project_slug"),
    // Project-only: repo/live URLs and the catalog category (stack reuses tags)
    repo: text("repo"),
    live: text("live"),
    category: text("category"),
    // Secret review link: the token itself is the credential — anyone holding
    // it can read the draft without login; null means not shared
    shareToken: uuid("share_token"),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("draft_author_id_idx").on(table.authorId),
    uniqueIndex("draft_share_token_uq").on(table.shareToken),
  ],
);

// Aggregate-only by design: no per-reader tracking, so views stay anonymous
export const postView = pgTable("post_view", {
  slug: text("slug").primaryKey(),
  count: integer("count").notNull().default(0),
});

// Same beacon as post_view, bucketed per day so the dashboard keeps history
export const postViewDaily = pgTable(
  "post_view_daily",
  {
    slug: text("slug").notNull(),
    day: date("day").notNull(),
    count: integer("count").notNull().default(0),
  },
  (table) => [primaryKey({ columns: [table.slug, table.day] })],
);

// Cache filled on first read of a post: the Groq summary is generated once
// and reused forever, never one call per pageview
export const postTldr = pgTable("post_tldr", {
  slug: text("slug").primaryKey(),
  // JSON array of 3 bullet strings
  bullets: text("bullets").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const like = pgTable(
  "like",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    readerId: text("reader_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    targetType: likeTargetType("target_type").notNull(),
    targetId: text("target_id").notNull(),
    // Reactions (util/curioso/discordo) reuse this table; plain likes keep
    // the default so pre-existing rows stay valid
    kind: text("kind").notNull().default("like"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    // The "one reaction per reader per target per kind" rule is enforced by
    // the database, not just the UI
    uniqueIndex("like_reader_target_kind_uq").on(
      table.readerId,
      table.targetType,
      table.targetId,
      table.kind,
    ),
    index("like_target_idx").on(table.targetType, table.targetId),
  ],
);
