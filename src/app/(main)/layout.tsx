// src/app/(main)/layout.tsx
"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import MusicPlayer from "@/components/player/MusicPlayer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      {/* کانتینر اصلی صفحه */}
      <div className="flex h-[100dvh] bg-gray-50 dark:bg-gray-900 p-2 md:p-4 gap-2 md:gap-4 transition-colors">
        {/* پرده تاریک (Overlay) برای موبایل */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden animate-fade-in"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* سایدبار */}
        <div
          className={`fixed inset-y-0 left-0 z-[70] md:z-0 w-72 md:w-64 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 md:border md:rounded-2xl shadow-2xl md:shadow-sm flex flex-col overflow-hidden transition-transform duration-300 ease-out md:relative md:translate-x-0 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar onClose={() => setIsSidebarOpen(false)} />
        </div>

        <div className="flex-1 flex flex-col gap-2 md:gap-4 overflow-hidden relative w-full">
          {/* تاپ‌بار */}
          <div className="h-16 md:h-20 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm shrink-0 transition-colors">
            <Topbar onOpenMenu={() => setIsSidebarOpen(true)} />
          </div>

          {/* ناحیه محتوای اصلی */}
          <main className="flex-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 md:p-6 overflow-y-auto shadow-sm pb-32 md:pb-28 transition-colors relative">
            {children}
          </main>
        </div>
      </div>

      {/* 🌟 موزیک پلیر از کانتینر flex خارج شد! حالا مستقله و دیگه هیچ‌وقت قیچی یا غیب نمیشه */}
      <MusicPlayer />
    </>
  );
}
