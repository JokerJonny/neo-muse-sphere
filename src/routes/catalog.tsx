import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search } from "lucide-react";
import { TrackCard } from "@/components/TrackCard";
import { fetchTracks } from "@/lib/queries";
import { GENRES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/catalog")({
  head: () => ({
    meta: [
      { title: "Catalog — neoSHADE" },
      { name: "description", content: "Browse and stream the full neoSHADE catalog. Search by title and filter by genre." },
      { property: "og:title", content: "neoSHADE Catalog" },
    ],
  }),
  component: Catalog,
});

function Catalog() {
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState<string | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ["catalog", search, genre],
    queryFn: () => fetchTracks({ search: search || undefined, genre: genre || undefined }),
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">Catalog</h1>
      <p className="mt-1 text-muted-foreground">Stream everything free. Own any track for $0.50.</p>

      <div className="mt-6 flex flex-col gap-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tracks..."
            className="w-full rounded-full border border-input bg-card py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Chip active={!genre} onClick={() => setGenre(null)}>All</Chip>
          {GENRES.map((g) => (
            <Chip key={g} active={genre === g} onClick={() => setGenre(g)}>{g}</Chip>
          ))}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {(data ?? []).map((t) => (
          <TrackCard key={t.id} track={t} queue={data} />
        ))}
      </div>
      {isLoading && <p className="mt-8 text-center text-muted-foreground">Loading…</p>}
      {!isLoading && !data?.length && (
        <p className="mt-12 rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">
          No tracks match. Catalog fills up as content is synced or uploaded.
        </p>
      )}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
        active ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
