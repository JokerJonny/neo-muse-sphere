import { createFileRoute } from "@tanstack/react-router";
import { MessageSquare, ExternalLink, Bell } from "lucide-react";
import { BRAND } from "@/lib/constants";

export const Route = createFileRoute("/posts")({
  head: () => ({
    meta: [
      { title: "Posts — neoSHADE" },
      { name: "description", content: "Community posts and transmissions from neoSHADE." },
      { property: "og:title", content: "neoSHADE Posts" },
    ],
  }),
  component: Posts,
});

function Posts() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
        <MessageSquare className="h-3.5 w-3.5" /> Community
      </span>
      <h1 className="mt-3 font-display text-3xl font-bold sm:text-5xl">Posts</h1>
      <p className="mt-1 text-muted-foreground">Transmissions from the neoUNIVERSE community feed.</p>

      <div className="scanlines relative mt-10 overflow-hidden rounded-2xl border border-border bg-card p-10 text-center neon-border">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/15 text-accent">
          <Bell className="h-8 w-8" />
        </span>
        <h2 className="mt-5 font-display text-xl font-bold">Community feed coming online</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Community posts live on the YouTube channel for now. Follow{" "}
          <span className="text-foreground">{BRAND.youtubeHandle}</span> to catch every announcement, poll and
          behind-the-scenes drop from the neon dark.
        </p>
        <a
          href={`${BRAND.youtubeUrl}/community`}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-semibold text-accent-foreground shadow-[var(--shadow-neon)] transition-transform hover:scale-105"
        >
          Open Community tab <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
