import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { eq, postView, postViewDaily, sql } from "@gabriel/db";
import { findPost } from "@/lib/content";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const slugSchema = z.string().min(1);

type RouteContext = { params: Promise<{ slug: string }> };

// Only published posts get a row — otherwise any URL would grow the table
async function resolvePublishedSlug(context: RouteContext) {
  const { slug } = await context.params;
  const parsed = slugSchema.safeParse(slug);
  if (!parsed.success || !findPost(parsed.data)) return null;
  return parsed.data;
}

const notFound = () =>
  NextResponse.json({ error: "post não encontrado" }, { status: 404 });

export async function GET(_request: NextRequest, context: RouteContext) {
  const slug = await resolvePublishedSlug(context);
  if (!slug) return notFound();

  const [row] = await db
    .select({ count: postView.count })
    .from(postView)
    .where(eq(postView.slug, slug));

  return NextResponse.json({ count: row?.count ?? 0 });
}

export async function POST(_request: NextRequest, context: RouteContext) {
  const slug = await resolvePublishedSlug(context);
  if (!slug) return notFound();

  const [row] = await db
    .insert(postView)
    .values({ slug, count: 1 })
    .onConflictDoUpdate({
      target: postView.slug,
      set: { count: sql`${postView.count} + 1` },
    })
    .returning({ count: postView.count });

  if (!row) {
    throw new Error(`post_view upsert for "${slug}" returned no row`);
  }

  await db
    .insert(postViewDaily)
    .values({ slug, day: sql`CURRENT_DATE`, count: 1 })
    .onConflictDoUpdate({
      target: [postViewDaily.slug, postViewDaily.day],
      set: { count: sql`${postViewDaily.count} + 1` },
    });

  return NextResponse.json({ count: row.count });
}
