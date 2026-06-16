import { ExternalLink } from "lucide-react";
import { BRAND } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-border/60 glass">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-center sm:flex-row sm:text-left">
        <div className="space-y-1">
          <p className="font-display text-base font-bold tracking-wider text-gradient">
            {BRAND.universe}
          </p>
          <p className="text-xs text-muted-foreground">{BRAND.tagline}</p>
        </div>

        <a
          href={BRAND.site}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-md border border-neon-cyan/40 bg-card/50 px-5 py-2.5 text-sm font-semibold tracking-wide text-neon-cyan shadow-[var(--shadow-neon)] transition-transform hover:scale-105"
        >
          ← Back to Main Site
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </footer>
  );
}
