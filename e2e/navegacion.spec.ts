import { expect, PUBLIC_ROUTES, setConsent, test } from "./fixtures";
import { pages } from "../src/config/routes";

test.describe("navegación pública", () => {
  test.beforeEach(async ({ context }) => {
    await setConsent(context, { statistics: false, maps: false });
  });

  for (const route of PUBLIC_ROUTES) {
    test(`${route} responde 200 con su título, canonical y Open Graph en el HTML servido`, async ({ page, request }) => {
      const meta = pages[route as keyof typeof pages];
      // HTML tal como lo recibe un rastreador que no ejecuta JS (WhatsApp, Facebook).
      const res = await request.get(route);
      expect(res.status()).toBe(200);
      const html = await res.text();
      expect(html).toContain(`<title>${meta.title}</title>`);
      expect(html).toContain(`rel="canonical" href="http://localhost:4173${route}"`);
      expect(html).toContain('property="og:image" content="http://localhost:4173/og-image.jpg"');
      expect(html).not.toContain('name="robots" content="noindex');

      await page.goto(route);
      await expect(page).toHaveTitle(meta.title);
      await expect(page.locator("h1").first()).toBeVisible();
    });
  }

  test("el menú y el pie llevan a cada sección", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Principal" });
    for (const [label, path, heading] of [
      ["Servicios", "/servicios", "Soluciones para tu empresa"],
      ["Reuniones", "/reuniones", "Reuniones y Asesorías"],
      ["Contáctenos", "/contacto", "Hablemos de tu proyecto"],
    ] as const) {
      await nav.getByRole("link", { name: label }).click();
      await expect(page).toHaveURL(path);
      await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
    }
    await nav.getByRole("button", { name: "Nuestra empresa" }).click();
    await page.getByRole("link", { name: "Comité asesor" }).click();
    await expect(page.getByRole("tab", { name: "Comité Asesor" })).toHaveAttribute("aria-selected", "true");

    const footer = page.locator("footer");
    await footer.getByRole("link", { name: "Política de tratamiento de datos" }).click();
    await expect(page).toHaveURL("/politica-de-datos");
    await footer.getByRole("link", { name: "Términos de uso" }).click();
    await expect(page).toHaveURL("/terminos");
  });

  test.describe("404", () => {
    // El navegador registra en consola el 404 del propio documento: es lo esperado.
    test.use({ allowedConsoleErrors: [/status of 404/] });
    test("una ruta inexistente responde 404 con noindex y la página de error", async ({ page }) => {
      const res = await page.goto("/no-existe");
      expect(res?.status()).toBe(404);
      await expect(page.getByRole("heading", { level: 1, name: "Página no encontrada" })).toBeVisible();
      await expect(page.locator('meta[name="robots"][content*="noindex"]').first()).toBeAttached();
      await page.getByRole("link", { name: "Volver al inicio" }).click();
      await expect(page).toHaveURL("/");
    });
  });

  test("sitemap y robots", async ({ request }) => {
    const sitemap = await (await request.get("/sitemap.xml")).text();
    for (const route of PUBLIC_ROUTES) expect(sitemap).toContain(`<loc>http://localhost:4173${route}</loc>`);
    expect(sitemap).not.toContain("/admin");
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toContain("Disallow: /admin");
  });
});
