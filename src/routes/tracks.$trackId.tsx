import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Play, Pause, ShoppingCart, Check, Download, Loader2, ArrowLeft, Youtube } from "lucide-react";
import { toast } from "sonner";
import { fetchTrack } from "@/lib/queries";
import { usePlayer } from "@/hooks/use-player";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { PayPalCheckout } from "@/components/PayPalCheckout";
import { getDownloadUrl } from "@/lib/media.functions";
import { supabase } from "@/integrations/supabase/client";
import { formatMoney, formatDuration, youtubeThumb } from "@/lib/format";
import { useState } from "react";

export const Route = createFileRoute("/tracks/$trackId")({
  loader: ({ params }) => fetchTrack(params.trackId),
  head: ({ loaderData, params }) => {
    const track = loaderData;
    const title = track ? `${track.title} — neoSHADE` : "Track — neoSHADE";
    const desc = track
      ? `${track.title} by ${track.artist} — stream on neoUNIVERSE${track.has_file ? `, or own the MP3 for $0.50.` : "."}`
      : "Stream neoSHADE tracks on the neoUNIVERSE.";
    const url = siteUrl(`/tracks/${params.trackId}`);
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "music.song" },
        { property: "og:url", content: url },
        ...(track?.artwork_url ? [{ property: "og:image", content: track.artwork_url }] : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: track
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "MusicRecording",
                name: track.title,
                byArtist: { "@type": "MusicGroup", name: track.artist },
                duration: track.duration_seconds
                  ? `PT${track.duration_seconds}S`
                  : undefined,
                genre: (track.genres ?? []).length ? track.genres : undefined,
                image: track.artwork_url ?? undefined,
                url,
              }),
            },
          ]
        : [],
    };
  },
  component: TrackPage,
  errorComponent: () => (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <h1 className="font-display text-2xl font-bold">Something went wrong</h1>
      <Link to="/catalog" className="mt-4 inline-block text-primary hover:underline">Back to catalog</Link>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <h1 className="font-display text-2xl font-bold">Track not found</h1>
      <Link to="/catalog" className="mt-4 inline-block text-primary hover:underline">Back to catalog</Link>
    </div>
  ),
});

function TrackPage() {
  const { trackId } = Route.useParams();
  const router = useRouter();
  const { current, isPlaying, playTrack, togglePlay } = usePlayer();
  const cart = useCart();
  const { user } = useAuth();

  const { data: track, isLoading } = useQuery({
    queryKey: ["track", trackId],
    queryFn: () => fetchTrack(trackId),
  });

  const owned = useQuery({
    queryKey: ["owns-track", trackId, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("purchases")
        .select("id")
        .eq("track_id", trackId)
        .eq("status", "completed")
        .maybeSingle();
      return !!data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!track) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold">Track not found</h1>
        <Link to="/catalog" className="mt-4 inline-block text-primary hover:underline">Back to catalog</Link>
      </div>
    );
  }

  const art = track.artwork_url || youtubeThumb(track.youtube_id);
  const isCurrent = current?.id === track.id;
  const inCart = cart.has(track.id);
  const canBuy = track.is_purchasable && track.has_file;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link to="/catalog" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Back to catalog
      </Link>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-secondary shadow-[var(--shadow-neon)]">
          {art ? (
            <img src={art} alt={`${track.title} cover art`} className="aspect-square w-full object-cover" />
          ) : (
            <div className="flex aspect-square w-full items-center justify-center font-display text-6xl text-muted-foreground">◢◤</div>
          )}
          <button
            onClick={() => (isCurrent ? togglePlay() : playTrack(track, [track]))}
            className="absolute bottom-4 right-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-neon)] transition-transform hover:scale-110"
            aria-label={isCurrent && isPlaying ? "Pause" : `Play ${track.title}`}
          >
            {isCurrent && isPlaying ? <Pause className="h-6 w-6" fill="currentColor" /> : <Play className="h-6 w-6 translate-x-[1px]" fill="currentColor" />}
          </button>
        </div>

        <div className="flex flex-col">
          <h1 className="glitch font-display text-3xl font-bold" data-text={track.title}>{track.title}</h1>
          <p className="mt-1 text-muted-foreground">{track.artist}</p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">{formatDuration(track.duration_seconds)}</span>
            {(track.genres ?? []).map((g) => (
              <span key={g} className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">{g}</span>
            ))}
          </div>

          {track.description && <p className="mt-4 text-sm text-muted-foreground">{track.description}</p>}

          {track.youtube_id && (
            <a
              href={`https://www.youtube.com/watch?v=${track.youtube_id}`}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm text-accent hover:underline"
            >
              <Youtube className="h-4 w-4" /> Watch the video
            </a>
          )}

          <div className="mt-auto space-y-3 pt-6">
            {canBuy ? (
              owned.data ? (
                <OwnedDownload trackId={track.id} title={track.title} />
              ) : (
                <>
                  <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
                    <span className="font-semibold">One-time download</span>
                    <span className="font-display text-xl text-gradient">{formatMoney(track.price_cents)}</span>
                  </div>

                  <button
                    onClick={() => !inCart && cart.add(track)}
                    disabled={inCart}
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-accent/40 bg-accent/10 py-2.5 text-sm font-semibold text-accent hover:bg-accent hover:text-accent-foreground disabled:opacity-60"
                  >
                    {inCart ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
                    {inCart ? "In cart" : "Add to cart"}
                  </button>

                  {user ? (
                    <div className="rounded-xl border border-border bg-card p-4">
                      <p className="mb-3 text-center text-xs text-muted-foreground">Buy now with PayPal — instant download</p>
                      <PayPalCheckout
                        trackIds={[track.id]}
                        onSuccess={() => {
                          owned.refetch();
                          toast.success("Download unlocked — find it in your library");
                          router.navigate({ to: "/library" });
                        }}
                      />
                    </div>
                  ) : (
                    <Link to="/auth" className="block rounded-full bg-primary py-2.5 text-center text-sm font-semibold text-primary-foreground">
                      Sign in to buy
                    </Link>
                  )}
                </>
              )
            ) : (
              <p className="text-sm text-primary">Free stream — press play to listen.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function OwnedDownload({ trackId, title }: { trackId: string; title: string }) {
  const [busy, setBusy] = useState(false);
  async function download() {
    setBusy(true);
    try {
      const res = await getDownloadUrl({ data: { trackId } });
      if (res.url) window.location.href = res.url;
      else toast.error("Download not available");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Download failed");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-primary/40 bg-primary/5 p-4 text-center text-sm text-primary">
        You own “{title}”.
      </div>
      <button onClick={download} disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 font-semibold text-primary-foreground shadow-[var(--shadow-neon)] disabled:opacity-60">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} Download MP3
      </button>
    </div>
  );
}
