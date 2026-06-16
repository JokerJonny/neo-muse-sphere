import type { Tables } from "@/integrations/supabase/types";

export type Track = Tables<"tracks">;
export type Album = Tables<"albums">;
export type Profile = Tables<"profiles">;
export type Purchase = Tables<"purchases">;
export type Playlist = Tables<"playlists">;
export type YouTubePlaylist = Tables<"youtube_playlists">;
export type YouTubePlaylistItem = Tables<"youtube_playlist_items">;

export type TrackWithAlbum = Track & { album?: Album | null };

export type SortMode = "newest" | "oldest" | "popular";
