import { Play, Pause, ShoppingCart, Youtube, Check } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { Track } from "@/lib/types";
import { usePlayer } from "@/hooks/use-player";
import { useCart } from "@/hooks/use-cart";
import { youtubeThumb, formatMoney, formatDuration } from "@/lib/format";
import { Equalizer } from "@/components/Equalizer";
import { cn } from "@/lib/utils";

export function TrackCard({
  track,
  queue,
}: {
  track: Track;
  queue?: Track[];
}) {
  const { current, isPlaying, playTrack, togglePlay } = usePlayer();
  const cart = useCart();

  const art = track.artwork_url || youtubeThumb(track.youtube_id);
  const isCurrent = current?.id === track.id;
  const inCart = cart.has(track.id);

  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:border-primary/60 hover:shadow-[0_0_30px_-8px_var(--neon-cyan)]">
      <div className="relative aspect-square overflow-hidden bg-secondary">
        {art ? (
          <img
            src={art}
            alt={`${track.title} cover art`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl font-display text-muted-foreground">
            ◢◤
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />

        <button
          onClick={() => (isCurrent ? togglePlay() : playTrack(track, queue))}
          className="absolute bottom-3 right-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-neon)] transition-all duration-300 hover:scale-110"
          aria-label={isCurrent && isPlaying ? "Pause" : `Play ${track.title}`}
        >
          {isCurrent && isPlaying ? (
            <Pause className="h-5 w-5" fill="currentColor" />
          ) : (
            <Play className="h-5 w-5 translate-x-[1px]" fill="currentColor" />
          )}
        </button>

        {track.youtube_id && (
          <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-background/70 px-2 py-1 text-xs text-accent backdrop-blur">
            <Youtube className="h-3.5 w-3.5" /> Video
          </span>
        )}
      </div>

      <div className="space-y-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link to="/tracks/$trackId" params={{ trackId: track.id }} className="block">
              <h3 className="truncate font-semibold leading-tight hover:text-primary" title={track.title}>
                {track.title}
              </h3>
            </Link>
            <p className="truncate text-xs text-muted-foreground">{track.artist}</p>
          </div>
          {isCurrent && <Equalizer active={isPlaying} />}
        </div>

        <div className="flex flex-wrap gap-1">
          {(track.genres ?? []).slice(0, 2).map((g) => (
            <span
              key={g}
              className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground"
            >
              {g}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-muted-foreground">
            {formatDuration(track.duration_seconds)}
          </span>
          {track.is_purchasable && track.file_path ? (
            <button
              onClick={() => !inCart && cart.add(track)}
              disabled={inCart}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                inCart
                  ? "bg-secondary text-muted-foreground"
                  : "bg-accent/15 text-accent hover:bg-accent hover:text-accent-foreground",
              )}
            >
              {inCart ? <Check className="h-3.5 w-3.5" /> : <ShoppingCart className="h-3.5 w-3.5" />}
              {inCart ? "In cart" : formatMoney(track.price_cents)}
            </button>
          ) : (
            <span className="text-xs font-medium text-primary">Stream</span>
          )}
        </div>
      </div>
    </div>
  );
}
