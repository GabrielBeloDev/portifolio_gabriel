import { z } from "zod";
import type { ChatPrompt } from "@/lib/ai-prompts";
import { env } from "@/lib/env";

const GROQ_BASE_URL = "https://api.groq.com/openai/v1";
const CHAT_MODEL = "llama-3.3-70b-versatile";
const TRANSCRIPTION_MODEL = "whisper-large-v3";

const chatCompletionSchema = z.object({
  choices: z.array(
    z.object({
      message: z.object({ content: z.string() }),
    }),
  ),
});

const transcriptionSchema = z.object({ text: z.string() });

function requireApiKey(): string {
  if (!env.GROQ_API_KEY) throw new Error("GROQ_API_KEY não configurada");
  return env.GROQ_API_KEY;
}

export async function chatCompletion(prompt: ChatPrompt): Promise<string> {
  const apiKey = requireApiKey();

  const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: CHAT_MODEL,
      messages: [
        { role: "system", content: prompt.system },
        { role: "user", content: prompt.user },
      ],
    }),
  });
  if (!response.ok) {
    throw new Error(`Groq respondeu ${response.status} no chat`);
  }

  const parsed = chatCompletionSchema.parse(await response.json());
  const content = parsed.choices[0]?.message.content;
  if (content === undefined) {
    throw new Error("Groq respondeu sem conteúdo no chat");
  }
  return content;
}

export async function transcribeAudio(audio: File): Promise<string> {
  const apiKey = requireApiKey();

  const formData = new FormData();
  formData.append("file", audio);
  formData.append("model", TRANSCRIPTION_MODEL);
  formData.append("language", "pt");

  const response = await fetch(`${GROQ_BASE_URL}/audio/transcriptions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  });
  if (!response.ok) {
    throw new Error(`Groq respondeu ${response.status} na transcrição`);
  }

  return transcriptionSchema.parse(await response.json()).text;
}
