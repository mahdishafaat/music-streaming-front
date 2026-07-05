// src/components/ui/SongCard.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Song } from "@/types";
import { usePlayer } from "@/context/PlayerContext";
import AddToPlaylistModal from "./AddToPlaylistModal";

interface SongCardProps {
  song: Song;
  artistName: string;
  contextSongs?: Song[];
}

export default function SongCard({
  song,
  artistName,
  contextSongs,
}: SongCardProps) {
  const { playSong, currentSong, isPlaying, togglePlay } = usePlayer();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isCurrentSong = currentSong?.id === song.id;

  const handlePlayClick = () => {
    if (isCurrentSong) {
      togglePlay();
    } else {
      playSong(song, contextSongs || [song]);
    }
  };

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  return (
    <>
      <div
        onClick={handlePlayClick}
        className={`group flex items-center justify-between p-3 border rounded-2xl transition-colors shadow-sm cursor-pointer ${
          isCurrentSong
            ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/50"
            : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:bg-green-50 dark:hover:bg-gray-700"
        }`}
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700">
            <Image
              src={song.coverImage || "/default-cover.png"}
              alt={song.title}
              fill
              className="object-cover"
              unoptimized
            />
            <div
              className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isCurrentSong ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
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
          <div className="flex flex-col flex-1 min-w-0">
            <h3
              className={`font-bold truncate transition-colors ${isCurrentSong ? "text-green-600 dark:text-green-400" : "text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400"}`}
            >
              {song.title}
            </h3>
            
            {/* تغییر span به Link برای هدایت به صفحه هنرمند */}
            <Link
              href={`/artists/${song.artistId}`}
              onClick={(e) => e.stopPropagation()}
              className="text-sm text-gray-500 dark:text-gray-400 truncate hover:text-green-600 dark:hover:text-green-400 hover:underline transition-colors w-fit"
            >
              {artistName}
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2 pl-4 flex-shrink-0">
          <button
            onClick={handleAddClick}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-600 transition-all opacity-0 group-hover:opacity-100"
            title="Add to Playlist"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              ></path>
            </svg>
          </button>

          <div
            className={`text-sm font-medium transition-opacity w-16 text-right ${isCurrentSong ? "text-green-600 dark:text-green-400 opacity-100" : "text-green-600 dark:text-green-400 opacity-0 group-hover:opacity-100"}`}
          >
            {isCurrentSong ? (isPlaying ? "Playing" : "Paused") : "Play"}
          </div>
        </div>
      </div>

      <AddToPlaylistModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        song={song}
      />
    </>
  );
}