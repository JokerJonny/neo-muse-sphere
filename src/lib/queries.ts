import { supabase } from "@/integrations/supabase/client";
import type { Track, Album } from "@/lib/types";

export async function fetchTracks(opts?: {
  search?: string;
  genre?: string;
  hasVideo?: boolean;
  albumId?: string;
  limit?: number;
}): Promise<Track[]> {
  let q = supabase
    .from("tracks")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (opts?.search) q = q.ilike("title", `%${opts.search}%`);
  if (opts?.genre) q = q.contains("genres", [opts.genre]);
  if (opts?.albumId) q = q.eq("album_id", opts.albumId);
  if (opts?.hasVideo) q = q.not("youtube_id", "is", null);
  if (opts?.limit) q = q.limit(opts.limit);

  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function fetchFeaturedTracks(): Promise<Track[]> {
  const { data, error } = await supabase
    .from("tracks")
    .select("*")
    .eq("is_published", true)
    .eq("featured", true)
    .limit(8);
  if (error) throw error;
  return data ?? [];
}

export async function fetchLatestTracks(limit = 6): Promise<Track[]> {
  const { data, error } = await supabase
    .from("tracks")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function fetchAlbums(): Promise<Album[]> {
  const { data, error } = await supabase
    .from("albums")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("release_date", { ascending: false, nullsFirst: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchVideos(): Promise<Track[]> {
  const { data, error } = await supabase
    .from("tracks")
    .select("*")
    .eq("is_published", true)
    .not("youtube_id", "is", null)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchTrack(id: string): Promise<Track | null> {
  const { data, error } = await supabase
    .from("tracks")
    .select("*")
    .eq("id", id)
    .eq("is_published", true)
    .maybeSingle();
  if (error) throw error;
  return data;
}
