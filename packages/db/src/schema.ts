import {
  index,
  integer,
  pgEnum,
  pgTable,
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
  },
  (table) => [
    index("comment_post_slug_idx").on(table.postSlug),
    index("comment_parent_id_idx").on(table.parentId),
  ],
);

export const draft = pgTable(
  "draft",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    authorId: text("author_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    // Permissive on purpose: autosave must never lose text, so validation
    // only gates publishing (ADR-0007), not saving
    title: text("title").notNull().default(""),
    slug: text("slug").notNull().default(""),
    summary: text("summary").notNull().default(""),
    tags: text("tags").notNull().default(""),
    body: text("body").notNull().default(""),
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

export const like = pgTable(
  "like",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    readerId: text("reader_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    targetType: likeTargetType("target_type").notNull(),
    targetId: text("target_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    // The "one like per reader per target" rule is enforced by the database,
    // not just the UI
    uniqueIndex("like_reader_target_uq").on(
      table.readerId,
      table.targetType,
      table.targetId,
    ),
    index("like_target_idx").on(table.targetType, table.targetId),
  ],
);
