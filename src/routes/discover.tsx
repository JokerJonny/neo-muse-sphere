import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import { Search, Sparkles, Play, Pause, Eye, Shuffle, ListMusic, Wand2 } from "lucide-react";
import { fetchCatalogForVibes } from "@/lib/queries";
import { VIBES, buildPlaylist, buildVibePlaylist, expandQuery, type Vibe } from "@/lib/vibes";
import { usePlayer } from "@/hooks/use-player";
import { Equalizer } from "@/components/Equalizer";
import { youtubeThumb, formatViews } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Track } from "@/lib/types";

export const Route = createFileRoute("/discover")({
  head: () => ({
    meta: [
      { title: "Discover · neoVIBES — neoSHADE" },
      {
        name: "description",
        content:
          "Search genres, moods and vibes across the neoUNIVERSE. The universe listens and curates a personal neoVIBE playlist from every neoSHADE release, video and journey.",
      },
      { property: "og:title", content: "neoVIBES — Discover the neoUNIVERSE" },
      {
        property: "og:description",
        content: "Type a feeling. The universe curates a playlist just for you.",
      },
    ],
  }),
  component: Discover,
});

const PLACEHOLDER =
  "Search genres, moods, vibes... (jazz, club, reggae, healing, rebellion, cinematic, workout...)";

function Discover() {
  const player = usePlayer();
  const [query, setQuery] = useState("");
  const [activeVibe, setActiveVibe] = useState<Vibe | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [result, setResult] = useState<{ title: string; tracks: Track[] } | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const { data: catalog = [], isLoading } = useQuery({
    queryKey: ["vibe-catalog"],
    queryFn: fetchCatalogForVibes,
    staleTime: 5 * 60_000,
  });

  const visibleVibes = useMemo(() => (showAll ? VIBES : VIBES.slice(0, 8).concat(VIBES.find((v) => v.random)!)), [showAll]);

  const reveal = (title: string, tracks: Track[], play = false) => {
    setResult({ title, tracks });
    if (play && tracks.length) {
      player.playTrack(tracks[0], tracks);
      if (tracks[0].youtube_id && !tracks[0].has_file && !tracks[0].preview_url) {
        player.openVideo();
      }
    }
    requestAnimationFrame(() => listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const runSearch = () => {
    if (!query.trim() || !catalog.length) return;
    setActiveVibe(null);
    const keywords = expandQuery(query);
    const tracks = buildPlaylist(catalog, keywords, 40);
    reveal(`neoVIBE · "${query.trim()}"`, tracks, true);
  };

  const pickVibe = (vibe: Vibe) => {
    if (!catalog.length) return;
    setActiveVibe(vibe);
    setQuery("");
    const tracks = buildVibePlaylist(catalog, vibe, 40);
    reveal(`${vibe.emoji} ${vibe.label} Playlist`, tracks, true);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      {/* Header */}
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-background/40 px-3 py-1 text-xs uppercase tracking-[0.25em] text-primary backdrop-blur">
          <Sparkles className="h-3.5 w-3.5" /> neoVIBES
        </span>
        <h1 className="mt-4 font-display text-4xl font-black sm:text-5xl">
          <span className="text-gradient">The universe is listening</span>
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          Type a genre, a mood, or a feeling — and a personal neoVIBE playlist is curated instantly
          from every neoSHADE release, video and journey.
        </p>
      </div>

      {/* Glowing search bar */}
      <div className="relative mx-auto mt-8 max-w-3xl">
        <div className="pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary via-accent to-primary opacity-60 blur-lg animate-[pulse_3s_ease-in-out_infinite]" />
        <div className="relative flex items-center gap-2 rounded-2xl border border-primary/50 bg-card/90 p-2 shadow-[0_0_40px_-8px_var(--neon-cyan)] backdrop-blur">
          <Search className="ml-3 h-5 w-5 shrink-0 text-primary" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runSearch()}
            placeholder={PLACEHOLDER}
            className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground sm:text-base"
            aria-label="Search vibes"
          />
          <button
            onClick={runSearch}
            disabled={!query.trim()}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-neon)] transition-transform hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
          >
            <Wand2 className="h-4 w-4" /> <span className="hidden sm:inline">Curate</span>
          </button>
        </div>
      </div>

      {/* Vibe cards */}
      <div className="mt-12">
        <h2 className="flex items-center gap-2 font-display text-2xl font-bold">
          <ListMusic className="h-5 w-5 text-accent" /> Pick a neoVIBE
        </h2>
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {visibleVibes.map((v) => (
            <button
              key={v.id}
              onClick={() => pickVibe(v)}
              className={cn(
                "group relative overflow-hidden rounded-2xl border p-5 text-left transition-all duration-300 hover:-translate-y-1.5",
                activeVibe?.id === v.id
                  ? "border-primary shadow-[var(--shadow-neon)]"
                  : "border-border hover:border-primary/60 hover:shadow-[0_0_30px_-8px_var(--neon-cyan)]",
              )}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-25 transition-opacity duration-300 group-hover:opacity-50"
                style={{ background: `linear-gradient(135deg, ${v.from}, ${v.to})` }}
              />
              <div className="pointer-events-none absolute -right-6 -top-6 text-7xl opacity-20 transition-transform duration-500 group-hover:scale-125 group-hover:opacity-30">
                {v.emoji}
              </div>
              <div className="relative">
                <span className="text-2xl">{v.emoji}</span>
                <h3 className="mt-2 font-display text-lg font-bold tracking-wide">{v.label}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">{v.tagline}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  <Play className="h-3 w-3" fill="currentColor" /> Generate & play
                </span>
              </div>
            </button>
          ))}
          {!showAll && VIBES.length > 9 && (
            <button
              onClick={() => setShowAll(true)}
              className="group flex items-center justify-center rounded-2xl border border-dashed border-border p-5 text-center transition-colors hover:border-primary/60"
            >
              <span className="font-display font-bold text-muted-foreground transition-colors group-hover:text-primary">
                More vibes +
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Generated playlist */}
      <div ref={listRef} className="mt-12 scroll-mt-24">
        {isLoading && (
          <p className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">
            Tuning into the neoUNIVERSE…
          </p>
        )}

        {result && !isLoading && (
          <div className="animate-fade-in">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-bold sm:text-3xl">{result.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {result.tracks.length} tracks curated from across the neoUNIVERSE
                </p>
              </div>
              {result.tracks.length > 0 && (
                <button
                  onClick={() => reveal(result.title, result.tracks, true)}
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground shadow-[var(--shadow-neon)] transition-transform hover:scale-105"
                >
                  <Shuffle className="h-4 w-4" /> Play all
                </button>
              )}
            </div>

            {result.tracks.length === 0 ? (
              <p className="mt-6 rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">
                The universe couldn't find that vibe yet. Try another mood or genre.
              </p>
            ) : (
              <ol className="mt-6 space-y-2">
                {result.tracks.map((t, i) => (
                  <VibeRow key={t.id} track={t} index={i} queue={result.tracks} />
                ))}
              </ol>
            )}
          </div>
        )}

        {!result && !isLoading && (
          <p className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">
            Search a feeling or tap a neoVIBE above — your playlist appears here and starts playing in
            the neoPLAYER.
          </p>
        )}
      </div>
    </div>
  );
}

function VibeRow({ track, index, queue }: { track: Track; index: number; queue: Track[] }) {
  const { current, isPlaying, playTrack, togglePlay, openVideo } = usePlayer();
  const isCurrent = current?.id === track.id;
  const art = track.artwork_url || youtubeThumb(track.youtube_id);

  const onPlay = () => {
    if (isCurrent) {
      togglePlay();
      return;
    }
    playTrack(track, queue);
    if (track.youtube_id && !track.has_file && !track.preview_url) openVideo();
  };

  return (
    <li
      className={cn(
        "group flex items-center gap-3 rounded-xl border p-2.5 transition-colors",
        isCurrent ? "border-primary/60 bg-primary/5" : "border-border bg-card hover:border-primary/40",
      )}
    >
      <span className="w-6 shrink-0 text-center font-display text-sm font-bold text-muted-foreground">
        {index + 1}
      </span>
      <button onClick={onPlay} className="relative aspect-video w-24 shrink-0 overflow-hidden rounded-lg bg-secondary sm:w-28">
        {art ? (
          <img src={art} alt={track.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-muted-foreground">◢◤</span>
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-background/40 opacity-0 transition-opacity group-hover:opacity-100">
          {isCurrent && isPlaying ? <Pause className="h-6 w-6" fill="currentColor" /> : <Play className="h-6 w-6 translate-x-[1px]" fill="currentColor" />}
        </span>
      </button>
      <div className="min-w-0 flex-1">
        <p className={cn("truncate font-semibold leading-tight", isCurrent && "text-primary")} title={track.title}>
          {track.title}
        </p>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
          <Eye className="h-3 w-3" /> {formatViews(track.view_count)}
        </p>
      </div>
      {isCurrent && <Equalizer active={isPlaying} />}
    </li>
  );
}
