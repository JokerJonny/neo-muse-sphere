import { createFileRoute } from "@tanstack/react-router";
import { ytDiag } from "@/lib/yt-diag.functions";

export const Route = createFileRoute("/api/yt-diag")({
  server: {
    handlers: {
      GET: async () => {
        const result = await ytDiag();
        return new Response(JSON.stringify(result, null, 2), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
