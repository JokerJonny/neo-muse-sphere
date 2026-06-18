import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Play, Eye } from "lucide-react";
import { usePlayer } from "@/hooks/use-player";
import { fetchPlaylist, fetchPlaylistTracks } from "@/lib/queries";
import { youtubeThumb, formatDuration, formatViews } from "@/lib/format";
import { siteUrl } from "@/lib/site";
import { ArtistProfileCard } from "@/components/ArtistProfileCard";
import type { Track } from "@/lib/types";

export const Route = createFileRoute("/playlists/$playlistId")({
  loader: ({ params }) => fetchPlaylist(params.playlistId),
  head: ({ loaderData, params }) => {
    const p = loaderData;
    const title = p ? `${p.title} — neoSHADE Playlist` : "Playlist — neoSHADE";
    const desc = p
      ? `${p.title} — ${p.item_count} videos in this neoSHADE playlist. Stream the full set on the neoUNIVERSE.`
      : "Stream curated neoSHADE playlists on the neoUNIVERSE.";
    const url = siteUrl(`/playlists/${params.playlistId}`);
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "music.playlist" },
        { property: "og:url", content: url },
        ...(p?.artwork_url ? [{ property: "og:image", content: p.artwork_url }] : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: p
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "MusicPlaylist",
                name: p.title,
                numTracks: p.item_count,
                image: p.artwork_url ?? undefined,
                url,
              }),
            },
          ]
        : [],
    };
  },
  component: PlaylistDetail,
  errorComponent: ({ error }) => (
    <div role="alert" className="mx-auto max-w-3xl px-4 py-16 text-center text-muted-foreground">
      {error.message}
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center text-muted-foreground">Playlist not found.</div>
  ),
});

function PlaylistDetail() {
  const { playlistId } = Route.useParams();
  const player = usePlayer();
  const router = useRouter();

  const playlist = useQuery({
    queryKey: ["yt-playlist", playlistId],
    queryFn: () => fetchPlaylist(playlistId),
  });
  const tracks = useQuery({
    queryKey: ["yt-playlist-tracks", playlistId],
    queryFn: () => fetchPlaylistTracks(playlistId),
  });

  const list = tracks.data ?? [];

  const open = (t: Track) => {
    player.playTrack(t, list);
    player.openVideo();
  };

  const p = playlist.data;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <button
        onClick={() => router.history.back()}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-end">
        <div className="aspect-video w-full overflow-hidden rounded-2xl border border-border bg-secondary neon-border sm:w-72 sm:shrink-0">
          {p?.artwork_url ? (
            <img src={p.artwork_url} alt={p.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-4xl text-muted-foreground">◢◤</div>
          )}
        </div>
        <div className="min-w-0">
          <span className="text-xs uppercase tracking-[0.2em] text-primary">Playlist</span>
          <h1 className="mt-1 font-display text-2xl font-bold sm:text-4xl">{p?.title ?? "Playlist"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{list.length} videos</p>
          {list.length > 0 && (
            <button
              onClick={() => open(list[0])}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-semibold text-primary-foreground shadow-[var(--shadow-neon)] transition-transform hover:scale-105"
            >
              <Play className="h-4 w-4 translate-x-[1px]" fill="currentColor" /> Play all
            </button>
          )}
        </div>
      </div>

      <div className="mt-8 divide-y divide-border/60 overflow-hidden rounded-2xl border border-border bg-card">
        {list.map((t, i) => (
          <button
            key={t.id}
            onClick={() => open(t)}
            className="group flex w-full items-center gap-4 p-3 text-left transition-colors hover:bg-secondary/40"
          >
            <span className="w-6 shrink-0 text-center font-mono text-sm text-muted-foreground">{i + 1}</span>
            <div className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-lg bg-secondary">
              <img
                src={t.artwork_url ?? youtubeThumb(t.youtube_id) ?? ""}
                alt={t.title}
                loading="lazy"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-background/40 opacity-0 transition-opacity group-hover:opacity-100">
                <Play className="h-6 w-6 text-primary" fill="currentColor" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold transition-colors group-hover:text-primary">{t.title}</p>
              <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Eye className="h-3 w-3" /> {formatViews(t.view_count)}
                </span>
                {t.duration_seconds ? <span className="font-mono">· {formatDuration(t.duration_seconds)}</span> : null}
              </p>
            </div>
          </button>
        ))}
        {tracks.isSuccess && !list.length && (
          <p className="p-8 text-center text-sm text-muted-foreground">No videos in this playlist yet.</p>
        )}
      </div>

      <ArtistProfileCard className="mt-12" />
    </div>
  );
}
