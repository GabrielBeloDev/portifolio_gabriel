import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Gabriel Belo — portfólio";

// Hex values on purpose: ImageResponse renders outside the DOM, without CSS tokens
const BACKGROUND = "#0b0d10";
const FOREGROUND = "#e6e9ef";
const MUTED = "#7d8590";
const ACCENT = "#f5a623";
const WINBAR_BORDER = "#1f242c";
const DOT_COLORS = ["#ff5f56", "#ffbd2e", "#27c93f"];

export default function OpengraphImage() {
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
          portfólio
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 84,
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
          }}
        >
          Gabriel Belo
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
