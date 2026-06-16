import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Play, Zap, Eye } from "lucide-react";
import { usePlayer } from "@/hooks/use-player";
import { fetchShorts } from "@/lib/queries";
import { youtubeThumb, formatViews } from "@/lib/format";
import { SortFilter } from "@/components/SortFilter";
import { SyncYouTubeButton } from "@/components/SyncYouTubeButton";
import type { Track, SortMode } from "@/lib/types";
import { siteUrl } from "@/lib/site";

export const Route = createFileRoute("/shorts")({
  loader: () => fetchShorts("newest"),
  head: ({ loaderData }) => {
    const shorts = (loaderData ?? []).slice(0, 12);
    const url = siteUrl("/shorts");
    return {
      meta: [
        { title: "Shorts — neoSHADE" },
        { name: "description", content: "Vertical neoSHADE Shorts — quick cinematic transmissions from the neon dark." },
        { property: "og:title", content: "neoSHADE Shorts" },
        { property: "og:description", content: "Quick vertical cinematic transmissions from the neoUNIVERSE." },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: shorts.length
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "ItemList",
                name: "neoSHADE Shorts",
                itemListElement: shorts.map((v, i) => ({
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
  component: Shorts,
});

function Shorts() {
  const player = usePlayer();
  const [sort, setSort] = useState<SortMode>("newest");
  const { data, isLoading } = useQuery({
    queryKey: ["shorts", sort],
    queryFn: () => fetchShorts(sort),
  });

  const shorts = data ?? [];

  const open = (t: Track) => {
    player.playTrack(t, shorts);
    player.openVideo();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Zap className="h-3.5 w-3.5" /> Vertical Transmissions
          </span>
          <h1 className="mt-3 font-display text-3xl font-bold sm:text-5xl">Shorts</h1>
          <p className="mt-1 text-muted-foreground">
            {shorts.length ? `${shorts.length} short bursts` : "Quick vertical cuts from the neoUNIVERSE."}
          </p>
        </div>
        <SyncYouTubeButton />
      </div>

      <div className="mt-6">
        <SortFilter value={sort} onChange={setSort} />
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {shorts.map((t) => (
          <button
            key={t.id}
            onClick={() => open(t)}
            aria-label={`Play short: ${t.title}`}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card text-left transition-all duration-300 hover:-translate-y-1 hover:border-primary/70 hover:shadow-[var(--shadow-neon)]"
          >
            <div className="relative aspect-[9/16] overflow-hidden bg-secondary">
              <img
                src={youtubeThumb(t.youtube_id, "sd") ?? t.artwork_url ?? youtubeThumb(t.youtube_id) ?? ""}
                alt={t.title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-neon)]">
                  <Play className="h-6 w-6 translate-x-[1px]" fill="currentColor" />
                </span>
              </div>
              <div className="absolute inset-x-0 bottom-0 p-3">
                <p className="line-clamp-2 text-sm font-semibold leading-tight">{t.title}</p>
                <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Eye className="h-3 w-3" /> {formatViews(t.view_count)}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {isLoading && <p className="mt-8 text-center text-muted-foreground">Loading…</p>}
      {!isLoading && !shorts.length && (
        <div className="mt-12 flex flex-col items-center gap-4 rounded-xl border border-dashed border-border p-10 text-center">
          <p className="text-muted-foreground">No Shorts yet. Sync the @NeoShade-AI channel to import them.</p>
          <SyncYouTubeButton />
        </div>
      )}
    </div>
  );
}
