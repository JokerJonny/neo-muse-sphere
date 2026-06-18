import { ArrowUpRight } from "lucide-react";
import { BrandIcon } from "@/components/social/BrandIcon";
import { PLATFORM_CATEGORIES } from "@/lib/platforms";

/** Prominent multi-category platform grid for the homepage. */
export function FollowTheSignal() {
  return (
    <section
      id="follow-the-signal"
      className="scroll-mt-20 border-y border-border/60 bg-gradient-to-b from-transparent to-background/40"
    >
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-background/40 px-3 py-1 text-xs uppercase tracking-[0.25em] text-primary backdrop-blur">
            The Network
          </span>
          <h2 className="mt-4 font-display text-3xl font-black sm:text-5xl">
            <span className="text-gradient">FOLLOW THE SIGNAL</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Connect with neoSHADE across every platform.
          </p>
        </div>

        <div className="mt-12 space-y-12">
          {PLATFORM_CATEGORIES.map((cat) => (
            <div key={cat.id}>
              <h3 className="mb-5 flex items-center gap-3 font-display text-sm font-bold uppercase tracking-[0.3em] text-muted-foreground">
                <span className="h-px flex-1 bg-gradient-to-r from-transparent to-border" />
                {cat.title}
                <span className="h-px flex-1 bg-gradient-to-l from-transparent to-border" />
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {cat.platforms.map((p) => (
                  <a
                    key={`${cat.id}-${p.label}`}
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="neo-platform-card group flex items-center gap-4 rounded-2xl p-5"
                  >
                    <span className="neo-social-chip h-12 w-12 shrink-0 group-hover:text-neon-cyan">
                      <BrandIcon brand={p.key} size={22} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1 font-display font-bold transition-colors group-hover:text-neon-cyan">
                        <span className="truncate">{p.label}</span>
                        <ArrowUpRight className="h-4 w-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                      </span>
                      <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                        {p.description}
                      </span>
                    </span>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
