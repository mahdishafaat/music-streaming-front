// src/components/layout/Topbar.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "@/components/ui/ThemeToggle";
import Link from "next/link";
import Image from "next/image";
import { getStorageItem } from "@/utils/storage";
import { Notification } from "@/types";
import { API_BASE_URL } from '@/config/api';

interface TopbarProps {
  onOpenMenu?: () => void;
}

export default function Topbar({ onOpenMenu }: TopbarProps) {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [unreadCount, setUnreadCount] = useState(0);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const syncQuery = async () => {
      const q = searchParams.get("q") || "";
      setQuery(q);
    };
    syncQuery();
  }, [searchParams]);

  useEffect(() => {
    const fetchNotifications = () => {
      const notifs = getStorageItem<Notification[]>("notifications") || [];
      const unread = notifs.filter(
        (n) =>
          !n.isRead && (n.userId === user?.id || n.targetRole === user?.role),
      ).length;
      setUnreadCount(unread);
    };

    if (user) fetchNotifications();
  }, [user, pathname]);

  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        const res = await fetch(`${API_BASE_URL}/accounts/profile/me/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const profileData = await res.json();
          setProfileImage(profileData.profile_image);
        }
      } catch (error) {
        console.error("Failed to fetch profile image for Topbar", error);
      }
    };

    if (user) fetchProfileImage();
  }, [user, pathname]);

  const handleSearchChange = (value: string) => {
    setQuery(value);
    if (value.trim()) {
      router.push(`/search?q=${encodeURIComponent(value)}`);
    } else {
      router.push("/search");
    }
  };

  const getValidImageUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    const normalizedPath = path.replace(/\\/g, "/");
    const prefix = normalizedPath.startsWith("/") ? "" : "/";
    return `http://127.0.0.1:8000${prefix}${normalizedPath}`;
  };

  const finalProfileImage = getValidImageUrl(profileImage);

  return (
    <div className="h-full px-4 md:px-6 flex items-center justify-between transition-colors bg-transparent gap-2 md:gap-4 w-full">
      {/* دکمه همبرگری برای موبایل */}
      <button
        onClick={onOpenMenu}
        className="md:hidden p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      <div className="flex-1 hidden lg:block"></div>

      <div className="w-full max-w-md relative shrink">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
          <svg
            className="w-4 h-4 md:w-5 md:h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
        </div>
        <input
          type="text"
          placeholder="Listen to..."
          value={query}
          onChange={(e) => handleSearchChange(e.target.value)}
          onFocus={() => {
            if (pathname !== "/search") router.push("/search");
          }}
          className="w-full pl-9 md:pl-10 pr-3 md:pr-4 py-2 md:py-2.5 rounded-full bg-gray-100 dark:bg-gray-800/80 border border-transparent dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:bg-white dark:focus:bg-gray-700 focus:border-green-500 dark:focus:border-green-500 transition-all text-sm shadow-inner"
        />
      </div>

      <div className="flex items-center justify-end gap-2 sm:gap-4 shrink-0">
        <div className="hidden sm:block">
          <ThemeToggle />
        </div>

        {user && (
          <Link
            href="/notifications"
            className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
          >
            <svg
              className="w-5 h-5 md:w-6 md:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
              />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-3.5 h-3.5 md:w-4 md:h-4 bg-red-500 text-white text-[9px] md:text-[10px] font-bold flex items-center justify-center rounded-full border border-white dark:border-gray-900">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>
        )}

        <div
          className="flex items-center gap-2 md:gap-3 cursor-pointer"
          onClick={() => router.push("/profile")}
        >
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden lg:block">
            {user?.displayName || "Guest"}
          </span>

          <div className="relative w-8 h-8 md:w-9 md:h-9 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 flex items-center justify-center font-bold text-sm border border-green-200 dark:border-green-800 overflow-hidden">
            {finalProfileImage && !imgError ? (
              <Image
                src={finalProfileImage}
                alt="Profile"
                fill
                className="object-cover"
                unoptimized
                onError={() => setImgError(true)}
              />
            ) : (
              <>{user?.displayName?.[0]?.toUpperCase() || "G"}</>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
