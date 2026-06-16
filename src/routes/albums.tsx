import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import { fetchAlbums } from "@/lib/queries";

export const Route = createFileRoute("/albums")({
  head: () => ({
    meta: [
      { title: "Albums — neoSHADE" },
      { name: "description", content: "Explore neoSHADE albums, playlists and collections." },
      { property: "og:title", content: "neoSHADE Albums" },
    ],
  }),
  component: Albums,
});

function Albums() {
  const { data, isLoading } = useQuery({ queryKey: ["albums"], queryFn: fetchAlbums });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">Albums & Collections</h1>
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {(data ?? []).map((a) => (
          <div key={a.id} className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="aspect-square overflow-hidden bg-secondary">
              {a.artwork_url ? (
                <img src={a.artwork_url} alt={a.title} loading="lazy" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl text-muted-foreground">◢◤</div>
              )}
            </div>
            <div className="p-3">
              <p className="truncate font-semibold">{a.title}</p>
              <p className="text-xs capitalize text-muted-foreground">{a.type}{a.release_date ? ` · ${new Date(a.release_date).getFullYear()}` : ""}</p>
              {a.external_url && (
                <a href={a.external_url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline">
                  Open <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
      {isLoading && <p className="mt-8 text-center text-muted-foreground">Loading…</p>}
      {!isLoading && !data?.length && (
        <p className="mt-12 rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">
          No albums yet.
        </p>
      )}
    </div>
  );
}
