// src/components/ui/CreatePlaylistModal.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getStorageItem, setStorageItem } from "@/utils/storage";
import { Playlist } from "@/types";

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newPlaylist: Playlist) => void;
}

export default function CreatePlaylistModal({
  isOpen,
  onClose,
  onSuccess,
}: CreatePlaylistModalProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Playlist name cannot be empty");
      return;
    }

    // ساخت آبجکت پلی‌لیست جدید
    const newPlaylist: Playlist = {
      id: `playlist_${Date.now()}`,
      title: title.trim(),
      userId: user?.id || "guest_user",
      songIds: [],
      createdAt: new Date().toISOString(),
    };

    // دریافت پلی‌لیست‌های قبلی، اضافه کردن جدید و ذخیره در استوریج
    const existingPlaylists = getStorageItem<Playlist[]>("playlists") || [];
    const updatedPlaylists = [...existingPlaylists, newPlaylist];
    setStorageItem("playlists", updatedPlaylists);

    // ریست کردن فرم و اطلاع به کامپوننت پدر
    setTitle("");
    setError("");
    onSuccess(newPlaylist);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
      <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md p-6 md:p-8 shadow-2xl border border-gray-100 dark:border-gray-700 transition-colors animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            New Playlist
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
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

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Playlist Name
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError("");
              }}
              placeholder="e.g. Late Night Drives"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 transition-all placeholder:text-gray-400"
              autoFocus
            />
            {error && (
              <span className="text-sm text-red-500 mt-2 block">{error}</span>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl transition-colors shadow-md shadow-green-600/20"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
