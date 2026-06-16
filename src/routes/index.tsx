import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Youtube, Sparkles } from "lucide-react";
import heroImg from "@/assets/hero.jpg";
import { BRAND } from "@/lib/constants";
import { GlitchText } from "@/components/GlitchText";
import { TrackCard } from "@/components/TrackCard";
import { fetchLatestTracks, fetchFeaturedTracks, fetchAlbums } from "@/lib/queries";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "neoSHADE · neoUNIVERSE — Music, Video & Store" },
      { name: "description", content: "The official neoSHADE hub: stream surreal cyberpunk music & videos, explore albums, and own tracks for $0.50." },
      { property: "og:title", content: "neoSHADE · neoUNIVERSE" },
      { property: "og:description", content: "Stream surreal cyberpunk music & videos from neoSHADE." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Index,
});

function Index() {
  const latest = useQuery({ queryKey: ["latest"], queryFn: () => fetchLatestTracks(8) });
  const featured = useQuery({ queryKey: ["featured"], queryFn: fetchFeaturedTracks });
  const albums = useQuery({ queryKey: ["albums-home"], queryFn: fetchAlbums });

  return (
    <div>
      <section className="scanlines relative flex min-h-[78vh] items-center overflow-hidden">
        <img src={heroImg} alt="neoSHADE neon cityscape" className="absolute inset-0 h-full w-full object-cover opacity-60" width={1920} height={1080} />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
        <div className="relative mx-auto w-full max-w-7xl px-4 py-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-background/40 px-3 py-1 text-xs uppercase tracking-[0.2em] text-primary backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" /> {BRAND.universe}
          </span>
          <h1 className="mt-5 max-w-3xl font-display text-5xl font-black leading-[1.05] sm:text-7xl">
            <GlitchText className="text-gradient">neoSHADE</GlitchText>
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted-foreground">{BRAND.tagline}. {BRAND.bio}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/catalog" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-[var(--shadow-neon)] transition-transform hover:scale-105">
              Explore catalog <ArrowRight className="h-4 w-4" />
            </Link>
            <a href={BRAND.youtubeUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-6 py-3 font-semibold backdrop-blur transition-colors hover:border-accent">
              <Youtube className="h-4 w-4 text-accent" /> Watch on YouTube
            </a>
          </div>
        </div>
      </section>

      <Section title="Latest Transmissions" href="/catalog">
        <Grid>
          {(latest.data ?? []).map((t) => (
            <TrackCard key={t.id} track={t} queue={latest.data} />
          ))}
        </Grid>
        {latest.isSuccess && !latest.data.length && <EmptyHint />}
      </Section>

      {!!featured.data?.length && (
        <Section title="Featured" href="/catalog">
          <Grid>
            {featured.data.map((t) => (
              <TrackCard key={t.id} track={t} queue={featured.data} />
            ))}
          </Grid>
        </Section>
      )}

      <Section title="Albums & Collections" href="/albums">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {(albums.data ?? []).slice(0, 8).map((a) => (
            <Link key={a.id} to="/catalog" className="group overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/60">
              <div className="aspect-square overflow-hidden bg-secondary">
                {a.artwork_url ? (
                  <img src={a.artwork_url} alt={a.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-3xl text-muted-foreground">◢◤</div>
                )}
              </div>
              <div className="p-3">
                <p className="truncate font-semibold">{a.title}</p>
                <p className="text-xs capitalize text-muted-foreground">{a.type}</p>
              </div>
            </Link>
          ))}
          {albums.isSuccess && !albums.data.length && <EmptyHint />}
        </div>
      </Section>
    </div>
  );
}

function Section({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-6 flex items-end justify-between">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">{title}</h2>
        <Link to={href} className="text-sm text-primary hover:underline">View all</Link>
      </div>
      {children}
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{children}</div>;
}

function EmptyHint() {
  return (
    <p className="col-span-full rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
      No content yet. Sign in as admin and sync from YouTube/Spotify or upload tracks.
    </p>
  );
}
