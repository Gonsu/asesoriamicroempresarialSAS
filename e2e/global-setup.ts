import { DEFAULT_CONTENT } from "../src/features/content/defaults";
import { sql } from "./helpers/db";
import { readSupabaseStatus, USERS } from "./helpers/env";

/**
 * Prepara el Supabase local antes de las pruebas: usuarios (admin y sin rol), datos de
 * visitas conocidos (con bots) y estado limpio. Es idempotente: se puede repetir sin reset.
 */
export default async function globalSetup() {
  const env = readSupabaseStatus();
  // Los workers heredan process.env de la preparación global.
  process.env.E2E_API_URL = env.apiUrl;
  process.env.E2E_PUBLISHABLE_KEY = env.publishableKey;
  process.env.E2E_SECRET_KEY = env.secretKey;
  process.env.E2E_DB_URL = env.dbUrl;

  for (const user of Object.values(USERS)) {
    const res = await fetch(`${env.apiUrl}/auth/v1/admin/users`, {
      method: "POST",
      headers: { apikey: env.secretKey, Authorization: `Bearer ${env.secretKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ ...user, email_confirm: true }),
    });
    // 422: ya existe (de una corrida anterior).
    if (!res.ok && res.status !== 422) throw new Error(`No se pudo crear ${user.email}: ${res.status} ${await res.text()}`);
  }
  await sql(
    `insert into public.user_roles (user_id, role)
     select id, 'admin' from auth.users where email = $1
     on conflict (user_id, role) do nothing`,
    [USERS.admin.email],
    env.dbUrl,
  );

  // Estado conocido: sin mensajes, sin contadores y con los textos por defecto.
  await sql("delete from public.contact_messages; delete from private.rate_limits;", [], env.dbUrl);
  await sql(`delete from public.meetings where title like 'E2E %'`, [], env.dbUrl);
  await sql(`update public.site_content set title = $1 where section_key = 'cta'`, [DEFAULT_CONTENT.cta.title], env.dbUrl);

  // Visitas: 3 de personas (2 visitantes) y 2 de bots, ayer; las estadísticas deben ignorar los bots.
  await sql("delete from public.page_views", [], env.dbUrl);
  await sql(
    `insert into public.page_views (page, visitor_id, user_agent, created_at) values
       ('/',        '11111111-1111-4111-8111-111111111111', 'Mozilla/5.0 (Windows NT 10.0) Chrome/129.0', now() - interval '1 day'),
       ('/empresa', '11111111-1111-4111-8111-111111111111', 'Mozilla/5.0 (Windows NT 10.0) Chrome/129.0', now() - interval '1 day'),
       ('/',        null,                                   'Mozilla/5.0 (iPhone) Safari/604.1',          now() - interval '1 day'),
       ('/',        'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'WhatsApp/2.23.20.0 A',                       now() - interval '1 day'),
       ('/',        'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'facebookexternalhit/1.1',                    now() - interval '1 day')`,
    [],
    env.dbUrl,
  );
}
