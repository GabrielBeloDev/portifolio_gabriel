import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { getCommentsPayload } from "@/lib/comments";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const postSlug = request.nextUrl.searchParams.get("post");
  if (!postSlug) {
    return NextResponse.json(
      { error: "parâmetro 'post' é obrigatório" },
      { status: 400 },
    );
  }

  const session = await auth.api.getSession({ headers: request.headers });
  const payload = await getCommentsPayload(postSlug, session?.user.id ?? null);

  return NextResponse.json({
    ...payload,
    viewer: session
      ? { id: session.user.id, isAdmin: session.user.role === "admin" }
      : null,
  });
}
