import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export type Supabase = SupabaseClient<Database>;

let client: Promise<Supabase> | null = null;

/**
 * Cliente de Supabase, cargado en diferido: supabase-js (~180 KB) no va en el JS inicial, así
 * la página se pinta antes (con los textos por defecto) y el cliente llega en paralelo.
 * Siempre es la misma instancia.
 *
 *   const supabase = await getSupabase();
 */
export function getSupabase(): Promise<Supabase> {
  client ??= import("@supabase/supabase-js").then(({ createClient }) =>
    createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        storage: localStorage,
        persistSession: true,
        autoRefreshToken: true,
      },
    }),
  );
  return client;
}
