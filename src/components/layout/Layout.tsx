import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { PlayerBar } from "@/components/layout/PlayerBar";
import { VideoOverlay } from "@/components/layout/VideoOverlay";
import { usePlayer } from "@/hooks/use-player";

export function Layout({ children }: { children: ReactNode }) {
  const { current } = usePlayer();
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className={current ? "flex-1 pb-28" : "flex-1"}>{children}</main>
      <PlayerBar />
      <VideoOverlay />
    </div>
  );
}
