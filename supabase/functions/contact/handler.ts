// Lógica de la Edge Function `contact`, sin dependencias de Deno para poder probarla con
// vitest. index.ts la conecta con Deno.serve, las variables de entorno y Supabase.

export interface ContactMessage {
  name: string;
  email: string;
  message: string;
  /** Prueba de la autorización (Decreto 1377): cuándo y qué versión de la política aceptó. */
  privacy_accepted_at: string;
  privacy_version: string;
}

export interface ContactDeps {
  /** Orígenes que pueden llamar a la función (CORS), p. ej. https://sitio.pages.dev */
  allowedOrigins: string[];
  /** Hostnames que Turnstile debe informar para aceptar el token. */
  allowedHostnames: string[];
  /** Suma una petición al límite de la IP; false si ya lo superó. */
  hitRateLimit: (ip: string | null) => Promise<boolean>;
  /** Verifica el token de Turnstile con Cloudflare. */
  verifyTurnstile: (token: string, ip: string | null) => Promise<TurnstileResult>;
  /** Guarda el mensaje (con la clave de servicio). */
  saveMessage: (message: ContactMessage) => Promise<void>;
}

export interface TurnstileResult {
  success: boolean;
  hostname?: string;
  action?: string;
  "error-codes"?: string[];
}

export const TURNSTILE_ACTION = "contact";
const MAX_BODY_BYTES = 10_000;
// Mismos límites que los CHECK de public.contact_messages y el esquema del formulario.
const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
// Versión de la política = su fecha (mismo formato que el CHECK de privacy_version).
const PRIVACY_VERSION_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Valida y normaliza el cuerpo. Devuelve el mensaje o el texto del error. */
export function parseContactBody(
  body: unknown,
  now: Date = new Date(),
): { ok: true; message: ContactMessage; token: string } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "Solicitud no válida." };
  const { name, email, message, token, privacyAccepted, privacyVersion } = body as Record<string, unknown>;
  if (typeof name !== "string" || typeof email !== "string" || typeof message !== "string") {
    return { ok: false, error: "Faltan datos del formulario." };
  }
  if (privacyAccepted !== true) {
    return { ok: false, error: "Debes autorizar el tratamiento de tus datos personales." };
  }
  if (typeof privacyVersion !== "string" || !PRIVACY_VERSION_PATTERN.test(privacyVersion)) {
    return { ok: false, error: "Solicitud no válida." };
  }
  if (typeof token !== "string" || token.length === 0 || token.length > 2048) {
    return { ok: false, error: "Completa la verificación anti-spam." };
  }
  const clean = { name: name.trim(), email: email.trim(), message: message.trim() };
  if (clean.name.length < 1 || clean.name.length > 120) return { ok: false, error: "El nombre no es válido." };
  if (clean.email.length > 254 || !EMAIL_PATTERN.test(clean.email)) {
    return { ok: false, error: "El correo no es válido." };
  }
  if (clean.message.length < 10 || clean.message.length > 2000) {
    return { ok: false, error: "El mensaje debe tener entre 10 y 2000 caracteres." };
  }
  // La hora de la aceptación la pone el servidor, no el navegador.
  return {
    ok: true,
    message: { ...clean, privacy_accepted_at: now.toISOString(), privacy_version: privacyVersion },
    token,
  };
}

/**
 * IP del cliente. No se usa el primer valor de x-forwarded-for porque lo puede escribir el
 * propio cliente; cf-connecting-ip y x-real-ip los pone el proxy.
 */
export function clientIp(headers: Headers): string | null {
  return headers.get("cf-connecting-ip")?.trim() || headers.get("x-real-ip")?.trim() || null;
}

function corsHeaders(origin: string): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function json(status: number, body: Record<string, unknown>, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...headers },
  });
}

export async function handleContact(req: Request, deps: ContactDeps): Promise<Response> {
  const origin = req.headers.get("origin") ?? "";
  if (!deps.allowedOrigins.includes(origin)) {
    return json(403, { error: "Origen no permitido." });
  }
  const cors = corsHeaders(origin);

  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST") return json(405, { error: "Método no permitido." }, cors);
  if (!req.headers.get("content-type")?.includes("application/json")) {
    return json(415, { error: "Se esperaba JSON." }, cors);
  }

  const raw = await req.text();
  if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) {
    return json(413, { error: "El mensaje es demasiado largo." }, cors);
  }
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return json(400, { error: "Solicitud no válida." }, cors);
  }
  const parsed = parseContactBody(body);
  if (!parsed.ok) return json(400, { error: parsed.error }, cors);

  // El límite se cuenta antes de verificar: los intentos fallidos también consumen cupo.
  const ip = clientIp(req.headers);
  let allowed: boolean;
  try {
    allowed = await deps.hitRateLimit(ip);
  } catch {
    return json(503, { error: "No se pudo enviar el mensaje. Inténtalo más tarde." }, cors);
  }
  if (!allowed) {
    return json(429, { error: "Has enviado demasiados mensajes. Inténtalo de nuevo en una hora." }, cors);
  }

  let verification: TurnstileResult;
  try {
    verification = await deps.verifyTurnstile(parsed.token, ip);
  } catch {
    return json(502, { error: "No se pudo verificar el anti-spam. Inténtalo de nuevo." }, cors);
  }
  const hostnameOk = !!verification.hostname && deps.allowedHostnames.includes(verification.hostname);
  const actionOk = verification.action === undefined || verification.action === TURNSTILE_ACTION;
  if (!verification.success || !hostnameOk || !actionOk) {
    return json(403, { error: "La verificación anti-spam falló. Recarga la página e inténtalo de nuevo." }, cors);
  }

  try {
    await deps.saveMessage(parsed.message);
  } catch {
    return json(500, { error: "No se pudo guardar el mensaje. Inténtalo más tarde." }, cors);
  }
  return json(201, { ok: true }, cors);
}
