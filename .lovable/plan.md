## Goal
Rebuild neoSHADE's navigation and catalog to mirror an official artist YouTube channel + personal universe: Home, Videos, Shorts, Releases/Albums, Playlists, Posts — each cinematic, filterable, and wired into the neoPLAYER. Keep PayPal store, YouTube sync, and the player intact.

## YouTube API realities (how each tab is sourced)
- **Videos vs Shorts**: The Data API does not flag Shorts. I'll classify by duration: `is_short = duration ≤ 60s` (or title/description containing `#shorts`). Current data: 42 shorts (≤60s), 182 long-form. Videos tab excludes shorts; Shorts tab shows only them.
- **Playlists**: Real channel playlists via the `playlists` + `playlistItems` endpoints, stored in new tables and shown with cover art + item counts.
- **Posts**: The Data API v3 has **no** Community/Posts endpoint. This tab will be a styled placeholder linking to the channel's Community tab (as you noted, "placeholder for now").
- **Popularity sorting**: I'll pull `statistics.viewCount` during sync so "Popular" sorting works.

## Database (migration)
Add to `tracks`: `is_short boolean default false`, `view_count bigint default 0`, `like_count bigint default 0`, `published_at timestamptz`.
New tables (public-read, service-role writes via sync):
- `youtube_playlists` (yt id, title, description, artwork_url, item_count, published_at, sort_order, is_published)
- `youtube_playlist_items` (playlist_id fk, youtube_id, position, title, artwork_url)
Each gets GRANTs + RLS: anon/authenticated SELECT on published rows; writes only via service role.

## Sync upgrade (`youtube.functions.ts`)
- Resolve channelId (not just uploads playlist).
- Pull `contentDetails,statistics` in the videos batch → set duration, view_count, like_count, is_short, published_at.
- Fetch all channel playlists + their items; upsert into the new tables.
- Return counts: videos added/updated, shorts, playlists.

## Queries (`queries.ts`)
- `fetchVideos({ sort })` — long-form only (`is_short=false`).
- `fetchShorts({ sort })` — shorts only.
- `fetchTrending()` — top by view_count.
- `fetchYouTubePlaylists()` + `fetchPlaylistItems(id)`.
- Shared sort: Newest / Oldest / Popular.

## Routes & nav
- **Header**: Home · Videos · Shorts · Releases · Playlists · Posts, plus Store (cart) + admin/sync preserved.
- `index.tsx` (Home): hero, latest releases, featured videos, trending in neoUNIVERSE, quick-access cards to each tab.
- `videos.tsx`: long-form grid + sort filter + featured hero (cinematic, already styled).
- `shorts.tsx` (new): vertical 9:16 grid/carousel; opens vertical player.
- `albums.tsx` → relabel **Releases/Albums**, group releases.
- `playlists.tsx` (new): channel playlists grid → playlist detail opens items in neoPLAYER.
- `posts.tsx` (new): styled placeholder + link to Community tab.
- A reusable `<SortFilter>` control with neon styling.

## Player
- `VideoOverlay` adapts to vertical (9:16, max-w-sm) for shorts vs 16:9 for videos. Clicking any item everywhere opens the neoPLAYER overlay.

## Styling
Consistent neon/glitch/cinematic treatment across all tabs using existing tokens (`--shadow-neon`, gradients, scanlines, GlitchText).

After building, I'll run a fresh sync to populate `is_short`, view counts, and playlists, then verify each tab in the preview.
