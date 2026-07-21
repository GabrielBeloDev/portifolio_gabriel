import { put } from "@vercel/blob";
import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";

const MAX_IMAGE_BYTES = 4.5 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
]);

function sanitizeFileName(name: string): string {
  const cleaned = name
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return cleaned === "" ? "image" : cleaned;
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (session?.user.role !== "admin") {
    return NextResponse.json({ error: "sem permissão" }, { status: 403 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "BLOB_READ_WRITE_TOKEN não configurada" },
      { status: 500 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "campo 'file' é obrigatório" },
      { status: 400 },
    );
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "tipo de imagem não suportado (use png, jpeg, webp ou gif)" },
      { status: 415 },
    );
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: "imagem maior que 4.5MB" }, { status: 413 });
  }

  try {
    const { url } = await put(
      `posts/${crypto.randomUUID()}-${sanitizeFileName(file.name)}`,
      file,
      { access: "public" },
    );
    return NextResponse.json({ url });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "erro ao enviar a imagem";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
