-- Paso 4 (seguridad): límites de abuso para las inserciones anónimas y mensajes de contacto.
--
--   * private.rate_limits cuenta peticiones por ventana de tiempo. Las claves (IP, visitor_id)
--     se guardan como SHA-256 con una sal secreta, nunca en claro.
--   * page_views: un trigger descarta en silencio las visitas que superan el límite.
--   * contact_messages: nadie inserta por la API. Solo la Edge Function `contact`, con la
--     clave de servicio, después de verificar Turnstile y el límite por IP.

-- ---------------------------------------------------------------------------
-- Esquema privado (no expuesto por la API)
-- ---------------------------------------------------------------------------

create schema private;
revoke all on schema private from public, anon, authenticated;

create table private.settings (
  name text primary key,
  value text not null
);

-- Sal para los hashes: sin ella, el hash de una IPv4 se revierte probando las 4.300 millones.
insert into private.settings (name, value)
values ('rate_limit_salt', replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''));

create table private.rate_limits (
  bucket text not null,
  key_hash text not null,
  window_start timestamptz not null,
  hits integer not null default 0,
  primary key (bucket, key_hash, window_start)
);

-- Suma una petición a la ventana actual y devuelve true si sigue dentro del límite.
-- Una clave vacía (p. ej. sin IP conocida) no se limita.
create function private.hit_rate_limit(p_bucket text, p_key text, p_max integer, p_window interval)
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

  -- Limpieza ocasional de ventanas viejas, sin depender de pg_cron.
  if random() < 0.01 then
    delete from private.rate_limits where window_start < now() - interval '2 days';
  end if;

  return v_hits <= p_max;
end;
$$;

-- IP del cliente según el proxy. No se usa el primer valor de x-forwarded-for porque lo
-- puede escribir el propio cliente. En producción (Cloudflare) llega cf-connecting-ip.
create function private.request_ip()
returns text
language sql
stable
set search_path = ''
as $$
  select nullif(btrim(coalesce(h ->> 'cf-connecting-ip', h ->> 'x-real-ip')), '')
  from (select nullif(current_setting('request.headers', true), '')::json as h) as s
$$;

revoke all on all functions in schema private from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Visitas: límite por visitante y por IP
-- ---------------------------------------------------------------------------

-- 60 por hora por visitor_id y 300 por hora por IP (varias personas pueden compartir IP).
-- Las visitas de más se descartan sin error: el tracker no reintenta y el atacante no
-- recibe señal. Solo aplica a peticiones de la API (anon/authenticated), no a importaciones
-- con la clave de servicio ni a SQL directo.
create function private.limit_page_views()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if coalesce((select auth.role()), '') not in ('anon', 'authenticated') then
    return new;
  end if;
  if not private.hit_rate_limit('page_views:visitor', new.visitor_id, 60, interval '1 hour')
     or not private.hit_rate_limit('page_views:ip', private.request_ip(), 300, interval '1 hour') then
    return null;
  end if;
  return new;
end;
$$;

revoke all on function private.limit_page_views() from public, anon, authenticated;

create trigger page_views_rate_limit
  before insert on public.page_views
  for each row execute function private.limit_page_views();

-- ---------------------------------------------------------------------------
-- Mensajes de contacto
-- ---------------------------------------------------------------------------

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 120),
  email text not null check (
    char_length(email) <= 254
    and email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
  ),
  message text not null check (char_length(btrim(message)) between 10 and 2000),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index contact_messages_created_at_idx on public.contact_messages (created_at desc);

alter table public.contact_messages enable row level security;

-- Sin política de INSERT: anon y authenticated no pueden insertar. La Edge Function usa la
-- clave de servicio, que no pasa por la RLS, y solo después de verificar Turnstile.
create policy "Admins ven los mensajes"
  on public.contact_messages for select
  to authenticated
  using ((select public.is_admin()));

create policy "Admins marcan mensajes como leídos"
  on public.contact_messages for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Admins borran mensajes"
  on public.contact_messages for delete
  to authenticated
  using ((select public.is_admin()));

revoke all on public.contact_messages from anon, authenticated;
grant select, delete on public.contact_messages to authenticated;
grant update (is_read) on public.contact_messages to authenticated;

-- Límite de la Edge Function: 5 mensajes por hora por IP. Solo la clave de servicio la ejecuta.
create function public.contact_rate_limit_hit(p_ip text)
returns boolean
language sql
security definer
set search_path = ''
as $$
  select private.hit_rate_limit('contact:ip', p_ip, 5, interval '1 hour')
$$;

revoke execute on function public.contact_rate_limit_hit(text) from public, anon, authenticated;
grant execute on function public.contact_rate_limit_hit(text) to service_role;
