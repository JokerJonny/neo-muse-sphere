import { BrandIcon } from "@/components/social/BrandIcon";
import { SOCIAL_LINKS } from "@/lib/platforms";

/** Compact row of brand icons for the header (desktop) or mobile menu. */
export function HeaderSocials({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {SOCIAL_LINKS.map((s) => (
        <a
          key={s.label}
          href={s.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={s.label}
          title={s.label}
          className="neo-social-chip h-9 w-9"
        >
          <BrandIcon brand={s.key} size={16} />
        </a>
      ))}
    </div>
  );
}
