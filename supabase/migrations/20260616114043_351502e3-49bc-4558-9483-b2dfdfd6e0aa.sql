DROP POLICY IF EXISTS "Published albums viewable by all" ON public.albums;
DROP POLICY IF EXISTS "Admins manage albums" ON public.albums;

CREATE POLICY "Published albums viewable by all"
ON public.albums FOR SELECT TO anon, authenticated
USING (is_published = true);

CREATE POLICY "Admins view all albums"
ON public.albums FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage albums"
ON public.albums FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));