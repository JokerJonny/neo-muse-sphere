
-- Lock down SECURITY DEFINER functions from direct API calls (still usable in RLS/triggers)
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;

-- Storage policies: admins manage track files
CREATE POLICY "Admins manage track files" ON storage.objects FOR ALL
  USING (bucket_id = 'track-files' AND public.has_role(auth.uid(),'admin'))
  WITH CHECK (bucket_id = 'track-files' AND public.has_role(auth.uid(),'admin'));

-- Storage policies: admins manage artwork
CREATE POLICY "Admins manage artwork" ON storage.objects FOR ALL
  USING (bucket_id = 'artwork' AND public.has_role(auth.uid(),'admin'))
  WITH CHECK (bucket_id = 'artwork' AND public.has_role(auth.uid(),'admin'));
