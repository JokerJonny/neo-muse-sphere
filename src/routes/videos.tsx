import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Play } from "lucide-react";
import { usePlayer } from "@/hooks/use-player";
import { fetchVideos } from "@/lib/queries";
import { youtubeThumb, formatDuration } from "@/lib/format";
import { SyncYouTubeButton } from "@/components/SyncYouTubeButton";

export const Route = createFileRoute("/videos")({
  head: () => ({
    meta: [
      { title: "Videos — neoSHADE" },
      { name: "description", content: "Watch every neoSHADE music video in cinematic full-screen mode." },
      { property: "og:title", content: "neoSHADE Videos" },
    ],
  }),
  component: Videos,
});

function Videos() {
  const player = usePlayer();
  const { data, isLoading } = useQuery({ queryKey: ["videos"], queryFn: fetchVideos });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Videos</h1>
          <p className="mt-1 text-muted-foreground">Cinematic visuals from the neoUNIVERSE.</p>
        </div>
        <SyncYouTubeButton />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

        {(data ?? []).map((t) => (
          <button
            key={t.id}
            onClick={() => {
              player.playTrack(t, data);
              player.openVideo();
            }}
            className="group overflow-hidden rounded-xl border border-border bg-card text-left transition-colors hover:border-accent/60"
          >
            <div className="relative aspect-video overflow-hidden bg-secondary">
              <img src={t.artwork_url ?? youtubeThumb(t.youtube_id) ?? ""} alt={t.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 flex items-center justify-center bg-background/30 opacity-0 transition-opacity group-hover:opacity-100">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-[var(--shadow-neon)]">
                  <Play className="h-6 w-6 translate-x-[1px]" fill="currentColor" />
                </span>
              </div>
              {t.duration_seconds ? (
                <span className="absolute bottom-2 right-2 rounded bg-background/85 px-1.5 py-0.5 font-mono text-[11px] text-foreground">
                  {formatDuration(t.duration_seconds)}
                </span>
              ) : null}
            </div>
            <div className="p-3">
              <p className="truncate font-semibold">{t.title}</p>
              <p className="truncate text-xs text-muted-foreground">{t.artist}</p>
            </div>

          </button>
        ))}
      </div>
      {isLoading && <p className="mt-8 text-center text-muted-foreground">Loading…</p>}
      {!isLoading && !data?.length && (
        <p className="mt-12 rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">
          No videos yet. Sync from YouTube in the admin panel.
        </p>
      )}
    </div>
  );
}
