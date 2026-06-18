import { Youtube, Headphones, Disc3, Music, Film, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Stat = {
  key: string;
  label: string;
  icon: LucideIcon;
  /** Live value once wired up; null renders a "soon" placeholder. */
  value: number | string | null;
};

/**
 * Live statistics strip. Structure is ready for real data — wire each
 * `value` to a data source (YouTube/Spotify API or DB counts) to activate.
 */
const STATS: Stat[] = [
  { key: "yt-subs", label: "YouTube Subscribers", icon: Youtube, value: null },
  { key: "sp-listeners", label: "Monthly Listeners", icon: Headphones, value: null },
  { key: "albums", label: "Albums", icon: Disc3, value: null },
  { key: "songs", label: "Songs", icon: Music, value: null },
  { key: "videos", label: "Videos", icon: Film, value: null },
  { key: "shorts", label: "Shorts", icon: Zap, value: null },
];

export function ArtistStats() {
  return (
    <div className="grid grid-cols-2 gap-px border-t border-border/70 bg-border/60 sm:grid-cols-3 lg:grid-cols-6">
      {STATS.map((s) => {
        const Icon = s.icon;
        return (
          <div
            key={s.key}
            className="flex flex-col items-center gap-1 bg-card/60 px-3 py-4 text-center backdrop-blur"
          >
            <Icon className="h-4 w-4 text-primary" />
            <span className="font-display text-lg font-black text-foreground">
              {s.value ?? "—"}
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
