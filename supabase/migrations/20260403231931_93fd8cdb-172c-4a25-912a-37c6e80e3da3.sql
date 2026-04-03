
-- Table for editable site content
CREATE TABLE public.site_content (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key text NOT NULL UNIQUE,
  title text,
  subtitle text,
  description text,
  image_url text,
  extra_data jsonb DEFAULT '{}'::jsonb,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view site content"
ON public.site_content FOR SELECT TO public
USING (true);

CREATE POLICY "Admins can insert site content"
ON public.site_content FOR INSERT TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update site content"
ON public.site_content FOR UPDATE TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete site content"
ON public.site_content FOR DELETE TO authenticated
USING (public.is_admin(auth.uid()));

CREATE TRIGGER update_site_content_updated_at
BEFORE UPDATE ON public.site_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default content for each section
INSERT INTO public.site_content (section_key, title, subtitle, description) VALUES
('hero', 'AME S.A.S.', 'Asesorías y Reuniones Empresariales', 'Soluciones profesionales para el crecimiento de tu empresa'),
('about', 'Quiénes Somos', NULL, 'Somos una empresa dedicada a brindar asesorías y servicios empresariales de alta calidad.'),
('services', 'Nuestros Servicios', NULL, 'Ofrecemos una amplia gama de servicios profesionales'),
('whyus', '¿Por Qué Elegirnos?', NULL, 'Experiencia y compromiso con tu éxito empresarial'),
('cta', '¿Listo para empezar?', NULL, 'Contáctanos hoy y lleva tu empresa al siguiente nivel'),
('footer', 'AME S.A.S.', NULL, 'Asesorías y Reuniones Empresariales');

-- Table for page view tracking
CREATE TABLE public.page_views (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page text NOT NULL DEFAULT '/',
  visitor_id text NOT NULL,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert page views"
ON public.page_views FOR INSERT TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can view page views"
ON public.page_views FOR SELECT TO authenticated
USING (public.is_admin(auth.uid()));

-- Index for efficient analytics queries
CREATE INDEX idx_page_views_created_at ON public.page_views (created_at);
CREATE INDEX idx_page_views_visitor_id ON public.page_views (visitor_id);
