import { defineConfig } from "@playwright/test";
import { config } from "dotenv";

// DB-backed specs (E2E_WITH_DB=1) talk to Postgres directly for setup/cleanup
config({ path: [".env.local", ".env"] });

// Parallel worktrees each need their own server — override via E2E_PORT
const PORT = Number(process.env.E2E_PORT ?? 3901);

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: `http://localhost:${PORT}`,
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
  webServer: {
    command: `pnpm start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
  },
});
