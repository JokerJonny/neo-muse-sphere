import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";
import {
  Youtube,
  Headphones,
  Eye,
  Disc3,
  Library,
  Music,
  Film,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { formatArtistStat } from "@/lib/format";
import { ARTIST_COUNTS } from "@/lib/constants";

type StatKey = keyof typeof ARTIST_COUNTS;

const iconByKey: Record<StatKey, LucideIcon> = {
  youtubeSubscribers: Youtube,
  spotifyMonthlyListeners: Headphones,
  totalViews: Eye,
  liveAlbums: Disc3,
  backloggedAlbums: Library,
  songs: Music,
  videos: Film,
  shorts: Zap,
};

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
  const entries = Object.entries(ARTIST_COUNTS) as [StatKey, (typeof ARTIST_COUNTS)[StatKey]][];

  return (
    <div className="grid grid-cols-2 gap-px border-t border-border/70 bg-border/60 sm:grid-cols-4">
      {entries.map(([key, stat], index) => {
        const Icon = iconByKey[key];
        return (
          <div
            key={key}
            className="flex flex-col items-center gap-1 bg-card/60 px-3 py-4 text-center backdrop-blur transition-colors hover:bg-card/80"
          >
            <Icon className="h-4 w-4 text-primary" />
            <AnimatedStat
              value={stat.value}
              mode={stat.mode}
              suffix={stat.suffix}
              delay={index * 120}
            />
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {stat.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
