"use server";

import { headers } from "next/headers";
import { z } from "zod";
import {
  buildImproveTextPrompt,
  buildOutlinePrompt,
  buildSuggestTopicsPrompt,
  type ChatPrompt,
} from "@/lib/ai-prompts";
import { auth } from "@/lib/auth";
import { publishedCaseStudies, publishedPosts } from "@/lib/content";
import { chatCompletion } from "@/lib/groq";

export type AiTextResult =
  | { ok: true; text: string }
  | { ok: false; error: string };

async function getAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session?.user.role !== "admin") return null;
  return session.user;
}

async function completeChat(prompt: ChatPrompt): Promise<AiTextResult> {
  try {
    return { ok: true, text: await chatCompletion(prompt) };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "erro ao chamar a Groq";
    return { ok: false, error: message };
  }
}

export async function suggestTopics(): Promise<AiTextResult> {
  const admin = await getAdmin();
  if (!admin) return { ok: false, error: "sem permissão" };

  const published = [
    ...publishedPosts.map((post) => ({ title: post.title, tags: post.tags })),
    ...publishedCaseStudies.map((study) => ({
      title: study.title,
      tags: [] as string[],
    })),
  ];
  return completeChat(buildSuggestTopicsPrompt(published));
}

export async function generateOutline(input: unknown): Promise<AiTextResult> {
  const admin = await getAdmin();
  if (!admin) return { ok: false, error: "sem permissão" };

  const parsed = z
    .object({ body: z.string().trim().min(1, "corpo vazio").max(100_000) })
    .safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "dados inválidos",
    };
  }

  return completeChat(buildOutlinePrompt(parsed.data.body));
}

export async function improveText(input: unknown): Promise<AiTextResult> {
  const admin = await getAdmin();
  if (!admin) return { ok: false, error: "sem permissão" };

  const parsed = z
    .object({ text: z.string().trim().min(1, "texto vazio").max(20_000) })
    .safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "dados inválidos",
    };
  }

  return completeChat(buildImproveTextPrompt(parsed.data.text));
}
