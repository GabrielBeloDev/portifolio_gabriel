import { describe, expect, it } from "vitest";
import { PROJECT_CATEGORIES, toProjectCategory } from "./draft-type";

describe("toProjectCategory", () => {
  it("accepts every known category", () => {
    for (const category of PROJECT_CATEGORIES) {
      expect(toProjectCategory(category)).toBe(category);
    }
  });

  it("returns null for empty, whitespace, null and undefined", () => {
    expect(toProjectCategory("")).toBeNull();
    expect(toProjectCategory("   ")).toBeNull();
    expect(toProjectCategory(null)).toBeNull();
    expect(toProjectCategory(undefined)).toBeNull();
  });

  it("returns null for an unknown value", () => {
    expect(toProjectCategory("inventada")).toBeNull();
  });

  // The publish path relies on `toProjectCategory(x) ?? "producao"` so an
  // untouched category never reaches the YAML as an empty string
  it("resolves an untouched category to the default at the call site", () => {
    expect(toProjectCategory("") ?? "producao").toBe("producao");
  });
});
