import { createFileRoute } from "@tanstack/react-router";

const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{6,32}$/;

export const Route = createFileRoute("/embed/youtube/$videoId")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const videoId = params.videoId;
        if (!YOUTUBE_ID_PATTERN.test(videoId)) {
          return new Response("Invalid YouTube video id", { status: 400 });
        }

        const url = new URL(request.url);
        const origin = url.origin;
        const title = url.searchParams.get("title") || "neoSHADE video";
        const autoplay = url.searchParams.get("autoplay") === "0" ? 0 : 1;
        const isShort = url.searchParams.get("short") === "1";

        return new Response(buildYouTubeEmbedPage({ videoId, title, origin, autoplay, isShort }), {
          headers: {
            "content-type": "text/html; charset=utf-8",
            "cache-control": "public, max-age=300, stale-while-revalidate=86400",
            "referrer-policy": "origin-when-cross-origin",
            "permissions-policy": 'autoplay=(self "https://www.youtube.com"), encrypted-media=(self "https://www.youtube.com"), fullscreen=(self "https://www.youtube.com")',
          },
        });
      },
    },
  },
});

function buildYouTubeEmbedPage({
  videoId,
  title,
  origin,
  autoplay,
  isShort,
}: {
  videoId: string;
  title: string;
  origin: string;
  autoplay: number;
  isShort: boolean;
}) {
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const safeTitle = escapeHtml(title);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="referrer" content="origin-when-cross-origin" />
    <title>${safeTitle}</title>
    <style>
      html, body { margin: 0; width: 100%; height: 100%; overflow: hidden; background: #05040a; color: #f7f4ff; font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      #stage { position: fixed; inset: 0; display: grid; place-items: center; background: #05040a; }
      #player { width: 100%; height: 100%; }
      .fallback { position: fixed; inset-inline: 16px; bottom: 16px; display: none; gap: 10px; align-items: center; justify-content: space-between; border: 1px solid rgba(255,255,255,.16); border-radius: 10px; padding: 12px; background: rgba(5,4,10,.88); backdrop-filter: blur(12px); }
      .fallback.is-visible { display: flex; }
      .fallback p { margin: 0; font-size: 13px; color: rgba(247,244,255,.78); }
      .fallback a { flex: 0 0 auto; border-radius: 999px; padding: 9px 12px; background: #f012be; color: white; font-size: 13px; font-weight: 700; text-decoration: none; }
      @media (max-width: 520px) { .fallback { align-items: stretch; flex-direction: column; } .fallback a { text-align: center; } }
    </style>
  </head>
  <body data-short="${isShort ? "true" : "false"}">
    <main id="stage" aria-label="${safeTitle}">
      <div id="player"></div>
      <div id="fallback" class="fallback" role="status" aria-live="polite">
        <p>YouTube blocked the embedded player.</p>
        <a href="${watchUrl}" target="_blank" rel="noopener noreferrer">Watch on YouTube</a>
      </div>
    </main>
    <script>
      const VIDEO_ID = ${JSON.stringify(videoId)};
      const ORIGIN = ${JSON.stringify(origin)};
      const AUTOPLAY = ${JSON.stringify(autoplay)};
      const MESSAGE_SOURCE = "neo-universe-youtube-embed";
      let player = null;
      let ready = false;

      function notify(type, detail) {
        if (!window.parent || window.parent === window) return;
        window.parent.postMessage({ source: MESSAGE_SOURCE, type, videoId: VIDEO_ID, ...(detail || {}) }, ORIGIN);
      }

      function showFallback() {
        document.getElementById("fallback")?.classList.add("is-visible");
      }

      function createPlayer() {
        if (!window.YT || !window.YT.Player) {
          notify("error", { code: "api-unavailable" });
          showFallback();
          return;
        }

        player = new window.YT.Player("player", {
          width: "100%",
          height: "100%",
          videoId: VIDEO_ID,
          host: "https://www.youtube.com",
          playerVars: {
            autoplay: AUTOPLAY,
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            enablejsapi: 1,
            origin: ORIGIN,
            iv_load_policy: 3,
            fs: 1,
          },
          events: {
            onReady(event) {
              ready = true;
              notify("ready");
              if (AUTOPLAY) {
                try { event.target.playVideo(); } catch (error) { notify("error", { code: "play-rejected" }); }
              }
            },
            onStateChange(event) {
              notify("state", { state: event.data });
              if (event.data === 1) notify("playing");
            },
            onError(event) {
              notify("error", { code: event.data });
              showFallback();
            },
          },
        });
      }

      window.onYouTubeIframeAPIReady = function onYouTubeIframeAPIReady() {
        window.setTimeout(createPlayer, 350 + Math.floor(Math.random() * 450));
      };

      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      tag.async = true;
      tag.onerror = function () {
        notify("error", { code: "api-load" });
        showFallback();
      };
      document.head.appendChild(tag);

      window.setTimeout(function () {
        if (!ready) notify("slow", { after: 7000 });
      }, 7000);
    </script>
  </body>
</html>`;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (char) => {
    switch (char) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "'":
        return "&#39;";
      case '"':
        return "&quot;";
      default:
        return char;
    }
  });
}