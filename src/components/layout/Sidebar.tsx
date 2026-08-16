// src/components/layout/Sidebar.tsx
"use client";

import Link from "next/link";
import Image from "next/image"; // 🌟 این رو اضافه کردیم
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface SidebarProps {
  onClose?: () => void;
}

const baseNavItems = [
  { name: "Home", path: "/" },
  { name: "Playlists", path: "/playlists" },
  { name: "Albums & Singles", path: "/albums" },
  { name: "Profile", path: "/profile" },
  { name: "Settings", path: "/settings" },
  { name: "Tickets", path: "/tickets" },
];

export default function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const hasDashboardAccess = user?.role === "ADMIN" || user?.role === "SUPPORT";
  const hasStudioAccess = user?.role === "ARTIST";

  const navItems = [...baseNavItems];

  if (hasStudioAccess) {
    navItems.push({ name: "Studio", path: "/studio" });
  }

  if (hasDashboardAccess) {
    navItems.push({ name: "Dashboard", path: "/dashboard" });
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 transition-colors">
      <div className="p-6 flex items-center justify-between">
        {/* 🌟 بخش هدر سایدبار که آپدیت شد */}
        <Link
          href="/"
          onClick={onClose}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <Image
            src="/icon.png"
            alt="Spotify Clone Logo"
            width={32}
            height={32}
            className="rounded-full shadow-md shrink-0 dark:shadow-black/50"
          />
          <span className="text-2xl font-bold text-green-600 dark:text-green-500 tracking-tight transition-colors">
            Spotify Clone
          </span>
        </Link>

        {/* دکمه بستن فقط در موبایل */}
        <button
          onClick={onClose}
          className="md:hidden p-2 -mr-2 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.path ||
            (pathname.startsWith(item.path) && item.path !== "/");

          return (
            <Link
              key={item.name}
              href={item.path}
              onClick={onClose} // بستن منو بعد از کلیک روی لینک
              className={`block px-4 py-3 rounded-xl font-medium transition-colors ${
                isActive
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100 dark:border-gray-700 mt-auto transition-colors flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-900 dark:bg-gray-600 text-white flex items-center justify-center text-xs font-bold transition-colors uppercase shrink-0">
          {user?.displayName ? user.displayName.charAt(0) : "U"}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-bold text-gray-900 dark:text-white truncate">
            {user?.displayName || "Guest"}
          </span>
          {(hasDashboardAccess || hasStudioAccess) && (
            <span className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-wider">
              {user.role}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
