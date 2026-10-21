import pg from "pg";
import { e2eEnv } from "./env";

/** Consulta SQL contra la base local (como postgres, sin RLS). Solo para preparar y verificar. */
export async function sql<T extends Record<string, unknown> = Record<string, unknown>>(
  text: string,
  params: unknown[] = [],
  dbUrl = e2eEnv().dbUrl,
): Promise<T[]> {
  const client = new pg.Client({ connectionString: dbUrl });
  await client.connect();
  try {
    return (await client.query<T>(text, params)).rows;
  } finally {
    await client.end();
  }
}

/** Vacía los contadores anti-abuso (límites por IP y visitante) entre pruebas. */
export const resetRateLimits = () => sql("delete from private.rate_limits");
