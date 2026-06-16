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

        return new Response(buildYouTubeEmbedPage({ videoId, title, origin, autoplay }), {
          headers: {
            "content-type": "text/html; charset=utf-8",
            "cache-control": "public, max-age=300, stale-while-revalidate=86400",
            "referrer-policy": "origin-when-cross-origin",
            "permissions-policy":
              'autoplay=(self "https://www.youtube.com" "https://www.youtube-nocookie.com"), encrypted-media=(self "https://www.youtube.com" "https://www.youtube-nocookie.com"), fullscreen=(self "https://www.youtube.com" "https://www.youtube-nocookie.com")',
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
}: {
  videoId: string;
  title: string;
  origin: string;
  autoplay: number;
}) {
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const safeTitle = escapeHtml(title);

  // Plain official YouTube embed served from our own origin, with an explicit
  // origin param. This is the minimal, most-compatible embed method.
  const embedParams = new URLSearchParams({
    autoplay: String(autoplay),
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
    iv_load_policy: "3",
    origin,
  });
  const embedSrc = `https://www.youtube.com/embed/${videoId}?${embedParams.toString()}`;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="referrer" content="origin-when-cross-origin" />
    <title>${safeTitle}</title>
    <style>
      html, body { margin: 0; width: 100%; height: 100%; overflow: hidden; background: #05040a; color: #f7f4ff; font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      #stage { position: fixed; inset: 0; background: #05040a; }
      iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
      .fallback { position: fixed; inset-inline: 16px; bottom: 16px; display: none; gap: 10px; align-items: center; justify-content: space-between; border: 1px solid rgba(255,255,255,.16); border-radius: 10px; padding: 12px; background: rgba(5,4,10,.88); backdrop-filter: blur(12px); }
      .fallback.is-visible { display: flex; }
      .fallback p { margin: 0; font-size: 13px; color: rgba(247,244,255,.78); }
      .fallback a { flex: 0 0 auto; border-radius: 999px; padding: 9px 12px; background: #f012be; color: white; font-size: 13px; font-weight: 700; text-decoration: none; }
      @media (max-width: 520px) { .fallback { align-items: stretch; flex-direction: column; } .fallback a { text-align: center; } }
    </style>
  </head>
  <body>
    <main id="stage" aria-label="${safeTitle}">
      <iframe
        id="player"
        src="${embedSrc}"
        title="${safeTitle}"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
        referrerpolicy="origin-when-cross-origin"
      ></iframe>
      <div id="fallback" class="fallback" role="status" aria-live="polite">
        <p>YouTube is taking longer than expected.</p>
        <a href="${watchUrl}" target="_blank" rel="noopener noreferrer">Watch on YouTube</a>
      </div>
    </main>
    <script>
      const VIDEO_ID = ${JSON.stringify(videoId)};
      const ORIGIN = ${JSON.stringify(origin)};
      const MESSAGE_SOURCE = "neo-universe-youtube-embed";
      const iframe = document.getElementById("player");
      let loaded = false;

      function notify(type, detail) {
        if (!window.parent || window.parent === window) return;
        window.parent.postMessage({ source: MESSAGE_SOURCE, type, videoId: VIDEO_ID, ...(detail || {}) }, ORIGIN);
      }

      // We cannot read player state across the youtube.com cross-origin frame,
      // so "ready" simply means the iframe document finished loading.
      iframe.addEventListener("load", function () {
        loaded = true;
        notify("ready");
      });
      iframe.addEventListener("error", function () {
        notify("error", { code: "iframe-load" });
        document.getElementById("fallback")?.classList.add("is-visible");
      });

      window.setTimeout(function () {
        if (!loaded) {
          notify("slow", { after: 7000 });
          document.getElementById("fallback")?.classList.add("is-visible");
        }
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
