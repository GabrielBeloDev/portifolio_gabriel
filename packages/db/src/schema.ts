import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

export const likeTargetType = pgEnum("like_target_type", ["post", "comment"]);

export const comment = pgTable(
  "comment",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    postSlug: text("post_slug").notNull(),
    // FK to the Better Auth user table lands with the auth schema (#21)
    authorId: text("author_id").notNull(),
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

export const like = pgTable(
  "like",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    readerId: text("reader_id").notNull(),
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
