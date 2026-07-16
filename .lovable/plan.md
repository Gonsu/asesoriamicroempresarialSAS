
# Plan: Rediseño corporativo multipágina — AME S.A.S.

## 1. Nueva estructura de rutas (React Router)

Rutas nuevas en `src/App.tsx`:

- `/` → Inicio
- `/empresa` → Nuestra Empresa
- `/servicios` → Servicios
- `/reuniones` → Reuniones
- `/contacto` → Contacto

Cada ruta será una página independiente en `src/pages/`. El `Header` y `Footer` se moverán a un componente `Layout.tsx` compartido que envuelve las rutas mediante `<Outlet />`, garantizando header fijo y consistente.

Eliminar la navegación por anclas (`#services`, `#about`, etc.) — los enlaces del menú usarán `<NavLink>` de React Router, con clase activa aplicada automáticamente.

## 2. Reorganización del contenido

**Inicio (`/`)** — versión reducida:
- Hero (simplificado)
- Resumen corto de la empresa (2-3 líneas + botón "Conoce más" → `/empresa`)
- 3 servicios destacados (grid resumido con botón "Ver todos" → `/servicios`)
- CTA final

**Empresa (`/empresa`)** — consolidación de:
- Quiénes somos (About)
- Historia (nueva sección breve)
- Misión, Visión, Objetivos, Comité Asesor, Valores (mover `CompanyDetails` + info existente)

**Servicios (`/servicios`)**:
- Grid completo con todos los servicios (imagen, descripción larga, botón "Solicitar información" → WhatsApp)

**Reuniones (`/reuniones`)**:
- Reutiliza el componente `Meetings` existente (lee desde la BD)

**Contacto (`/contacto`)**:
- Información de contacto (teléfono, correo, dirección)
- Formulario simple (nombre, correo, mensaje) — envío por `mailto:` inicialmente (sin backend nuevo)
- Mapa embebido de Google Maps (usando `<iframe>` de maps.google.com/embed, que sí es permitido — no confundir con embeber redes sociales)
- Íconos de redes sociales

## 3. Rediseño del Header (más corporativo, menos landing)

- Reducir glassmorphism, transparencias y sombras exageradas.
- Fondo sólido `bg-ame-dark` (sin blur).
- Dropdown "Nuestra empresa" con estilo limpio: fondo sólido, borde fino, sin animaciones largas (transición 150ms).
- Enlaces de menú: peso medium, sin uppercase forzado ni tracking amplio.
- Logo con protagonismo (tamaño actual OK).
- Estado activo: subrayado inferior fino + color primario (en lugar del pill con borde).

## 4. Menú "Nuestra empresa"

Dropdown con enlaces a **secciones dentro de `/empresa`**:
- Quiénes somos → `/empresa#quienes`
- Misión y Visión → `/empresa#mision`
- Objetivos → `/empresa#objetivos`
- Comité asesor → `/empresa#comite`

Scroll suave a la sección al llegar.

## 5. Rediseño del Hero

Nueva versión minimalista:
- Título
- Subtítulo (1 párrafo corto)
- 2 botones (Servicios / Contáctenos)
- Imagen principal (mantener carrusel de 3 imágenes de fondo, pero sin panel de estadísticas encima)

Las **estadísticas** se mueven a una sección propia debajo del Hero en Inicio (banda horizontal con 4 números).

## 6. Espaciado

Definir clase utilitaria `section-padding` = `py-20 md:py-24` (~80-100px) y aplicarla consistentemente a todas las secciones. Eliminar `py-20 px-8` inconsistentes.

## 7. Tipografía

Simplificar a 4 niveles en `index.css`:
- `h1` — 2.5rem / 3rem desktop, semibold
- `h2` — 1.75rem / 2rem, semibold
- `p` (texto normal) — 1rem, regular
- `.text-small` — 0.8125rem, regular

Reducir mayúsculas: eliminar `uppercase` y `tracking-[2px]` decorativos en subtítulos ("ASESORÍA MICROEMPRESARIAL", badges, etc.). Mantener capitalización natural.

## 8-9. Enlaces externos y oficiales

Auditar y actualizar todos los enlaces:

| Servicio | URL nueva |
|---|---|
| WhatsApp | `https://wa.me/573168308779` |
| Facebook | `https://www.facebook.com/profile.php?id=100090527183922` |
| Instagram | `https://www.instagram.com/asesoriamsas/` |
| Correo | `mailto:asesoriamsas@gmail.com` |
| Google Maps | `https://maps.google.com/?q=Calle+5+%235+Barrio+Lleras+Cúcuta` |

Todos con `target="_blank" rel="noopener noreferrer"`. Eliminar cualquier intento de embed de redes sociales. El único iframe permitido será el mapa oficial de Google Maps Embed en `/contacto`.

## Archivos afectados

**Nuevos:**
- `src/components/Layout.tsx` (Header + Outlet + Footer + FloatingWhatsApp)
- `src/pages/Empresa.tsx`
- `src/pages/Servicios.tsx`
- `src/pages/Reuniones.tsx`
- `src/pages/Contacto.tsx`
- `src/components/HeroSimple.tsx` (nuevo Hero minimalista)
- `src/components/StatsBand.tsx` (estadísticas movidas)

**Modificados:**
- `src/App.tsx` — nuevas rutas + Layout
- `src/pages/Index.tsx` — versión reducida (Hero + resumen + 3 servicios + CTA)
- `src/components/Header.tsx` — rediseño corporativo, NavLinks a rutas, dropdown limpio
- `src/components/Footer.tsx` — enlaces actualizados
- `src/components/TopBar.tsx` — enlaces actualizados
- `src/components/CTA.tsx` — enlaces + link a `/contacto`
- `src/components/FloatingWhatsApp.tsx` — número corregido a `573168308779`
- `src/index.css` — tipografía y utilitaria `section-padding`
- `src/components/Services.tsx` — variante resumida (3 items) para Inicio

**Sin cambios:**
- Panel admin, autenticación, base de datos (meetings, testimonials, site_content, page_views), RLS. El refactor es puramente frontend.

## Consideración

Los testimonios: no están en el brief del rediseño. Los mantengo en Inicio como sección corta (no en su propia página) salvo que prefieras moverlos a `/empresa` o eliminarlos del refactor.

¿Apruebas este plan para proceder con la implementación?
