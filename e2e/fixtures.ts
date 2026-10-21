import { test as base, expect, type BrowserContext, type Page } from "@playwright/test";
import { USERS } from "./helpers/env";

export { expect };

/** Versión de la política vigente (src/config/legal.ts). */
export const POLICY_VERSION = "2026-10-22";

type Options = {
  /** Errores de consola esperados en esta prueba (p. ej. un 429 provocado). */
  allowedConsoleErrors: RegExp[];
};

/**
 * `page` con vigilancia: al terminar cada prueba, falla si hubo violaciones de la CSP o
 * errores de consola no esperados.
 */
export const test = base.extend<Options>({
  allowedConsoleErrors: [[], { option: true }],
  page: async ({ page, allowedConsoleErrors }, use) => {
    const consoleErrors: string[] = [];
    page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));
    page.on("pageerror", (e) => consoleErrors.push(String(e)));
    await page.addInitScript(() => {
      (window as unknown as { __csp: string[] }).__csp = [];
      document.addEventListener("securitypolicyviolation", (e) =>
        (window as unknown as { __csp: string[] }).__csp.push(`${e.violatedDirective} ${e.blockedURI}`),
      );
    });

    await use(page);

    if (!page.isClosed()) {
      const csp = await page.evaluate(() => (window as unknown as { __csp?: string[] }).__csp ?? []).catch(() => []);
      expect(csp, "violaciones de la CSP").toEqual([]);
    }
    const unexpected = consoleErrors.filter((e) => !allowedConsoleErrors.some((re) => re.test(e)));
    expect(unexpected, "errores de consola").toEqual([]);
  },
});

/** Guarda una elección de cookies antes de cargar la página (sin pasar por el aviso). */
export async function setConsent(context: BrowserContext, choices: { statistics: boolean; maps: boolean }) {
  await context.addInitScript(
    ([value]) => localStorage.setItem("ame_consent", value),
    [JSON.stringify({ ...choices, version: POLICY_VERSION, decidedAt: new Date().toISOString() })],
  );
}

/** Inicia sesión por el formulario de /login. */
export async function login(page: Page, user: keyof typeof USERS) {
  await page.goto("/login");
  await page.getByLabel("Correo electrónico").fill(USERS[user].email);
  await page.getByLabel("Contraseña").fill(USERS[user].password);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
}

/** Las rutas públicas indexables. */
export const PUBLIC_ROUTES = ["/", "/empresa", "/servicios", "/reuniones", "/contacto", "/politica-de-datos", "/terminos"];
