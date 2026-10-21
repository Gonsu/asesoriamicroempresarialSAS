-- Contenido inicial de ejemplo. Se carga con `supabase start` y `supabase db reset` (local).
-- En producción solo se aplica si se pide expresamente (`supabase db push --include-seed`).
-- No crea usuarios: el primer administrador se invita o se crea a mano (docs/supabase.md).

insert into public.site_content (section_key, title, subtitle, description) values
  ('hero', 'AME S.A.S.', 'Asesorías y Reuniones Empresariales', 'Soluciones profesionales para el crecimiento de tu empresa'),
  ('about', 'Quiénes Somos', null, 'Somos una empresa dedicada a brindar asesorías y servicios empresariales de alta calidad.'),
  ('services', 'Nuestros Servicios', null, 'Ofrecemos una amplia gama de servicios profesionales'),
  ('whyus', '¿Por Qué Elegirnos?', null, 'Experiencia y compromiso con tu éxito empresarial'),
  ('cta', '¿Listo para empezar?', null, 'Contáctanos hoy y lleva tu empresa al siguiente nivel'),
  ('footer', 'AME S.A.S.', null, 'Asesorías y Reuniones Empresariales')
on conflict (section_key) do nothing;

insert into public.meetings (title, description, meeting_date, type, published) values
  ('Taller de finanzas para microempresas',
   'Sesión práctica sobre flujo de caja, control de gastos y separación de cuentas personales y del negocio.',
   now() - interval '20 days', 'reunion', true),
  ('Asesoría en formalización empresarial',
   'Acompañamiento en el registro mercantil, RUT y obligaciones tributarias básicas.',
   now() - interval '7 days', 'asesoria', true),
  ('Reunión de planeación (borrador)',
   'Ejemplo de registro no publicado: solo lo ven los administradores.',
   now() + interval '10 days', 'reunion', false);

insert into public.testimonials (name, business_type, content, is_published) values
  ('María Fernanda R.', 'Tienda de ropa',
   'Gracias a la asesoría financiera ordené las cuentas de mi negocio y ahora sé cuánto gano realmente.', true),
  ('Carlos A. Peñaranda', 'Panadería',
   'Me ayudaron con la formalización y con el manejo del inventario. Muy recomendados.', true),
  ('Testimonio de ejemplo', 'Borrador',
   'Este testimonio no está publicado y no debe verse en el sitio.', false);
