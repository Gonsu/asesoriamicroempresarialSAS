# Lanzamiento a producción

Pasos pendientes de los pasos 3, 4 y 5 para aplicar en producción, en este orden. Se ejecutan en el paso 8. Nada de esto se ha aplicado todavía.

- Proyecto Supabase: `xrnwnjcnqqbcqqudlzal` (región `us-west-2`).
- Sitio: `https://asesoriamicroempresarialsas.pages.dev`.

Todo lo que lleve un secreto se ejecuta en una PowerShell aparte, nunca se pega en un chat ni se guarda en el repositorio.

## 0. Antes de empezar

- [ ] La rama que se va a desplegar tiene `npm run typecheck`, `npm run lint`, `npm test` y `npm run build` en verde.
- [ ] El proyecto local está enlazado: `npx supabase link --project-ref xrnwnjcnqqbcqqudlzal`.
- [ ] El widget de Cloudflare Turnstile está creado (ver el paso 4). Tienes a mano la **site key** y la **secret key**.
- [ ] **Revisión legal hecha** (paso 5):
  - Un abogado revisó `/politica-de-datos`, `/terminos` y el texto de la casilla de autorización.
  - En `src/config/legal.ts` no queda ningún `[COMPLETAR]`: `grep -rn "COMPLETAR" src` no debe devolver nada.
  - Si el abogado cambia la política, actualiza `PRIVACY_POLICY_VERSION`.

## 1. Respaldo

```bash
npx supabase db dump --linked --data-only -f respaldo-antes-lanzamiento.sql
```

Guarda el archivo fuera del repositorio. Contiene datos personales: mensajes y visitas.

## 2. Migraciones (pasos 3 y 4)

```bash
npx supabase db push --dry-run
```

Debe listar solo estas migraciones, en este orden:

1. `20261021000000_estadisticas.sql`: funciones de estadísticas y filtro de bots (paso 3).
2. `20261022000000_seguridad.sql`: límites de abuso, `contact_messages` y `contact_rate_limit_hit` (paso 4).
3. `20261023000000_legal.sql`: `visitor_id` opcional, prueba de la autorización en `contact_messages` y retención con `pg_cron` (paso 5).

Si aparece otra o falta alguna, detente y revisa. Si todo está bien:

```bash
npx supabase db push
```

**No uses `--include-seed`:** crearía reuniones y testimonios de ejemplo.

La migración legal activa la extensión `pg_cron` y programa dos tareas. Compruébalas en el **SQL Editor**:

```sql
select jobname, schedule, active from cron.job order by 1;
```

Deben aparecer `ame-rate-limits-cada-hora` (`5 * * * *`) y `ame-retencion-diaria` (`15 8 * * *`), las dos activas.

## 3. Textos del sitio (`site_content`)

En el **SQL Editor**, ejecuta **solo** el primer bloque de `supabase/seed.sql`: el `insert into public.site_content … on conflict (section_key) do update …`.

- Debe responder `INSERT 0 7`: actualiza los 6 textos de ejemplo de Lovable y crea `home_about`.
- No ejecutes el resto del seed.

## 4. Turnstile y Edge Function `contact`

### 4.1 Widget en Cloudflare

Si aún no existe, créalo en **Cloudflare → Turnstile → Add widget**:

- **Widget name:** `AME contacto`
- **Hostnames:** `asesoriamicroempresarialsas.pages.dev` (y el dominio propio, si ya hay uno)
- **Widget mode:** Managed
- **Pre-clearance:** No

### 4.2 Secretos de la función

```powershell
npx supabase secrets set TURNSTILE_SECRET_KEY=<secret key de Turnstile> ALLOWED_ORIGINS=https://asesoriamicroempresarialsas.pages.dev ALLOWED_HOSTNAMES=asesoriamicroempresarialsas.pages.dev
npx supabase secrets list
```

`secrets list` muestra solo los nombres y un resumen. Comprueba que estén los tres.

### 4.3 Desplegar la función

```bash
npx supabase functions deploy contact
```

`supabase/config.toml` ya tiene `verify_jwt = false` para `contact`. La función es pública; la protegen Turnstile, el límite por IP y la lista de orígenes.

## 5. Auth en el panel de Supabase

- [ ] **Authentication → Sign In / Providers:** **Allow new users to sign up** desactivado y el proveedor **Email** activado. Ya se verificó en el paso 2; confírmalo.
- [ ] **Authentication → Providers → Email:** contraseña mínima de 12 caracteres, con mayúsculas, minúsculas y números (paso 4).
- [ ] **Authentication → URL Configuration:**
  - Site URL: `https://asesoriamicroempresarialsas.pages.dev`
  - Redirect URLs: `https://asesoriamicroempresarialsas.pages.dev/login` y `http://localhost:8080/login`
- [ ] **Login con Google** (pendiente desde el paso 2): sigue `docs/supabase.md`, sección 5, si se quiere activar en el lanzamiento.

## 6. Variables de Cloudflare Pages

En **Workers & Pages → el proyecto → Settings → Variables and Secrets**, para *Production*:

| Variable | Valor |
|---|---|
| `VITE_SUPABASE_URL` | `https://xrnwnjcnqqbcqqudlzal.supabase.co`. Obligatoria: sin ella el build falla, porque la usa la CSP. |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Publishable key de Supabase (Project Settings → API Keys). Nunca la secret. |
| `VITE_SITE_URL` | `https://asesoriamicroempresarialsas.pages.dev` |
| `VITE_TURNSTILE_SITE_KEY` | Site key del widget. Sin ella se usa la clave de prueba y el formulario falla. |

Configuración de build: comando `npm run build`, directorio de salida `dist`. El build genera `dist/_headers` con las cabeceras de seguridad.

## 7. Desplegar el frontend

Haz merge de la rama final a `main` y despliega en Cloudflare Pages. El orden de las secciones 2 a 6 importa: el frontend nuevo usa las funciones SQL y la Edge Function, y el sitio actual sigue funcionando mientras tanto.

## 8. Verificaciones

### 8.1 Cabeceras

```bash
curl -sI https://asesoriamicroempresarialsas.pages.dev | grep -iE "content-security-policy|strict-transport|x-content-type|referrer-policy|permissions-policy|x-frame-options"
```

Deben aparecer las seis. La CSP debe nombrar `https://xrnwnjcnqqbcqqudlzal.supabase.co`.

### 8.2 Sitio público

- [ ] Inicio y Empresa muestran los textos de `site_content`, con "microempresa" resaltada en el hero.
- [ ] La consola del navegador no muestra violaciones de CSP en Inicio, Contacto ni el panel.
- [ ] En una ventana privada aparece el aviso de cookies. **Rechazar** lo cierra y solo deja `ame_consent` en localStorage (DevTools → Application).
- [ ] En Contacto, "Ver mapa" pide permiso si no aceptaste Mapas; con permiso carga el mapa. Antes no hay peticiones a Google.
- [ ] El pie de página enlaza a `/politica-de-datos`, `/terminos` y "Preferencias de cookies", y `https://asesoriamicroempresarialsas.pages.dev/sitemap.xml` incluye las dos páginas.

### 8.3 Estadísticas (SQL Editor)

```sql
select * from public.page_view_totals('2026-04-01', current_date);
select count(*) filter (where public.is_bot_user_agent(user_agent)) as bots, count(*) as total
from public.page_views;
```

Las visitas del primer resultado deben ser el total menos los bots. Al importar había 159 visitas y unas 16 de bots.

### 8.4 La IP llega al límite por IP

Visita el sitio una vez y ejecuta:

```sql
select bucket, count(*) from private.rate_limits group by 1;
```

Debe aparecer `page_views:ip`. Si solo aparece `page_views:visitor`, la cabecera `cf-connecting-ip` (o `x-real-ip`) no está llegando y el límite por IP no se aplica. En ese caso hay que revisarlo antes de dar el lanzamiento por terminado.

### 8.5 Formulario de contacto

- [ ] Sin marcar la casilla de autorización, el formulario no se envía.
- [ ] Envía un mensaje desde `/contacto`. Debe aparecer "¡Gracias! Recibimos tu mensaje", y en el panel el mensaje muestra la fecha y la versión de la autorización.
- [ ] El mensaje aparece en **/admin → Mensajes**. Márcalo como leído y bórralo.
- [ ] La llamada desde otro origen se rechaza:

  ```bash
  curl -s -X POST https://xrnwnjcnqqbcqqudlzal.supabase.co/functions/v1/contact -H "Origin: https://evil.example" -H "Content-Type: application/json" -d "{}"
  ```

  Debe responder `{"error":"Origen no permitido."}`.

### 8.6 Panel

- [ ] `/admin` sin sesión redirige a `/login`.
- [ ] Iniciar sesión, revisar Estadísticas y descargar un CSV.
- [ ] Después de 30 minutos sin actividad, la sesión se cierra y `/login` lo avisa.

## 9. Después del lanzamiento

- Pausar o borrar el proyecto viejo de Lovable Cloud (`dddqlypayckwzytnmzem`) cuando ya no haga falta.
- Borrar `scripts/migrar-desde-lovable.mjs`.
- Activar en GitHub las alertas de Dependabot: **Settings → Code security**.
