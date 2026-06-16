import { X, ExternalLink } from "lucide-react";
import { usePlayer } from "@/hooks/use-player";
import { cn } from "@/lib/utils";

export function VideoOverlay() {
  const p = usePlayer();
  if (!p.videoOpen || !p.current?.youtube_id) return null;

  const isShort = p.current.is_short;
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const embedSrc =
    `https://www.youtube-nocookie.com/embed/${p.current.youtube_id}` +
    `?autoplay=1&rel=0&playsinline=1&modestbranding=1` +
    (origin ? `&origin=${encodeURIComponent(origin)}` : "");
  const watchUrl = `https://www.youtube.com/watch?v=${p.current.youtube_id}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 p-4 backdrop-blur-xl">
      <button
        onClick={p.closeVideo}
        className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-primary"
        aria-label="Close video"
      >
        <X className="h-5 w-5" />
      </button>
      <div className="flex flex-col items-center gap-3">
        <div
          className={cn(
            "scanlines relative overflow-hidden rounded-xl neon-border",
            isShort ? "aspect-[9/16] h-[82vh] max-h-[82vh] w-auto max-w-[94vw]" : "aspect-video w-full max-w-5xl",
          )}
        >
          <iframe
            className="h-full w-full"
            src={embedSrc}
            title={p.current.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <a
          href={watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
        >
          Player blocked? Watch on YouTube
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
