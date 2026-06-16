import { X } from "lucide-react";
import { usePlayer } from "@/hooks/use-player";

export function VideoOverlay() {
  const p = usePlayer();
  if (!p.videoOpen || !p.current?.youtube_id) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 p-4 backdrop-blur-xl">
      <button
        onClick={p.closeVideo}
        className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-primary"
        aria-label="Close video"
      >
        <X className="h-5 w-5" />
      </button>
      <div className="scanlines relative aspect-video w-full max-w-5xl overflow-hidden rounded-xl neon-border">
        <iframe
          className="h-full w-full"
          src={`https://www.youtube.com/embed/${p.current.youtube_id}?autoplay=1&rel=0`}
          title={p.current.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}
