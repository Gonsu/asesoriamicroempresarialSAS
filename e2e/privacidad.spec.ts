import type { Page, Request } from "@playwright/test";
import { expect, POLICY_VERSION, test } from "./fixtures";
import { resetRateLimits } from "./helpers/db";

/** Cuerpos de los POST a page_views que haga la página. */
function captureVisits(page: Page) {
  const visits: { page: string; visitor_id: string | null }[] = [];
  page.on("request", (r: Request) => {
    if (r.method() === "POST" && r.url().includes("/rest/v1/page_views")) visits.push(JSON.parse(r.postData() ?? "{}"));
  });
  return visits;
}

const storageKeys = (page: Page) => page.evaluate(() => Object.keys(localStorage).sort());

test.describe("privacidad y consentimiento", () => {
  test.beforeEach(async () => {
    await resetRateLimits();
  });

  test("primera visita: aviso visible, visita sin identificador y nada guardado", async ({ page }) => {
    const visits = captureVisits(page);
    await page.goto("/");
    await expect(page.getByRole("region", { name: "Tu privacidad" })).toBeVisible();
    await expect.poll(() => visits.length).toBeGreaterThan(0);
    expect(visits[0]).toMatchObject({ page: "/", visitor_id: null });
    expect(await storageKeys(page)).toEqual([]);
  });

  test("Rechazar guarda solo la elección y las visitas siguen sin identificador", async ({ page }) => {
    const visits = captureVisits(page);
    await page.goto("/");
    await page.getByRole("button", { name: "Rechazar" }).click();
    await expect(page.getByRole("region", { name: "Tu privacidad" })).toHaveCount(0);
    expect(await storageKeys(page)).toEqual(["ame_consent"]);
    await page.goto("/empresa");
    await expect.poll(() => visits.length).toBeGreaterThanOrEqual(2);
    expect(visits.every((v) => v.visitor_id === null)).toBe(true);
  });

  test("activar Estadísticas desde el pie agrega el identificador; retirarlo lo borra", async ({ page }) => {
    const visits = captureVisits(page);
    await page.goto("/terminos");
    await page.getByRole("button", { name: "Rechazar" }).click();
    const footer = page.locator("footer");
    await footer.getByRole("button", { name: "Preferencias de cookies" }).click();
    await page.getByRole("switch", { name: "Estadísticas" }).click();
    await page.getByRole("button", { name: "Guardar preferencias" }).click();

    await page.goto("/servicios");
    await expect.poll(() => visits.at(-1)?.visitor_id ?? null).toMatch(/^[0-9a-f-]{36}$/);
    expect(await storageKeys(page)).toContain("ame_visitor_id");

    await footer.getByRole("button", { name: "Preferencias de cookies" }).click();
    await page.getByRole("switch", { name: "Estadísticas" }).click();
    await page.getByRole("button", { name: "Guardar preferencias" }).click();
    expect(await storageKeys(page)).not.toContain("ame_visitor_id");
  });

  test("el mapa de Google pide permiso y solo carga tras aceptarlo", async ({ page }) => {
    const google: string[] = [];
    page.on("request", (r) => new URL(r.url()).hostname.endsWith("google.com") && google.push(r.url()));
    await page.goto("/contacto");
    await page.getByRole("button", { name: "Rechazar" }).click();
    await page.getByRole("button", { name: "Ver mapa" }).click();
    await expect(page.getByRole("group", { name: "Permiso para cargar Google Maps" })).toBeVisible();
    await expect(page.locator('iframe[src*="google.com/maps"]')).toHaveCount(0);
    expect(google).toEqual([]);

    await page.getByRole("button", { name: "Aceptar y ver mapa" }).click();
    await expect(page.locator('iframe[src*="google.com/maps"]')).toBeAttached();
    const consent = await page.evaluate(() => JSON.parse(localStorage.getItem("ame_consent") ?? "{}"));
    expect(consent).toMatchObject({ maps: true, statistics: false, version: POLICY_VERSION });
  });

  test("la política de datos incluye lo exigido", async ({ page }) => {
    await page.goto("/politica-de-datos");
    await page.getByRole("button", { name: "Rechazar" }).click();
    const text = await page.locator("article").innerText();
    for (const needle of [
      "Ley Estatutaria 1581 de 2012",
      "us-west-2",
      "transmisión internacional",
      "Turnstile",
      "Google Maps",
      "12 meses",
      "24 meses",
      "hash irreversible",
      "diez (10) días",
      "quince (15) días",
    ]) {
      expect(text, needle).toContain(needle);
    }
  });
});
