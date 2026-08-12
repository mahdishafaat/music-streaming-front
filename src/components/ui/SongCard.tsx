// src/components/ui/SongCard.tsx
"use client";

import Image from "next/image";
import { usePlayer } from "@/context/PlayerContext";
import { Song } from "@/types";

interface DisplaySong extends Song {
  artistName?: string;
}

interface SongCardProps {
  song: DisplaySong;
  artistName?: string;
  contextSongs: Song[];
}

export default function SongCard({
  song,
  artistName,
  contextSongs,
}: SongCardProps) {
  const { playSong, currentSong, isPlaying, togglePlay } = usePlayer();

  const isThisPlaying = currentSong?.id === song.id;
  const displayArtist = artistName || song.artistName || "Unknown Artist";

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isThisPlaying) {
      togglePlay();
    } else {
      playSong(song, contextSongs);
    }
  };

  return (
    <div
      onClick={() => playSong(song, contextSongs)}
      className={`group relative flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-all border ${
        isThisPlaying
          ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
          : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-gray-200 dark:hover:border-gray-600"
      }`}
    >
      <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700">
        <Image
          src={song.coverImage || "/default-cover.png"}
          alt={song.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          unoptimized
        />

        <div
          className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isThisPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
        >
          <button
            onClick={handlePlayClick}
            className="w-8 h-8 rounded-full bg-green-500 text-black flex items-center justify-center hover:scale-110 transition-transform shadow-md"
          >
            {isThisPlaying && isPlaying ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg
                className="w-4 h-4 ml-0.5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-col flex-1 min-w-0 pr-4">
        <h4
          className={`font-bold text-base truncate transition-colors ${isThisPlaying ? "text-green-700 dark:text-green-400" : "text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400"}`}
        >
          {song.title}
        </h4>
        <div className="flex items-center gap-2.5 mt-0.5 text-xs text-gray-500 dark:text-gray-400 font-medium">
          <span className="truncate">{displayArtist}</span>

          <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>

          {/* آمار استریم */}
          <span className="flex items-center gap-1" title="Streams">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              ></path>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            {song.streamsCount?.toLocaleString() || "0"}
          </span>

          <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>

          {/* آمار لایک */}
          <span
            className="flex items-center gap-1 text-gray-600 dark:text-gray-300"
            title="Likes"
          >
            <svg
              className="w-3.5 h-3.5"
              fill={song.isLiked ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={song.isLiked ? "0" : "2"}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              ></path>
            </svg>
            {song.likesCount?.toLocaleString() || "0"}
          </span>
        </div>
      </div>
    </div>
  );
}
