import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const HANDLE = "NeoShade-AI";
const API = "https://www.googleapis.com/youtube/v3";

interface YTVideo {
  videoId: string;
  title: string;
  description: string;
  thumbnail: string | null;
  publishedAt: string;
  durationSeconds: number | null;
  viewCount: number;
  likeCount: number;
  isShort: boolean;
}

interface YTPlaylist {
  playlistId: string;
  title: string;
  description: string;
  thumbnail: string | null;
  publishedAt: string;
  official: boolean;
  items: { videoId: string; title: string; thumbnail: string | null; position: number }[];
}

/** YouTube Music album/single playlists (the "Releases" tab) use this prefix. */
function isOfficialRelease(playlistId: string): boolean {
  return playlistId.startsWith("OLAK5uy_") || playlistId.startsWith("RDCLAK5uy_");
}

function parseDuration(iso?: string | null): number | null {
  if (!iso) return null;
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return null;
  const h = Number(m[1] ?? 0);
  const min = Number(m[2] ?? 0);
  const s = Number(m[3] ?? 0);
  return h * 3600 + min * 60 + s;
}

function pickThumb(thumbnails: Record<string, { url?: string }> | undefined): string | null {
  if (!thumbnails) return null;
  return (
    thumbnails.maxres?.url ??
    thumbnails.standard?.url ??
    thumbnails.high?.url ??
    thumbnails.medium?.url ??
    thumbnails.default?.url ??
    null
  );
}

async function ytFetch(path: string, params: Record<string, string>, apiKey: string) {
  const url = new URL(`${API}/${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  url.searchParams.set("key", apiKey);
  const res = await fetch(url.toString());
  const json = await res.json();
  if (!res.ok) {
    const reason = json?.error?.message ?? `YouTube API error (${res.status})`;
    throw new Error(reason);
  }
  return json;
}

async function resolveChannel(apiKey: string): Promise<{ channelId: string; uploads: string }> {
  const byHandle = await ytFetch(
    "channels",
    { part: "contentDetails", forHandle: HANDLE },
    apiKey,
  );
  let channelId = byHandle?.items?.[0]?.id;
  let uploads = byHandle?.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (channelId && uploads) return { channelId, uploads };

  const search = await ytFetch(
    "search",
    { part: "snippet", type: "channel", q: HANDLE, maxResults: "1" },
    apiKey,
  );
  channelId = search?.items?.[0]?.snippet?.channelId;
  if (!channelId) throw new Error(`Could not find a YouTube channel for @${HANDLE}.`);

  const byId = await ytFetch("channels", { part: "contentDetails", id: channelId }, apiKey);
  uploads = byId?.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploads) throw new Error("Could not resolve the channel's uploads playlist.");
  return { channelId, uploads };
}

async function fetchAllVideos(apiKey: string, uploads: string): Promise<YTVideo[]> {
  const items: {
    videoId: string;
    title: string;
    description: string;
    thumbnail: string | null;
    publishedAt: string;
  }[] = [];
  let pageToken: string | undefined;
  do {
    const page = await ytFetch(
      "playlistItems",
      {
        part: "snippet,contentDetails",
        playlistId: uploads,
        maxResults: "50",
        ...(pageToken ? { pageToken } : {}),
      },
      apiKey,
    );
    for (const it of page.items ?? []) {
      const vid = it?.contentDetails?.videoId ?? it?.snippet?.resourceId?.videoId;
      if (!vid) continue;
      items.push({
        videoId: vid,
        title: it.snippet?.title ?? "Untitled",
        description: it.snippet?.description ?? "",
        thumbnail: pickThumb(it.snippet?.thumbnails),
        publishedAt: it.contentDetails?.videoPublishedAt ?? it.snippet?.publishedAt ?? new Date().toISOString(),
      });
    }
    pageToken = page.nextPageToken;
  } while (pageToken);

  // Fetch durations + statistics in batches of 50.
  const meta = new Map<string, { duration: number | null; views: number; likes: number }>();
  for (let i = 0; i < items.length; i += 50) {
    const batch = items.slice(i, i + 50);
    const detail = await ytFetch(
      "videos",
      { part: "contentDetails,statistics", id: batch.map((b) => b.videoId).join(",") },
      apiKey,
    );
    for (const v of detail.items ?? []) {
      meta.set(v.id, {
        duration: parseDuration(v.contentDetails?.duration),
        views: Number(v.statistics?.viewCount ?? 0),
        likes: Number(v.statistics?.likeCount ?? 0),
      });
    }
  }

  return items
    .filter((it) => meta.has(it.videoId))
    .map((it) => {
      const m = meta.get(it.videoId)!;
      const text = `${it.title} ${it.description}`.toLowerCase();
      const isShort =
        (m.duration != null && m.duration <= 60) || /#short(s)?\b/.test(text);
      return {
        ...it,
        durationSeconds: m.duration,
        viewCount: m.views,
        likeCount: m.likes,
        isShort,
      };
    });
}

const SCRAPE_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

/**
 * Scrape the official "Releases" tab (youtube.com/@HANDLE/releases) for album/single
 * playlist IDs (OLAK5uy_…). These are the artist's real albums/singles and are NOT
 * returned by the Data API's playlists.list (they're owned by the generic YouTube
 * channel), so we read them straight off the Releases page, paging through continuations.
 */
async function scrapeReleaseIds(): Promise<string[]> {
  const ids = new Set<string>();
  try {
    const res = await fetch(`https://www.youtube.com/@${HANDLE}/releases`, {
      headers: {
        "User-Agent": SCRAPE_UA,
        "Accept-Language": "en-US,en;q=0.9",
        Cookie: "CONSENT=YES+1; SOCS=CAI",
      },
    });
    const html = await res.text();
    for (const m of html.matchAll(/OLAK5uy_[A-Za-z0-9_-]+|RDCLAK5uy_[A-Za-z0-9_-]+/g)) {
      ids.add(m[0]);
    }
    const key = html.match(/"INNERTUBE_API_KEY":"([^"]+)"/)?.[1];
    const ver = html.match(/"INNERTUBE_CONTEXT_CLIENT_VERSION":"([^"]+)"/)?.[1];
    let cont = html.match(/"continuationCommand":\{"token":"([^"]+)"/)?.[1];

    let guard = 0;
    while (key && ver && cont && guard < 15) {
      guard += 1;
      const r = await fetch(`https://www.youtube.com/youtubei/v1/browse?key=${key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "User-Agent": SCRAPE_UA },
        body: JSON.stringify({
          context: { client: { clientName: "WEB", clientVersion: ver } },
          continuation: cont,
        }),
      });
      const json = await r.json();
      const s = JSON.stringify(json);
      for (const m of s.matchAll(/OLAK5uy_[A-Za-z0-9_-]+|RDCLAK5uy_[A-Za-z0-9_-]+/g)) {
        ids.add(m[0]);
      }
      cont = s.match(/"continuationCommand":\{"token":"([^"]+)"/)?.[1];
    }
  } catch (e) {
    console.error("Release scrape failed:", e);
  }
  return [...ids];
}

/** Collect extra playlist IDs surfaced via the channel's sections (Releases tab, etc.). */
async function fetchSectionPlaylistIds(apiKey: string, channelId: string): Promise<string[]> {
  try {
    const page = await ytFetch(
      "channelSections",
      { part: "contentDetails", channelId },
      apiKey,
    );
    const ids = new Set<string>();
    for (const s of page.items ?? []) {
      for (const pid of s?.contentDetails?.playlists ?? []) {
        if (pid) ids.add(pid);
      }
    }
    return [...ids];
  } catch {
    return [];
  }
}

async function hydratePlaylistMeta(
  apiKey: string,
  ids: string[],
): Promise<Map<string, { title: string; description: string; thumbnail: string | null; publishedAt: string }>> {
  const map = new Map<string, { title: string; description: string; thumbnail: string | null; publishedAt: string }>();
  for (let i = 0; i < ids.length; i += 50) {
    const batch = ids.slice(i, i + 50);
    const page = await ytFetch(
      "playlists",
      { part: "snippet", id: batch.join(",") },
      apiKey,
    );
    for (const pl of page.items ?? []) {
      map.set(pl.id, {
        title: pl.snippet?.title ?? "Untitled playlist",
        description: pl.snippet?.description ?? "",
        thumbnail: pickThumb(pl.snippet?.thumbnails),
        publishedAt: pl.snippet?.publishedAt ?? new Date().toISOString(),
      });
    }
  }
  return map;
}

async function fetchPlaylists(apiKey: string, channelId: string): Promise<YTPlaylist[]> {
  const byId = new Map<string, YTPlaylist>();

  // 1. Channel-owned playlists.
  let pageToken: string | undefined;
  do {
    const page = await ytFetch(
      "playlists",
      {
        part: "snippet,contentDetails",
        channelId,
        maxResults: "50",
        ...(pageToken ? { pageToken } : {}),
      },
      apiKey,
    );
    for (const pl of page.items ?? []) {
      byId.set(pl.id, {
        playlistId: pl.id,
        title: pl.snippet?.title ?? "Untitled playlist",
        description: pl.snippet?.description ?? "",
        thumbnail: pickThumb(pl.snippet?.thumbnails),
        publishedAt: pl.snippet?.publishedAt ?? new Date().toISOString(),
        official: isOfficialRelease(pl.id),
        items: [],
      });
    }
    pageToken = page.nextPageToken;
  } while (pageToken);

  // 2. Official album/single releases from the Releases tab + channel sections.
  const sectionIds = await fetchSectionPlaylistIds(apiKey, channelId);
  const releaseIds = await scrapeReleaseIds();
  const extraIds = [...new Set([...sectionIds, ...releaseIds])].filter((id) => !byId.has(id));
  if (extraIds.length) {
    const meta = await hydratePlaylistMeta(apiKey, extraIds);
    for (const [id, m] of meta) {
      byId.set(id, {
        playlistId: id,
        title: m.title,
        description: m.description,
        thumbnail: m.thumbnail,
        publishedAt: m.publishedAt,
        official: isOfficialRelease(id),
        items: [],
      });
    }
  }

  const playlists = [...byId.values()];

  // Fetch items for each playlist.
  for (const pl of playlists) {
    let token: string | undefined;
    do {
      const page = await ytFetch(
        "playlistItems",
        {
          part: "snippet,contentDetails",
          playlistId: pl.playlistId,
          maxResults: "50",
          ...(token ? { pageToken: token } : {}),
        },
        apiKey,
      );
      for (const it of page.items ?? []) {
        const vid = it?.contentDetails?.videoId ?? it?.snippet?.resourceId?.videoId;
        if (!vid) continue;
        pl.items.push({
          videoId: vid,
          title: it.snippet?.title ?? "Untitled",
          thumbnail: pickThumb(it.snippet?.thumbnails),
          position: it.snippet?.position ?? pl.items.length,
        });
      }
      token = page.nextPageToken;
    } while (token);
  }

  // Official releases first, then newest by published date.
  playlists.sort((a, b) => {
    if (a.official !== b.official) return a.official ? -1 : 1;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  return playlists;
}

/** Upsert playlists + items into the DB. Returns count synced. */
async function syncPlaylistsToDb(
  apiKey: string,
  channelId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabaseAdmin: any,
): Promise<number> {
  const playlists = await fetchPlaylists(apiKey, channelId);
  let count = 0;
  for (let i = 0; i < playlists.length; i++) {
    const pl = playlists[i];
    const { data: row, error: plErr } = await supabaseAdmin
      .from("youtube_playlists")
      .upsert(
        {
          youtube_playlist_id: pl.playlistId,
          title: pl.title,
          description: pl.description,
          artwork_url: pl.thumbnail,
          item_count: pl.items.length,
          published_at: pl.publishedAt,
          sort_order: i,
          is_published: true,
        },
        { onConflict: "youtube_playlist_id" },
      )
      .select("id")
      .single();
    if (plErr) throw new Error(plErr.message);

    await supabaseAdmin.from("youtube_playlist_items").delete().eq("playlist_id", row.id);
    if (pl.items.length) {
      const itemRows = pl.items.map((it) => ({
        playlist_id: row.id,
        youtube_id: it.videoId,
        position: it.position,
        title: it.title,
        artwork_url: it.thumbnail,
      }));
      const { error: itErr } = await supabaseAdmin
        .from("youtube_playlist_items")
        .insert(itemRows);
      if (itErr) throw new Error(itErr.message);
    }
    count += 1;
  }
  return count;
}

export const syncYouTube = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden: admin access required.");

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      throw new Error("YouTube sync is not configured. Add a YOUTUBE_API_KEY secret.");
    }

    const { channelId, uploads } = await resolveChannel(apiKey);
    const videos = await fetchAllVideos(apiKey, uploads);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let added = 0;
    let updated = 0;

    if (videos.length) {
      const ids = videos.map((v) => v.videoId);
      const { data: existing, error: exErr } = await supabaseAdmin
        .from("tracks")
        .select("id, youtube_id")
        .in("youtube_id", ids);
      if (exErr) throw new Error(exErr.message);

      const existingMap = new Map<string, string>();
      for (const row of existing ?? []) {
        if (row.youtube_id) existingMap.set(row.youtube_id, row.id);
      }

      const inserts = videos
        .filter((v) => !existingMap.has(v.videoId))
        .map((v, idx) => ({
          title: v.title,
          artist: "neoSHADE",
          source: "youtube",
          youtube_id: v.videoId,
          description: v.description,
          artwork_url: v.thumbnail,
          duration_seconds: v.durationSeconds,
          view_count: v.viewCount,
          like_count: v.likeCount,
          is_short: v.isShort,
          published_at: v.publishedAt,
          genres: [] as string[],
          is_published: true,
          sort_order: idx,
          created_at: v.publishedAt,
        }));

      if (inserts.length) {
        const { error: insErr } = await supabaseAdmin.from("tracks").insert(inserts);
        if (insErr) throw new Error(insErr.message);
        added = inserts.length;
      }

      for (const v of videos) {
        const rowId = existingMap.get(v.videoId);
        if (!rowId) continue;
        const { error: upErr } = await supabaseAdmin
          .from("tracks")
          .update({
            title: v.title,
            description: v.description,
            artwork_url: v.thumbnail,
            duration_seconds: v.durationSeconds,
            view_count: v.viewCount,
            like_count: v.likeCount,
            is_short: v.isShort,
            published_at: v.publishedAt,
          })
          .eq("id", rowId);
        if (upErr) throw new Error(upErr.message);
        updated += 1;
      }
    }

    // Sync playlists + items (releases).
    let playlistCount = 0;
    try {
      playlistCount = await syncPlaylistsToDb(apiKey, channelId, supabaseAdmin);
    } catch (e) {
      // Playlists are non-critical; surface but don't fail the whole sync.
      console.error("Playlist sync failed:", e);
    }

    const shorts = videos.filter((v) => v.isShort).length;
    return {
      added,
      updated,
      total: videos.length,
      shorts,
      videos: videos.length - shorts,
      playlists: playlistCount,
    };
  });

/** Focused sync that only refreshes the Releases tab (album/release playlists). */
export const syncReleases = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden: admin access required.");

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      throw new Error("YouTube sync is not configured. Add a YOUTUBE_API_KEY secret.");
    }

    const { channelId } = await resolveChannel(apiKey);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const playlists = await syncPlaylistsToDb(apiKey, channelId, supabaseAdmin);
    return { playlists };
  });
