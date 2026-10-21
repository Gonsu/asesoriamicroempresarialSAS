import { defineConfig, devices } from "@playwright/test";

// Pruebas E2E en ./e2e contra el build real servido con `vite preview` (cabeceras de seguridad,
// HTML por ruta y 404 como en Cloudflare Pages) y el Supabase local. Antes: `npx supabase start`
// y `npm run test:e2e`, que escribe .env.production.local y hace el build.
//
// PW_CHANNEL=msedge usa Edge en lugar del Chromium de Playwright (útil en Windows).
const CI = !!process.env.CI;

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  // Las pruebas comparten la base local y los contadores de límites: una a la vez.
  fullyParallel: false,
  workers: 1,
  retries: CI ? 1 : 0,
  forbidOnly: CI,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: CI ? [["list"], ["html", { open: "never" }]] : [["list"]],
  use: {
    baseURL: "http://localhost:4173",
    locale: "es-CO",
    timezoneId: "America/Bogota",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      // "Desktop Chrome" usa un user agent de Chrome normal: el headless se anunciaría como
      // HeadlessChrome y el filtro de bots descartaría las visitas (correcto, pero no se podrían probar).
      use: { ...devices["Desktop Chrome"], channel: process.env.PW_CHANNEL || undefined },
    },
  ],
  webServer: [
    {
      command: "npx vite preview --port 4173 --strictPort",
      url: "http://localhost:4173",
      reuseExistingServer: !CI,
      timeout: 60_000,
    },
    {
      // Edge Function del formulario con las claves de prueba de Turnstile. Responde 403 a un
      // GET sin origen permitido: suficiente para saber que está lista.
      command: "npx supabase functions serve contact --env-file supabase/functions/.env.example",
      url: "http://127.0.0.1:54321/functions/v1/contact",
      reuseExistingServer: !CI,
      timeout: 180_000,
    },
  ],
});
