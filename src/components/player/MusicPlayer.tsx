// src/components/player/MusicPlayer.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
// توابع جدید رو از کانتکست می‌گیریم
import { usePlayer } from "@/context/PlayerContext";

export default function MusicPlayer() {
  const { currentSong, isPlaying, togglePlay, playNext, playPrevious } =
    usePlayer();
  const audioRef = useRef<HTMLAudioElement>(null);

  const [progress, setProgress] = useState(0);
  // استیت‌های مربوط به کنترل صدا
  const [volume, setVolume] = useState(1); // از 0 تا 1
  const [isMuted, setIsMuted] = useState(false);

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

  // وقتی State ولوم عوض می‌شه، صدای المان Audio رو هم تغییر می‌دیم
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      if (duration) {
        setProgress((current / duration) * 100);
      }
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current && audioRef.current.duration) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      audioRef.current.currentTime = percentage * audioRef.current.duration;
      setProgress(percentage * 100);
    }
  };

  // هندلر تغییر صدا با اسلایدر
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  if (!currentSong) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 bg-white border-t border-gray-200 px-6 flex items-center justify-between z-50 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)]">
      <div className="flex items-center gap-4 w-1/4 min-w-[200px]">
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

      <div className="flex flex-col items-center justify-center gap-2 w-2/4 max-w-[600px]">
        <div className="flex items-center gap-6">
          {/* دکمه آهنگ قبلی متصل شد */}
          <button
            onClick={playPrevious}
            className="text-gray-400 hover:text-green-600 transition-colors"
          >
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

          {/* دکمه آهنگ بعدی متصل شد */}
          <button
            onClick={playNext}
            className="text-gray-400 hover:text-green-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
          </button>
        </div>

        <div className="w-full flex items-center gap-2">
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

      {/* بخش کنترل صدا */}
      <div className="flex items-center justify-end gap-3 w-1/4 min-w-[200px]">
        {/* دکمه قطع/وصل صدا */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="text-gray-400 hover:text-green-600 transition-colors"
        >
          {isMuted || volume === 0 ? (
            // آیکون Mute
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
            </svg>
          ) : (
            // آیکون Volume Up
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
            </svg>
          )}
        </button>

        {/* اسلایدر تنظیم صدا */}
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          // استایل دادن به اسلایدر پیش‌فرض مرورگر
          className="w-24 h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-green-600 focus:outline-none"
        />
      </div>

      {/* زمانی که آهنگ تموم شد، به صورت خودکار برو آهنگ بعدی */}
      <audio
        ref={audioRef}
        src={currentSong.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={playNext}
      />
    </div>
  );
}
