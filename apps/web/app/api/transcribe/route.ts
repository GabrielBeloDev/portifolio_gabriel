import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { transcribeAudio } from "@/lib/groq";

const MAX_AUDIO_BYTES = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (session?.user.role !== "admin") {
    return NextResponse.json({ error: "sem permissão" }, { status: 403 });
  }

  const formData = await request.formData();
  const audio = formData.get("audio");
  if (!(audio instanceof File)) {
    return NextResponse.json(
      { error: "campo 'audio' é obrigatório" },
      { status: 400 },
    );
  }
  if (audio.size > MAX_AUDIO_BYTES) {
    return NextResponse.json(
      { error: "áudio maior que 10MB" },
      { status: 413 },
    );
  }

  try {
    const text = await transcribeAudio(audio);
    return NextResponse.json({ text });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "erro ao transcrever o áudio";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
