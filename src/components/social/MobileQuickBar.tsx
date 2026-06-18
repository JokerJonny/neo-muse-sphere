import { Link } from "@tanstack/react-router";
import { Film, Music, Users, Share2 } from "lucide-react";
import { toast } from "sonner";
import { SOCIAL_LINKS } from "@/lib/platforms";

/** Sticky bottom quick-access bar — mobile only. */
export function MobileQuickBar() {
  const spotify = SOCIAL_LINKS.find((s) => s.key === "spotify")?.url ?? "#";

  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "https://universe.neo-shade.com";
    const data = {
      title: "neoUNIVERSE — neoSHADE",
      text: "Stream neoSHADE across the neoUNIVERSE.",
      url,
    };
    try {
      if (navigator.share) {
        await navigator.share(data);
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      }
    } catch {
      /* user cancelled */
    }
  };

  const item =
    "flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium text-muted-foreground transition-colors hover:text-primary";

  return (
    <nav className="glass fixed inset-x-0 bottom-0 z-40 flex border-t border-border/60 md:hidden">
      <Link to="/videos" className={item}>
        <Film className="h-5 w-5" />
        Watch
      </Link>
      <a href={spotify} target="_blank" rel="noopener noreferrer" className={item}>
        <Music className="h-5 w-5" />
        Listen
      </a>
      <a href="/#follow-the-signal" className={item}>
        <Users className="h-5 w-5" />
        Follow
      </a>
      <button type="button" onClick={share} className={item}>
        <Share2 className="h-5 w-5" />
        Share
      </button>
    </nav>
  );
}
