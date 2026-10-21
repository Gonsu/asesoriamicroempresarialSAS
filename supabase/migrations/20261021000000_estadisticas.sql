-- Estadísticas del panel calculadas en la base de datos, en lugar de descargar las tablas
-- completas al navegador (la API devuelve como máximo 1000 filas por petición).
--
--   * Los períodos son fechas locales de Cúcuta (America/Bogota), con p_hasta inclusive.
--   * Las visitas de bots y vistas previas de enlaces (WhatsApp, Facebook, Telegram, ...)
--     se excluyen al consultar, así que el filtro también aplica a las visitas antiguas.
--   * Todas las funciones son SECURITY INVOKER: la RLS de cada tabla sigue aplicando, de
--     modo que solo un admin obtiene cifras de page_views y de reuniones no publicadas.

-- ---------------------------------------------------------------------------
-- Bots
-- ---------------------------------------------------------------------------

-- Solo agentes que se identifican como bot o generador de vistas previas ("Googlebot/2.1",
-- "WhatsApp/2.23"...); se usa "bot/" y no "bot" a secas para no confundir móviles como
-- "CUBOT X30". Debe coincidir con src/features/analytics/bots.ts. Los navegadores
-- integrados de Facebook o WhatsApp usan un user agent de navegador normal y sí cuentan.
create function public.is_bot_user_agent(p_user_agent text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select coalesce(
    p_user_agent ~* '(bot/|crawler|spider|slurp|facebookexternalhit|facebookcatalog|meta-externalagent|whatsapp/|telegrambot|twitterbot|linkedinbot|slackbot|discordbot|skypeuripreview|embedly|headlesschrome|lighthouse)',
    false
  )
$$;

-- ---------------------------------------------------------------------------
-- Visitas
-- ---------------------------------------------------------------------------

-- Visitas de personas (sin bots) entre dos fechas locales, ambas inclusive.
create function public.human_page_views(p_desde date, p_hasta date)
returns setof public.page_views
language sql
stable
security invoker
set search_path = ''
as $$
  select *
  from public.page_views
  where created_at >= (p_desde::timestamp at time zone 'America/Bogota')
    and created_at < ((p_hasta + 1)::timestamp at time zone 'America/Bogota')
    and not public.is_bot_user_agent(user_agent)
$$;

-- Visitas y visitantes únicos por mes (primer día del mes, hora local).
create function public.page_view_stats(p_desde date, p_hasta date)
returns table (mes date, visitas bigint, visitantes_unicos bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    date_trunc('month', v.created_at at time zone 'America/Bogota')::date,
    count(*),
    count(distinct v.visitor_id)
  from public.human_page_views(p_desde, p_hasta) as v
  group by 1
  order by 1
$$;

-- Totales del período. Los visitantes únicos no se pueden sumar mes a mes: quien visitó
-- en enero y en febrero es un solo visitante del año.
create function public.page_view_totals(p_desde date, p_hasta date)
returns table (visitas bigint, visitantes_unicos bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select count(*), count(distinct v.visitor_id)
  from public.human_page_views(p_desde, p_hasta) as v
$$;

-- ---------------------------------------------------------------------------
-- Reuniones y asesorías
-- ---------------------------------------------------------------------------

-- Actividades creadas por mes (fecha de creación, hora local).
create function public.meeting_stats(p_desde date, p_hasta date)
returns table (mes date, total bigint, publicadas bigint, reuniones bigint, asesorias bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    date_trunc('month', m.created_at at time zone 'America/Bogota')::date,
    count(*),
    count(*) filter (where m.published),
    count(*) filter (where m.type = 'reunion'),
    count(*) filter (where m.type = 'asesoria')
  from public.meetings as m
  where m.created_at >= (p_desde::timestamp at time zone 'America/Bogota')
    and m.created_at < ((p_hasta + 1)::timestamp at time zone 'America/Bogota')
  group by 1
  order by 1
$$;

-- ---------------------------------------------------------------------------
-- Privilegios
-- ---------------------------------------------------------------------------

revoke execute on function
  public.is_bot_user_agent(text),
  public.human_page_views(date, date),
  public.page_view_stats(date, date),
  public.page_view_totals(date, date),
  public.meeting_stats(date, date)
from public, anon;

grant execute on function
  public.is_bot_user_agent(text),
  public.human_page_views(date, date),
  public.page_view_stats(date, date),
  public.page_view_totals(date, date),
  public.meeting_stats(date, date)
to authenticated, service_role;
