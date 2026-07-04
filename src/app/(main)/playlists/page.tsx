// src/app/(main)/playlists/page.tsx
"use client";

import { useState, useEffect } from "react";
import { getStorageItem } from "@/utils/storage";
import { Playlist } from "@/types";
import PlaylistCard from "@/components/ui/PlaylistCard";

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // پیچیدن منطق داخل یک تابع برای جلوگیری از اخطار رندر آبشاری
    const fetchPlaylists = async () => {
      const storedPlaylists = getStorageItem<Playlist[]>("playlists") || [];
      setPlaylists(storedPlaylists);
      setIsLoading(false);
    };

    fetchPlaylists();
  }, []);

  return (
    <div className="flex flex-col gap-8 pb-10 transition-colors">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Your Playlists
        </h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10 text-gray-500 dark:text-gray-400">
          Loading...
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <div
            onClick={() => alert("Modal Create Playlist will open here!")}
            className="group flex flex-col gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl hover:bg-green-50 dark:hover:bg-gray-800 transition-colors cursor-pointer justify-center items-center text-center aspect-square"
          >
            <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-sm">
              <svg
                className="w-8 h-8"
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
            </div>
            <span className="font-bold text-gray-900 dark:text-white">
              Create New
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Build your custom queue
            </span>
          </div>

          {playlists.map((playlist) => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </div>
      )}
    </div>
  );
}
