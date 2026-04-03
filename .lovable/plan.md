## Plan: Panel Admin Avanzado

### 1. Base de datos
- **Tabla `site_content`**: Para almacenar textos editables de cada sección (Hero, About, Services, WhyUs, CTA) con campos: `section_key`, `title`, `subtitle`, `description`, `image_url`
- **Tabla `page_views`**: Para rastrear visitas con campos: `page`, `visitor_id` (anónimo), `created_at`
- RLS: lectura pública para `site_content`, solo admin puede editar. Inserción pública para `page_views`.

### 2. Tracking de visitas
- Componente invisible que registra cada visita a la página en `page_views`
- Genera un ID anónimo por sesión para contar visitantes únicos

### 3. Panel Admin - Dashboard de estadísticas
- Total reuniones/asesorías (creadas, publicadas, por tipo)
- Gráficos de visitas por mes/semana
- Visitantes únicos vs total de visitas

### 4. Panel Admin - Editor de contenido
- Formularios para editar títulos, descripciones e imágenes de cada sección
- Las secciones públicas leerán de `site_content` en vez de texto hardcoded

### 5. Generación de reporte Excel
- Botón en el dashboard para generar reporte mensual/anual
- Incluye: totales por mes, reuniones por tipo, tendencias de visitas
- Se genera en el cliente usando una librería como `xlsx`

### Orden de implementación
1. Migraciones de BD (site_content + page_views)
2. Tracking de visitas
3. Dashboard de estadísticas  
4. Editor de contenido + actualizar secciones públicas
5. Generación de Excel
