DROP INDEX IF EXISTS public.tracks_youtube_id_key;
ALTER TABLE public.tracks ADD CONSTRAINT tracks_youtube_id_key UNIQUE (youtube_id);