import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ListVideo, Play } from "lucide-react";
import { fetchYouTubePlaylists } from "@/lib/queries";
import { SyncYouTubeButton } from "@/components/SyncYouTubeButton";
import { siteUrl } from "@/lib/site";

export const Route = createFileRoute("/playlists/")({
  loader: () => fetchYouTubePlaylists(),
  head: ({ loaderData }) => {
    const playlists = (loaderData ?? []).slice(0, 20);
    const url = siteUrl("/playlists");
    return {
      meta: [
        { title: "Playlists — neoSHADE" },
        { name: "description", content: "Explore curated neoSHADE playlists from the neoUNIVERSE." },
        { property: "og:title", content: "neoSHADE Playlists" },
        { property: "og:description", content: "Curated neoSHADE collections — full sets streamed straight from the neoUNIVERSE." },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: playlists.length
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "ItemList",
                name: "neoSHADE Playlists",
                itemListElement: playlists.map((p, i) => ({
                  "@type": "ListItem",
                  position: i + 1,
                  item: {
                    "@type": "MusicPlaylist",
                    name: p.title,
                    numTracks: p.item_count,
                    image: p.artwork_url ?? undefined,
                    url: `https://universe.neo-shade.com/playlists/${p.id}`,
                  },
                })),
              }),
            },
          ]
        : [],
    };
  },
  component: Playlists,
});

function Playlists() {
  const { data, isLoading } = useQuery({
    queryKey: ["yt-playlists"],
    queryFn: fetchYouTubePlaylists,
  });
  const playlists = data ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <ListVideo className="h-3.5 w-3.5" /> Curated Collections
          </span>
          <h1 className="mt-3 font-display text-3xl font-bold sm:text-5xl">Playlists</h1>
          <p className="mt-1 text-muted-foreground">
            {playlists.length ? `${playlists.length} playlists` : "Curated sets from the neoUNIVERSE."}
          </p>
        </div>
        <SyncYouTubeButton />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {playlists.map((p) => (
          <Link
            key={p.id}
            to="/playlists/$playlistId"
            params={{ playlistId: p.id }}
            className="group overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/70 hover:shadow-[var(--shadow-neon)]"
          >
            <div className="relative aspect-video overflow-hidden bg-secondary">
              {p.artwork_url ? (
                <img
                  src={p.artwork_url}
                  alt={p.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-4xl text-muted-foreground">◢◤</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-transparent to-transparent" />
              <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-background/80 px-2.5 py-1 text-xs font-medium text-foreground backdrop-blur">
                <ListVideo className="h-3.5 w-3.5" /> {p.item_count}
              </span>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-neon)]">
                  <Play className="h-6 w-6 translate-x-[1px]" fill="currentColor" />
                </span>
              </div>
            </div>
            <div className="p-4">
              <h2 className="truncate font-display text-lg font-bold transition-colors group-hover:text-primary">
                {p.title}
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">{p.item_count} videos</p>
            </div>
          </Link>
        ))}
      </div>

      {isLoading && <p className="mt-8 text-center text-muted-foreground">Loading…</p>}
      {!isLoading && !playlists.length && (
        <div className="mt-12 flex flex-col items-center gap-4 rounded-xl border border-dashed border-border p-10 text-center">
          <p className="text-muted-foreground">No playlists yet. Sync the @NeoShade-AI channel to import them.</p>
          <SyncYouTubeButton />
        </div>
      )}
    </div>
  );
}
