import type { Track } from "@/lib/types";
import cinematicImg from "@/assets/vibes/cinematic.jpg.asset.json";
import healingImg from "@/assets/vibes/healing.jpg.asset.json";
import lightningImg from "@/assets/vibes/lightning.jpg.asset.json";
import jazzImg from "@/assets/vibes/jazz.jpg.asset.json";
import clubImg from "@/assets/vibes/club.jpg.asset.json";
import reggaeImg from "@/assets/vibes/reggae.jpg.asset.json";
import rebellionImg from "@/assets/vibes/rebellion.jpg.asset.json";
import shadowImg from "@/assets/vibes/shadow.jpg.asset.json";

/** A neoVIBE — an emotional/genre lens over the whole neoUNIVERSE catalog. */
export interface Vibe {
  id: string;
  label: string;
  tagline: string;
  /** Keywords matched against track title + description (lowercased). */
  keywords: string[];
  /** Two-stop gradient for the card (decorative only). */
  from: string;
  to: string;
  emoji: string;
  /** Optional cover image for the card. */
  image?: string;
  /** When true, ignores keywords and builds a random emotional journey. */
  random?: boolean;
}


export const VIBES: Vibe[] = [
  {
    id: "jazz",
    label: "neoJAZZ",
    tagline: "Smooth, soulful, after-hours",
    keywords: ["jazz", "smooth", "sax", "saxophone", "soul", "blues", "lounge", "swing", "brass", "noir", "mellow", "groove"],
    from: "#1e3a8a", to: "#7c3aed", emoji: "🎷", image: jazzImg.url,
  },
  {
    id: "club",
    label: "neoCLUB",
    tagline: "Party anthems & high energy",
    keywords: ["club", "party", "dance", "anthem", "boom", "energy", "beat", "drop", "bass", "house", "rave", "banger", "hip hop", "hip-hop", "trap", "drill", "explode", "movement"],
    from: "#db2777", to: "#06b6d4", emoji: "🪩", image: clubImg.url,
  },
  {
    id: "reggae",
    label: "neoREGGAE",
    tagline: "Island roots & sunshine riddim",
    keywords: ["reggae", "island", "dub", "roots", "caribbean", "jamaica", "riddim", "dancehall", "sunshine", "tropical", "beach", "palm"],
    from: "#16a34a", to: "#facc15", emoji: "🌴", image: reggaeImg.url,
  },
  {
    id: "healing",
    label: "neoHEALING",
    tagline: "Calm, presence & recovery",
    keywords: ["healing", "heal", "calm", "peace", "breathe", "breathing", "meditation", "ambient", "recovery", "restore", "gentle", "presence", "mindful", "soft", "still", "quiet", "rest"],
    from: "#0d9488", to: "#a3e635", emoji: "🌿", image: healingImg.url,
  },
  {
    id: "rebellion",
    label: "neoREBELLION",
    tagline: "Fight, freedom & uprising",
    keywords: ["rebellion", "rebel", "fight", "freedom", "revolution", "uprising", "defiance", "power", "rise", "riot", "resist", "warrior", "battle", "stand", "war"],
    from: "#dc2626", to: "#f97316", emoji: "✊", image: rebellionImg.url,
  },
  {
    id: "cinematic",
    label: "neoCINEMATIC",
    tagline: "Epic scores & sweeping journeys",
    keywords: ["cinematic", "epic", "orchestral", "film", "score", "journey", "imax", "soundtrack", "dramatic", "sweeping", "story", "saga", "ancient", "temple"],
    from: "#4338ca", to: "#0ea5e9", emoji: "🎬", image: cinematicImg.url,
  },
  {
    id: "shadow",
    label: "neoSHADOW",
    tagline: "Dark nights & shadow work",
    keywords: ["shadow", "dark", "darkness", "night", "late night", "monster", "ego", "mask", "fear", "void", "abyss", "noir", "hidden", "demon", "midnight"],
    from: "#1e1b4b", to: "#6d28d9", emoji: "🌑", image: shadowImg.url,
  },
  {
    id: "lightning",
    label: "neoLIGHTNING",
    tagline: "Thunder, speed & raw power",
    keywords: ["lightning", "thunder", "storm", "electric", "speed", "mach", "afterburner", "fire", "blaze", "charge", "surge", "raptor", "freedom", "explosive"],
    from: "#0891b2", to: "#facc15", emoji: "⚡", image: lightningImg.url,
  },
  {
    id: "africa",
    label: "neoAFRICA",
    tagline: "Desert, savanna & world rhythms",
    keywords: ["africa", "desert", "savanna", "tribal", "world", "egypt", "sands", "rainforest", "ancestral", "drum"],
    from: "#b45309", to: "#ea580c", emoji: "🌍",
  },
  {
    id: "spirit",
    label: "neoSPIRIT",
    tagline: "Faith, redemption & the sacred",
    keywords: ["spirit", "god", "gospel", "faith", "prayer", "sacred", "redemption", "soul", "ancient", "divine", "heaven", "transformation", "rebirth"],
    from: "#7c2d12", to: "#fbbf24", emoji: "🕊️",
  },
  {
    id: "love",
    label: "neoLOVE",
    tagline: "Romance, longing & late-night hearts",
    keywords: ["love", "heart", "romance", "she", "her", "waited", "longing", "kiss", "tender", "forever", "together"],
    from: "#be185d", to: "#a855f7", emoji: "💜",
  },
  {
    id: "patriot",
    label: "neoPATRIOT",
    tagline: "Liberty, country & the brave",
    keywords: ["america", "american", "freedom", "liberty", "soldier", "flag", "patriot", "usa", "military", "veteran", "anthem", "brave"],
    from: "#1d4ed8", to: "#dc2626", emoji: "🇺🇸",
  },
  {
    id: "surprise",
    label: "Surprise Me",
    tagline: "A random emotional journey",
    keywords: [],
    from: "#7c3aed", to: "#06b6d4", emoji: "✨",
    random: true,
  },
];

/** Synonyms expand free-text searches into richer keyword sets. */
const SYNONYMS: Record<string, string[]> = {
  workout: ["workout", "energy", "power", "run", "gym", "training", "speed", "pump", "beast", "grind"],
  sad: ["loss", "grief", "tears", "pain", "broken", "alone", "lonely", "sorrow"],
  happy: ["joy", "sunshine", "bright", "celebration", "uplift", "smile", "good"],
  chill: ["chill", "lo-fi", "lofi", "calm", "relax", "smooth", "mellow", "ambient"],
  focus: ["focus", "deep", "study", "flow", "concentration", "ambient"],
  motivation: ["motivation", "rise", "grind", "success", "push", "never quit", "discipline", "power"],
  opera: ["opera", "aria", "orchestral", "classical", "soprano", "epic"],
  glitch: ["glitch", "industrial", "distorted", "circuit", "machine", "digital"],
  drive: ["drive", "highway", "night", "synthwave", "road", "cruise"],
  redemption: ["redemption", "rebirth", "transformation", "rise", "second chance", "comeback"],
  presence: ["presence", "present", "still", "mindful", "now", "breathe"],
  rebellion: ["rebellion", "rebel", "fight", "freedom", "uprising", "resist"],
};

function normalize(s: string | null | undefined): string {
  return (s ?? "").toLowerCase();
}

/** Score a single track against a set of keywords. Title hits weigh more. */
export function scoreTrack(track: Track, keywords: string[]): number {
  if (!keywords.length) return 0;
  const title = normalize(track.title);
  const desc = normalize(track.description);
  const genres = (track.genres ?? []).map((g) => g.toLowerCase());
  let score = 0;
  for (const kw of keywords) {
    const k = kw.toLowerCase();
    if (!k) continue;
    if (title.includes(k)) score += 4;
    if (genres.some((g) => g.includes(k))) score += 3;
    if (desc.includes(k)) score += 1;
  }
  return score;
}

/** Expand a free-text query into a keyword list using synonyms + vibe sets. */
export function expandQuery(query: string): string[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const tokens = q.split(/[\s,]+/).filter((t) => t.length > 1);
  const set = new Set<string>(tokens);
  // whole-query and per-token synonym expansion
  for (const [key, syns] of Object.entries(SYNONYMS)) {
    if (q.includes(key) || tokens.includes(key)) syns.forEach((s) => set.add(s));
  }
  // pull in matching vibe keyword banks when a vibe name/word is mentioned
  for (const v of VIBES) {
    if (v.random) continue;
    const hit = v.keywords.some((k) => q.includes(k)) || q.includes(v.id) || q.includes(v.label.toLowerCase());
    if (hit) v.keywords.forEach((k) => set.add(k));
  }
  return Array.from(set);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Build a ranked neoVIBE playlist from the full catalog. */
export function buildPlaylist(tracks: Track[], keywords: string[], limit = 30): Track[] {
  if (!keywords.length) return shuffle(tracks).slice(0, limit);
  const scored = tracks
    .map((t) => ({ t, s: scoreTrack(t, keywords) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s);
  return scored.slice(0, limit).map((x) => x.t);
}

/** Build a playlist for a vibe card. */
export function buildVibePlaylist(tracks: Track[], vibe: Vibe, limit = 30): Track[] {
  if (vibe.random) return shuffle(tracks).slice(0, limit);
  const result = buildPlaylist(tracks, vibe.keywords, limit);
  // Always return something — fall back to a shuffled mix if no keyword hits.
  return result.length ? result : shuffle(tracks).slice(0, limit);
}
