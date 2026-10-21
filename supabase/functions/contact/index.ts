// Edge Function `contact`: recibe el formulario de contacto, verifica Cloudflare Turnstile,
// aplica el límite por IP y guarda el mensaje con la clave de servicio.
//
// Variables (npx supabase secrets set ...):
//   TURNSTILE_SECRET_KEY  clave secreta del widget de Turnstile
//   ALLOWED_ORIGINS       orígenes del sitio separados por coma (https://sitio.pages.dev)
//   ALLOWED_HOSTNAMES     hostnames que Turnstile debe informar, separados por coma
// SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY las pone Supabase.

// Versión fija, la misma que usa el frontend (package.json).
import { createClient } from "npm:@supabase/supabase-js@2.101.1";
import { handleContact, type TurnstileResult } from "./handler.ts";

const list = (name: string) =>
  (Deno.env.get(name) ?? "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

const required = (name: string) => {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Falta la variable ${name}`);
  return value;
};

const turnstileSecret = required("TURNSTILE_SECRET_KEY");
const supabase = createClient(required("SUPABASE_URL"), required("SUPABASE_SERVICE_ROLE_KEY"), {
  auth: { persistSession: false, autoRefreshToken: false },
});

Deno.serve((req) =>
  handleContact(req, {
    allowedOrigins: list("ALLOWED_ORIGINS"),
    allowedHostnames: list("ALLOWED_HOSTNAMES"),

    async hitRateLimit(ip) {
      const { data, error } = await supabase.rpc("contact_rate_limit_hit", { p_ip: ip ?? "" });
      if (error) throw new Error(error.message);
      return data === true;
    },

    async verifyTurnstile(token, ip) {
      const form = new FormData();
      form.append("secret", turnstileSecret);
      form.append("response", token);
      if (ip) form.append("remoteip", ip);
      form.append("idempotency_key", crypto.randomUUID());
      const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        body: form,
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) throw new Error(`siteverify respondió ${res.status}`);
      const result = (await res.json()) as TurnstileResult;
      if (!result.success) console.warn("[contact] Turnstile rechazó el token:", result["error-codes"]);
      return result;
    },

    async saveMessage(message) {
      const { error } = await supabase.from("contact_messages").insert(message);
      if (error) {
        // Sin el contenido del mensaje en los logs: solo el error.
        console.error("[contact] No se pudo guardar:", error.code, error.message);
        throw new Error(error.message);
      }
    },
  })
);
