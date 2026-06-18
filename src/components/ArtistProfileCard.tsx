import { Link, useNavigate } from "@tanstack/react-router";
import { Film, Music, Rocket, Users } from "lucide-react";
import profileLogo from "@/assets/profile-neoshade.png.asset.json";
import { ArtistStats } from "@/components/ArtistStats";

type ArtistProfileCardProps = {
  className?: string;
  /** Render the live statistics strip beneath the profile. */
  showStats?: boolean;
};

const NEOSHADE_AI_URL = "https://neoshadeai.com";

/**
 * Reusable artist identity card for Jonathan George | neoSHADE.
 * Surfaced on the homepage, album, playlist and video pages.
 */
export function ArtistProfileCard({ className = "", showStats = false }: ArtistProfileCardProps) {
  const navigate = useNavigate();

  const followSocials = () => {
    const el =
      typeof document !== "undefined" ? document.getElementById("follow-the-signal") : null;
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      // Section lives on the homepage — go there and anchor to it.
      navigate({ to: "/", hash: "follow-the-signal" });
    }
  };

  return (
    <div
      className={`glass overflow-hidden rounded-2xl border border-border/70 shadow-[var(--shadow-card)] ${className}`}
    >
      <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
        <div className="relative shrink-0 self-center sm:self-auto">
          <span className="absolute -inset-1 rounded-full bg-[var(--gradient-neon)] opacity-60 blur-md" />
          <img
            src={profileLogo.url}
            alt="Jonathan George — neoSHADE logo"
            width={104}
            height={104}
            loading="lazy"
            className="relative h-24 w-24 rounded-full border-2 border-neon-cyan/60 object-cover shadow-[var(--shadow-neon)] sm:h-28 sm:w-28"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-2xl font-black">
            <span className="text-gradient">Jonathan George</span>{" "}
            <span className="text-foreground">| neoSHADE</span>
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Programmer. Builder. Music Creator. Father. Recovery Journey. AI Pioneer.
          </p>

          <div className="mt-5 flex flex-wrap gap-2.5">
            <Link
              to="/videos"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-neon)] transition-transform hover:scale-105"
            >
              <Film className="h-4 w-4" /> Watch Videos
            </Link>
            <Link
              to="/catalog"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-2 text-sm font-semibold backdrop-blur transition-colors hover:border-primary"
            >
              <Music className="h-4 w-4" /> Listen Music
            </Link>
            <a
              href={NEOSHADE_AI_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-2 text-sm font-semibold backdrop-blur transition-colors hover:border-accent"
            >
              <Rocket className="h-4 w-4 text-accent" /> Visit neoSHADE AI
            </a>
            <button
              type="button"
              onClick={followSocials}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-2 text-sm font-semibold backdrop-blur transition-colors hover:border-neon-violet"
            >
              <Users className="h-4 w-4" /> Follow Socials
            </button>
          </div>
        </div>
      </div>

      {showStats && <ArtistStats />}
    </div>
  );
}
