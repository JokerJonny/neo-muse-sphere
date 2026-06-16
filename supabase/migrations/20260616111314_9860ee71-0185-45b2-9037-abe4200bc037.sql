
-- 1. Add a safe indicator column so the client can tell which tracks have a
--    downloadable file WITHOUT exposing the private storage path.
ALTER TABLE public.tracks
  ADD COLUMN IF NOT EXISTS has_file boolean
  GENERATED ALWAYS AS (file_path IS NOT NULL) STORED;

-- 2. Stop exposing the private storage path (file_path) to anon/authenticated.
--    Replace table-wide SELECT with column-level grants that exclude file_path.
REVOKE SELECT ON public.tracks FROM anon;
REVOKE SELECT ON public.tracks FROM authenticated;

GRANT SELECT (
  id, title, slug, artist, album_id, duration_seconds, genres, youtube_id,
  spotify_id, source, preview_url, artwork_url, description, price_cents,
  is_purchasable, is_published, plays, featured, sort_order, created_at,
  updated_at, is_short, view_count, like_count, published_at, has_file
) ON public.tracks TO anon, authenticated;

-- service_role keeps full access for server-side functions.
GRANT ALL ON public.tracks TO service_role;

-- 3. Restrict YouTube playlist items to those whose parent playlist is published.
DROP POLICY IF EXISTS "Playlist items are viewable by everyone" ON public.youtube_playlist_items;

CREATE POLICY "Published playlist items viewable by everyone"
ON public.youtube_playlist_items
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.youtube_playlists p
    WHERE p.id = youtube_playlist_items.playlist_id
      AND p.is_published = true
  )
);
