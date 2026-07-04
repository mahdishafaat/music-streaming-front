// src/components/player/MusicPlayer.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePlayer } from "@/context/PlayerContext";

export default function MusicPlayer() {
  const { currentSong, isPlaying, togglePlay } = usePlayer();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current
          .play()
          .catch((err) => console.log("Audio play error:", err));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSong]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      if (duration) {
        setProgress((current / duration) * 100);
      }
    }
  };

  // تابع جدید برای محاسبه محل کلیک کاربر و تغییر زمان آهنگ
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current && audioRef.current.duration) {
      // پیدا کردن مختصات نوار روی صفحه
      const rect = e.currentTarget.getBoundingClientRect();
      // محاسبه فاصله کلیک از ابتدای نوار
      const clickX = e.clientX - rect.left;
      // محاسبه درصد
      const percentage = clickX / rect.width;

      // تغییر زمان آهنگ اصلی
      audioRef.current.currentTime = percentage * audioRef.current.duration;
      setProgress(percentage * 100);
    }
  };

  if (!currentSong) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 bg-white border-t border-gray-200 px-6 flex items-center justify-between z-50 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)]">
      <div className="flex items-center gap-4 w-1/4">
        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
          <Image
            src={currentSong.coverImage || "/default-cover.png"}
            alt={currentSong.title}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
        <div className="flex flex-col min-w-0">
          <Link
            href={currentSong.albumId ? `/albums/${currentSong.albumId}` : "#"}
            className="font-bold text-gray-900 hover:text-green-600 truncate transition-colors"
          >
            {currentSong.title}
          </Link>
          <span className="text-xs text-gray-500 truncate">
            {currentSong.artistId}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center gap-2 w-2/4">
        <div className="flex items-center gap-6">
          <button className="text-gray-400 hover:text-green-600 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </button>

          <button
            onClick={togglePlay}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-green-100 text-green-700 hover:bg-green-600 hover:text-white transition-all shadow-sm"
          >
            {isPlaying ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 ml-1"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <button className="text-gray-400 hover:text-green-600 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
          </button>
        </div>

        {/* متصل کردن رویداد کلیک به نوار پیشرفت و افزایش ارتفاع برای کلیک راحت‌تر */}
        <div className="w-full max-w-md flex items-center gap-2">
          <div
            className="h-2 w-full bg-gray-200 rounded-full overflow-hidden cursor-pointer relative"
            onClick={handleSeek}
          >
            <div
              className="absolute top-0 left-0 h-full bg-green-500 rounded-full transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-4 w-1/4">
        {/* بعداً اینجا آیکون صف، شافل و صدا اضافه می‌شه */}
      </div>

      <audio
        ref={audioRef}
        src={currentSong.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => togglePlay()}
      />
    </div>
  );
}
