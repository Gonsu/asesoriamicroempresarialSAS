# AME S.A.S. — Asesoría Microempresarial

Sitio web corporativo de **Asesoría Microempresarial S.A.S.** (Cúcuta, Norte de Santander),
empresa que ofrece asesoría financiera, gestión administrativa y consultoría a microempresas.

Incluye:

- **Páginas públicas:** Inicio (`/`), Empresa (`/empresa`), Servicios (`/servicios`),
  Reuniones (`/reuniones`) y Contacto (`/contacto`).
- **Panel administrativo:** `/login` y `/admin`, con estadísticas de visitas, gestión de
  reuniones y testimonios, y editor de contenido.

**Tecnologías:** Vite 5, React 18, TypeScript, Tailwind CSS, shadcn/ui, React Router 6 y
[Supabase](https://supabase.com) (base de datos Postgres, autenticación y almacenamiento).

## Requisitos

- [Node.js](https://nodejs.org) 20 o superior (incluye npm). El proyecto usa **npm** como
  único gestor de paquetes.
- Un proyecto de Supabase con las migraciones de `supabase/migrations/` aplicadas, o
  Supabase local con Docker Desktop. Ver [docs/supabase.md](docs/supabase.md).

## Ejecutar en local

```bash
git clone https://github.com/Gonsu/asesoriamicroempresarialSAS.git
cd asesoriamicroempresarialSAS
npm ci
cp .env.example .env   # y completa los valores
npm run dev
```

El sitio queda disponible en <http://localhost:8080>.

## Variables de entorno

Se leen del archivo `.env` (no se versiona). Usa `.env.example` como plantilla.

| Variable | Descripción |
| --- | --- |
| `VITE_SUPABASE_URL` | URL del proyecto de Supabase (Project Settings → API). |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Clave pública `anon`/publishable de Supabase. **Nunca** uses la `service_role`. |
| `VITE_SITE_URL` | URL pública del sitio, sin barra final. Se usa en la URL canónica, Open Graph, JSON-LD, `robots.txt` y `sitemap.xml`. Si falta, se usa `http://localhost:8080`. |

Todas las variables `VITE_*` quedan incluidas en el JavaScript que se envía al navegador:
no pongas secretos en ellas.

## Scripts

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo en <http://localhost:8080>. |
| `npm run build` | Build de producción en `dist/` (genera también `robots.txt` y `sitemap.xml`). |
| `npm run build:dev` | Build en modo development. |
| `npm run preview` | Sirve `dist/` localmente para revisar el build. |
| `npm run lint` | Revisa el código con ESLint. |
| `npm test` | Ejecuta las pruebas con Vitest (una pasada). |
| `npm run test:watch` | Vitest en modo watch. |

Chequeo de tipos (el build de Vite no lo hace):

```bash
npx tsc -p tsconfig.app.json --noEmit
```

## Estructura

```
public/               archivos estáticos (favicon, imagen Open Graph)
src/config/site.ts    datos de la empresa: contacto, dirección, redes y URL del sitio
src/pages/            páginas (una por ruta)
src/components/       secciones del sitio; admin/ para el panel; ui/ para shadcn/ui
src/contexts/         sesión y rol de administrador (Supabase Auth)
src/integrations/     cliente y tipos de Supabase
supabase/migrations/  esquema de la base de datos y políticas RLS
supabase/seed.sql     contenido de ejemplo para desarrollo local
scripts/              migración de datos desde el proyecto anterior (Lovable Cloud)
docs/supabase.md      guía del backend: local, producción, administradores, Google
```

Para cambiar el teléfono, el correo, la dirección o las redes sociales, edita solo
`src/config/site.ts`.
