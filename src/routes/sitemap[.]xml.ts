import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { fetchYouTubePlaylists, fetchTracks } from "@/lib/queries";

const BASE_URL = "https://universe.neo-shade.com";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const STATIC_ENTRIES: SitemapEntry[] = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/catalog", changefreq: "daily", priority: "0.9" },
  { path: "/discover", changefreq: "weekly", priority: "0.8" },
  { path: "/videos", changefreq: "daily", priority: "0.8" },
  { path: "/shorts", changefreq: "daily", priority: "0.7" },
  { path: "/albums", changefreq: "weekly", priority: "0.8" },
  { path: "/playlists", changefreq: "weekly", priority: "0.7" },
  { path: "/merch", changefreq: "monthly", priority: "0.5" },
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [...STATIC_ENTRIES];

        try {
          const [playlists, tracks] = await Promise.all([
            fetchYouTubePlaylists(),
            fetchTracks(),
          ]);
          for (const p of playlists) {
            entries.push({ path: `/playlists/${p.id}`, changefreq: "weekly", priority: "0.6" });
          }
          for (const t of tracks) {
            entries.push({ path: `/tracks/${t.id}`, changefreq: "monthly", priority: "0.5" });
          }
        } catch {
          // If dynamic content can't be loaded, still serve the static routes.
        }

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
