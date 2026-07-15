import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { getCommentTree } from "@/lib/comments";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const postSlug = request.nextUrl.searchParams.get("post");
  if (!postSlug) {
    return NextResponse.json(
      { error: "parâmetro 'post' é obrigatório" },
      { status: 400 },
    );
  }

  const [comments, session] = await Promise.all([
    getCommentTree(postSlug),
    auth.api.getSession({ headers: request.headers }),
  ]);

  return NextResponse.json({
    comments,
    viewer: session
      ? { id: session.user.id, isAdmin: session.user.role === "admin" }
      : null,
  });
}
