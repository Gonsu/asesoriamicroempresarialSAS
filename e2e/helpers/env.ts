import { execSync } from "node:child_process";

/** Datos del Supabase local para las pruebas (claves de desarrollo, no secretos). */
export interface E2EEnv {
  apiUrl: string;
  publishableKey: string;
  secretKey: string;
  dbUrl: string;
}

/** Lee `supabase status`. Lo llama la preparación global y lo guarda en process.env. */
export function readSupabaseStatus(): E2EEnv {
  const raw = execSync("npx supabase status -o env", { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  const env = Object.fromEntries(
    raw
      .split(/\r?\n/)
      .map((line) => line.match(/^([A-Z_]+)="?(.*?)"?$/))
      .filter((m): m is RegExpMatchArray => m !== null)
      .map((m) => [m[1], m[2]]),
  );
  const secretKey = env.SECRET_KEY || env.SERVICE_ROLE_KEY;
  if (!env.API_URL || !env.PUBLISHABLE_KEY || !secretKey || !env.DB_URL) {
    throw new Error("supabase status incompleto. ¿Está corriendo `npx supabase start`?");
  }
  return { apiUrl: env.API_URL, publishableKey: env.PUBLISHABLE_KEY, secretKey, dbUrl: env.DB_URL };
}

/** En los workers: los valores que dejó la preparación global. */
export function e2eEnv(): E2EEnv {
  const { E2E_API_URL, E2E_PUBLISHABLE_KEY, E2E_SECRET_KEY, E2E_DB_URL } = process.env;
  if (!E2E_API_URL || !E2E_PUBLISHABLE_KEY || !E2E_SECRET_KEY || !E2E_DB_URL) {
    throw new Error("Falta el entorno E2E: la preparación global no se ejecutó.");
  }
  return { apiUrl: E2E_API_URL, publishableKey: E2E_PUBLISHABLE_KEY, secretKey: E2E_SECRET_KEY, dbUrl: E2E_DB_URL };
}

/** Usuarios de prueba que crea la preparación global. */
export const USERS = {
  admin: { email: "admin@e2e.test", password: "PruebaE2E-2026" },
  normal: { email: "normal@e2e.test", password: "PruebaE2E-2026" },
} as const;
