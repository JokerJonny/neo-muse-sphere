import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { Track } from "@/lib/types";
import { getStreamUrl } from "@/lib/media.functions";

type RepeatMode = "off" | "all" | "one";

interface PlayerContextValue {
  queue: Track[];
  current: Track | null;
  currentIndex: number;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  shuffle: boolean;
  repeat: RepeatMode;
  loadingTrack: boolean;
  videoOpen: boolean;
  playTrack: (track: Track, queue?: Track[]) => void;
  togglePlay: () => void;
  next: () => void;
  prev: () => void;
  seek: (t: number) => void;
  setVolume: (v: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  openVideo: () => void;
  closeVideo: () => void;
}

const PlayerContext = createContext<PlayerContextValue | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>("off");
  const [loadingTrack, setLoadingTrack] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);

  const current = currentIndex >= 0 ? queue[currentIndex] ?? null : null;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const audio = new Audio();
    audio.volume = volume;
    audioRef.current = audio;

    const onTime = () => setProgress(audio.currentTime);
    const onMeta = () => setDuration(audio.duration || 0);
    const onEnd = () => handleEnded();
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnd);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnd);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAndPlay = useCallback(async (track: Track) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!track.file_path && !track.preview_url) {
      // YouTube/Spotify-only track: open the video experience.
      setVideoOpen(!!track.youtube_id);
      setIsPlaying(false);
      return;
    }

    setLoadingTrack(true);
    try {
      let src = track.preview_url ?? null;
      if (track.file_path) {
        const res = await getStreamUrl({ data: { trackId: track.id } });
        src = res.url ?? src;
      }
      if (!src) {
        setLoadingTrack(false);
        return;
      }
      audio.src = src;
      await audio.play();
    } catch {
      setIsPlaying(false);
    } finally {
      setLoadingTrack(false);
    }
  }, []);

  function handleEnded() {
    setIsPlaying(false);
    setProgress(0);
    // use refs through state setters
    setCurrentIndex((idx) => {
      if (repeat === "one") {
        const t = queue[idx];
        if (t) void loadAndPlay(t);
        return idx;
      }
      let nextIdx = shuffle
        ? Math.floor(Math.random() * queue.length)
        : idx + 1;
      if (nextIdx >= queue.length) {
        if (repeat === "all") nextIdx = 0;
        else return idx;
      }
      const t = queue[nextIdx];
      if (t) void loadAndPlay(t);
      return nextIdx;
    });
  }

  const playTrack: PlayerContextValue["playTrack"] = (track, newQueue) => {
    const q = newQueue && newQueue.length ? newQueue : [track];
    const idx = q.findIndex((t) => t.id === track.id);
    setQueue(q);
    setCurrentIndex(idx >= 0 ? idx : 0);
    void loadAndPlay(track);
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !current) return;
    if (!current.file_path && !current.preview_url) {
      setVideoOpen(true);
      return;
    }
    if (audio.paused) void audio.play();
    else audio.pause();
  };

  const next = () => {
    if (!queue.length) return;
    let nextIdx = shuffle ? Math.floor(Math.random() * queue.length) : currentIndex + 1;
    if (nextIdx >= queue.length) nextIdx = 0;
    setCurrentIndex(nextIdx);
    void loadAndPlay(queue[nextIdx]);
  };

  const prev = () => {
    if (!queue.length) return;
    if (progress > 3 && audioRef.current) {
      audioRef.current.currentTime = 0;
      return;
    }
    let prevIdx = currentIndex - 1;
    if (prevIdx < 0) prevIdx = queue.length - 1;
    setCurrentIndex(prevIdx);
    void loadAndPlay(queue[prevIdx]);
  };

  const seek = (t: number) => {
    if (audioRef.current) audioRef.current.currentTime = t;
    setProgress(t);
  };

  const setVolume = (v: number) => {
    setVolumeState(v);
    if (audioRef.current) audioRef.current.volume = v;
  };

  const toggleShuffle = () => setShuffle((s) => !s);
  const cycleRepeat = () =>
    setRepeat((r) => (r === "off" ? "all" : r === "all" ? "one" : "off"));

  return (
    <PlayerContext.Provider
      value={{
        queue,
        current,
        currentIndex,
        isPlaying,
        progress,
        duration,
        volume,
        shuffle,
        repeat,
        loadingTrack,
        videoOpen,
        playTrack,
        togglePlay,
        next,
        prev,
        seek,
        setVolume,
        toggleShuffle,
        cycleRepeat,
        openVideo: () => setVideoOpen(true),
        closeVideo: () => setVideoOpen(false),
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}
