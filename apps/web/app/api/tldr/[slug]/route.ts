import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { eq, postTldr } from "@gabriel/db";
import { buildTldrPrompt, parseTldrBullets } from "@/lib/ai-prompts";
import { findPost } from "@/lib/content";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { chatCompletion } from "@/lib/groq";

export const dynamic = "force-dynamic";

const slugSchema = z.string().min(1);
const bulletsSchema = z.array(z.string());

type RouteContext = { params: Promise<{ slug: string }> };

// Only published posts get a summary — otherwise any URL would burn Groq calls
async function resolvePublishedPost(context: RouteContext) {
  const { slug } = await context.params;
  const parsed = slugSchema.safeParse(slug);
  if (!parsed.success) return null;
  return findPost(parsed.data) ?? null;
}

const noContent = () => new NextResponse(null, { status: 204 });

export async function GET(_request: NextRequest, context: RouteContext) {
  const post = await resolvePublishedPost(context);
  if (!post) {
    return NextResponse.json({ error: "post não encontrado" }, { status: 404 });
  }

  const [cached] = await db
    .select({ bullets: postTldr.bullets })
    .from(postTldr)
    .where(eq(postTldr.slug, post.slug));
  if (cached) {
    return NextResponse.json({
      bullets: bulletsSchema.parse(JSON.parse(cached.bullets)),
    });
  }

  // The summary is an enhancement triggered by any reader: without a key (or
  // on a Groq failure) the post must still render, so misses degrade to 204
  if (!env.GROQ_API_KEY) {
    console.warn("tl;dr indisponível: GROQ_API_KEY ausente");
    return noContent();
  }

  let bullets: string[];
  try {
    bullets = parseTldrBullets(await chatCompletion(buildTldrPrompt(post.raw)));
  } catch (error) {
    console.warn(`tl;dr indisponível para "${post.slug}"`, error);
    return noContent();
  }
  if (bullets.length === 0) {
    console.warn(
      `tl;dr indisponível para "${post.slug}": resposta sem bullets`,
    );
    return noContent();
  }

  // Two first readers racing both generate; last write wins and the race
  // costs at most one extra Groq call
  await db
    .insert(postTldr)
    .values({ slug: post.slug, bullets: JSON.stringify(bullets) })
    .onConflictDoUpdate({
      target: postTldr.slug,
      set: { bullets: JSON.stringify(bullets) },
    });

  return NextResponse.json({ bullets });
}
