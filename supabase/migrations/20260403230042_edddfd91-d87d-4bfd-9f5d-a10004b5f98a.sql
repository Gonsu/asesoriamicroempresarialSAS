
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check admin role
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'admin'
  )
$$;

-- RLS for user_roles
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Create meetings table
CREATE TABLE public.meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  meeting_date TIMESTAMP WITH TIME ZONE,
  image_url TEXT,
  type TEXT NOT NULL DEFAULT 'reunion' CHECK (type IN ('reunion', 'asesoria')),
  published BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

-- Public can view published meetings
CREATE POLICY "Anyone can view published meetings"
  ON public.meetings FOR SELECT
  USING (published = true OR public.is_admin(auth.uid()));

-- Only admins can insert
CREATE POLICY "Admins can create meetings"
  ON public.meetings FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

-- Only admins can update
CREATE POLICY "Admins can update meetings"
  ON public.meetings FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Only admins can delete
CREATE POLICY "Admins can delete meetings"
  ON public.meetings FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_meetings_updated_at
  BEFORE UPDATE ON public.meetings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for meeting images
INSERT INTO storage.buckets (id, name, public) VALUES ('meeting-images', 'meeting-images', true);

CREATE POLICY "Anyone can view meeting images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'meeting-images');

CREATE POLICY "Admins can upload meeting images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'meeting-images' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can update meeting images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'meeting-images' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete meeting images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'meeting-images' AND public.is_admin(auth.uid()));
