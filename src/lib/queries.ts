import { supabase } from "@/integrations/supabase/client";
import type { Track, Album, SortMode, YouTubePlaylist } from "@/lib/types";

/**
 * Public-safe column list for tracks. The private storage path (`file_path`)
 * is intentionally excluded — clients only need the `has_file` indicator to
 * know whether a track is downloadable. The real path is read server-side
 * (via the admin client) when generating signed stream/download URLs.
 */
const TRACK_COLUMNS =
  "id,title,slug,artist,album_id,duration_seconds,genres,youtube_id,spotify_id,source,preview_url,artwork_url,description,price_cents,is_purchasable,is_published,plays,featured,sort_order,created_at,updated_at,is_short,view_count,like_count,published_at,has_file";

async function fetchVideoTracks(isShort: boolean, sort: SortMode): Promise<Track[]> {
  let q = supabase
    .from("tracks")
    .select(TRACK_COLUMNS)
    .eq("is_published", true)
    .eq("is_short", isShort)
    .not("youtube_id", "is", null);

  if (sort === "popular") {
    q = q.order("view_count", { ascending: false });
  } else if (sort === "oldest") {
    q = q.order("published_at", { ascending: true, nullsFirst: false });
  } else {
    q = q
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });
  }

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as Track[];
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
    .select(TRACK_COLUMNS)
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
  return (data ?? []) as Track[];
}

/** Fetch the entire published catalog (title + description + metadata) for
 * client-side neoVIBE matching across all content. */
export async function fetchCatalogForVibes(): Promise<Track[]> {
  const { data, error } = await supabase
    .from("tracks")
    .select(TRACK_COLUMNS)
    .eq("is_published", true)
    .order("view_count", { ascending: false, nullsFirst: false })
    .limit(1000);
  if (error) throw error;
  return (data ?? []) as Track[];
}

export async function fetchFeaturedTracks(): Promise<Track[]> {
  const { data, error } = await supabase
    .from("tracks")
    .select(TRACK_COLUMNS)
    .eq("is_published", true)
    .eq("featured", true)
    .limit(8);
  if (error) throw error;
  return (data ?? []) as Track[];
}

export async function fetchLatestTracks(limit = 6): Promise<Track[]> {
  const { data, error } = await supabase
    .from("tracks")
    .select(TRACK_COLUMNS)
    .eq("is_published", true)
    .eq("is_short", false)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as Track[];
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
  return fetchVideoTracks(false, sort);
}

/** Vertical Shorts only. */
export async function fetchShorts(sort: SortMode = "newest"): Promise<Track[]> {
  return fetchVideoTracks(true, sort);
}


/** Most-viewed videos in the neoUNIVERSE. */
export async function fetchTrending(limit = 8): Promise<Track[]> {
  const { data, error } = await supabase
    .from("tracks")
    .select(TRACK_COLUMNS)
    .eq("is_published", true)
    .not("youtube_id", "is", null)
    .order("view_count", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as Track[];
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

/** Build a playable Track from a raw YouTube playlist item (for release songs
 * that live on the Topic channel and aren't in the tracks library). */
function synthesizeTrack(item: {
  youtube_id: string;
  title: string | null;
  artwork_url: string | null;
}): Track {
  const now = new Date().toISOString();
  return {
    id: `yt-${item.youtube_id}`,
    title: item.title ?? "Untitled",
    slug: null,
    artist: "neoSHADE",
    album_id: null,
    duration_seconds: null,
    genres: [],
    youtube_id: item.youtube_id,
    spotify_id: null,
    source: "youtube",
    file_path: null,
    has_file: false,
    preview_url: null,
    artwork_url: item.artwork_url,
    description: null,
    price_cents: 0,
    is_purchasable: false,
    is_published: true,
    plays: 0,
    featured: false,
    sort_order: 0,
    created_at: now,
    updated_at: now,
    is_short: false,
    view_count: 0,
    like_count: 0,
    published_at: null,
  };
}

/** Returns the tracks belonging to a playlist, ordered by playlist position.
 * Uses real library tracks when available, otherwise synthesizes a playable
 * track from the stored playlist item so every release plays in full. */
export async function fetchPlaylistTracks(playlistId: string): Promise<Track[]> {
  const { data: items, error } = await supabase
    .from("youtube_playlist_items")
    .select("youtube_id, position, title, artwork_url")
    .eq("playlist_id", playlistId)
    .order("position", { ascending: true });
  if (error) throw error;
  const validItems = (items ?? []).filter((i) => i.youtube_id);
  if (!validItems.length) return [];

  const ids = validItems.map((i) => i.youtube_id);
  const { data: tracks, error: tErr } = await supabase
    .from("tracks")
    .select(TRACK_COLUMNS)
    .in("youtube_id", ids)
    .eq("is_published", true);
  if (tErr) throw tErr;

  const byId = new Map<string, Track>();
  for (const t of (tracks ?? []) as Track[]) if (t.youtube_id) byId.set(t.youtube_id, t);

  const ordered: Track[] = [];
  for (const it of validItems) {
    const existing = byId.get(it.youtube_id);
    ordered.push(existing ?? synthesizeTrack(it));
  }
  return ordered;
}

export async function fetchTrack(id: string): Promise<Track | null> {
  const { data, error } = await supabase
    .from("tracks")
    .select(TRACK_COLUMNS)
    .eq("id", id)
    .eq("is_published", true)
    .maybeSingle();
  if (error) throw error;
  return (data as Track | null) ?? null;
}
