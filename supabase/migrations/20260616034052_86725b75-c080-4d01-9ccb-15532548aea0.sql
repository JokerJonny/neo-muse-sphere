-- 1. Extend tracks with classification + ranking fields
ALTER TABLE public.tracks
  ADD COLUMN IF NOT EXISTS is_short boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS view_count bigint NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS like_count bigint NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS published_at timestamptz;

UPDATE public.tracks
  SET is_short = true
  WHERE youtube_id IS NOT NULL AND duration_seconds IS NOT NULL AND duration_seconds <= 60 AND is_short = false;

UPDATE public.tracks
  SET published_at = created_at
  WHERE published_at IS NULL;

-- 2. YouTube playlists
CREATE TABLE IF NOT EXISTS public.youtube_playlists (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  youtube_playlist_id text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  artwork_url text,
  item_count integer NOT NULL DEFAULT 0,
  published_at timestamptz,
  sort_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.youtube_playlists TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.youtube_playlists TO authenticated;
GRANT ALL ON public.youtube_playlists TO service_role;

ALTER TABLE public.youtube_playlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published playlists are viewable by everyone"
  ON public.youtube_playlists FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can manage playlists"
  ON public.youtube_playlists FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_youtube_playlists_updated_at
  BEFORE UPDATE ON public.youtube_playlists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. YouTube playlist items
CREATE TABLE IF NOT EXISTS public.youtube_playlist_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id uuid NOT NULL REFERENCES public.youtube_playlists(id) ON DELETE CASCADE,
  youtube_id text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  title text NOT NULL DEFAULT 'Untitled',
  artwork_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (playlist_id, youtube_id)
);

CREATE INDEX IF NOT EXISTS idx_youtube_playlist_items_playlist ON public.youtube_playlist_items(playlist_id);

GRANT SELECT ON public.youtube_playlist_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.youtube_playlist_items TO authenticated;
GRANT ALL ON public.youtube_playlist_items TO service_role;

ALTER TABLE public.youtube_playlist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Playlist items are viewable by everyone"
  ON public.youtube_playlist_items FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage playlist items"
  ON public.youtube_playlist_items FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));