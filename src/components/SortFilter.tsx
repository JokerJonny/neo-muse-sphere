import type { SortMode } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Clock, Flame, History } from "lucide-react";

const OPTIONS: { value: SortMode; label: string; icon: typeof Clock }[] = [
  { value: "newest", label: "Newest", icon: Clock },
  { value: "popular", label: "Popular", icon: Flame },
  { value: "oldest", label: "Oldest", icon: History },
];

export function SortFilter({
  value,
  onChange,
  className,
}: {
  value: SortMode;
  onChange: (v: SortMode) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-border bg-card/60 p-1 backdrop-blur",
        className,
      )}
      role="tablist"
      aria-label="Sort content"
    >
      {OPTIONS.map((o) => {
        const Icon = o.icon;
        const active = value === o.value;
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all",
              active
                ? "bg-primary text-primary-foreground shadow-[var(--shadow-neon)]"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="h-3.5 w-3.5" /> {o.label}
          </button>
        );
      })}
    </div>
  );
}
