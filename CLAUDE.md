# CLAUDE.md — AME S.A.S. (Asesoría Microempresarial)

## Contexto

Sitio corporativo de **AME S.A.S.** (Asesoría Microempresarial, Cúcuta, Colombia), generado
originalmente con Lovable. El objetivo es convertirlo en una aplicación limpia, segura y
mantenible, desplegable gratis y **sin depender de Lovable**.

- **Páginas públicas:** Inicio (`/`), Empresa (`/empresa`), Servicios (`/servicios`),
  Reuniones (`/reuniones`), Contacto (`/contacto`), Política de datos (`/politica-de-datos`)
  y Términos (`/terminos`).
- **Panel admin:** `/login` y `/admin` — estadísticas, CRUD de reuniones y testimonios,
  editor de contenido.
- **Stack:** Vite 5 + React 18 + TypeScript + Tailwind + shadcn/ui + React Router 6 +
  Supabase (Postgres, Auth, Storage) + TanStack Query + zod + react-hook-form + react-helmet-async.
- **Hosting objetivo:** Cloudflare Pages (plan gratuito) en un subdominio `*.pages.dev`
  (aún no hay dominio propio). SPA: Cloudflare Pages sirve `index.html` como fallback si
  no existe `404.html` en `dist/`.
- **Backend:** Supabase en plan gratuito, en la cuenta propia del usuario (proyecto
  `xrnwnjcnqqbcqqudlzal`). Migraciones en `supabase/migrations/`, seed en `supabase/seed.sql`.
  Guía completa (local, producción, admin, Google, migración desde Lovable): `docs/supabase.md`.
- **Idioma:** interfaz y mensajes de commit en **español**.

## Reglas de trabajo

- Una rama por paso (p. ej. `paso-1-limpieza`). Commits pequeños con mensajes claros en español.
- Antes de un cambio grande, mostrar el plan y **esperar confirmación**.
- Al final de cada paso ejecutar `npm run lint`, `npm run build` y `npm test`, e informar el
  resultado real. No afirmar que algo funciona sin haberlo verificado.
- **Nunca** subir secretos al repositorio. **Nunca** usar la `service_role` key de Supabase
  en el frontend (solo la clave `anon`/publishable, protegida por RLS).
- No cambiar el diseño visual salvo petición expresa; el objetivo es la calidad del código.
- Si algo es ambiguo, preguntar.

## Comandos

```bash
npm ci               # instalar dependencias (npm es el único gestor de paquetes)
npm run dev          # servidor de desarrollo en http://localhost:8080
npm run build        # build de producción en dist/
npm run build:dev    # build en modo development
npm run preview      # servir dist/ localmente
npm run lint         # ESLint (falla también con avisos: --max-warnings 0)
npm test             # Vitest (una pasada)
npm run test:watch   # Vitest en modo watch
npm run typecheck    # tipos de la app, los tests y la config (vite build no los revisa)
npm run preview      # sirve dist/ con las cabeceras de seguridad (prueba la CSP)
npx supabase functions serve contact --env-file supabase/functions/.env   # Edge Function local
npx supabase start   # Supabase local (requiere Docker Desktop); migraciones + seed
npx supabase db reset                   # recrea la base local
npx supabase gen types typescript --local --schema public > src/integrations/supabase/types.ts
```

Variables de entorno (archivo `.env`, no versionar; plantilla en `.env.example`):
`VITE_SUPABASE_URL` (obligatoria en el build: la usa la CSP), `VITE_SUPABASE_PUBLISHABLE_KEY`,
`VITE_SITE_URL` y `VITE_TURNSTILE_SITE_KEY` (vacía = clave de prueba de Turnstile). Si falta
`VITE_SITE_URL`, `vite.config.ts` usa `http://localhost:8080` y avisa en el build.

## Estructura de carpetas

```
.
├── index.html                 # HTML base y meta OG/Twitter (%VITE_SITE_URL%)
├── public/                    # favicon y og-image.png (se copian tal cual a dist/);
│                              # robots.txt y sitemap.xml los genera vite.config.ts
├── docs/supabase.md           # backend: local, producción, admin, Google, migración
├── scripts/
│   └── migrar-desde-lovable.mjs   # exporta/importa datos e imágenes de Lovable Cloud
├── supabase/
│   ├── config.toml            # config local de la CLI (auth, Google, registro desactivado)
│   ├── migrations/            # esquema inicial (tablas, RLS, is_admin, bucket), funciones
│   │                          # de estadísticas, seguridad (límites, contact_messages) y
│   │                          # legal (visitor_id opcional, prueba de autorización, pg_cron)
│   ├── functions/contact/     # Edge Function del formulario (Turnstile, límite, CORS);
│   │                          # handler.ts sin Deno, probado con vitest
│   └── seed.sql               # textos reales de site_content (upsert) + ejemplos locales
├── src/
│   ├── main.tsx / App.tsx     # arranque, rutas (React.lazy salvo Inicio), ErrorBoundary
│   ├── pages/                 # Index, Empresa, Servicios, Reuniones, Contacto,
│   │                          # Login, Admin (pestañas en diferido), NotFound
│   ├── features/              # cada una: service.ts (consultas Supabase), hooks.ts
│   │   │                      # (TanStack Query), schema.ts (zod) y components/
│   │   ├── analytics/         # tracker, estadísticas por período, CSV, filtro de bots
│   │   ├── content/           # textos de site_content (defaults.ts) y ContentEditor
│   │   ├── meetings/          # MeetingsSection (pública) y MeetingsManager (admin)
│   │   ├── testimonials/      # TestimonialsSection (pública) y TestimonialsManager
│   │   ├── contact/           # formulario (Turnstile + autorización), mapa al clic (con
│   │   │                      # consentimiento) y ContactMessagesManager
│   │   ├── consent/           # aviso de cookies: Estadísticas y Mapas (ConsentProvider)
│   │   ├── auth/              # esquema del formulario de login
│   │   └── schemas.test.ts    # tests de los esquemas de formularios
│   ├── components/            # secciones públicas (Header, Footer, TopBar, HeroSimple,
│   │   │                      # StatsBand, CTA, Seo, ...), ErrorBoundary, QueryState
│   │   │                      # (error/vacío/skeleton/FieldError), ConfirmDeleteButton,
│   │   │                      # RequireAdmin (ruta protegida + inactividad)
│   │   └── ui/                # componentes shadcn/ui en uso
│   ├── config/site.ts         # datos de la empresa, URL del sitio y JSON-LD
│   ├── config/legal.ts        # versión de la política, datos [COMPLETAR] y plazos de retención
│   ├── config/securityHeaders.ts  # CSP y cabeceras (dist/_headers y vite preview)
│   ├── contexts/              # AuthContext (proveedor), auth-context y useAuth
│   ├── hooks/                 # use-toast, useNotify, useIdleLogout, useScrollReveal, ...
│   ├── integrations/
│   │   └── supabase/          # client.ts y types.ts (tipos generados de la BD)
│   ├── lib/                   # utils.ts (cn), storageImage.ts (subir/borrar/URL de imágenes),
│   │                          # imageField.ts (validación zod de imágenes), zod.ts (z sin JIT)
│   ├── assets/                # imágenes importadas por Vite
│   └── test/                  # setup de Vitest
├── vite.config.ts / vitest.config.ts / tailwind.config.ts / eslint.config.js
└── tsconfig*.json             # TypeScript en modo estricto
```

## Modelo de datos y seguridad (Supabase)

- Rol admin: tabla `user_roles` + función `SECURITY DEFINER public.is_admin()` (sin
  parámetros, `search_path = ''`, no ejecutable por `anon`). Los roles se asignan por SQL.
- Tablas con RLS: `meetings` y `testimonials` (lectura pública solo de publicados),
  `site_content` (lectura pública), `page_views` (insert anónimo validado, lectura admin).
- `anon` tiene privilegios de tabla mínimos: columnas públicas de `meetings`/`testimonials`
  (sin `created_by`; `select=*` como anon falla, pedir columnas explícitas).
- Storage: bucket público `site-images` (carpetas `meetings/`, `testimonials/`, `content/`),
  2 MB, solo JPEG/PNG/WebP, escritura solo admin, no listable. En la BD se guarda la ruta
  (`image_path`), nunca la URL; la URL se arma con `imageUrl()` de `storageImage.ts`.
- Auth: registro público desactivado; login con contraseña o Google (solo cuentas existentes).
- La autorización real está en RLS; las comprobaciones de `isAdmin` en el frontend son solo UX.
- Solo `AuthContext`, `lib/storageImage.ts` y los `service.ts` de `features/` importan `supabase`;
  los componentes usan los hooks.
- Estadísticas: funciones SQL `security invoker` (`page_view_stats`, `page_view_totals`,
  `meeting_stats`) por período en `America/Bogota`; excluyen bots con `is_bot_user_agent`,
  cuya regex debe coincidir con `features/analytics/bots.ts` (lo comprueba un test).
- `contact_messages`: sin INSERT por la API; solo la Edge Function `contact` (clave de servicio,
  tras Turnstile y límite por IP). Admins leen, marcan `is_read` y borran.
- Límites de abuso en `private.rate_limits` (claves con hash y sal): `page_views` 60/h por
  visitante y 300/h por IP (trigger que descarta en silencio); contacto 5/h por IP.
- Nada de HTML sin escapar: ESLint prohíbe `dangerouslySetInnerHTML` e `innerHTML`; zod se
  importa de `@/lib/zod` (sin JIT, la CSP no permite eval).
- Datos personales (Ley 1581): sin consentimiento de estadísticas la visita se guarda sin
  `visitor_id`; Google Maps exige el consentimiento de Mapas; el formulario exige la casilla
  y guarda `privacy_accepted_at`/`privacy_version`. Retención con pg_cron: mensajes 12 meses,
  visitas 24, contadores 2 horas (`private.apply_retention()`). Si cambia la política, subir
  `PRIVACY_POLICY_VERSION` (el aviso vuelve a preguntar).
- `site_content`: textos por defecto en `features/content/defaults.ts`, iguales a `seed.sql`
  (lo comprueba un test). `extra_data.highlight` = palabra resaltada del título del hero.

## Problemas conocidos

Pendientes (estado al terminar el paso 4, 2026-10-21):

- `npm audit`: 5 altas, todas de `braces` vía tailwindcss 3 (solo en el build; sin versión
  corregida). Se resuelve con tailwindcss 4.
- `cucuta-real.png` (670 KB) se sirve sin optimizar.
- Login con Google: falta configurarlo en producción (`docs/supabase.md`, sección 5).
- Turnstile usa la clave de prueba hasta tener la site key real.
- Páginas legales: revisión de un abogado y datos [COMPLETAR] de `src/config/legal.ts`.
- Producción: todo lo pendiente está en orden en `docs/lanzamiento.md`.

Resueltos del diagnóstico inicial (2026-10-20): dependencia de Lovable, lockfiles duplicados,
`.env` versionado, `site_content` sin uso, estadísticas calculadas en el navegador con un
selector que no filtraba, tracker que solo registraba la primera página, borrado sin
confirmación, `<Switch>` dentro de `<Button>`, TypeScript no estricto, errores de lint,
`console.log`, código y componentes sin uso, teléfono y correo repetidos, `/reuniones` fuera
del sitemap, bundle único de ~955 KB y falta de tests. El detalle está en el historial de git.
