import { useState } from "react";
import { RefreshCw, Disc3 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { syncReleases } from "@/lib/youtube.functions";

export function SyncReleasesButton({ className }: { className?: string }) {
  const { isAdmin } = useAuth();
  const sync = useServerFn(syncReleases);
  const qc = useQueryClient();
  const [loading, setLoading] = useState(false);

  if (!isAdmin) return null;

  async function handleSync() {
    setLoading(true);
    const t = toast.loading("Syncing releases from YouTube…");
    try {
      const res = await sync({});
      await qc.invalidateQueries({ queryKey: ["yt-playlists"] });
      toast.success(`Synced ${res.playlists} release${res.playlists === 1 ? "" : "s"}.`, { id: t });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Release sync failed.", { id: t });
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleSync}
      disabled={loading}
      className={cn(
        "group relative inline-flex items-center gap-2 overflow-hidden rounded-lg border border-primary/60 bg-primary/10 px-5 py-2.5 font-display text-sm font-bold uppercase tracking-wider text-primary transition-all hover:bg-primary hover:text-primary-foreground hover:shadow-[var(--shadow-neon)] disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
    >
      {loading ? (
        <RefreshCw className="h-4 w-4 animate-spin" />
      ) : (
        <Disc3 className="h-4 w-4" />
      )}
      {loading ? "Syncing…" : "Sync Releases"}
    </button>
  );
}
