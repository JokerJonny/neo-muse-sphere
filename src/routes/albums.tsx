import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Disc3, Play, ListMusic, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { usePlayer } from "@/hooks/use-player";
import { fetchYouTubePlaylists, fetchPlaylistTracks } from "@/lib/queries";
import { SyncYouTubeButton } from "@/components/SyncYouTubeButton";
import type { YouTubePlaylist } from "@/lib/types";

export const Route = createFileRoute("/albums")({
  head: () => ({
    meta: [
      { title: "Releases & Albums — neoSHADE" },
      {
        name: "description",
        content:
          "Full neoSHADE albums and releases — complete playlists from the neoUNIVERSE, ready to play in the neoPLAYER.",
      },
      { property: "og:title", content: "neoSHADE Releases & Albums" },
      {
        property: "og:description",
        content: "Complete albums and releases streamed straight from the neoUNIVERSE.",
      },
    ],
  }),
  component: Albums,
});

function Albums() {
  const { data, isLoading } = useQuery({
    queryKey: ["yt-playlists"],
    queryFn: fetchYouTubePlaylists,
  });
  const albums = data ?? [];

  return (
    <div className="relative mx-auto max-w-7xl px-4 py-12">
      {/* ambient neon glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(60%_100%_at_50%_0%,color-mix(in_oklab,var(--primary)_22%,transparent),transparent)]" />

      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-primary">
            <Disc3 className="h-3.5 w-3.5" /> Discography
          </span>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-6xl">
            Releases &amp; <span className="text-gradient">Albums</span>
          </h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Full-length drops from the neoUNIVERSE. Hit play to stream an entire album in the
            neoPLAYER, or step inside for the full tracklist.
          </p>
        </div>
        <SyncYouTubeButton />
      </div>

      {isLoading && (
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[4/5] animate-pulse rounded-2xl border border-border bg-card/60"
            />
          ))}
        </div>
      )}

      {!isLoading && albums.length > 0 && (
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((album, i) => (
            <AlbumCard key={album.id} album={album} index={i} />
          ))}
        </div>
      )}

      {!isLoading && albums.length === 0 && <ComingSoon />}
    </div>
  );
}

function AlbumCard({ album, index }: { album: YouTubePlaylist; index: number }) {
  const player = usePlayer();
  const [loading, setLoading] = useState(false);

  async function playAlbum(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    const t = toast.loading(`Loading "${album.title}"…`);
    try {
      const tracks = await fetchPlaylistTracks(album.id);
      if (!tracks.length) {
        toast.error("This album has no playable videos yet.", { id: t });
        return;
      }
      player.playTrack(tracks[0], tracks);
      player.openVideo();
      toast.success(`Now playing "${album.title}"`, { id: t });
    } catch {
      toast.error("Couldn't load this album.", { id: t });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Link
      to="/playlists/$playlistId"
      params={{ playlistId: album.id }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/70 hover:shadow-[var(--shadow-neon)]"
    >
      <div className="relative aspect-square overflow-hidden bg-secondary">
        {album.artwork_url ? (
          <img
            src={album.artwork_url}
            alt={album.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-5xl text-muted-foreground">
            ◢◤
          </div>
        )}

        {/* cinematic overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[linear-gradient(115deg,transparent_30%,color-mix(in_oklab,var(--primary)_18%,transparent)_50%,transparent_70%)]" />

        <span className="absolute left-3 top-3 rounded-full border border-border/60 bg-background/70 px-2.5 py-1 font-mono text-[11px] font-semibold text-primary backdrop-blur">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-background/70 px-2.5 py-1 text-xs font-medium text-foreground backdrop-blur">
          <ListMusic className="h-3.5 w-3.5" /> {album.item_count}
        </span>

        {/* play album */}
        <button
          type="button"
          onClick={playAlbum}
          disabled={loading}
          aria-label={`Play album ${album.title}`}
          className="absolute bottom-3 right-3 flex h-14 w-14 translate-y-2 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 shadow-[var(--shadow-neon)] transition-all duration-300 hover:scale-110 group-hover:translate-y-0 group-hover:opacity-100 disabled:opacity-70"
        >
          {loading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <Play className="h-6 w-6 translate-x-[1px]" fill="currentColor" />
          )}
        </button>
      </div>

      <div className="p-4">
        <h2 className="truncate font-display text-lg font-bold transition-colors group-hover:text-primary">
          {album.title}
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {album.item_count} track{album.item_count === 1 ? "" : "s"}
        </p>
      </div>
    </Link>
  );
}

function ComingSoon() {
  return (
    <div className="relative mt-14 overflow-hidden rounded-3xl border border-dashed border-primary/40 bg-card/40 p-12 text-center">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(50%_80%_at_50%_0%,color-mix(in_oklab,var(--accent)_18%,transparent),transparent)]" />
      <span className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/40 bg-primary/10 text-primary">
        <Sparkles className="h-8 w-8" />
      </span>
      <h2 className="mt-6 font-display text-3xl font-bold sm:text-4xl">
        Building the <span className="text-gradient">Catalog</span>
      </h2>
      <p className="mx-auto mt-3 max-w-md text-muted-foreground">
        The neoUNIVERSE discography is loading. Sync the @NeoShade-AI channel to pull in album
        playlists and full releases.
      </p>
      <div className="mt-8 flex justify-center">
        <SyncYouTubeButton />
      </div>
    </div>
  );
}
