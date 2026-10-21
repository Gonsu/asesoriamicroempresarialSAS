-- Contenido inicial de ejemplo. Se carga con `supabase start` y `supabase db reset` (local).
-- En producción solo se aplica si se pide expresamente (`supabase db push --include-seed`).
-- No crea usuarios: el primer administrador se invita o se crea a mano (docs/supabase.md).

-- Textos reales del sitio: los mismos de src/features/content/defaults.ts (lo comprueba
-- content.test.ts). Es un upsert, así que este bloque también sirve para actualizar
-- producción desde el SQL Editor.
insert into public.site_content (section_key, subtitle, title, description, extra_data) values
  ('hero',
   'Asesoría Microempresarial desde 2016',
   'Impulsamos el crecimiento de tu microempresa',
   'Servicios financieros, administrativos y de consultoría para pequeños empresarios en Norte de Santander.',
   '{"highlight": "microempresa"}'),
  ('home_about',
   'Quiénes somos',
   'Asesoría Microempresarial S.A.S.',
   E'Somos una sociedad comercial de economía privada, constituida conforme a las leyes de Colombia, dedicada a impulsar el crecimiento de la microempresa en Norte de Santander.\n\nNuestro equipo está conformado por profesionales con amplia trayectoria en el sector financiero y empresarial.',
   '{}'),
  ('about',
   'Quiénes somos',
   'Asesoría Microempresarial S.A.S.',
   E'Somos una sociedad comercial de economía privada, constituida conforme a las leyes de la República de Colombia. Nuestro equipo está conformado por profesionales con amplia trayectoria en el sector financiero y empresarial.\n\nDesde nuestra fundación hemos trabajado para democratizar el acceso a servicios de consultoría de calidad para pequeños y medianos empresarios de la región.',
   '{}'),
  ('services',
   'Lo que ofrecemos',
   'Servicios diseñados para tu negocio',
   'Soluciones financieras, administrativas y de consultoría para cada etapa de tu empresa.',
   '{}'),
  ('whyus',
   '¿Por qué elegirnos?',
   'Una empresa con propósito y valores sólidos',
   'Fundada bajo los principios de servicio, respeto y compromiso, Asesoría Microempresarial S.A.S. trabaja para ser el aliado estratégico de la microempresa colombiana, impulsando el crecimiento económico y social en Norte de Santander.',
   '{}'),
  ('cta',
   '¿Listo para empezar?',
   'Lleva tu empresa al siguiente nivel',
   'Nuestro equipo de asesores está disponible para atenderte y diseñar una estrategia personalizada para tu negocio.',
   '{}'),
  ('footer',
   null,
   'AME S.A.S. — Asesoría Microempresarial',
   'Todos los derechos reservados',
   '{}')
on conflict (section_key) do update set
  subtitle = excluded.subtitle,
  title = excluded.title,
  description = excluded.description,
  extra_data = excluded.extra_data;

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
