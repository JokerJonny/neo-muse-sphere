import { supabase } from "@/integrations/supabase/client";
import type { Track, Album, SortMode, YouTubePlaylist } from "@/lib/types";

type Query = ReturnType<ReturnType<typeof supabase.from<"tracks">>["select"]>;

function applySort<T extends { order: Query["order"] }>(q: T, sort: SortMode): T {
  switch (sort) {
    case "popular":
      // @ts-expect-error chained builder typing
      return q.order("view_count", { ascending: false }).order("published_at", {
        ascending: false,
        nullsFirst: false,
      });
    case "oldest":
      // @ts-expect-error chained builder typing
      return q.order("published_at", { ascending: true, nullsFirst: false });
    case "newest":
    default:
      // @ts-expect-error chained builder typing
      return q.order("published_at", { ascending: false, nullsFirst: false }).order(
        "created_at",
        { ascending: false },
      );
  }
}

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
    .eq("is_short", false)
    .order("published_at", { ascending: false, nullsFirst: false })
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

/** Long-form videos only (excludes Shorts). */
export async function fetchVideos(sort: SortMode = "newest"): Promise<Track[]> {
  const q = supabase
    .from("tracks")
    .select("*")
    .eq("is_published", true)
    .eq("is_short", false)
    .not("youtube_id", "is", null);
  const { data, error } = await applySort(q, sort);
  if (error) throw error;
  return data ?? [];
}

/** Vertical Shorts only. */
export async function fetchShorts(sort: SortMode = "newest"): Promise<Track[]> {
  const q = supabase
    .from("tracks")
    .select("*")
    .eq("is_published", true)
    .eq("is_short", true)
    .not("youtube_id", "is", null);
  const { data, error } = await applySort(q, sort);
  if (error) throw error;
  return data ?? [];
}

/** Most-viewed videos in the neoUNIVERSE. */
export async function fetchTrending(limit = 8): Promise<Track[]> {
  const { data, error } = await supabase
    .from("tracks")
    .select("*")
    .eq("is_published", true)
    .not("youtube_id", "is", null)
    .order("view_count", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function fetchYouTubePlaylists(): Promise<YouTubePlaylist[]> {
  const { data, error } = await supabase
    .from("youtube_playlists")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("published_at", { ascending: false, nullsFirst: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchPlaylist(id: string): Promise<YouTubePlaylist | null> {
  const { data, error } = await supabase
    .from("youtube_playlists")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/** Returns the tracks belonging to a playlist, ordered by playlist position. */
export async function fetchPlaylistTracks(playlistId: string): Promise<Track[]> {
  const { data: items, error } = await supabase
    .from("youtube_playlist_items")
    .select("youtube_id, position")
    .eq("playlist_id", playlistId)
    .order("position", { ascending: true });
  if (error) throw error;
  const ids = (items ?? []).map((i) => i.youtube_id).filter(Boolean);
  if (!ids.length) return [];

  const { data: tracks, error: tErr } = await supabase
    .from("tracks")
    .select("*")
    .in("youtube_id", ids)
    .eq("is_published", true);
  if (tErr) throw tErr;

  const byId = new Map<string, Track>();
  for (const t of tracks ?? []) if (t.youtube_id) byId.set(t.youtube_id, t);

  const ordered: Track[] = [];
  for (const it of items ?? []) {
    const t = it.youtube_id ? byId.get(it.youtube_id) : undefined;
    if (t) ordered.push(t);
  }
  return ordered;
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
