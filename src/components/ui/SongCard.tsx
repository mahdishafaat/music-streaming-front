// src/components/ui/SongCard.tsx
"use client";

import Image from "next/image";
import { Song } from "@/types";
import { usePlayer } from "@/context/PlayerContext";

interface SongCardProps {
  song: Song;
  artistName: string;
}

export default function SongCard({ song, artistName }: SongCardProps) {
  const { playSong, currentSong, isPlaying, togglePlay } = usePlayer();
  const isCurrentSong = currentSong?.id === song.id;

  const handlePlayClick = () => {
    if (isCurrentSong) {
      togglePlay();
    } else {
      playSong(song);
    }
  };

  return (
    <div
      onClick={handlePlayClick}
      className={`group flex items-center justify-between p-3 border rounded-2xl transition-colors shadow-sm cursor-pointer ${
        isCurrentSong
          ? "bg-green-50 border-green-200"
          : "bg-white border-gray-100 hover:bg-green-50"
      }`}
    >
      {/* اضافه کردن flex-1 و min-w-0 به کانتینر اصلی سمت چپ */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
          <Image
            src={song.coverImage || "/default-cover.png"}
            alt={song.title}
            fill
            className="object-cover"
            unoptimized
          />
          <div
            className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
              isCurrentSong
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100"
            }`}
          >
            {isCurrentSong && isPlaying ? (
              <svg
                className="w-6 h-6 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg
                className="w-6 h-6 text-white ml-1"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </div>
        </div>
        {/* اضافه کردن flex-1 و min-w-0 به کانتینر متن‌ها */}
        <div className="flex flex-col flex-1 min-w-0">
          <h3
            className={`font-bold truncate ${isCurrentSong ? "text-green-600" : "text-gray-900"}`}
          >
            {song.title}
          </h3>
          <span className="text-sm text-gray-500 truncate">{artistName}</span>
        </div>
      </div>

      {/* اضافه کردن flex-shrink-0 برای جلوگیری از فشرده شدن */}
      <div
        className={`text-sm font-medium pl-4 flex-shrink-0 transition-opacity ${
          isCurrentSong
            ? "text-green-600 opacity-100"
            : "text-green-600 opacity-0 group-hover:opacity-100"
        }`}
      >
        {isCurrentSong ? (isPlaying ? "Playing" : "Paused") : "Play Now"}
      </div>
    </div>
  );
}
