import { useQuery } from "@tanstack/react-query";
import { Youtube, Headphones, Disc3, Music, Film, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { fetchArtistCounts } from "@/lib/queries";
import { formatCompact } from "@/lib/format";
import { ARTIST_SOCIAL_STATS } from "@/lib/constants";

type StatItem = {
  key: string;
  label: string;
  icon: LucideIcon;
  value: number | null;
};

/**
 * Live statistics strip. Albums / Songs / Videos / Shorts come straight from
 * the catalog; YouTube subscribers & Spotify monthly listeners use editable
 * placeholders (ARTIST_SOCIAL_STATS) until a platform API is connected.
 */
export function ArtistStats() {
  const counts = useQuery({ queryKey: ["artist-counts"], queryFn: fetchArtistCounts });

  const stats: StatItem[] = [
    {
      key: "yt-subs",
      label: "YouTube Subscribers",
      icon: Youtube,
      value: ARTIST_SOCIAL_STATS.youtubeSubscribers,
    },
    {
      key: "sp-listeners",
      label: "Monthly Listeners",
      icon: Headphones,
      value: ARTIST_SOCIAL_STATS.spotifyMonthlyListeners,
    },
    { key: "albums", label: "Albums", icon: Disc3, value: counts.data?.albums ?? null },
    { key: "songs", label: "Songs", icon: Music, value: counts.data?.songs ?? null },
    { key: "videos", label: "Videos", icon: Film, value: counts.data?.videos ?? null },
    { key: "shorts", label: "Shorts", icon: Zap, value: counts.data?.shorts ?? null },
  ];

  return (
    <div className="grid grid-cols-2 gap-px border-t border-border/70 bg-border/60 sm:grid-cols-3 lg:grid-cols-6">
      {stats.map((s) => {
        const Icon = s.icon;
        const showSkeleton = counts.isLoading && s.value === null;
        return (
          <div
            key={s.key}
            className="flex flex-col items-center gap-1 bg-card/60 px-3 py-4 text-center backdrop-blur transition-colors hover:bg-card/80"
          >
            <Icon className="h-4 w-4 text-primary" />
            <span className="font-display text-lg font-black text-foreground">
              {showSkeleton ? (
                <span className="inline-block h-4 w-8 animate-pulse rounded bg-muted" />
              ) : (
                formatCompact(s.value)
              )}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {s.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
