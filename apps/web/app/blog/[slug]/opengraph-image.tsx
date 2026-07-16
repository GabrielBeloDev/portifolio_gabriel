import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { findPost } from "@/lib/content";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Post do blog de Gabriel Belo";

// Hex values on purpose: ImageResponse renders outside the DOM, without CSS tokens
const BACKGROUND = "#0b0d10";
const FOREGROUND = "#e6e9ef";
const MUTED = "#7d8590";
const ACCENT = "#f5a623";
const WINBAR_BORDER = "#1f242c";
const DOT_COLORS = ["#ff5f56", "#ffbd2e", "#27c93f"];

const LONG_TITLE_LENGTH = 60;

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = findPost(slug);
  if (!post) notFound();

  const tag = post.tags[0] ?? "blog";
  const titleFontSize = post.title.length > LONG_TITLE_LENGTH ? 56 : 68;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: BACKGROUND,
        color: FOREGROUND,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "28px 48px",
          borderBottom: `1px solid ${WINBAR_BORDER}`,
        }}
      >
        {DOT_COLORS.map((dotColor) => (
          <div
            key={dotColor}
            style={{
              width: 16,
              height: 16,
              borderRadius: 8,
              backgroundColor: dotColor,
            }}
          />
        ))}
      </div>
      <div
        style={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 24,
          padding: "0 72px",
        }}
      >
        <div style={{ display: "flex", color: ACCENT, fontSize: 30 }}>
          {tag}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: titleFontSize,
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
          }}
        >
          {post.title}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          padding: "0 72px 56px",
          color: MUTED,
          fontSize: 28,
        }}
      >
        gabrielbelo — dev
      </div>
    </div>,
    size,
  );
}
