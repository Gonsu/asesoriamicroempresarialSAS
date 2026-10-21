-- Esquema inicial de AME S.A.S. Consolida las migraciones generadas por Lovable.
--
-- Principios:
--   * RLS activado en todas las tablas; la autorización real vive aquí, no en el frontend.
--   * El rol anon solo tiene los privilegios de tabla que necesita (lectura de contenido
--     público e inserción de visitas); RLS filtra además las filas.
--   * Las imágenes se guardan en el bucket público site-images y en la base de datos solo
--     se guarda la ruta del archivo (image_path), nunca la URL completa.

-- ---------------------------------------------------------------------------
-- Roles
-- ---------------------------------------------------------------------------

create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.app_role not null default 'user',
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

-- SECURITY DEFINER para poder leer user_roles desde las políticas sin depender de sus
-- propias políticas RLS. search_path vacío: todos los nombres van calificados.
-- Sin parámetros: solo responde por el usuario de la sesión, para que nadie pueda
-- averiguar si otro usuario es admin.
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = (select auth.uid())
      and role = 'admin'
  )
$$;

revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated, service_role;

-- Cada usuario solo ve sus propios roles (AuthContext lo consulta). Los roles se asignan
-- desde el SQL Editor del panel de Supabase; no hay escritura desde la API.
create policy "Usuarios ven sus propios roles"
  on public.user_roles for select
  to authenticated
  using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- updated_at
-- ---------------------------------------------------------------------------

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke execute on function public.set_updated_at() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Reuniones y asesorías
-- ---------------------------------------------------------------------------

create table public.meetings (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 200),
  description text check (char_length(description) <= 5000),
  meeting_date timestamptz,
  image_path text check (char_length(image_path) <= 255 and image_path !~ '^[a-z]+://'),
  type text not null default 'reunion' check (type in ('reunion', 'asesoria')),
  published boolean not null default false,
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index meetings_published_date_idx on public.meetings (published, meeting_date desc);

alter table public.meetings enable row level security;

create trigger meetings_set_updated_at
  before update on public.meetings
  for each row execute function public.set_updated_at();

create policy "Anon ve reuniones publicadas"
  on public.meetings for select
  to anon
  using (published);

create policy "Usuarios ven reuniones publicadas; admins todas"
  on public.meetings for select
  to authenticated
  using (published or (select public.is_admin()));

create policy "Admins crean reuniones"
  on public.meetings for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "Admins editan reuniones"
  on public.meetings for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Admins borran reuniones"
  on public.meetings for delete
  to authenticated
  using ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- Testimonios
-- ---------------------------------------------------------------------------

create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  business_type text check (char_length(business_type) <= 120),
  content text not null check (char_length(content) between 1 and 2000),
  image_path text check (char_length(image_path) <= 255 and image_path !~ '^[a-z]+://'),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index testimonials_published_created_idx on public.testimonials (is_published, created_at desc);

alter table public.testimonials enable row level security;

create trigger testimonials_set_updated_at
  before update on public.testimonials
  for each row execute function public.set_updated_at();

create policy "Anon ve testimonios publicados"
  on public.testimonials for select
  to anon
  using (is_published);

create policy "Usuarios ven testimonios publicados; admins todos"
  on public.testimonials for select
  to authenticated
  using (is_published or (select public.is_admin()));

create policy "Admins crean testimonios"
  on public.testimonials for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "Admins editan testimonios"
  on public.testimonials for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Admins borran testimonios"
  on public.testimonials for delete
  to authenticated
  using ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- Contenido editable del sitio
-- ---------------------------------------------------------------------------

create table public.site_content (
  id uuid primary key default gen_random_uuid(),
  section_key text not null unique check (section_key ~ '^[a-z0-9_]{1,40}$'),
  title text,
  subtitle text,
  description text,
  image_path text check (char_length(image_path) <= 255 and image_path !~ '^[a-z]+://'),
  extra_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;

create trigger site_content_set_updated_at
  before update on public.site_content
  for each row execute function public.set_updated_at();

create policy "Todos ven el contenido del sitio"
  on public.site_content for select
  to anon, authenticated
  using (true);

create policy "Admins crean contenido"
  on public.site_content for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "Admins editan contenido"
  on public.site_content for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Admins borran contenido"
  on public.site_content for delete
  to authenticated
  using ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- Visitas (analítica propia)
-- ---------------------------------------------------------------------------

create table public.page_views (
  id uuid primary key default gen_random_uuid(),
  page text not null default '/',
  visitor_id text not null,
  user_agent text,
  created_at timestamptz not null default now()
);

create index page_views_created_at_idx on public.page_views (created_at);
create index page_views_visitor_id_idx on public.page_views (visitor_id);

alter table public.page_views enable row level security;

create policy "Visitantes registran visitas válidas"
  on public.page_views for insert
  to anon, authenticated
  with check (
    visitor_id ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
    and page ~ '^/[A-Za-z0-9/_-]*$'
    and char_length(page) <= 128
    and (user_agent is null or char_length(user_agent) <= 512)
  );

create policy "Admins ven las visitas"
  on public.page_views for select
  to authenticated
  using ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- Privilegios de tabla
-- ---------------------------------------------------------------------------
-- Supabase concede por defecto todos los privilegios a anon y authenticated en las tablas
-- nuevas de public. Se reducen al mínimo para que RLS no sea la única barrera.

revoke all on public.user_roles, public.meetings, public.testimonials, public.site_content,
  public.page_views from anon, authenticated;

-- anon: solo columnas públicas (created_by no se expone).
grant select (id, title, description, meeting_date, image_path, type, published, created_at, updated_at)
  on public.meetings to anon;
grant select (id, name, business_type, content, image_path, is_published, created_at, updated_at)
  on public.testimonials to anon;
grant select on public.site_content to anon;
grant insert (page, visitor_id, user_agent) on public.page_views to anon;

grant select on public.user_roles to authenticated;
grant select, insert, update, delete on public.meetings, public.testimonials, public.site_content
  to authenticated;
grant select, insert on public.page_views to authenticated;

-- ---------------------------------------------------------------------------
-- Storage: imágenes del sitio
-- ---------------------------------------------------------------------------
-- Bucket público: cualquiera descarga por URL pública (no pasa por RLS). Sin política
-- SELECT para anon, nadie puede listar el bucket. Escritura solo para admins y solo en
-- las carpetas conocidas. Límite de 2 MB y solo JPEG, PNG y WebP.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-images', 'site-images', true, 2097152, array['image/jpeg', 'image/png', 'image/webp']);

create policy "Admins ven imágenes del sitio"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'site-images' and (select public.is_admin()));

create policy "Admins suben imágenes del sitio"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'site-images'
    and (storage.foldername(name))[1] in ('meetings', 'testimonials', 'content')
    and (select public.is_admin())
  );

create policy "Admins reemplazan imágenes del sitio"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'site-images' and (select public.is_admin()))
  with check (
    bucket_id = 'site-images'
    and (storage.foldername(name))[1] in ('meetings', 'testimonials', 'content')
    and (select public.is_admin())
  );

create policy "Admins borran imágenes del sitio"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'site-images' and (select public.is_admin()));
