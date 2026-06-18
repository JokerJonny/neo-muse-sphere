export const BRAND = {
  name: "neoSHADE",
  universe: "neoUNIVERSE",
  tagline: "Music · Video · Lore from the neon dark",
  intro: "neoSHADE (NeoShade-AI) — a surreal cyberpunk audiovisual project.",
  bio: "Cinematic IMAX-scale soundscapes forged in the neon dark. The neoUNIVERSE is the central living hub for every release, video, unreleased transmission, and emotional journey.",
  youtubeHandle: "@NeoShade-AI",
  youtubeUrl: "https://www.youtube.com/@NeoShade-AI",
  spotifyArtistId: "2DuUdfmZ26CFPtOOnp1DaV",
  spotifyUrl: "https://open.spotify.com/artist/2DuUdfmZ26CFPtOOnp1DaV",
  site: "https://neo-shade.com",
  merchUrl: "https://neoshade.printify.me/",
  trackPriceCents: 50,
};

/**
 * Editable placeholder figures for external platforms that have no live API
 * wired up yet. Albums / Songs / Videos / Shorts are fetched live from the
 * catalog (see fetchArtistCounts); these two are manual until an API is added.
 * Set to null to render a "—" placeholder instead.
 */
export const ARTIST_SOCIAL_STATS: {
  youtubeSubscribers: number | null;
  spotifyMonthlyListeners: number | null;
} = {
  youtubeSubscribers: 12400,
  spotifyMonthlyListeners: 45000,
};

/**
 * Display counts for the artist profile statistics row. These are the
 * public-facing figures shown on the card; live DB totals remain available via
 * fetchArtistCounts when an API connection is ready.
 */
export const ARTIST_COUNTS: {
  youtubeSubscribers: { value: number; mode: "compact" | "exact"; suffix: string };
  spotifyMonthlyListeners: { value: number; mode: "compact" | "exact"; suffix: string };
  albums: { value: number; mode: "compact" | "exact"; suffix: string };
  songs: { value: number; mode: "compact" | "exact"; suffix: string };
  videos: { value: number; mode: "compact" | "exact"; suffix: string };
  shorts: { value: number; mode: "compact" | "exact"; suffix: string };
} = {
  youtubeSubscribers: { value: 12400, mode: "compact", suffix: "" },
  spotifyMonthlyListeners: { value: 45000, mode: "compact", suffix: "" },
  albums: { value: 105, mode: "exact", suffix: "" },
  songs: { value: 1900, mode: "exact", suffix: "+" },
  videos: { value: 170, mode: "exact", suffix: "+" },
  shorts: { value: 50, mode: "exact", suffix: "+" },
};

export const GENRES = [
  "Cyberpunk",
  "Synthwave",
  "Darkwave",
  "Industrial",
  "Cinematic",
  "Ambient",
  "Trap",
  "Electronic",
  "Phonk",
  "Drill",
  "Lo-fi",
  "Experimental",
];
