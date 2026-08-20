-- 1. Validate anonymous page view inserts
DROP POLICY IF EXISTS "Anyone can insert page views" ON public.page_views;
CREATE POLICY "Visitors can log valid page views"
ON public.page_views FOR INSERT TO anon, authenticated
WITH CHECK (
  visitor_id ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
  AND page ~ '^/[A-Za-z0-9/_-]*$'
  AND length(page) <= 128
  AND (user_agent IS NULL OR length(user_agent) <= 512)
);

-- 2. Split public read policies so anon never evaluates is_admin()
DROP POLICY IF EXISTS "Anyone can view published meetings" ON public.meetings;
CREATE POLICY "Anon can view published meetings"
ON public.meetings FOR SELECT TO anon USING (published = true);
CREATE POLICY "Users can view published meetings or admins all"
ON public.meetings FOR SELECT TO authenticated
USING (published = true OR is_admin(auth.uid()));

DROP POLICY IF EXISTS "Anyone can view published testimonials" ON public.testimonials;
CREATE POLICY "Anon can view published testimonials"
ON public.testimonials FOR SELECT TO anon USING (is_published = true);
CREATE POLICY "Users can view published testimonials or admins all"
ON public.testimonials FOR SELECT TO authenticated
USING (is_published = true OR is_admin(auth.uid()));

-- 3. Restrict SECURITY DEFINER function execution
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- 4. Storage: no broad listing/reading of the bucket
DROP POLICY IF EXISTS "Anyone can view meeting images" ON storage.objects;

CREATE POLICY "Anon can view published content images"
ON storage.objects FOR SELECT TO anon
USING (
  bucket_id = 'meeting-images'
  AND (
    EXISTS (SELECT 1 FROM public.meetings m WHERE m.published = true AND m.image_url LIKE '%' || storage.objects.name)
    OR EXISTS (SELECT 1 FROM public.testimonials t WHERE t.is_published = true AND t.image_url LIKE '%' || storage.objects.name)
  )
);

CREATE POLICY "Users can view published content images or admins all"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'meeting-images'
  AND (
    is_admin(auth.uid())
    OR EXISTS (SELECT 1 FROM public.meetings m WHERE m.published = true AND m.image_url LIKE '%' || storage.objects.name)
    OR EXISTS (SELECT 1 FROM public.testimonials t WHERE t.is_published = true AND t.image_url LIKE '%' || storage.objects.name)
  )
);