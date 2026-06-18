import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";
import { Youtube, Headphones, Disc3, Music, Film, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { formatArtistStat } from "@/lib/format";
import { ARTIST_COUNTS } from "@/lib/constants";

type StatItem = {
  key: string;
  label: string;
  icon: LucideIcon;
  value: number;
  mode: "compact" | "exact";
  suffix: string;
};

const stats: StatItem[] = [
  {
    key: "yt-subs",
    label: "YouTube Subscribers",
    icon: Youtube,
    ...ARTIST_COUNTS.youtubeSubscribers,
  },
  {
    key: "sp-listeners",
    label: "Monthly Listeners",
    icon: Headphones,
    ...ARTIST_COUNTS.spotifyMonthlyListeners,
  },
  { key: "albums", label: "Albums", icon: Disc3, ...ARTIST_COUNTS.albums },
  { key: "songs", label: "Songs", icon: Music, ...ARTIST_COUNTS.songs },
  { key: "videos", label: "Videos", icon: Film, ...ARTIST_COUNTS.videos },
  { key: "shorts", label: "Shorts", icon: Zap, ...ARTIST_COUNTS.shorts },
];

function AnimatedStat({
  value,
  mode,
  suffix,
  delay = 0,
}: {
  value: number;
  mode: "compact" | "exact";
  suffix: string;
  delay?: number;
}) {
  const animated = useAnimatedNumber(value, 1400, delay);
  return (
    <span className="font-display text-lg font-black text-foreground tabular-nums">
      {formatArtistStat(animated, mode)}
      {suffix}
    </span>
  );
}

/**
 * Animated artist statistics strip. Numbers count up on load with a subtle
 * staggered effect, formatted in the neoSHADE cyberpunk aesthetic.
 */
export function ArtistStats() {
  return (
    <div className="grid grid-cols-2 gap-px border-t border-border/70 bg-border/60 sm:grid-cols-3 lg:grid-cols-6">
      {stats.map((s, index) => {
        const Icon = s.icon;
        return (
          <div
            key={s.key}
            className="flex flex-col items-center gap-1 bg-card/60 px-3 py-4 text-center backdrop-blur transition-colors hover:bg-card/80"
          >
            <Icon className="h-4 w-4 text-primary" />
            <AnimatedStat
              value={s.value}
              mode={s.mode}
              suffix={s.suffix}
              delay={index * 120}
            />
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {s.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
