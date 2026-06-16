import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Download, Loader2, Heart } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { getDownloadUrl } from "@/lib/media.functions";
import { formatMoney, youtubeThumb } from "@/lib/format";
import type { Track } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/library")({
  head: () => ({ meta: [{ title: "Your Library — neoSHADE" }] }),
  component: Library,
});

function Library() {
  const { user } = useAuth();
  const purchases = useQuery({
    queryKey: ["purchases", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("purchases")
        .select("id, status, amount_cents, created_at, tracks(*)")
        .eq("status", "completed")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });
  const favorites = useQuery({
    queryKey: ["favorites", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("favorites").select("tracks(*)");
      return (data ?? []).map((f) => f.tracks).filter(Boolean) as Track[];
    },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold">Your Library</h1>

      <h2 className="mt-8 mb-3 font-display text-xl font-semibold">Downloads</h2>
      {purchases.isLoading ? (
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      ) : purchases.data?.length ? (
        <div className="space-y-2">
          {purchases.data.map((p) => {
            const t = p.tracks as Track | null;
            if (!t) return null;
            return <DownloadRow key={p.id} track={t} amount={p.amount_cents} />;
          })}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
          No purchases yet. <Link to="/catalog" className="text-primary hover:underline">Browse the catalog</Link>.
        </p>
      )}

      <h2 className="mt-10 mb-3 flex items-center gap-2 font-display text-xl font-semibold">
        <Heart className="h-5 w-5 text-accent" /> Favorites
      </h2>
      {favorites.data?.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {favorites.data.map((t) => (
            <div key={t.id} className="overflow-hidden rounded-lg border border-border bg-card">
              <img src={t.artwork_url || youtubeThumb(t.youtube_id) || ""} alt="" className="aspect-square w-full object-cover" />
              <p className="truncate p-2 text-sm">{t.title}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No favorites yet.</p>
      )}
    </div>
  );
}

function DownloadRow({ track, amount }: { track: Track; amount: number }) {
  const [busy, setBusy] = useState(false);
  async function download() {
    setBusy(true);
    try {
      const res = await getDownloadUrl({ data: { trackId: track.id } });
      if (res.url) window.location.href = res.url;
      else toast.error("Download not available");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Download failed");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
      <img src={track.artwork_url || youtubeThumb(track.youtube_id) || ""} alt="" className="h-12 w-12 rounded-md object-cover" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{track.title}</p>
        <p className="text-xs text-muted-foreground">{formatMoney(amount)} · owned</p>
      </div>
      <button onClick={download} disabled={busy} className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} MP3
      </button>
    </div>
  );
}
