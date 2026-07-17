import path from "node:path";
import { neon } from "@neondatabase/serverless";

export const READER_EMAIL = "e2e-reader@example.com";
export const ADMIN_EMAIL = "e2e-admin@example.com";
export const FIXTURE_PASSWORD = "senha-de-teste-123";

export const READER_STATE = path.join(__dirname, ".auth", "reader.json");
export const ADMIN_STATE = path.join(__dirname, ".auth", "admin.json");

// browser.newContext() inherits context options from test.use, so a context
// that must be anonymous has to override any file-level storageState explicitly
export const ANONYMOUS_STATE = { cookies: [], origins: [] };

export function requireDb() {
  const databaseUrl = process.env.DATABASE_URL;
  // Only reachable with E2E_WITH_DB=1, so a missing URL is always
  // misconfiguration — failing loud beats a silent no-op sweep
  if (!databaseUrl) {
    throw new Error("E2E_WITH_DB=1 requer DATABASE_URL para as fixtures e2e");
  }
  return neon(databaseUrl);
}
