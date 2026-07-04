// src/context/PlayerContext.tsx
"use client";

import React, { createContext, useContext, useState } from "react";
import { Song } from "@/types";

type RepeatMode = "OFF" | "ALL" | "ONE";

interface PlayerContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  queue: Song[];
  isShuffle: boolean;
  repeatMode: RepeatMode;
  playSong: (song: Song, newQueue?: Song[]) => void;
  togglePlay: () => void;
  setQueue: (songs: Song[]) => void;
  playNext: () => void;
  playPrevious: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState<Song[]>([]);

  // استیت‌های جدید برای شافل و تکرار
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("OFF");

  const playSong = (song: Song, newQueue?: Song[]) => {
    setCurrentSong(song);
    setIsPlaying(true);
    if (newQueue) {
      setQueue(newQueue);
    }
  };

  const togglePlay = () => {
    if (currentSong) setIsPlaying(!isPlaying);
  };

  const toggleShuffle = () => setIsShuffle(!isShuffle);

  const cycleRepeat = () => {
    setRepeatMode((prev) => {
      if (prev === "OFF") return "ALL";
      if (prev === "ALL") return "ONE";
      return "OFF";
    });
  };

  // هوشمندسازی تابع رفتن به آهنگ بعدی
  const playNext = () => {
    if (!currentSong || queue.length === 0) return;

    // اگر شافل روشن بود، یک آهنگ تصادفی از صف انتخاب کن
    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * queue.length);
      playSong(queue[randomIndex]);
      return;
    }

    const currentIndex = queue.findIndex((song) => song.id === currentSong.id);

    if (currentIndex !== -1 && currentIndex < queue.length - 1) {
      // رفتن به آهنگ بعدی در حالت عادی
      playSong(queue[currentIndex + 1]);
    } else if (repeatMode === "ALL") {
      // اگر به آخر صف رسیدیم و تکرار کل روشن بود، برو اول صف
      playSong(queue[0]);
    } else {
      // اگر آخر صف بودیم و تکرار خاموش بود، متوقف شو
      setIsPlaying(false);
    }
  };

  const playPrevious = () => {
    if (!currentSong || queue.length === 0) return;
    const currentIndex = queue.findIndex((song) => song.id === currentSong.id);

    if (currentIndex > 0) {
      playSong(queue[currentIndex - 1]);
    } else if (repeatMode === "ALL") {
      playSong(queue[queue.length - 1]);
    }
  };

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        queue,
        isShuffle,
        repeatMode,
        playSong,
        togglePlay,
        setQueue,
        playNext,
        playPrevious,
        toggleShuffle,
        cycleRepeat,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (context === undefined)
    throw new Error("usePlayer must be used within a PlayerProvider");
  return context;
};
