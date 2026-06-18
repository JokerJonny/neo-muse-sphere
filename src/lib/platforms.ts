import {
  siYoutube,
  siSpotify,
  siFacebook,
  siInstagram,
  siX,
  siTiktok,
  siGithub,
  siApplemusic,
  type SimpleIcon,
} from "simple-icons";
import { Globe, Sparkles, Rocket, Music2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type BrandKey =
  | "youtube"
  | "spotify"
  | "facebook"
  | "instagram"
  | "x"
  | "tiktok"
  | "github"
  | "applemusic"
  | "amazonmusic"
  | "universe"
  | "neoshadeai"
  | "neoshade"
  | "websiteo2";

export type Brand =
  | { kind: "simple"; icon: SimpleIcon }
  | { kind: "lucide"; icon: LucideIcon };

export const BRANDS: Record<BrandKey, Brand> = {
  youtube: { kind: "simple", icon: siYoutube },
  spotify: { kind: "simple", icon: siSpotify },
  facebook: { kind: "simple", icon: siFacebook },
  instagram: { kind: "simple", icon: siInstagram },
  x: { kind: "simple", icon: siX },
  tiktok: { kind: "simple", icon: siTiktok },
  github: { kind: "simple", icon: siGithub },
  applemusic: { kind: "simple", icon: siApplemusic },
  amazonmusic: { kind: "lucide", icon: Music2 },
  universe: { kind: "lucide", icon: Sparkles },
  neoshadeai: { kind: "lucide", icon: Rocket },
  neoshade: { kind: "lucide", icon: Globe },
  websiteo2: { kind: "lucide", icon: Globe },
};

export type Platform = {
  key: BrandKey;
  label: string;
  url: string;
  description: string;
};

export type PlatformCategory = {
  id: "watch" | "listen" | "connect" | "build" | "explore";
  title: string;
  platforms: Platform[];
};

export const PLATFORM_CATEGORIES: PlatformCategory[] = [
  {
    id: "watch",
    title: "Watch",
    platforms: [
      {
        key: "youtube",
        label: "neoSHADE AI",
        url: "https://www.youtube.com/@NeoShade-AI",
        description: "Official cinematic music videos, animations, shorts & releases.",
      },
      {
        key: "youtube",
        label: "Jonathan George",
        url: "https://www.youtube.com/@JonathanGeorgeArt",
        description: "Creator content, projects, commentary & updates.",
      },
      {
        key: "youtube",
        label: "neoSHADE VEVO",
        url: "https://www.youtube.com/@NeoShadeVEVO",
        description: "Official music distribution channel.",
      },
    ],
  },
  {
    id: "listen",
    title: "Listen",
    platforms: [
      {
        key: "spotify",
        label: "Spotify",
        url: "https://open.spotify.com/artist/2DuUdfmZ26CFPtOOnp1DaV/discography/all",
        description: "Complete neoSHADE discography.",
      },
      {
        key: "applemusic",
        label: "Apple Music",
        url: "https://music.apple.com/gb/artist/neoshade/1859903376",
        description: "Official artist catalog.",
      },
      {
        key: "amazonmusic",
        label: "Amazon Music",
        url: "https://music.amazon.com/artists/B0DVZNTQZR",
        description: "Official artist catalog.",
      },
    ],
  },
  {
    id: "connect",
    title: "Connect",
    platforms: [
      {
        key: "facebook",
        label: "Facebook",
        url: "https://www.facebook.com/profile.php?id=61571943296570",
        description: "Community updates & announcements.",
      },
      {
        key: "instagram",
        label: "Instagram",
        url: "https://instagram.com/neoshademusic",
        description: "Music, artwork, visuals & announcements.",
      },
      {
        key: "x",
        label: "X",
        url: "https://x.com/neoshade2025",
        description: "Updates, releases & project announcements.",
      },
      {
        key: "tiktok",
        label: "TikTok",
        url: "https://www.tiktok.com/@neoshadeai",
        description: "Short-form music content & promo clips.",
      },
    ],
  },
  {
    id: "build",
    title: "Build",
    platforms: [
      {
        key: "github",
        label: "GitHub",
        url: "https://github.com/JokerJonny",
        description: "Apps, repositories, AI tools & source code.",
      },
      {
        key: "websiteo2",
        label: "WebsiteO2",
        url: "https://websiteo2.com",
        description: "Web development, design & business projects.",
      },
    ],
  },
  {
    id: "explore",
    title: "Explore",
    platforms: [
      {
        key: "neoshadeai",
        label: "neoSHADE AI",
        url: "https://neoshadeai.com",
        description: "Primary brand HQ — music, AI, apps & media.",
      },
      {
        key: "universe",
        label: "neoUNIVERSE",
        url: "https://universe.neo-shade.com",
        description: "The official cyberpunk multimedia hub.",
      },
      {
        key: "neoshade",
        label: "neoSHADE",
        url: "https://neo-shade.com",
        description: "Original neoSHADE website & content archive.",
      },
    ],
  },
];

/** Compact social set used in the header, dock & quick actions. */
export const SOCIAL_LINKS: { key: BrandKey; label: string; url: string }[] = [
  { key: "youtube", label: "YouTube", url: "https://www.youtube.com/@NeoShade-AI" },
  {
    key: "spotify",
    label: "Spotify",
    url: "https://open.spotify.com/artist/2DuUdfmZ26CFPtOOnp1DaV/discography/all",
  },
  {
    key: "facebook",
    label: "Facebook",
    url: "https://www.facebook.com/profile.php?id=61571943296570",
  },
  { key: "instagram", label: "Instagram", url: "https://instagram.com/neoshademusic" },
  { key: "x", label: "X", url: "https://x.com/neoshade2025" },
  { key: "tiktok", label: "TikTok", url: "https://www.tiktok.com/@neoshadeai" },
  { key: "github", label: "GitHub", url: "https://github.com/JokerJonny" },
];
