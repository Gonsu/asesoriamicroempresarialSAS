import { describe, expect, it } from "vitest";
import { buildContentSecurityPolicy, buildHeadersFile } from "./securityHeaders";

const directives = (csp: string) =>
  Object.fromEntries(
    csp.split("; ").map((d) => {
      const [name, ...values] = d.split(" ");
      return [name, values];
    }),
  );

describe("Content-Security-Policy", () => {
  const csp = directives(buildContentSecurityPolicy("https://abc.supabase.co/"));

  it("solo permite el propio sitio, Supabase, Turnstile y Google Maps", () => {
    expect(csp["default-src"]).toEqual(["'self'"]);
    expect(csp["script-src"]).toEqual(["'self'", "https://challenges.cloudflare.com"]);
    expect(csp["connect-src"]).toEqual(["'self'", "https://abc.supabase.co"]);
    expect(csp["img-src"]).toEqual(["'self'", "data:", "https://abc.supabase.co"]);
    expect(csp["font-src"]).toEqual(["'self'"]);
    expect(csp["frame-src"]).toEqual(["https://challenges.cloudflare.com", "https://www.google.com"]);
  });

  it("no permite scripts en línea ni eval, ni ser incrustado", () => {
    expect(csp["script-src"]).not.toContain("'unsafe-inline'");
    expect(Object.values(csp).flat()).not.toContain("'unsafe-eval'");
    expect(csp["style-src"]).toEqual(["'self'", "'unsafe-inline'"]);
    expect(csp["frame-ancestors"]).toEqual(["'none'"]);
    expect(csp["object-src"]).toEqual(["'none'"]);
    expect(csp).toHaveProperty("upgrade-insecure-requests");
  });

  it("no fuerza HTTPS con un Supabase local", () => {
    expect(directives(buildContentSecurityPolicy("http://127.0.0.1:54321"))).not.toHaveProperty(
      "upgrade-insecure-requests",
    );
  });
});

describe("_headers", () => {
  it("aplica las cabeceras a todas las rutas y caché larga a /assets", () => {
    const file = buildHeadersFile("https://abc.supabase.co");
    expect(file.startsWith("/*\n")).toBe(true);
    for (const header of [
      "Strict-Transport-Security: max-age=31536000; includeSubDomains",
      "X-Content-Type-Options: nosniff",
      "Referrer-Policy: strict-origin-when-cross-origin",
      "Permissions-Policy: camera=()",
      "X-Frame-Options: DENY",
    ]) {
      expect(file).toContain(`  ${header}`);
    }
    expect(file).toContain("/assets/*\n  Cache-Control: public, max-age=31536000, immutable");
  });
});
