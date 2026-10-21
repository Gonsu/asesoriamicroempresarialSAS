import { expect, setConsent, test } from "./fixtures";

test.describe("cabeceras y recursos de terceros", () => {
  test("cabeceras de seguridad en las respuestas", async ({ request }) => {
    const res = await request.get("/");
    const h = res.headers();
    const csp = h["content-security-policy"] ?? "";
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("script-src 'self' https://challenges.cloudflare.com");
    expect(csp).not.toMatch(/script-src[^;]*'unsafe-(inline|eval)'/);
    expect(h["strict-transport-security"]).toBe("max-age=31536000; includeSubDomains");
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["x-frame-options"]).toBe("DENY");
    expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(h["permissions-policy"]).toContain("camera=()");
  });

  test("sin peticiones a Google ni a otras fuentes externas al cargar Inicio", async ({ page, context }) => {
    await setConsent(context, { statistics: false, maps: false });
    const external = new Set<string>();
    page.on("request", (r) => {
      const host = new URL(r.url()).hostname;
      if (!["localhost", "127.0.0.1"].includes(host)) external.add(host);
    });
    await page.goto("/");
    await page.waitForLoadState("load");
    await page.waitForTimeout(2500);
    expect([...external]).toEqual([]);
    expect(await page.evaluate(() => document.fonts.check("16px 'Open Sans'"))).toBe(true);
  });

  test.describe("incrustado", () => {
    // El navegador registra en consola el bloqueo por frame-ancestors: es lo esperado.
    test.use({ allowedConsoleErrors: [/frame-ancestors|Refused to (display|frame)/] });
    test("el sitio no se puede incrustar en un iframe", async ({ page }) => {
      // frame-ancestors 'none': el navegador bloquea la carga dentro de otro documento.
      await page.setContent('<iframe id="f" src="http://localhost:4173/"></iframe>');
      await page.waitForTimeout(1500);
      const frame = page.frame({ url: /localhost:4173/ });
      const loaded = frame ? await frame.locator("#root").count().catch(() => 0) : 0;
      expect(loaded).toBe(0);
    });
  });
});
