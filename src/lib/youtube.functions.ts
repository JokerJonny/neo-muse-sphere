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

async function resolveUploadsPlaylist(apiKey: string): Promise<string> {
  // Resolve channel by handle, fall back to a search if needed.
  const byHandle = await ytFetch(
    "channels",
    { part: "contentDetails", forHandle: HANDLE },
    apiKey,
  );
  let uploads = byHandle?.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (uploads) return uploads;

  const search = await ytFetch(
    "search",
    { part: "snippet", type: "channel", q: HANDLE, maxResults: "1" },
    apiKey,
  );
  const channelId = search?.items?.[0]?.snippet?.channelId;
  if (!channelId) throw new Error(`Could not find a YouTube channel for @${HANDLE}.`);

  const byId = await ytFetch("channels", { part: "contentDetails", id: channelId }, apiKey);
  uploads = byId?.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploads) throw new Error("Could not resolve the channel's uploads playlist.");
  return uploads;
}

async function fetchAllVideos(apiKey: string): Promise<YTVideo[]> {
  const uploads = await resolveUploadsPlaylist(apiKey);

  // 1. Page through the uploads playlist to collect all video IDs + snippets.
  const items: { videoId: string; title: string; description: string; thumbnail: string | null; publishedAt: string }[] = [];
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

  // 2. Fetch durations in batches of 50 via the videos endpoint.
  const durations = new Map<string, number | null>();
  for (let i = 0; i < items.length; i += 50) {
    const batch = items.slice(i, i + 50);
    const detail = await ytFetch(
      "videos",
      { part: "contentDetails", id: batch.map((b) => b.videoId).join(",") },
      apiKey,
    );
    for (const v of detail.items ?? []) {
      durations.set(v.id, parseDuration(v.contentDetails?.duration));
    }
  }

  // Drop private/deleted entries that have no duration record at all.
  return items
    .filter((it) => durations.has(it.videoId))
    .map((it) => ({ ...it, durationSeconds: durations.get(it.videoId) ?? null }));
}

export const syncYouTube = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    // Admin-only.
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden: admin access required.");

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      throw new Error("YouTube sync is not configured. Add a YOUTUBE_API_KEY secret.");
    }

    const videos = await fetchAllVideos(apiKey);
    if (videos.length === 0) {
      return { added: 0, updated: 0, total: 0 };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Map existing youtube videos to track rows.
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

    let added = 0;
    let updated = 0;

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
        })
        .eq("id", rowId);
      if (upErr) throw new Error(upErr.message);
      updated += 1;
    }

    return { added, updated, total: videos.length };
  });
