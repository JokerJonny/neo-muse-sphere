REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;

DROP POLICY IF EXISTS "Published tracks viewable by all" ON public.tracks;
DROP POLICY IF EXISTS "Admins manage tracks" ON public.tracks;

CREATE POLICY "Published tracks viewable by all"
  ON public.tracks FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

CREATE POLICY "Admins view all tracks"
  ON public.tracks FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage tracks"
  ON public.tracks FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));