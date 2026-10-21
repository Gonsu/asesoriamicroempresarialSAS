// Cabeceras HTTP de seguridad. vite.config.ts las escribe en dist/_headers (formato de
// Cloudflare Pages) y las aplica también en `npm run preview`, para probarlas en local.
// No usa alias "@/" porque lo importa vite.config.ts (Node).

/** Orígenes externos que el sitio necesita, además del propio. */
export const TURNSTILE_ORIGIN = "https://challenges.cloudflare.com";
export const GOOGLE_MAPS_ORIGIN = "https://www.google.com";

export function buildContentSecurityPolicy(supabaseUrl: string): string {
  const supabase = new URL(supabaseUrl).origin;
  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    // Turnstile carga su script desde Cloudflare; no hay scripts en línea.
    "script-src": ["'self'", TURNSTILE_ORIGIN],
    "style-src": ["'self'"],
    // Imágenes del bucket site-images; data: para los SVG en línea de algunos componentes.
    "img-src": ["'self'", "data:", supabase],
    "font-src": ["'self'"],
    // API, Auth, Storage y Edge Functions de Supabase.
    "connect-src": ["'self'", supabase],
    // Widget de Turnstile y mapa de Google (solo tras hacer clic en "Ver mapa").
    "frame-src": [TURNSTILE_ORIGIN, GOOGLE_MAPS_ORIGIN],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
  };
  const policy = Object.entries(directives).map(([name, values]) => `${name} ${values.join(" ")}`);
  // En producción todo es HTTPS; en local (http://127.0.0.1) la directiva rompería Supabase.
  if (supabase.startsWith("https://")) policy.push("upgrade-insecure-requests");
  return policy.join("; ");
}

/** Cabeceras para todas las rutas. */
export function buildSecurityHeaders(supabaseUrl: string): Record<string, string> {
  return {
    "Content-Security-Policy": buildContentSecurityPolicy(supabaseUrl),
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy":
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=(), bluetooth=(), browsing-topics=()",
    "Cross-Origin-Opener-Policy": "same-origin",
  };
}

/** Contenido de dist/_headers para Cloudflare Pages. */
export function buildHeadersFile(supabaseUrl: string): string {
  const lines = ["/*", ...Object.entries(buildSecurityHeaders(supabaseUrl)).map(([k, v]) => `  ${k}: ${v}`)];
  // Los archivos de /assets llevan hash en el nombre: se pueden guardar en caché para siempre.
  lines.push("", "/assets/*", "  Cache-Control: public, max-age=31536000, immutable");
  return lines.join("\n") + "\n";
}
