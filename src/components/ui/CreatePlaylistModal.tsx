// src/components/ui/CreatePlaylistModal.tsx
"use client";

import { useState, useRef } from "react";
import Image from "next/image";
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
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Playlist name cannot be empty");
      return;
    }

    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("You must be logged in to create a playlist.");
      return;
    }

    setIsCreating(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      if (imageFile) {
        formData.append("cover", imageFile);
      }

      const res = await fetch("http://127.0.0.1:8000/music/playlists/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();

        // چک امنیتی: اگر آدرس خودش http داشت، چیزی به آن نمی‌چسبانیم
        const finalCoverUrl = data.cover
          ? data.cover.startsWith("http")
            ? data.cover
            : `http://127.0.0.1:8000${data.cover}`
          : undefined;

        onSuccess({
          id: data.id.toString(),
          title: data.name,
          songIds: [],
          userId: "me",
          createdAt: data.created_at || new Date().toISOString(),
          coverImage: finalCoverUrl,
        });

        setName("");
        setImageFile(null);
        setImagePreview(null);
        setError("");
      } else {
        const errorData = await res.json();
        setError(errorData.detail || "Failed to create playlist.");
      }
    } catch (err) {
      console.error("Failed to create playlist:", err);
      setError("Network error occurred. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md p-8 shadow-2xl border border-gray-100 dark:border-gray-700 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create Playlist
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

        <form onSubmit={handleCreate} className="flex flex-col gap-6">
          <div className="flex justify-center">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative w-40 h-40 rounded-2xl bg-gray-100 dark:bg-gray-700 flex flex-col items-center justify-center cursor-pointer overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors group shadow-inner"
            >
              {imagePreview ? (
                <>
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white font-bold text-sm">
                      Change Cover
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <svg
                    className="w-10 h-10 text-gray-400 mb-2 group-hover:text-gray-500 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    ></path>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    ></path>
                  </svg>
                  <span className="text-sm font-medium text-gray-500">
                    Upload Cover
                  </span>
                </>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="name"
              className="text-sm font-bold text-gray-700 dark:text-gray-300"
            >
              Playlist Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              placeholder="e.g. Late Night Vibes"
              className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:border-green-500 text-gray-900 dark:text-white font-medium"
              autoFocus
            />
            {error && (
              <span className="text-sm text-red-500 font-medium mt-1">
                {error}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={isCreating || !name.trim()}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-md mt-2"
          >
            {isCreating ? "Creating..." : "Create Playlist"}
          </button>
        </form>
      </div>
    </div>
  );
}
