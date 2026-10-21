-- Paso 5 (legal): consentimiento, prueba de la autorización y retención de datos.
--
--   * page_views.visitor_id es opcional: sin consentimiento de estadísticas la visita se
--     registra sin identificador. Los visitantes únicos solo cuentan a quienes aceptaron
--     (count(distinct) ya ignora los nulos). El límite por IP se mantiene; el límite por
--     visitante solo aplica cuando hay identificador.
--   * contact_messages guarda cuándo y qué versión de la política aceptó el titular
--     (Decreto 1377 de 2013: conservar prueba de la autorización).
--   * Retención con pg_cron: mensajes 12 meses, visitas 24 meses y contadores anti-abuso
--     solo el tiempo de su ventana (borrado cada hora, con margen de 2 horas).

-- ---------------------------------------------------------------------------
-- Visitas sin identificador
-- ---------------------------------------------------------------------------

alter table public.page_views alter column visitor_id drop not null;

drop policy "Visitantes registran visitas válidas" on public.page_views;

create policy "Visitantes registran visitas válidas"
  on public.page_views for insert
  to anon, authenticated
  with check (
    (visitor_id is null
      or visitor_id ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$')
    and page ~ '^/[A-Za-z0-9/_-]*$'
    and char_length(page) <= 128
    and (user_agent is null or char_length(user_agent) <= 512)
  );

-- ---------------------------------------------------------------------------
-- Prueba de la autorización en los mensajes de contacto
-- ---------------------------------------------------------------------------

-- Sin valor por defecto: la Edge Function debe enviarlos siempre. La tabla aún no tiene
-- datos en producción (se crea en la migración anterior, en el mismo lanzamiento).
alter table public.contact_messages
  add column privacy_accepted_at timestamptz not null,
  add column privacy_version text not null check (privacy_version ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$');

-- ---------------------------------------------------------------------------
-- Retención
-- ---------------------------------------------------------------------------

-- Los contadores se borran en cuanto su ventana (1 hora) deja de servir.
create or replace function private.hit_rate_limit(p_bucket text, p_key text, p_max integer, p_window interval)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_seconds double precision := extract(epoch from p_window);
  v_window timestamptz := to_timestamp(floor(extract(epoch from now()) / v_seconds) * v_seconds);
  v_salt text := (select value from private.settings where name = 'rate_limit_salt');
  v_hits integer;
begin
  if p_key is null or p_key = '' then
    return true;
  end if;

  insert into private.rate_limits as r (bucket, key_hash, window_start, hits)
  values (p_bucket, encode(sha256(convert_to(v_salt || ':' || p_bucket || ':' || p_key, 'UTF8')), 'hex'), v_window, 1)
  on conflict (bucket, key_hash, window_start) do update set hits = r.hits + 1
  returning hits into v_hits;

  return v_hits <= p_max;
end;
$$;

revoke all on function private.hit_rate_limit(text, text, integer, interval) from public, anon, authenticated;

-- Borra lo que superó su plazo y devuelve cuántas filas quitó de cada tabla.
create function private.apply_retention()
returns table (tabla text, borradas bigint)
language plpgsql
set search_path = ''
as $$
declare
  n bigint;
begin
  delete from public.contact_messages where created_at < now() - interval '12 months';
  get diagnostics n = row_count;
  tabla := 'contact_messages'; borradas := n; return next;

  delete from public.page_views where created_at < now() - interval '24 months';
  get diagnostics n = row_count;
  tabla := 'page_views'; borradas := n; return next;

  delete from private.rate_limits where window_start < now() - interval '2 hours';
  get diagnostics n = row_count;
  tabla := 'private.rate_limits'; borradas := n; return next;
end;
$$;

revoke all on function private.apply_retention() from public, anon, authenticated;

create extension if not exists pg_cron with schema pg_catalog;

-- Cada día a las 08:15 UTC (03:15 en Cúcuta) y cada hora para los contadores.
select cron.schedule('ame-retencion-diaria', '15 8 * * *', 'select private.apply_retention()');
select cron.schedule(
  'ame-rate-limits-cada-hora',
  '5 * * * *',
  $$delete from private.rate_limits where window_start < now() - interval '2 hours'$$
);
