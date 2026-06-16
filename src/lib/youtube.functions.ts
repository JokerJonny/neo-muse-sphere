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
  items: { videoId: string; title: string; thumbnail: string | null; position: number }[];
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

async function fetchPlaylists(apiKey: string, channelId: string): Promise<YTPlaylist[]> {
  const playlists: YTPlaylist[] = [];
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
      playlists.push({
        playlistId: pl.id,
        title: pl.snippet?.title ?? "Untitled playlist",
        description: pl.snippet?.description ?? "",
        thumbnail: pickThumb(pl.snippet?.thumbnails),
        publishedAt: pl.snippet?.publishedAt ?? new Date().toISOString(),
        items: [],
      });
    }
    pageToken = page.nextPageToken;
  } while (pageToken);

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

  return playlists;
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

    // Sync playlists + items.
    let playlistCount = 0;
    try {
      const playlists = await fetchPlaylists(apiKey, channelId);
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
        playlistCount += 1;
      }
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
