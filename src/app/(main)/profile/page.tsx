// src/app/(main)/profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getStorageItem } from "@/utils/storage";
import { Playlist } from "@/types";
import PlaylistCard from "@/components/ui/PlaylistCard";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [userPlaylists, setUserPlaylists] = useState<Playlist[]>([]);
  const router = useRouter();

  // برطرف کردن خطای رندر آبشاری با استفاده از یک تابع درون useEffect
  useEffect(() => {
    const loadPlaylists = async () => {
      const storedPlaylists = getStorageItem<Playlist[]>("playlists") || [];
      setUserPlaylists(storedPlaylists);
    };

    loadPlaylists();
  }, []);

  // هندل کردن فرآیند خروج و انتقال کاربر به صفحه ورود
  const handleLogout = () => {
    logout();
    router.push("/login"); // مسیر انتقال به صفحه ورود
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Please log in to view your profile
        </h2>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 pb-10 transition-colors">
      {/* هدر پروفایل */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-6 pb-8 border-b border-gray-200 dark:border-gray-800">
        <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden shadow-2xl flex-shrink-0 bg-gradient-to-tr from-green-400 to-green-600 border-4 border-white dark:border-gray-900 flex items-center justify-center">
          {/* جایگزین کردن تگ img با کامپوننت Image */}
          {user.profileImage ? (
            <Image
              src={user.profileImage}
              alt={user.displayName}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <span className="text-6xl md:text-7xl font-bold text-white uppercase shadow-sm">
              {user.displayName?.[0] || "U"}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-3 flex-1 text-center md:text-left min-w-0 w-full mt-4 md:mt-0">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
            Profile
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-gray-900 dark:text-white truncate">
            {user.displayName}
          </h1>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2">
            <span className="font-medium text-gray-900 dark:text-gray-200 text-sm bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
              {user.role}
            </span>
            <span className="font-medium text-yellow-600 dark:text-yellow-500 text-sm bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1 rounded-full border border-yellow-200 dark:border-yellow-800/50">
              {user.subscription} PLAN
            </span>
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              {userPlaylists.length} Public Playlists
            </span>
          </div>
        </div>

        {/* دکمه خروج که به تابع جدید متصل شده است */}
        <div className="mt-4 md:mt-0 flex-shrink-0">
          <button
            onClick={handleLogout}
            className="px-6 py-2 rounded-full border-2 border-gray-200 dark:border-gray-700 font-bold text-sm text-gray-700 dark:text-gray-300 hover:border-gray-900 dark:hover:border-white hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Log out
          </button>
        </div>
      </div>

      {/* بخش پلی‌لیست‌های کاربر */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Your Playlists
        </h2>

        {userPlaylists.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
            <svg
              className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              ></path>
            </svg>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              No playlists yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Head over to the playlists tab to create your first mix.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {userPlaylists.map((playlist) => (
              <PlaylistCard key={playlist.id} playlist={playlist} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
