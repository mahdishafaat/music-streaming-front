// src/components/ui/AddToPlaylistModal.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Song } from "@/types";
import { API_BASE_URL } from '@/config/api';

interface Playlist {
  id: string | number;
  name: string;
}

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
  const [isLoading, setIsLoading] = useState(true);

  // واکشی پلی‌لیست‌های کاربر از بک‌اند
  useEffect(() => {
    if (isOpen) {
      const fetchPlaylists = async () => {
        setIsLoading(true);
        try {
          const token = localStorage.getItem("access_token");
          if (!token) {
            setIsLoading(false);
            return;
          }

          const res = await fetch(`${API_BASE_URL}/music/my-playlists/`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
          });

          if (res.ok) {
            const data = await res.json();
            setPlaylists(data);
          }
        } catch (error) {
          console.error("Failed to fetch playlists:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchPlaylists();
    }
  }, [isOpen]);

  if (!isOpen || !song) return null;

  // اضافه کردن آهنگ به پلی‌لیست
  const handleAddToPlaylist = async (playlistId: string | number) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("Please login first.");
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE_URL}/music/playlists/${playlistId}/add-music/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ music_id: parseInt(song.id) }),
        },
      );

      if (res.ok) {
        onClose(); // بستن موفقیت‌آمیز مودال
      } else {
        const errorData = await res.json();
        alert(
          errorData.detail ||
            "Failed to add music to playlist. It might already be there.",
        );
      }
    } catch (error) {
      console.error("Error adding to playlist:", error);
    }
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

        <div className="flex flex-col gap-2 max-h-[40vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pr-1">
          {isLoading ? (
            <div className="text-center py-6 text-sm font-bold text-gray-500 dark:text-gray-400">
              Loading playlists...
            </div>
          ) : playlists.length === 0 ? (
            <div className="text-center py-6 text-sm font-bold text-gray-500 dark:text-gray-400">
              You don&apos;t have any playlists yet.
            </div>
          ) : (
            playlists.map((playlist) => {
              return (
                <button
                  key={playlist.id}
                  onClick={() => handleAddToPlaylist(playlist.id)}
                  className="flex items-center justify-between p-3 rounded-xl text-left transition-colors hover:bg-green-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 group"
                >
                  <span className="font-bold text-gray-900 dark:text-white truncate pr-4">
                    {playlist.name}
                  </span>
                  <svg
                    className="w-5 h-5 text-gray-400 group-hover:text-green-500 flex-shrink-0 transition-colors"
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
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
