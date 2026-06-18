import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Youtube, Sparkles, Play, Flame, Eye, Film, Zap, ListVideo, Disc3, ShoppingBag } from "lucide-react";
import heroImg from "@/assets/hero.jpg";
import { BRAND } from "@/lib/constants";
import { siteUrl } from "@/lib/site";
import { GlitchText } from "@/components/GlitchText";
import { TrackCard } from "@/components/TrackCard";
import { usePlayer } from "@/hooks/use-player";
import { fetchLatestTracks, fetchVideos, fetchTrending } from "@/lib/queries";
import { youtubeThumb, formatViews } from "@/lib/format";
import { ArtistProfileCard } from "@/components/ArtistProfileCard";
import { FollowTheSignal } from "@/components/social/FollowTheSignal";
import type { Track } from "@/lib/types";

export const Route = createFileRoute("/")({
  head: () => {
    const url = siteUrl("/");
    return {
      meta: [
        { title: "neoSHADE · neoUNIVERSE — Cyberpunk Music & Visuals" },
        { name: "description", content: "The official neoSHADE hub: stream surreal cyberpunk music & videos, explore albums, and own tracks for $0.50." },
        { property: "og:title", content: "neoSHADE · neoUNIVERSE — Cyberpunk Music & Visuals" },
        { property: "og:description", content: "Stream surreal cyberpunk music & videos from neoSHADE." },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: Index,
});

const QUICK = [
  { to: "/discover", label: "neoVIBES", icon: Sparkles, desc: "Curated by vibe" },
  { to: "/videos", label: "Videos", icon: Film, desc: "Cinematic visuals" },
  { to: "/shorts", label: "Shorts", icon: Zap, desc: "Vertical bursts" },
  { to: "/albums", label: "Releases", icon: Disc3, desc: "Albums & EPs" },
  { to: "/playlists", label: "Playlists", icon: ListVideo, desc: "Curated sets" },
  { to: "/catalog", label: "Music Store", icon: ShoppingBag, desc: "Own tracks" },
] as const;

function Index() {
  const player = usePlayer();
  const latest = useQuery({ queryKey: ["latest"], queryFn: () => fetchLatestTracks(8) });
  const videos = useQuery({ queryKey: ["videos", "home"], queryFn: () => fetchVideos("newest") });
  const trending = useQuery({ queryKey: ["trending"], queryFn: () => fetchTrending(6) });

  const featuredVideos = (videos.data ?? []).slice(0, 6);
  const heroVideo = (trending.data ?? [])[0] ?? featuredVideos[0];

  const openVideo = (t: Track) => {
    player.playTrack(t, featuredVideos);
    player.openVideo();
  };

  return (
    <div>
      {/* Hero */}
      <section className="scanlines relative flex min-h-[78vh] items-center overflow-hidden">
        <img src={heroImg} alt="neoSHADE neon cityscape" className="absolute inset-0 h-full w-full object-cover opacity-60" width={1920} height={1080} />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
        <div className="relative mx-auto w-full max-w-7xl px-4 py-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-background/40 px-3 py-1 text-xs uppercase tracking-[0.2em] text-primary backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" /> {BRAND.universe}
          </span>
          <h1
            className="mt-5 max-w-3xl font-display text-5xl font-black leading-[1.05] sm:text-7xl"
            aria-label="neoSHADE — Cyberpunk Music & Visuals"
          >
            <GlitchText className="text-gradient">neoSHADE</GlitchText>
          </h1>
          <p className="mt-4 font-display text-lg font-semibold tracking-wide text-primary sm:text-xl">
            {BRAND.tagline}
          </p>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            {BRAND.intro} {BRAND.bio}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {heroVideo && (
              <button onClick={() => openVideo(heroVideo)} className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-[var(--shadow-neon)] transition-transform hover:scale-105">
                <Play className="h-4 w-4 translate-x-[1px]" fill="currentColor" /> Play latest
              </button>
            )}
            <Link to="/videos" className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-6 py-3 font-semibold backdrop-blur transition-colors hover:border-primary">
              Browse videos <ArrowRight className="h-4 w-4" />
            </Link>
            <a href={BRAND.youtubeUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-6 py-3 font-semibold backdrop-blur transition-colors hover:border-accent">
              <Youtube className="h-4 w-4 text-accent" /> YouTube
            </a>
          </div>
        </div>
      </section>

      {/* Quick access */}
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {QUICK.map((q) => {
            const Icon = q.icon;
            return (
              <Link key={q.to} to={q.to} className="group rounded-xl border border-border bg-card p-4 transition-all hover:-translate-y-1 hover:border-primary/60 hover:shadow-[var(--shadow-neon)]">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="mt-3 font-display font-bold">{q.label}</p>
                <p className="text-xs text-muted-foreground">{q.desc}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Artist profile */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <ArtistProfileCard showStats />
      </section>



      {/* Featured videos */}
      {!!featuredVideos.length && (
        <Section title="Featured Videos" href="/videos">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredVideos.map((t) => (
              <button key={t.id} onClick={() => openVideo(t)} aria-label={`Play video: ${t.title}`} className="group overflow-hidden rounded-xl border border-border bg-card text-left transition-all duration-300 hover:-translate-y-1 hover:border-accent/70 hover:shadow-[var(--shadow-neon)]">
                <div className="relative aspect-video overflow-hidden bg-secondary">
                  <img src={t.artwork_url ?? youtubeThumb(t.youtube_id) ?? ""} alt={t.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-90" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-[var(--shadow-neon)]">
                      <Play className="h-6 w-6 translate-x-[1px]" fill="currentColor" />
                    </span>
                  </div>
                </div>
                <div className="p-3">
                  <p className="truncate font-semibold transition-colors group-hover:text-accent">{t.title}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <Eye className="h-3 w-3" /> {formatViews(t.view_count)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </Section>
      )}

      {/* Trending */}
      {!!trending.data?.length && (
        <Section title="Trending in neoUNIVERSE" href="/videos" icon={<Flame className="h-5 w-5 text-accent" />}>
          <div className="grid gap-3 sm:grid-cols-2">
            {trending.data.map((t, i) => (
              <button key={t.id} onClick={() => openVideo(t)} aria-label={`Play video: ${t.title}`} className="group flex items-center gap-4 rounded-xl border border-border bg-card p-3 text-left transition-colors hover:border-accent/60">
                <span className="w-6 shrink-0 text-center font-display text-xl font-black text-muted-foreground">{i + 1}</span>
                <div className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-lg bg-secondary">
                  <img src={t.artwork_url ?? youtubeThumb(t.youtube_id) ?? ""} alt={t.title} loading="lazy" className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold transition-colors group-hover:text-accent">{t.title}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <Eye className="h-3 w-3" /> {formatViews(t.view_count)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </Section>
      )}

      {/* Latest releases */}
      <Section title="Latest Releases" href="/catalog">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {(latest.data ?? []).map((t) => (
            <TrackCard key={t.id} track={t} queue={latest.data} />
          ))}
        </div>
        {latest.isSuccess && !latest.data.length && <EmptyHint />}
      </Section>
    </div>
  );
}

function Section({ title, href, icon, children }: { title: string; href: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6 flex items-end justify-between">
        <h2 className="flex items-center gap-2 font-display text-2xl font-bold sm:text-3xl">{icon}{title}</h2>
        <Link to={href} className="text-sm text-primary hover:underline">View all</Link>
      </div>
      {children}
    </section>
  );
}

function EmptyHint() {
  return (
    <p className="col-span-full rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
      No content yet. Sign in as admin and sync from YouTube or upload tracks.
    </p>
  );
}
