// src/components/layout/Topbar.tsx
"use client";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function Topbar() {
  const { user } = useAuth();

  return (
    <div className="h-full px-6 flex items-center justify-between transition-colors bg-transparent">
      {/* بخش جستجو یا فضای خالی */}
      <div className="flex-1"></div>

      {/* بخش پروفایل و کنترل‌ها */}
      <div className="flex items-center gap-6">
        {/* دکمه دارک‌تم اینجاست */}
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
