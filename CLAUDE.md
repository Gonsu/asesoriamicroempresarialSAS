# CLAUDE.md — AME S.A.S. (Asesoría Microempresarial)

## Contexto

Sitio corporativo de **AME S.A.S.** (Asesoría Microempresarial, Cúcuta, Colombia), generado
originalmente con Lovable. El objetivo es convertirlo en una aplicación limpia, segura y
mantenible, desplegable gratis y **sin depender de Lovable**.

- **Páginas públicas:** Inicio (`/`), Empresa (`/empresa`), Servicios (`/servicios`),
  Reuniones (`/reuniones`), Contacto (`/contacto`).
- **Panel admin:** `/login` y `/admin` — estadísticas, CRUD de reuniones y testimonios,
  editor de contenido.
- **Stack:** Vite 5 + React 18 + TypeScript + Tailwind + shadcn/ui + React Router 6 +
  Supabase (Postgres, Auth, Storage). TanStack Query y react-helmet-async instalados.
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
npm run lint         # ESLint
npm test             # Vitest (una pasada)
npm run test:watch   # Vitest en modo watch
npx tsc -p tsconfig.app.json --noEmit   # chequeo de tipos (vite build no lo hace)
npx supabase start   # Supabase local (requiere Docker Desktop); migraciones + seed
npx supabase db reset                   # recrea la base local
npx supabase gen types typescript --local --schema public > src/integrations/supabase/types.ts
```

Variables de entorno (archivo `.env`, no versionar; plantilla en `.env.example`):
`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SITE_URL`. Si falta
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
│   ├── migrations/            # esquema SQL consolidado: tablas, RLS, is_admin, bucket
│   └── seed.sql               # contenido de ejemplo (local)
├── src/
│   ├── main.tsx / App.tsx     # arranque y rutas (Layout envuelve las páginas públicas)
│   ├── pages/                 # Index, Empresa, Servicios, Reuniones, Contacto,
│   │                          # Login, Admin, NotFound
│   ├── components/            # secciones públicas (Header, Footer, TopBar, HeroSimple,
│   │   │                      # StatsBand, Meetings, TestimonialsSection, CTA, Seo, ...)
│   │   ├── admin/             # AdminDashboard, MeetingsManager, TestimonialsManager,
│   │   │                      # ContentEditor
│   │   └── ui/                # componentes shadcn/ui en uso
│   ├── config/site.ts         # datos de la empresa, URL del sitio y JSON-LD
│   ├── contexts/AuthContext.tsx   # sesión Supabase y rol admin (tabla user_roles)
│   ├── hooks/                 # use-toast, useScrollReveal, useScrollDirection
│   ├── integrations/
│   │   └── supabase/          # client.ts y types.ts (tipos generados de la BD)
│   ├── lib/                   # utils.ts (cn), storageImage.ts (subir/borrar/URL de imágenes)
│   ├── assets/                # imágenes importadas por Vite
│   └── test/                  # setup de Vitest y test de ejemplo
├── vite.config.ts / vitest.config.ts / tailwind.config.ts / eslint.config.js
└── tsconfig*.json             # TypeScript sin modo estricto en la app
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

## Problemas conocidos (diagnóstico inicial, 2026-10-20)

**Dependencia de Lovable**
- `@lovable.dev/cloud-auth-js` (`src/integrations/lovable/`, botón Google en `Login.tsx`),
  `lovable-tagger` en `vite.config.ts`, carpeta `.lovable/`, `README.md` de plantilla.
- `playwright.config.ts` y `playwright-fixture.ts` importan `lovable-agent-playwright-config`,
  que no está en `package.json` (no hay tests e2e).
- URLs `asesoriamicroempresarialsas.lovable.app` en `Seo.tsx`, `index.html`, `robots.txt`,
  `sitemap.xml`; imagen OG en `storage.googleapis.com/gpt-engineer-file-uploads`;
  `twitter:site` = `@Lovable`.

**Repositorio y dependencias**
- `package-lock.json` desincronizado (`npm ci` falla: faltan react-helmet-async, @testing-library/dom…).
- Tres lockfiles (`package-lock.json`, `bun.lock`, `bun.lockb`).
- `.env` incluido y **no** listado en `.gitignore` (contiene la clave `anon`, no la service_role).
- `npm audit`: 41 vulnerabilidades (2 críticas, 31 altas) con dependencias actuales;
  `xlsx` sin corrección en npm.

**Funcionalidad**
- `ContentEditor` guarda en `site_content`, pero ninguna página pública lo lee.
- `AdminDashboard` descarga `page_views` y `meetings` completos (máx. 1000 filas por
  petición en Supabase) y agrega en el navegador; el selector mes/año solo cambia la
  etiqueta y el nombre del archivo Excel, no filtra datos.
- `PageViewTracker` está en `Layout` con `useEffect([])`: solo registra la primera página
  de la visita, no las navegaciones internas.
- Admin: borrar no pide confirmación; `<Switch>` (button) anidado dentro de `<Button>` en
  TestimonialsManager.
- Formulario de contacto con `mailto:`. `sitemap.xml` no incluye `/reuniones`.

**Calidad de código**
- TypeScript sin modo estricto (`strict: false`, `noImplicitAny: false`).
- `npm run lint`: 11 errores (8 `no-explicit-any` en admin, 2 `no-empty-object-type` en ui,
  1 `require` en tailwind.config.ts) y 8 avisos.
- `console.log` en `AuthContext.tsx`.
- Sin uso: 39 archivos de `src/components/ui` (solo se usan button, input, label, skeleton,
  sonner, switch, textarea, toast, toaster, tooltip), `Hero`, `Services`, `NavLink`,
  `hooks/use-mobile`, `App.css`, y las imágenes `banner-ame.png`, `about-cucuta.jpg`,
  `logo-ame-full.avif`.
- Un solo bundle JS de ~955 KB (sin code splitting); `cucuta-real.png` (670 KB) se usa sin optimizar.
- Teléfono y correo repetidos en 7 archivos (CTA, Footer, TopBar, FloatingWhatsApp,
  Contacto, Servicios, index.html).
- Solo hay un test de ejemplo (`expect(true).toBe(true)`).
