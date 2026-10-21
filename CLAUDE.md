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
- **Backend:** Supabase en plan gratuito, en la cuenta propia del usuario. Migraciones en
  `supabase/migrations/`.
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
npm install          # instalar dependencias (npm ci falla hasta regenerar package-lock.json)
npm run dev          # servidor de desarrollo en http://localhost:8080
npm run build        # build de producción en dist/
npm run build:dev    # build en modo development
npm run preview      # servir dist/ localmente
npm run lint         # ESLint
npm test             # Vitest (una pasada)
npm run test:watch   # Vitest en modo watch
npx tsc -p tsconfig.app.json --noEmit   # chequeo de tipos (vite build no lo hace)
```

Variables de entorno (archivo `.env`, no versionar): `VITE_SUPABASE_URL`,
`VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`.

## Estructura de carpetas

```
.
├── index.html                 # HTML base, meta OG/Twitter y JSON-LD de la empresa
├── public/                    # favicon, robots.txt, sitemap.xml (se copian tal cual a dist/)
├── supabase/
│   ├── config.toml            # project_id del proyecto Supabase
│   └── migrations/            # esquema SQL: user_roles, meetings, site_content,
│                              # page_views, testimonials, bucket meeting-images, RLS
├── src/
│   ├── main.tsx / App.tsx     # arranque y rutas (Layout envuelve las páginas públicas)
│   ├── pages/                 # Index, Empresa, Servicios, Reuniones, Contacto,
│   │                          # Login, Admin, NotFound
│   ├── components/            # secciones públicas (Header, Footer, TopBar, HeroSimple,
│   │   │                      # StatsBand, Meetings, TestimonialsSection, CTA, Seo, ...)
│   │   ├── admin/             # AdminDashboard, MeetingsManager, TestimonialsManager,
│   │   │                      # ContentEditor
│   │   └── ui/                # componentes shadcn/ui (la mayoría sin uso)
│   ├── contexts/AuthContext.tsx   # sesión Supabase y rol admin (tabla user_roles)
│   ├── hooks/                 # use-toast, useScrollReveal, useScrollDirection, use-mobile
│   ├── integrations/
│   │   ├── supabase/          # client.ts y types.ts (tipos generados de la BD)
│   │   └── lovable/           # login con Google vía Lovable (a eliminar)
│   ├── lib/                   # utils.ts (cn), storageImage.ts (URLs firmadas)
│   ├── assets/                # imágenes importadas por Vite
│   └── test/                  # setup de Vitest y test de ejemplo
├── vite.config.ts / vitest.config.ts / tailwind.config.ts / eslint.config.js
└── tsconfig*.json             # TypeScript sin modo estricto en la app
```

## Modelo de datos y seguridad (Supabase)

- Rol admin: tabla `user_roles` + función `SECURITY DEFINER public.is_admin(uuid)`.
- Tablas con RLS: `meetings` y `testimonials` (lectura pública solo de publicados),
  `site_content` (lectura pública), `page_views` (insert anónimo validado, lectura admin).
- Storage: bucket `meeting-images` (reuniones y `testimonials/`); escritura solo admin.
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
- Bucket `meeting-images`: creado `public = true` (las URLs públicas saltan las políticas
  RLS de SELECT), el código guarda `getPublicUrl`, `storageImage.ts` lo trata como privado y
  firma URLs; las políticas usan `image_url LIKE '%' || name`.
- Admin: borrar no pide confirmación ni elimina la imagen de Storage; errores de subida se
  ignoran en silencio; `<Switch>` (button) anidado dentro de `<Button>` en TestimonialsManager.
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
