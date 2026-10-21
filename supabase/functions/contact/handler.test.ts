import { describe, expect, it, vi } from "vitest";
import { clientIp, handleContact, parseContactBody, type ContactDeps } from "./handler";

const ORIGIN = "https://ame.pages.dev";
const valid = { name: "Ana", email: "ana@correo.co", message: "Quiero una asesoría financiera.", token: "tok" };

function deps(overrides: Partial<ContactDeps> = {}): ContactDeps {
  return {
    allowedOrigins: [ORIGIN],
    allowedHostnames: ["ame.pages.dev"],
    hitRateLimit: vi.fn().mockResolvedValue(true),
    verifyTurnstile: vi.fn().mockResolvedValue({ success: true, hostname: "ame.pages.dev", action: "contact" }),
    saveMessage: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

const request = (body: unknown, init: { origin?: string; method?: string; headers?: Record<string, string> } = {}) =>
  new Request("https://x.supabase.co/functions/v1/contact", {
    method: init.method ?? "POST",
    headers: { origin: init.origin ?? ORIGIN, "content-type": "application/json", ...init.headers },
    body: init.method === "OPTIONS" ? undefined : typeof body === "string" ? body : JSON.stringify(body),
  });

describe("handleContact", () => {
  it("guarda un mensaje válido y verificado", async () => {
    const d = deps();
    const res = await handleContact(request(valid, { headers: { "cf-connecting-ip": "203.0.113.5" } }), d);
    expect(res.status).toBe(201);
    expect(res.headers.get("access-control-allow-origin")).toBe(ORIGIN);
    expect(d.hitRateLimit).toHaveBeenCalledWith("203.0.113.5");
    expect(d.verifyTurnstile).toHaveBeenCalledWith("tok", "203.0.113.5");
    expect(d.saveMessage).toHaveBeenCalledWith({ name: "Ana", email: "ana@correo.co", message: valid.message });
  });

  it("rechaza orígenes no permitidos sin cabeceras CORS", async () => {
    const d = deps();
    const res = await handleContact(request(valid, { origin: "https://evil.example" }), d);
    expect(res.status).toBe(403);
    expect(res.headers.get("access-control-allow-origin")).toBeNull();
    expect(d.saveMessage).not.toHaveBeenCalled();
  });

  it("responde al preflight", async () => {
    const res = await handleContact(request(null, { method: "OPTIONS" }), deps());
    expect(res.status).toBe(204);
    expect(res.headers.get("access-control-allow-methods")).toBe("POST, OPTIONS");
  });

  it("no guarda si Turnstile falla, viene de otro hostname o de otra acción", async () => {
    for (const result of [
      { success: false },
      { success: true, hostname: "otro.com", action: "contact" },
      { success: true, hostname: "ame.pages.dev", action: "login" },
    ]) {
      const d = deps({ verifyTurnstile: vi.fn().mockResolvedValue(result) });
      const res = await handleContact(request(valid), d);
      expect(res.status).toBe(403);
      expect(d.saveMessage).not.toHaveBeenCalled();
    }
  });

  it("aplica el límite antes de verificar el token", async () => {
    const d = deps({ hitRateLimit: vi.fn().mockResolvedValue(false) });
    const res = await handleContact(request(valid), d);
    expect(res.status).toBe(429);
    expect(d.verifyTurnstile).not.toHaveBeenCalled();
  });

  it("valida el cuerpo, el tipo y el tamaño", async () => {
    expect((await handleContact(request({ ...valid, email: "x" }), deps())).status).toBe(400);
    expect((await handleContact(request("{no es json"), deps())).status).toBe(400);
    expect((await handleContact(request({ ...valid, message: "x".repeat(20_000) }), deps())).status).toBe(413);
    expect((await handleContact(request(valid, { headers: { "content-type": "text/plain" } }), deps())).status).toBe(
      415,
    );
    expect((await handleContact(request(valid, { method: "PUT" }), deps())).status).toBe(405);
  });

  it("devuelve errores genéricos si fallan los servicios", async () => {
    const down = vi.fn().mockRejectedValue(new Error("detalle interno"));
    const r1 = await handleContact(request(valid), deps({ hitRateLimit: down }));
    const r2 = await handleContact(request(valid), deps({ verifyTurnstile: down }));
    const r3 = await handleContact(request(valid), deps({ saveMessage: down }));
    expect([r1.status, r2.status, r3.status]).toEqual([503, 502, 500]);
    for (const r of [r1, r2, r3]) expect(await r.text()).not.toContain("detalle interno");
  });
});

describe("parseContactBody", () => {
  it("recorta espacios y exige token", () => {
    expect(parseContactBody({ ...valid, name: "  Ana  " })).toMatchObject({ ok: true, message: { name: "Ana" } });
    expect(parseContactBody({ ...valid, token: "" })).toEqual({ ok: false, error: "Completa la verificación anti-spam." });
    expect(parseContactBody({ ...valid, message: "corto" }).ok).toBe(false);
    expect(parseContactBody(null).ok).toBe(false);
  });
});

describe("clientIp", () => {
  it("prefiere cf-connecting-ip y nunca usa x-forwarded-for", () => {
    expect(clientIp(new Headers({ "cf-connecting-ip": "1.1.1.1", "x-real-ip": "2.2.2.2" }))).toBe("1.1.1.1");
    expect(clientIp(new Headers({ "x-real-ip": "2.2.2.2" }))).toBe("2.2.2.2");
    expect(clientIp(new Headers({ "x-forwarded-for": "6.6.6.6" }))).toBeNull();
  });
});
