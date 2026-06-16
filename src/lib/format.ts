export function formatDuration(seconds?: number | null): string {
  if (!seconds || seconds < 0) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatMoney(cents: number, currency = "usd"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export function formatViews(views?: number | null): string {
  const n = views ?? 0;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M views`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K views`;
  return `${n} view${n === 1 ? "" : "s"}`;
}

export function timeAgo(date?: string | null): string {
  if (!date) return "";
  const then = new Date(date).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Date.now() - then;
  const day = 86_400_000;
  const year = day * 365;
  const month = day * 30;
  if (diff >= year) return `${Math.floor(diff / year)}y ago`;
  if (diff >= month) return `${Math.floor(diff / month)}mo ago`;
  if (diff >= day) return `${Math.floor(diff / day)}d ago`;
  const hour = 3_600_000;
  if (diff >= hour) return `${Math.floor(diff / hour)}h ago`;
  return "just now";
}

export function youtubeThumb(
  id?: string | null,
  quality: "hq" | "sd" | "maxres" = "hq",
): string | null {
  if (!id) return null;
  const file =
    quality === "maxres" ? "maxresdefault" : quality === "sd" ? "sddefault" : "hqdefault";
  return `https://i.ytimg.com/vi/${id}/${file}.jpg`;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}
