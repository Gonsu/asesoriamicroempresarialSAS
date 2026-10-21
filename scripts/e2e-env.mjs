// Escribe .env.production.local para que `npm run build` apunte al Supabase local (pruebas E2E
// y Lighthouse). Las claves salen de `supabase status`: son las de desarrollo local, iguales en
// cualquier instalación, no secretos. El archivo no se versiona (.gitignore: .env.*).
// Uso: node scripts/e2e-env.mjs   (requiere `npx supabase start`)

import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const raw = execSync("npx supabase status -o env", { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
const env = Object.fromEntries(
  raw
    .split(/\r?\n/)
    .map((line) => line.match(/^([A-Z_]+)="?(.*?)"?$/))
    .filter(Boolean)
    .map((m) => [m[1], m[2]]),
);

for (const name of ["API_URL", "PUBLISHABLE_KEY"]) {
  if (!env[name]) throw new Error(`supabase status no devolvió ${name}. ¿Está corriendo \`npx supabase start\`?`);
}

writeFileSync(
  ".env.production.local",
  [
    `VITE_SUPABASE_URL=${env.API_URL}`,
    `VITE_SUPABASE_PUBLISHABLE_KEY=${env.PUBLISHABLE_KEY}`,
    "VITE_SITE_URL=http://localhost:4173",
    // Clave de prueba pública de Turnstile (siempre aprueba).
    "VITE_TURNSTILE_SITE_KEY=1x00000000000000000000AA",
    "",
  ].join("\n"),
);
console.log("Escrito .env.production.local con el Supabase local:", env.API_URL);
