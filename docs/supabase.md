# Backend Supabase

El backend es un proyecto Supabase propio, en el plan gratuito:

- Proyecto: `ASESORIA MICROEMPRESARIAL SAS`
- Referencia: `xrnwnjcnqqbcqqudlzal`
- Región: `us-west-2`

El esquema completo está en `supabase/migrations/` y el contenido de ejemplo en `supabase/seed.sql`.

Todos los comandos usan la CLI con `npx supabase`. No hace falta instalarla globalmente.

## 1. Desarrollo local

Requiere **Docker Desktop** abierto.

```bash
npx supabase start        # levanta Postgres, Auth, Storage y Studio; aplica migraciones y seed
npx supabase status       # muestra URLs y claves locales
npx supabase db reset     # borra la base local y vuelve a aplicar migraciones + seed
npx supabase stop         # detiene los contenedores (conserva los datos)
```

Para que el frontend use la base local, crea `.env.development.local`. Este archivo no se versiona y en `npm run dev` tiene prioridad sobre `.env`:

```
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_PUBLISHABLE_KEY=<PUBLISHABLE_KEY de `npx supabase status`>
```

Herramientas locales:

- Studio, el panel de administración: <http://127.0.0.1:54323>
- Mailpit, donde llegan los correos de invitación locales: <http://127.0.0.1:54324>

## 2. Aplicar el esquema al proyecto de producción

```bash
npx supabase link --project-ref xrnwnjcnqqbcqqudlzal   # pide la contraseña de la base
npx supabase db push                                   # aplica las migraciones pendientes
npx supabase db push --include-seed                    # solo si quieres el contenido de ejemplo
```

Después, en `.env`, que se usa en el build y en Cloudflare Pages:

```
VITE_SUPABASE_URL=https://xrnwnjcnqqbcqqudlzal.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<Publishable key de Project Settings → API Keys>
```

## 3. Configuración de Auth en el panel

`config.toml` solo afecta al entorno local. En producción, configura lo siguiente a mano en <https://supabase.com/dashboard/project/xrnwnjcnqqbcqqudlzal>.

**Desactivar el registro público**

1. Ve a **Authentication → Sign In / Providers**.
2. Desactiva **Allow new users to sign up**.
3. Deja **activado** el proveedor **Email**. Si lo desactivas, también se desactiva el login con contraseña.

**Configurar las URLs**

En **Authentication → URL Configuration**:

- **Site URL:** `https://asesoriamicroempresarialsas.pages.dev`
- **Redirect URLs:**
  - `https://asesoriamicroempresarialsas.pages.dev/login`
  - `http://localhost:8080/login`

Si más adelante hay dominio propio, añade su `/login` y cambia el Site URL.

## 4. Crear el primer administrador

Con el registro desactivado, las cuentas solo las crea un administrador del proyecto Supabase. Hay dos pasos: crear el usuario y luego darle el rol `admin`.

**Paso 1. Crear el usuario.** Elige una de estas dos formas.

*Opción A: crear con contraseña (recomendada).* Ve a **Authentication → Users → Add user → Create new user**. Escribe el correo y una contraseña, y marca **Auto Confirm User**. La persona entra en `/login` con esa contraseña. Si su correo es de Google, también puede usar **Continuar con Google**: Supabase vincula la identidad de Google al usuario existente con el mismo correo verificado.

*Opción B: invitar por correo.* Ve a **Authentication → Users → Add user → Send invitation**. El correo de invitación lleva a la Site URL con la sesión abierta. Después, la persona entra con Google.

> El SMTP incluido en el plan gratuito solo entrega correos a los miembros del equipo de la organización en Supabase, con un límite de pocos correos por hora. Para invitar a otras direcciones, configura un SMTP propio en **Project Settings → Authentication → SMTP Settings**, por ejemplo con Resend o Brevo, que tienen planes gratuitos. Si no, usa la opción A.

**Paso 2. Dar el rol de administrador.** En **SQL Editor**, ejecuta:

```sql
insert into public.user_roles (user_id, role)
select id, 'admin' from auth.users where email = 'correo@ejemplo.com';
```

Para quitarle el rol más adelante:

```sql
delete from public.user_roles
where role = 'admin'
  and user_id = (select id from auth.users where email = 'correo@ejemplo.com');
```

**En local** se hace lo mismo desde Studio (<http://127.0.0.1:54323>). Los correos de invitación llegan a Mailpit.

## 5. Login con Google

El login con Google usa `supabase.auth.signInWithOAuth({ provider: "google" })` y vuelve a `/login`. Solo entran las cuentas que ya existen. Si una cuenta de Google no existe, Supabase responde `signup_disabled` y `/login` muestra el aviso «Esta cuenta de Google no está autorizada».

### Google Cloud Console

1. Entra a <https://console.cloud.google.com/>.
2. Crea un proyecto, por ejemplo `ame-sas-web`.
3. Ve a **Google Auth Platform → Branding** y completa:
   - nombre de la app: `AME S.A.S.`;
   - correo de asistencia;
   - logo, opcional;
   - dominio autorizado: `supabase.co`;
   - más adelante, tu dominio propio.
4. En **Audience**, elige **External**.
   - Mientras esté en *Testing*, solo pueden entrar los correos añadidos en **Test users**.
   - Cuando pases a *In production*, con solo los permisos `openid`, `email` y `profile`, Google no exige verificación.
5. Ve a **Clients → Create client** y elige el tipo **Web application**.
   - **Authorized JavaScript origins:**
     - `https://asesoriamicroempresarialsas.pages.dev`
     - `http://localhost:8080`
   - **Authorized redirect URIs.** Es la URL de callback de Supabase, no la del sitio:
     - `https://xrnwnjcnqqbcqqudlzal.supabase.co/auth/v1/callback`
     - `http://127.0.0.1:54321/auth/v1/callback` (para pruebas locales)
6. Copia el **Client ID** y el **Client secret**.

### Supabase (producción)

1. Ve a **Authentication → Sign In / Providers → Google**.
2. Activa el proveedor.
3. Pega el Client ID y el Client secret, y guarda.

### Supabase (local)

Crea `supabase/.env`. Este archivo no se versiona.

```
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=<client id>
SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=<client secret>
```

Después reinicia con `npx supabase stop && npx supabase start`.

## 6. Migrar los datos desde Lovable Cloud

El proyecto anterior (`dddqlypayckwzytnmzem`) lo administra Lovable Cloud. No da acceso directo a la base, así que `scripts/migrar-desde-lovable.mjs` copia los datos por la API.

| Se migra | No se migra |
| --- | --- |
| Reuniones, testimonios, contenido del sitio, visitas (estas solo con login de admin) y las imágenes, que pasan del bucket viejo `meeting-images` al nuevo `site-images` con la ruta guardada en `image_path` | Los usuarios de Auth y sus roles: el admin se recrea (sección 4) |

Haz la migración en este orden:

1. Aplica el esquema al proyecto nuevo (sección 2).
2. Exporta desde el proyecto viejo. Estos comandos son para PowerShell:

   ```powershell
   $env:OLD_SUPABASE_URL = "https://dddqlypayckwzytnmzem.supabase.co"
   $env:OLD_SUPABASE_KEY = "<VITE_SUPABASE_PUBLISHABLE_KEY del .env actual>"
   node scripts/migrar-desde-lovable.mjs export
   ```

   Sin más variables solo se exporta lo publicado. Para incluir también los borradores y las visitas, el script necesita una sesión de admin del proyecto viejo:

   - **Admin que entraba con Google** (el caso de este proyecto):
     1. Inicia sesión en el sitio viejo de Lovable con Google.
     2. Abre la consola del navegador (F12 → Console) y ejecuta:

        ```js
        copy(JSON.parse(localStorage.getItem("sb-dddqlypayckwzytnmzem-auth-token")).access_token)
        ```

     3. En PowerShell, antes del `export`, ejecuta `$env:OLD_ACCESS_TOKEN = Get-Clipboard`. El token dura alrededor de 1 hora y da acceso de admin: no lo pegues en ningún chat.

   - **Admin con contraseña:** define `$env:OLD_ADMIN_EMAIL` y `$env:OLD_ADMIN_PASSWORD`.

   El resultado queda en `migracion/datos.json` y `migracion/imagenes/`. La carpeta no se versiona. Revísala antes de seguir.

3. Importa en el proyecto nuevo:

   ```powershell
   $env:NEW_SUPABASE_URL = "https://xrnwnjcnqqbcqqudlzal.supabase.co"
   $env:NEW_SUPABASE_SECRET_KEY = "<Secret key de Project Settings → API Keys>"
   node scripts/migrar-desde-lovable.mjs import
   ```

   Puedes repetir la importación sin crear duplicados, porque conserva los `id` y las `section_key`. Las imágenes de más de 2 MB o en un formato distinto de JPG, PNG o WebP se omiten y aparecen al final como problemas. Súbelas de nuevo desde el panel de administración.

4. Borra las claves de la sesión y la carpeta exportada:

   ```powershell
   Remove-Item Env:OLD_ACCESS_TOKEN, Env:OLD_ADMIN_PASSWORD, Env:NEW_SUPABASE_SECRET_KEY -ErrorAction SilentlyContinue
   Remove-Item -Recurse -Force migracion
   ```

**Importante:** la secret key salta RLS. Nunca la pongas en `.env`, en el frontend ni en el repositorio.

## 7. Tipos de TypeScript

Después de cambiar el esquema, regenera los tipos con la base local levantada:

```bash
npx supabase gen types typescript --local --schema public > src/integrations/supabase/types.ts
npx prettier@3.3.3 --write src/integrations/supabase/types.ts
```

## 8. Modelo de seguridad

- **RLS en todas las tablas.** `anon` además tiene privilegios de tabla mínimos:
  - `SELECT` de las columnas públicas de `meetings` y `testimonials`. `created_by` no se expone, así que `select=*` como anon da error de permisos y hay que pedir columnas explícitas.
  - `SELECT` de `site_content`.
  - `INSERT` de `page`, `visitor_id` y `user_agent` en `page_views`.
- **`public.is_admin()`:**
  - `SECURITY DEFINER` con `search_path = ''`;
  - sin parámetros, así que solo responde por el usuario de la sesión;
  - no ejecutable por `anon`.
- **Usuarios autenticados sin rol:** solo ven lo publicado y sus propias filas de `user_roles`. No hay escritura de `user_roles` desde la API.
- **Bucket `site-images`:**
  - público para descargar por URL;
  - nadie puede listarlo sin ser admin;
  - escritura solo para admins en `meetings/`, `testimonials/` y `content/`;
  - límite de 2 MB y solo `image/jpeg`, `image/png` e `image/webp`.
- **Registro público desactivado.** Las cuentas solo las crea un administrador del proyecto.
- **Estadísticas:** `page_view_stats`, `page_view_totals`, `meeting_stats` y `human_page_views` son `SECURITY INVOKER`. La RLS de cada tabla sigue aplicando, así que solo un admin obtiene cifras. `anon` no puede ejecutarlas.

## 9. Contenido editable y estadísticas

**Textos del sitio (`site_content`)**

- Los textos por defecto están en `src/features/content/defaults.ts`. Las páginas los muestran mientras carga la consulta, si falla o si un campo está vacío en la base de datos.
- Secciones: `hero`, `home_about` (Quiénes somos en Inicio), `about` (Empresa), `services`, `whyus`, `cta` y `footer`.
- `subtitle` es la etiqueta pequeña sobre el encabezado, `title` el encabezado y `description` el texto. Una línea en blanco separa párrafos.
- En el hero, `extra_data.highlight` es la palabra del título que va resaltada. Si no aparece tal cual en el título, no se resalta nada.
- `supabase/seed.sql` tiene los mismos textos como upsert, y un test lo comprueba. Para restaurar los textos originales en producción, ejecuta en el **SQL Editor** el primer `insert … on conflict (section_key) do update` de `seed.sql`. No ejecutes el resto del seed: crea reuniones y testimonios de ejemplo.

**Estadísticas**

- El panel usa las funciones de la migración `20261021000000_estadisticas.sql`. Agregan las cifras en SQL por un período de fechas locales de Cúcuta (`America/Bogota`), con las dos fechas incluidas.
- Las visitas de bots y vistas previas de enlaces (WhatsApp, Facebook, Telegram, Googlebot…) se excluyen al consultar con `public.is_bot_user_agent`, así que el filtro también vale para las visitas antiguas.
- El tracker del frontend tampoco inserta esas visitas. Su expresión regular (`src/features/analytics/bots.ts`) debe ser la misma que la de SQL; un test lo comprueba.

## 10. Seguridad (paso 4)

**Cabeceras HTTP.** `vite build` genera `dist/_headers` para Cloudflare Pages desde `src/config/securityHeaders.ts`:

- Content-Security-Policy con el Supabase de `VITE_SUPABASE_URL`, Turnstile y Google Maps.
- HSTS, `nosniff`, `X-Frame-Options`, Referrer-Policy, Permissions-Policy y COOP.

`npm run preview` aplica las mismas cabeceras, así que es la forma de probar la CSP en local. El build falla si falta `VITE_SUPABASE_URL`.

**Límites de abuso.** Están en la migración `20261022000000_seguridad.sql`:

- `page_views`: 60 visitas por hora por `visitor_id` y 300 por hora por IP. Las de más se descartan sin error.
- Formulario de contacto: 5 mensajes por hora por IP.
- La IP sale de `cf-connecting-ip` o `x-real-ip`, nunca del `x-forwarded-for` que manda el cliente. Se guarda como SHA-256 con una sal secreta, en `private.rate_limits`.

**Formulario de contacto.**

- La tabla `contact_messages` no admite inserciones por la API: solo la Edge Function `contact`, con la clave de servicio.
- La función verifica el token de Turnstile (hostname y acción), aplica el límite por IP y solo responde a los orígenes de `ALLOWED_ORIGINS`.

En local:

```bash
cp supabase/functions/.env.example supabase/functions/.env   # claves de prueba de Turnstile
npx supabase functions serve contact --env-file supabase/functions/.env
```

En producción:

```bash
npx supabase secrets set TURNSTILE_SECRET_KEY=<secret key de Turnstile> \
  ALLOWED_ORIGINS=https://asesoriamicroempresarialsas.pages.dev \
  ALLOWED_HOSTNAMES=asesoriamicroempresarialsas.pages.dev
npx supabase functions deploy contact
```

La site key de Turnstile (pública) va en `VITE_TURNSTILE_SITE_KEY`, en `.env` y en las variables de Cloudflare Pages. Sin ella se usa la clave de prueba, que en producción no funciona: la secret real rechaza sus tokens.

**Contraseñas.** `config.toml` exige 12 caracteres con mayúsculas, minúsculas y números, pero solo en local. En producción se configura en **Authentication → Providers → Email**.

**Sesión del panel.** Se cierra tras 30 minutos sin actividad (`src/hooks/useIdleLogout.ts`). Es una medida del frontend: el cierre por inactividad del servidor es del plan Pro.

## 11. Datos personales: consentimiento y retención (paso 5)

**Visitas**

- Sin consentimiento de estadísticas se guarda la visita con `visitor_id = null`, y el navegador no guarda nada.
- Con consentimiento, la visita lleva el identificador anónimo `ame_visitor_id`.
- Los visitantes únicos (`count(distinct visitor_id)`) solo cuentan a quienes aceptaron.

**Prueba de la autorización.** `contact_messages.privacy_accepted_at` y `privacy_version` son obligatorios.

- La Edge Function rechaza el envío sin la casilla marcada.
- La hora de la aceptación la pone el servidor.
- La versión viene de `PRIVACY_POLICY_VERSION`, en `src/config/legal.ts`.

**Retención.** `pg_cron` la aplica con estas tareas:

| Tarea | Horario | Qué borra |
|---|---|---|
| `ame-retencion-diaria` | `15 8 * * *` (03:15 en Cúcuta) | mensajes de más de 12 meses y visitas de más de 24 meses (`private.apply_retention()`) |
| `ame-rate-limits-cada-hora` | `5 * * * *` | contadores de `private.rate_limits` de más de 2 horas |

Para ejecutarla a mano: `select * from private.apply_retention();` (devuelve las filas borradas por tabla). Si cambian los plazos, actualiza la migración y `retention` en `src/config/legal.ts`, que es lo que muestra la política.
