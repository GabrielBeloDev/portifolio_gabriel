import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// drizzle-kit runs outside Next, so .env.local must be loaded by hand;
// lib/env.ts can't be used here because its import would evaluate before this
config({ path: [".env.local", ".env"] });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set — expected in apps/web/.env.local");
}

export default defineConfig({
  schema: [
    "../../packages/db/src/schema.ts",
    "../../packages/db/src/auth-schema.ts",
  ],
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: databaseUrl },
});
