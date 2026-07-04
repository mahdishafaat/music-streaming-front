// src/components/ui/AddToPlaylistModal.tsx
"use client";

import { useState, useEffect } from "react";
import { getStorageItem, setStorageItem } from "@/utils/storage";
import { Playlist, Song } from "@/types";
import Image from "next/image";

interface AddToPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  song: Song | null;
}

export default function AddToPlaylistModal({
  isOpen,
  onClose,
  song,
}: AddToPlaylistModalProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  useEffect(() => {
    // پیچیدن منطق در یک تابع برای جلوگیری از رندر آبشاری
    const loadPlaylists = async () => {
      if (isOpen) {
        const storedPlaylists = getStorageItem<Playlist[]>("playlists") || [];
        setPlaylists(storedPlaylists);
      }
    };

    loadPlaylists();
  }, [isOpen]);

  if (!isOpen || !song) return null;

  const handleAddToPlaylist = (playlistId: string) => {
    const allPlaylists = getStorageItem<Playlist[]>("playlists") || [];
    const updatedPlaylists = allPlaylists.map((p) => {
      if (p.id === playlistId) {
        if (!p.songIds?.includes(song.id)) {
          return { ...p, songIds: [...(p.songIds || []), song.id] };
        }
      }
      return p;
    });

    setStorageItem("playlists", updatedPlaylists);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-gray-100 dark:border-gray-700 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Add to Playlist
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl mb-6">
          <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-700">
            <Image
              src={song.coverImage || "/default-cover.png"}
              alt={song.title}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm text-gray-900 dark:text-white truncate">
              {song.title}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
              Select a playlist
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
          {playlists.length === 0 ? (
            <div className="text-center py-6 text-sm text-gray-500 dark:text-gray-400">
              {/* استفاده از &apos; به جای سینگل‌کوتیشن */}
              You don&apos;t have any playlists yet.
            </div>
          ) : (
            playlists.map((playlist) => {
              const isAlreadyAdded = playlist.songIds?.includes(song.id);
              return (
                <button
                  key={playlist.id}
                  onClick={() =>
                    !isAlreadyAdded && handleAddToPlaylist(playlist.id)
                  }
                  disabled={isAlreadyAdded}
                  className={`flex items-center justify-between p-3 rounded-xl text-left transition-colors ${
                    isAlreadyAdded
                      ? "opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800"
                      : "hover:bg-green-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700"
                  }`}
                >
                  <span className="font-medium text-gray-900 dark:text-white truncate pr-4">
                    {playlist.title}
                  </span>
                  {isAlreadyAdded ? (
                    <svg
                      className="w-5 h-5 text-green-500 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5 text-gray-400 flex-shrink-0"
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
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
