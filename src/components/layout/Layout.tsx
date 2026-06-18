import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PlayerBar } from "@/components/layout/PlayerBar";
import { VideoOverlay } from "@/components/layout/VideoOverlay";
import { FloatingSocialDock } from "@/components/social/FloatingSocialDock";
import { MobileQuickBar } from "@/components/social/MobileQuickBar";
import { usePlayer } from "@/hooks/use-player";

export function Layout({ children }: { children: ReactNode }) {
  const { current } = usePlayer();
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className={current ? "flex-1 pb-44 md:pb-28" : "flex-1 pb-16 md:pb-0"}>
        {children}
      </main>
      <Footer />
      <PlayerBar />
      <VideoOverlay />
      <FloatingSocialDock />
      <MobileQuickBar />
    </div>
  );
}
