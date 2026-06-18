import { ExternalLink } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { BRAND } from "@/lib/constants";
import { PLATFORM_CATEGORIES } from "@/lib/platforms";
import { BrandIcon } from "@/components/social/BrandIcon";
import { SOCIAL_LINKS } from "@/lib/platforms";
import profileLogo from "@/assets/profile-neoshade.png.asset.json";

export function Footer() {
  return (
    <footer className="mt-12 border-t border-border/60 glass">
      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="flex flex-col items-center text-center">
          <h2 className="font-display text-2xl font-black sm:text-4xl">
            <span className="text-gradient">EXPLORE THE NEO UNIVERSE</span>
          </h2>
          <p className="mt-3 max-w-md text-sm text-muted-foreground">
            Stream, follow, build and explore every official neoSHADE platform.
          </p>
          <div className="mt-6">
            <HeaderlessSocials />
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
          {PLATFORM_CATEGORIES.map((cat) => (
            <div key={cat.id}>
              <h3 className="font-display text-xs font-bold uppercase tracking-[0.25em] text-primary">
                {cat.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {cat.platforms.map((p) => (
                  <li key={`${cat.id}-${p.label}`}>
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <BrandIcon
                        brand={p.key}
                        size={14}
                        className="shrink-0 text-muted-foreground transition-colors group-hover:text-neon-cyan"
                      />
                      <span className="truncate">{p.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-8 sm:flex-row sm:text-left">
          <div className="flex items-center gap-3">
            <Link to="/" aria-label="neoSHADE home" className="shrink-0">
              <img
                src={profileLogo.url}
                alt="neoSHADE Music logo"
                width={44}
                height={44}
                className="h-11 w-11 rounded-full transition-transform hover:scale-105"
              />
            </Link>
            <div className="space-y-0.5">
              <p className="font-display text-base font-bold tracking-wider text-gradient">
                {BRAND.universe}
              </p>
              <p className="text-xs text-muted-foreground">{BRAND.tagline}</p>
            </div>
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
      </div>
    </footer>
  );
}

function HeaderlessSocials() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {SOCIAL_LINKS.map((s) => (
        <a
          key={s.label}
          href={s.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={s.label}
          title={s.label}
          className="neo-social-chip h-10 w-10"
        >
          <BrandIcon brand={s.key} size={18} />
        </a>
      ))}
    </div>
  );
}
