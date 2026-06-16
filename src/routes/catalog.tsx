import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search } from "lucide-react";
import { TrackCard } from "@/components/TrackCard";
import { fetchTracks } from "@/lib/queries";
import { GENRES } from "@/lib/constants";
import { siteUrl } from "@/lib/site";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/catalog")({
  head: () => {
    const url = siteUrl("/catalog");
    return {
      meta: [
        { title: "Music Store — neoSHADE" },
        { name: "description", content: "Browse and stream the full neoSHADE catalog. Search by title, filter by genre, and own any track for $0.50 via PayPal." },
        { property: "og:title", content: "neoSHADE Music Store" },
        { property: "og:description", content: "Stream the full neoSHADE catalog free, or own any track for $0.50 with secure PayPal checkout." },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
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
      {/* Store switch banner */}
      <div className="mb-6 flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-card/50 p-2 text-sm">
        <span className="rounded-lg bg-primary px-3 py-1.5 font-semibold text-primary-foreground shadow-[var(--shadow-neon)]">
          🎵 Music Store
        </span>
        <a
          href="/merch"
          className="rounded-lg px-3 py-1.5 font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          🛍️ Merch Store
        </a>
        <span className="ml-auto hidden text-xs text-muted-foreground sm:block">
          Two separate stores — digital music vs. physical merch.
        </span>
      </div>

      <h1 className="font-display text-3xl font-bold sm:text-4xl">Music Store</h1>
      <p className="mt-1 text-muted-foreground">Stream everything free. Own any track for $0.50 — secure PayPal checkout.</p>


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
