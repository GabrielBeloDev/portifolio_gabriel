import { describe, expect, it } from "vitest";
import { signInSchema, signUpSchema } from "./auth";

describe("signUpSchema", () => {
  it("accepts a valid sign-up payload", () => {
    const result = signUpSchema.safeParse({
      name: "Gabriel",
      email: "g@example.com",
      password: "senha-forte",
    });
    expect(result.success).toBe(true);
  });

  it("rejects short passwords with a readable message", () => {
    const result = signUpSchema.safeParse({
      name: "Gabriel",
      email: "g@example.com",
      password: "curta",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain("8 caracteres");
    }
  });

  it("trims the name before validating", () => {
    const result = signUpSchema.safeParse({
      name: "  G  ",
      email: "g@example.com",
      password: "senha-forte",
    });
    expect(result.success).toBe(false);
  });
});

describe("signInSchema", () => {
  it("rejects malformed emails", () => {
    const result = signInSchema.safeParse({ email: "nope", password: "x" });
    expect(result.success).toBe(false);
  });
});
