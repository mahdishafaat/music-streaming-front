// src/context/PlayerContext.tsx
"use client";

import React, { createContext, useContext, useState } from "react";
import { Song } from "@/types";

interface PlayerContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  queue: Song[];
  playSong: (song: Song, newQueue?: Song[]) => void;
  togglePlay: () => void;
  setQueue: (songs: Song[]) => void;
  // دو تا متد جدید برای آهنگ قبلی و بعدی
  playNext: () => void;
  playPrevious: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState<Song[]>([]);

  const playSong = (song: Song, newQueue?: Song[]) => {
    setCurrentSong(song);
    setIsPlaying(true);
    if (newQueue) {
      setQueue(newQueue);
    }
  };

  const togglePlay = () => {
    if (currentSong) {
      setIsPlaying(!isPlaying);
    }
  };

  // تابع رفتن به آهنگ بعدی
  const playNext = () => {
    if (!currentSong || queue.length === 0) return;

    // پیدا کردن ایندکس آهنگ فعلی تو صف
    const currentIndex = queue.findIndex((song) => song.id === currentSong.id);

    // اگر آهنگی تو صف بود و آهنگ آخر نبودیم
    if (currentIndex !== -1 && currentIndex < queue.length - 1) {
      playSong(queue[currentIndex + 1]);
    } else if (queue.length > 0) {
      // اگر به آخر صف رسیدیم، برگردیم به اول (Loop)
      playSong(queue[0]);
    }
  };

  // تابع رفتن به آهنگ قبلی
  const playPrevious = () => {
    if (!currentSong || queue.length === 0) return;

    const currentIndex = queue.findIndex((song) => song.id === currentSong.id);

    // اگر آهنگ اول نبودیم، برو به قبلی
    if (currentIndex > 0) {
      playSong(queue[currentIndex - 1]);
    } else if (queue.length > 0) {
      // اگر اول صف بودیم، برو به آهنگ آخر
      playSong(queue[queue.length - 1]);
    }
  };

  return (
    // پاس دادن متدهای جدید به Provider
    <PlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        queue,
        playSong,
        togglePlay,
        setQueue,
        playNext,
        playPrevious,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
};
