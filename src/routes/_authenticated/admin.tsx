import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Youtube, Video, Music } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { fetchVideos, fetchTracks } from "@/lib/queries";
import { SyncYouTubeButton } from "@/components/SyncYouTubeButton";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — neoSHADE" }] }),
  component: Admin,
});

function Admin() {
  const { isAdmin, loading } = useAuth();
  const { data: videos } = useQuery({ queryKey: ["videos"], queryFn: fetchVideos });
  const { data: tracks } = useQuery({ queryKey: ["tracks"], queryFn: () => fetchTracks() });

  if (loading) {
    return <div className="mx-auto max-w-5xl px-4 py-16 text-center text-muted-foreground">Loading…</div>;
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-bold">Restricted</h1>
        <p className="mt-2 text-muted-foreground">You need admin access to view this page.</p>
        <Link to="/" className="mt-6 inline-block text-accent underline-offset-4 hover:underline">
          Back home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">Admin Panel</h1>
      <p className="mt-1 text-muted-foreground">Manage the neoUNIVERSE catalog.</p>

      <section className="mt-8 overflow-hidden rounded-2xl border border-accent/40 bg-card neon-border">
        <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <Youtube className="h-6 w-6" />
            </span>
            <div>
              <h2 className="font-display text-xl font-bold">YouTube Sync</h2>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Import every video from <span className="text-foreground">@NeoShade-AI</span> — titles,
                thumbnails, durations and publish dates — straight into the catalog.
              </p>
            </div>
          </div>
          <SyncYouTubeButton />
        </div>
      </section>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Video className="h-4 w-4" /> Videos
          </div>
          <p className="mt-2 font-display text-3xl font-bold">{videos?.length ?? 0}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Music className="h-4 w-4" /> Total tracks
          </div>
          <p className="mt-2 font-display text-3xl font-bold">{tracks?.length ?? 0}</p>
        </div>
      </div>
    </div>
  );
}
