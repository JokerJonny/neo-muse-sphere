import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  Youtube,
  Maximize2,
  Loader2,
} from "lucide-react";
import { usePlayer } from "@/hooks/use-player";
import { Slider } from "@/components/ui/slider";
import { youtubeThumb, formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";

export function PlayerBar() {
  const p = usePlayer();
  if (!p.current) return null;
  const t = p.current;
  const art = t.artwork_url || youtubeThumb(t.youtube_id);
  const isVideoOnly = !t.file_path && !t.preview_url;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 glass">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-3 py-2 sm:px-4">
        {!isVideoOnly && (
          <Slider
            value={[p.progress]}
            max={p.duration || 1}
            step={1}
            onValueChange={(v) => p.seek(v[0])}
            className="w-full"
          />
        )}
        <div className="flex items-center gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {art ? (
              <img src={art} alt="" className="h-12 w-12 rounded-md object-cover" />
            ) : (
              <div className="h-12 w-12 rounded-md bg-secondary" />
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{t.title}</p>
              <p className="truncate text-xs text-muted-foreground">{t.artist}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={p.toggleShuffle}
              className={cn("hidden h-8 w-8 items-center justify-center rounded-md sm:flex", p.shuffle ? "text-primary" : "text-muted-foreground")}
              aria-label="Shuffle"
            >
              <Shuffle className="h-4 w-4" />
            </button>
            <button onClick={p.prev} className="flex h-8 w-8 items-center justify-center text-foreground" aria-label="Previous">
              <SkipBack className="h-5 w-5" fill="currentColor" />
            </button>
            <button
              onClick={p.togglePlay}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-neon)]"
              aria-label="Play/Pause"
            >
              {p.loadingTrack ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : isVideoOnly ? (
                <Youtube className="h-5 w-5" />
              ) : p.isPlaying ? (
                <Pause className="h-5 w-5" fill="currentColor" />
              ) : (
                <Play className="h-5 w-5 translate-x-[1px]" fill="currentColor" />
              )}
            </button>
            <button onClick={p.next} className="flex h-8 w-8 items-center justify-center text-foreground" aria-label="Next">
              <SkipForward className="h-5 w-5" fill="currentColor" />
            </button>
            <button
              onClick={p.cycleRepeat}
              className={cn("hidden h-8 w-8 items-center justify-center rounded-md sm:flex", p.repeat !== "off" ? "text-primary" : "text-muted-foreground")}
              aria-label="Repeat"
            >
              {p.repeat === "one" ? <Repeat1 className="h-4 w-4" /> : <Repeat className="h-4 w-4" />}
            </button>
          </div>

          <div className="hidden flex-1 items-center justify-end gap-3 md:flex">
            {!isVideoOnly && (
              <span className="text-xs tabular-nums text-muted-foreground">
                {formatDuration(p.progress)} / {formatDuration(p.duration)}
              </span>
            )}
            {t.youtube_id && (
              <button onClick={p.openVideo} className="flex h-8 w-8 items-center justify-center rounded-md text-accent" aria-label="Full screen video">
                <Maximize2 className="h-4 w-4" />
              </button>
            )}
            <div className="flex w-28 items-center gap-2">
              <Volume2 className="h-4 w-4 text-muted-foreground" />
              <Slider value={[p.volume]} max={1} step={0.01} onValueChange={(v) => p.setVolume(v[0])} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
