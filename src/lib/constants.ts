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
  youtubeSubscribers: 1200,
  spotifyMonthlyListeners: 3400,
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
