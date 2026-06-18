import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Play, Clock, Film, Eye } from "lucide-react";
import { usePlayer } from "@/hooks/use-player";
import { fetchVideos } from "@/lib/queries";
import { youtubeThumb, formatDuration, formatViews, timeAgo } from "@/lib/format";
import { SyncYouTubeButton } from "@/components/SyncYouTubeButton";
import { SortFilter } from "@/components/SortFilter";
import type { Track, SortMode } from "@/lib/types";
import { siteUrl } from "@/lib/site";
import { ArtistProfileCard } from "@/components/ArtistProfileCard";

export const Route = createFileRoute("/videos")({
  loader: () => fetchVideos("newest"),
  head: ({ loaderData }) => {
    const videos = (loaderData ?? []).slice(0, 12);
    const url = siteUrl("/videos");
    return {
      meta: [
        { title: "Videos — neoSHADE" },
        { name: "description", content: "Watch every neoSHADE music video in cinematic full-screen mode." },
        { property: "og:title", content: "neoSHADE Videos" },
        { property: "og:description", content: "Cinematic neoSHADE music videos — stream the full neoUNIVERSE visual catalogue." },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: videos.length
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "ItemList",
                name: "neoSHADE Videos",
                itemListElement: videos.map((v, i) => ({
                  "@type": "ListItem",
                  position: i + 1,
                  item: {
                    "@type": "VideoObject",
                    name: v.title,
                    thumbnailUrl: v.artwork_url ?? undefined,
                    uploadDate: v.published_at ?? undefined,
                    interactionStatistic: {
                      "@type": "InteractionCounter",
                      interactionType: "https://schema.org/WatchAction",
                      userInteractionCount: v.view_count ?? 0,
                    },
                    embedUrl: v.youtube_id
                      ? `https://www.youtube.com/embed/${v.youtube_id}`
                      : undefined,
                  },
                })),
              }),
            },
          ]
        : [],
    };
  },
  component: Videos,
});

function Videos() {
  const player = usePlayer();
  const [sort, setSort] = useState<SortMode>("newest");
  const { data, isLoading } = useQuery({
    queryKey: ["videos", sort],
    queryFn: () => fetchVideos(sort),
  });

  const videos = data ?? [];
  const featured = videos[0];
  const rest = videos.slice(1);

  const open = (t: Track) => {
    player.playTrack(t, videos);
    player.openVideo();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      {/* Header */}
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
            <Film className="h-3.5 w-3.5" /> neoUNIVERSE Visuals
          </span>
          <h1 className="mt-3 font-display text-3xl font-bold sm:text-5xl">Videos</h1>
          <p className="mt-1 text-muted-foreground">
            {videos.length ? `${videos.length} cinematic visuals` : "Cinematic visuals from the neoUNIVERSE."}
          </p>
        </div>
        <SyncYouTubeButton />
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <SortFilter value={sort} onChange={setSort} />
      </div>

      {/* Featured hero */}
      {featured && (
        <button
          onClick={() => open(featured)}
          aria-label={`Play video: ${featured.title}`}
          className="group relative mt-8 block w-full overflow-hidden rounded-2xl border border-border bg-card text-left shadow-[var(--shadow-neon)] transition-all hover:border-accent/70"
        >
          <div className="relative aspect-[16/10] w-full overflow-hidden sm:aspect-[21/9]">
            <img
              src={
                youtubeThumb(featured.youtube_id, "maxres") ??
                featured.artwork_url ??
                youtubeThumb(featured.youtube_id) ??
                ""
              }
              alt={featured.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/60 to-transparent" />

            <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground shadow-[var(--shadow-neon)]">
              {sort === "popular" ? "Most Watched" : "Latest Drop"}
            </span>

            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-8">
              <div className="min-w-0">
                <h2 className="font-display text-xl font-bold leading-tight sm:text-3xl">
                  {featured.title}
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span>{featured.artist}</span>
                  <span className="inline-flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" /> {formatViews(featured.view_count)}
                  </span>
                  {featured.duration_seconds ? (
                    <span className="inline-flex items-center gap-1 font-mono">
                      <Clock className="h-3.5 w-3.5" /> {formatDuration(featured.duration_seconds)}
                    </span>
                  ) : null}
                </div>
              </div>
              <span className="hidden shrink-0 items-center gap-2 rounded-full bg-accent px-5 py-3 font-semibold text-accent-foreground shadow-[var(--shadow-neon)] transition-transform group-hover:scale-105 sm:inline-flex">
                <Play className="h-5 w-5 translate-x-[1px]" fill="currentColor" /> Play
              </span>
            </div>

            <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-accent/90 text-accent-foreground shadow-[var(--shadow-neon)] opacity-0 transition-opacity group-hover:opacity-100 sm:hidden">
              <Play className="h-7 w-7 translate-x-[1px]" fill="currentColor" />
            </span>
          </div>
        </button>
      )}

      {/* Grid */}
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((t) => (
          <button
            key={t.id}
            onClick={() => open(t)}
            aria-label={`Play video: ${t.title}`}
            className="group overflow-hidden rounded-xl border border-border bg-card text-left transition-all duration-300 hover:-translate-y-1 hover:border-accent/70 hover:shadow-[var(--shadow-neon)]"
          >
            <div className="relative aspect-video overflow-hidden bg-secondary">
              <img
                src={t.artwork_url ?? youtubeThumb(t.youtube_id) ?? ""}
                alt={t.title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-90" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-[var(--shadow-neon)]">
                  <Play className="h-6 w-6 translate-x-[1px]" fill="currentColor" />
                </span>
              </div>
              {t.duration_seconds ? (
                <span className="absolute bottom-2 right-2 rounded bg-background/85 px-1.5 py-0.5 font-mono text-[11px] text-foreground backdrop-blur-sm">
                  {formatDuration(t.duration_seconds)}
                </span>
              ) : null}
            </div>
            <div className="p-3">
              <p className="truncate font-semibold transition-colors group-hover:text-accent">{t.title}</p>
              <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Eye className="h-3 w-3" /> {formatViews(t.view_count)}
                </span>
                {t.published_at ? <span>· {timeAgo(t.published_at)}</span> : null}
              </p>
            </div>
          </button>
        ))}
      </div>

      {isLoading && <p className="mt-8 text-center text-muted-foreground">Loading…</p>}
      {!isLoading && !videos.length && (
        <div className="mt-12 flex flex-col items-center gap-4 rounded-xl border border-dashed border-border p-10 text-center">
          <p className="text-muted-foreground">No videos yet. Sync the @NeoShade-AI channel to import them.</p>
          <SyncYouTubeButton />
        </div>
      )}

      <ArtistProfileCard showStats className="mt-12" />
    </div>
  );
}
