import { useState } from "react";
import { RefreshCw, Youtube } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { syncYouTube } from "@/lib/youtube.functions";

export function SyncYouTubeButton({ className }: { className?: string }) {
  const { isAdmin } = useAuth();
  const sync = useServerFn(syncYouTube);
  const qc = useQueryClient();
  const [loading, setLoading] = useState(false);

  if (!isAdmin) return null;

  async function handleSync() {
    setLoading(true);
    const t = toast.loading("Syncing videos from YouTube…");
    try {
      const res = await sync({});
      await qc.invalidateQueries();
      toast.success(
        `Synced ${res.total} videos — ${res.added} new, ${res.updated} updated.`,
        { id: t },
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "YouTube sync failed.", { id: t });
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleSync}
      disabled={loading}
      className={cn(
        "group relative inline-flex items-center gap-2 overflow-hidden rounded-lg border border-accent/60 bg-accent/10 px-5 py-2.5 font-display text-sm font-bold uppercase tracking-wider text-accent transition-all hover:bg-accent hover:text-accent-foreground hover:shadow-[var(--shadow-neon)] disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
    >
      {loading ? (
        <RefreshCw className="h-4 w-4 animate-spin" />
      ) : (
        <Youtube className="h-4 w-4" />
      )}
      {loading ? "Syncing…" : "Sync from YouTube"}
    </button>
  );
}
