import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  it("resolves conflicting tailwind classes keeping the last one", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("drops falsy conditional values", () => {
    const isActive = false;
    expect(cn("base", isActive && "active", undefined)).toBe("base");
  });

  it("merges class lists from arrays and strings", () => {
    expect(cn(["font-mono", "text-xs"], "text-sm")).toBe("font-mono text-sm");
  });
});
