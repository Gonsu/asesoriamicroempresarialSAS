import AxeBuilder from "@axe-core/playwright";
import { expect, PUBLIC_ROUTES, setConsent, test } from "./fixtures";

const WCAG = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

test.describe("accesibilidad (axe, WCAG 2.2 AA)", () => {
  // La CSP del sitio (bien) bloquea el script de axe que se inyecta: se omite solo aquí.
  test.use({ bypassCSP: true });

  for (const withBanner of [true, false]) {
    for (const route of [...PUBLIC_ROUTES, "/no-existe", "/login"]) {
      test.describe(route, () => {
        // /no-existe responde 404 a propósito y el navegador lo registra en consola.
        if (route === "/no-existe") test.use({ allowedConsoleErrors: [/status of 404/] });
        test(withBanner ? "con el aviso de cookies" : "sin el aviso", async ({ page, context }) => {
          if (!withBanner) await setConsent(context, { statistics: false, maps: false });
          await page.goto(route);
          await page.waitForLoadState("load");
          await page.waitForTimeout(1000);
          const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze();
          expect(violations.map((v) => `${v.id}: ${v.nodes[0]?.target.join(" ")}`)).toEqual([]);
        });
      });
    }
  }
});

test.describe("teclado", () => {
  const focused = (page: import("@playwright/test").Page) =>
    page.evaluate(() => {
      const el = document.activeElement;
      return el ? `${el.tagName.toLowerCase()}${el.id ? "#" + el.id : ""} ${(el.getAttribute("aria-label") || el.textContent || "").trim()}` : "";
    });

  test("el aviso de cookies se alcanza primero y al decidir el foco va al contenido", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    expect(await focused(page)).toMatch(/Política de tratamiento|Configurar|Rechazar|Aceptar/);
    for (let i = 0; i < 5 && !(await focused(page)).includes("Rechazar"); i++) await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");
    await expect.poll(() => focused(page)).toMatch(/^main#contenido/);
  });

  test("Saltar al contenido, submenú con Escape y pestañas con flechas", async ({ page, context }) => {
    await setConsent(context, { statistics: false, maps: false });
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/servicios");
    await page.keyboard.press("Tab");
    expect(await focused(page)).toContain("Saltar al contenido");
    await page.keyboard.press("Enter");
    expect(await focused(page)).toMatch(/^main#contenido/);

    const empresa = page.getByRole("button", { name: "Nuestra empresa" });
    await empresa.focus();
    await page.keyboard.press("Enter");
    await expect(empresa).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(empresa).toHaveAttribute("aria-expanded", "false");
    expect(await focused(page)).toContain("Nuestra empresa");

    await page.goto("/empresa#comite");
    const comite = page.getByRole("tab", { name: "Comité Asesor" });
    await expect(comite).toHaveAttribute("aria-selected", "true");
    await comite.focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tab", { name: "Objetivos" })).toHaveAttribute("aria-selected", "true");
  });

  test("las preferencias reciben el foco y lo devuelven al pie", async ({ page, context }) => {
    await setConsent(context, { statistics: false, maps: false });
    await page.goto("/terminos");
    const prefs = page.locator("footer").getByRole("button", { name: "Preferencias de cookies" });
    await prefs.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("heading", { name: "Preferencias de privacidad" })).toBeFocused();
    await page.getByRole("button", { name: "Cancelar" }).click();
    await expect(prefs).toBeFocused();
  });

  test("el carrusel se puede pausar y respeta el movimiento reducido", async ({ page, browser }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Pausar el carrusel" }).click();
    await expect(page.getByRole("button", { name: "Reanudar el carrusel" })).toBeVisible();

    const reduced = await browser.newContext({ reducedMotion: "reduce", baseURL: "http://localhost:4173" });
    const rp = await reduced.newPage();
    await rp.goto("/");
    await expect(rp.getByRole("button", { name: "Reanudar el carrusel" })).toBeVisible();
    await reduced.close();
  });
});
