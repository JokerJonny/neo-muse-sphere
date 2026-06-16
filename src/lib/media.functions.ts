import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const idInput = (data: unknown) => z.object({ trackId: z.string().uuid() }).parse(data);

/**
 * Public free-streaming URL: short-lived signed URL for in-site listening.
 * Available to guests and logged-in users alike.
 */
export const getStreamUrl = createServerFn({ method: "POST" })
  .inputValidator(idInput)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: track, error } = await supabaseAdmin
      .from("tracks")
      .select("id, file_path, is_published")
      .eq("id", data.trackId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!track || !track.is_published || !track.file_path) {
      return { url: null as string | null };
    }

    const { data: signed, error: signErr } = await supabaseAdmin.storage
      .from("track-files")
      .createSignedUrl(track.file_path, 60 * 60); // 1 hour stream window

    if (signErr) throw new Error(signErr.message);
    return { url: signed?.signedUrl ?? null };
  });

/**
 * Secure download URL — only for tracks the authenticated user has purchased.
 * Returns a time-limited link with a download disposition.
 */
export const getDownloadUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(idInput)
  .handler(async ({ data, context }) => {
    const { userId } = context;

    const { data: purchase } = await context.supabase
      .from("purchases")
      .select("id, status")
      .eq("user_id", userId)
      .eq("track_id", data.trackId)
      .eq("status", "completed")
      .maybeSingle();

    if (!purchase) {
      throw new Error("You have not purchased this track.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: track } = await supabaseAdmin
      .from("tracks")
      .select("file_path, title")
      .eq("id", data.trackId)
      .maybeSingle();

    if (!track?.file_path) throw new Error("Download file not available.");

    const { data: signed, error } = await supabaseAdmin.storage
      .from("track-files")
      .createSignedUrl(track.file_path, 60 * 10, {
        download: `${track.title || "neoSHADE-track"}.mp3`,
      });

    if (error) throw new Error(error.message);
    return { url: signed?.signedUrl ?? null };
  });
