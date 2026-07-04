// src/components/layout/Topbar.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function Topbar() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [query, setQuery] = useState(searchParams.get("q") || "");

  // حل ارور ESLint با پیچیدن منطق درون یک تابع
  useEffect(() => {
    const syncQuery = async () => {
      const q = searchParams.get("q") || "";
      setQuery(q);
    };
    syncQuery();
  }, [searchParams]);

  const handleSearchChange = (value: string) => {
    setQuery(value);

    if (value.trim()) {
      router.push(`/search?q=${encodeURIComponent(value)}`);
    } else {
      router.push("/search");
    }
  };

  return (
    <div className="h-full px-6 flex items-center justify-between transition-colors bg-transparent gap-4">
      {/* فضای خالی سمت چپ برای هل دادن سرچ‌بار به مرکز */}
      <div className="flex-1 hidden md:block"></div>

      {/* بخش جستجو - حالا کاملاً در مرکز قرار دارد */}
      <div className="w-full max-w-md relative flex-shrink-0">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
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
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
        </div>
        <input
          type="text"
          placeholder="What do you want to listen to?"
          value={query}
          onChange={(e) => handleSearchChange(e.target.value)}
          onFocus={() => {
            if (pathname !== "/search") router.push("/search");
          }}
          className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 dark:bg-gray-700/50 border border-transparent dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:bg-white focus:border-green-500 dark:focus:border-green-400 transition-all text-sm"
        />
        {query && (
          <button
            onClick={() => handleSearchChange("")}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        )}
      </div>

      {/* بخش پروفایل - چسبیده به سمت راست */}
      <div className="flex-1 flex items-center justify-end gap-6 flex-shrink-0">
        <ThemeToggle />

        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors">
            {user?.displayName || user?.username || "Guest"}
          </span>
          <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 flex items-center justify-center font-bold text-lg border border-green-200 dark:border-green-800 transition-colors shadow-sm">
            {user?.displayName?.[0]?.toUpperCase() || "G"}
          </div>
        </div>
      </div>
    </div>
  );
}
