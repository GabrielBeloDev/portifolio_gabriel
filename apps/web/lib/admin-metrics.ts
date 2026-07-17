import {
  comment,
  count,
  desc,
  eq,
  gte,
  isNull,
  like,
  max,
  postView,
  session,
  sql,
  user,
} from "@gabriel/db";
import { countReportedComments } from "./comments";
import { publishedPosts } from "./content";
import { db } from "./db";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string | null;
  createdAt: Date;
  lastSeenAt: Date | null;
};

export type SignupsByDay = {
  day: string;
  total: number;
};

export type PostViews = {
  slug: string;
  title: string;
  views: number;
};

export type AdminTotals = {
  comments: number;
  likes: number;
  reportedPending: number;
};

const SIGNUP_WINDOW_DAYS = 30;

export async function listUsersWithLastSession(): Promise<AdminUser[]> {
  return db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      lastSeenAt: max(session.createdAt),
    })
    .from(user)
    .leftJoin(session, eq(session.userId, user.id))
    .groupBy(user.id)
    .orderBy(desc(user.createdAt));
}

export async function listSignupsByDay(): Promise<SignupsByDay[]> {
  const windowStart = new Date();
  windowStart.setUTCDate(windowStart.getUTCDate() - (SIGNUP_WINDOW_DAYS - 1));
  windowStart.setUTCHours(0, 0, 0, 0);

  const dayExpression = sql<string>`to_char(${user.createdAt} at time zone 'utc', 'YYYY-MM-DD')`;
  const rows = await db
    .select({ day: dayExpression, total: count() })
    .from(user)
    .where(gte(user.createdAt, windowStart))
    .groupBy(dayExpression);

  const totalsByDay = new Map(rows.map((row) => [row.day, row.total]));

  // Zero-fill the window: a time axis with missing days would distort the chart
  return Array.from({ length: SIGNUP_WINDOW_DAYS }, (_, index) => {
    const date = new Date(windowStart);
    date.setUTCDate(windowStart.getUTCDate() + index);
    const day = date.toISOString().slice(0, 10);
    return { day, total: totalsByDay.get(day) ?? 0 };
  });
}

export async function listViewsByPost(): Promise<PostViews[]> {
  const rows = await db
    .select({ slug: postView.slug, views: postView.count })
    .from(postView)
    .orderBy(desc(postView.count));

  // Post titles live in velite content, not in the database
  const titleBySlug = new Map(
    publishedPosts.map((post) => [post.slug, post.title]),
  );

  return rows.map((row) => ({
    slug: row.slug,
    title: titleBySlug.get(row.slug) ?? row.slug,
    views: row.views,
  }));
}

export async function getAdminTotals(): Promise<AdminTotals> {
  const [commentRows, likeRows, reportedPending] = await Promise.all([
    db
      .select({ total: count() })
      .from(comment)
      .where(isNull(comment.deletedAt)),
    db.select({ total: count() }).from(like),
    countReportedComments(),
  ]);

  return {
    comments: commentRows[0]?.total ?? 0,
    likes: likeRows[0]?.total ?? 0,
    reportedPending,
  };
}
