import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { X, ExternalLink, RefreshCw, AlertTriangle, Play } from "lucide-react";
import { usePlayer } from "@/hooks/use-player";
import { youtubeThumb } from "@/lib/format";
import { cn } from "@/lib/utils";

type PlayerStatus = "loading" | "ready" | "playing" | "slow" | "error";

const EMBED_MESSAGE_SOURCE = "neo-universe-youtube-embed";

function openOfficialYouTube(event: MouseEvent<HTMLAnchorElement>, videoId: string, watchUrl: string) {
  event.preventDefault();
  if (typeof window === "undefined") return;

  const ua = window.navigator.userAgent;
  if (/Android/i.test(ua)) {
    window.location.href = `intent://www.youtube.com/watch?v=${videoId}#Intent;scheme=https;package=com.google.android.youtube;S.browser_fallback_url=${encodeURIComponent(watchUrl)};end`;
    return;
  }

  if (/iPad|iPhone|iPod/i.test(ua)) {
    window.location.href = `youtube://www.youtube.com/watch?v=${videoId}`;
    window.setTimeout(() => {
      window.location.href = watchUrl;
    }, 700);
    return;
  }

  const opened = window.open(watchUrl, "_blank", "noopener,noreferrer");
  if (!opened) window.location.href = watchUrl;
}

export function VideoOverlay() {
  const p = usePlayer();
  const [retryNonce, setRetryNonce] = useState(0);
  const [playerStatus, setPlayerStatus] = useState<PlayerStatus>("loading");

  const current = p.current;
  const videoId = current?.youtube_id ?? "";
  const isShort = !!current?.is_short;
  const isVisible = !!p.videoOpen && !!videoId;
  const embedSrc = useMemo(() => {
    const params = new URLSearchParams({
      autoplay: "1",
      rel: "0",
      modestbranding: "1",
      playsinline: "1",
      title: current?.title ?? "neoSHADE video",
      short: isShort ? "1" : "0",
      r: String(retryNonce),
    });
    return `/embed/youtube/${encodeURIComponent(videoId)}?${params.toString()}`;
  }, [current?.title, isShort, retryNonce, videoId]);
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;

  useEffect(() => {
    if (!isVisible) return;

    setPlayerStatus("loading");

    const slowTimer = window.setTimeout(() => {
      setPlayerStatus((status) => (status === "loading" ? "slow" : status));
    }, 9000);

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data as { source?: string; type?: string; videoId?: string };
      if (!data || data.source !== EMBED_MESSAGE_SOURCE || data.videoId !== videoId) return;

      if (data.type === "ready") setPlayerStatus("ready");
      if (data.type === "playing") setPlayerStatus("playing");
      if (data.type === "slow") setPlayerStatus((status) => (status === "loading" ? "slow" : status));
      if (data.type === "error") setPlayerStatus("error");
    };

    window.addEventListener("message", onMessage);
    return () => {
      window.clearTimeout(slowTimer);
      window.removeEventListener("message", onMessage);
    };
  }, [isVisible, retryNonce, videoId]);

  const retry = () => {
    setPlayerStatus("loading");
    setRetryNonce((value) => value + 1);
  };

  const hasPlaybackIssue = playerStatus === "slow" || playerStatus === "error";

  if (!isVisible || !current) return null;

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
          {playerStatus === "error" ? (
            <div className="absolute inset-0">
              <img
                src={youtubeThumb(videoId, "maxres") ?? current.artwork_url ?? youtubeThumb(videoId) ?? ""}
                alt={current.title}
                className="h-full w-full object-cover opacity-40"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/70 p-6 text-center backdrop-blur-sm">
                <AlertTriangle className="h-8 w-8 text-accent" />
                <div>
                  <p className="font-display text-lg font-semibold">YouTube blocked the embedded player</p>
                  <p className="mt-1 max-w-md text-sm text-muted-foreground">
                    YouTube is asking to verify you're not a bot. Watch it directly on YouTube, or retry the player.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <a
                    href={watchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(event) => openOfficialYouTube(event, videoId, watchUrl)}
                    className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground shadow-[var(--shadow-neon)] transition-transform hover:scale-105"
                  >
                    <Play className="h-4 w-4" fill="currentColor" /> Watch on YouTube
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <button
                    type="button"
                    onClick={retry}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary"
                  >
                    <RefreshCw className="h-4 w-4" /> Retry
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <iframe
              className="h-full w-full"
              src={embedSrc}
              title={current.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="origin-when-cross-origin"
            />
          )}
          {playerStatus === "slow" && (
            <div className="absolute inset-x-3 bottom-3 rounded-lg border border-border bg-background/90 p-3 backdrop-blur-md">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertTriangle className="h-4 w-4 text-accent" />
                  YouTube is taking longer than expected.
                </p>
                <button
                  type="button"
                  onClick={retry}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary"
                >
                  <RefreshCw className="h-4 w-4" /> Retry
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <a
            href={watchUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => openOfficialYouTube(event, videoId, watchUrl)}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
          >
            Watch on YouTube
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
