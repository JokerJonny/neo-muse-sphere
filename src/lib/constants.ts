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
 * Display counts for the artist profile statistics row. These are the
 * public-facing figures shown on the card; live DB totals remain available via
 * fetchArtistCounts when an API connection is ready.
 */
export const ARTIST_COUNTS: {
  youtubeSubscribers: { value: number; mode: "compact" | "exact"; suffix: string; label: string };
  spotifyMonthlyListeners: { value: number; mode: "compact" | "exact"; suffix: string; label: string };
  totalViews: { value: number; mode: "compact" | "exact"; suffix: string; label: string };
  liveAlbums: { value: number; mode: "compact" | "exact"; suffix: string; label: string };
  backloggedAlbums: { value: number; mode: "compact" | "exact"; suffix: string; label: string };
  songs: { value: number; mode: "compact" | "exact"; suffix: string; label: string };
  videos: { value: number; mode: "compact" | "exact"; suffix: string; label: string };
  shorts: { value: number; mode: "compact" | "exact"; suffix: string; label: string };
} = {
  youtubeSubscribers: { value: 110, mode: "exact", suffix: "", label: "YouTube Subscribers" },
  spotifyMonthlyListeners: { value: 27000, mode: "compact", suffix: "", label: "Monthly Listeners" },
  totalViews: { value: 46000, mode: "compact", suffix: "", label: "Total Views" },
  liveAlbums: { value: 70, mode: "exact", suffix: "", label: "Live Albums" },
  backloggedAlbums: { value: 67, mode: "exact", suffix: "", label: "Backlogged Albums" },
  songs: { value: 1200, mode: "exact", suffix: "+", label: "Total Songs" },
  videos: { value: 227, mode: "exact", suffix: "+", label: "Videos" },
  shorts: { value: 50, mode: "exact", suffix: "+", label: "Shorts" },
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
