import { defineConfig, devices } from "@playwright/test";

// Pruebas e2e en ./e2e contra el servidor de desarrollo (http://localhost:8080).
export default defineConfig({
  testDir: "./e2e",
  use: {
    baseURL: "http://localhost:8080",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:8080",
    reuseExistingServer: !process.env.CI,
  },
});
