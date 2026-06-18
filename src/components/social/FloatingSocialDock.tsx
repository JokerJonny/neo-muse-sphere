import { BrandIcon } from "@/components/social/BrandIcon";
import { SOCIAL_LINKS } from "@/lib/platforms";

/** Vertical neon dock pinned to the right edge — desktop only. */
export function FloatingSocialDock() {
  return (
    <div className="fixed right-3 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-3 lg:flex">
      {SOCIAL_LINKS.map((s) => (
        <a
          key={s.label}
          href={s.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={s.label}
          title={s.label}
          className="neo-social-chip animate-neon-pulse h-11 w-11"
        >
          <BrandIcon brand={s.key} size={20} />
        </a>
      ))}
    </div>
  );
}
