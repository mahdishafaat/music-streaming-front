// src/app/(main)/layout.tsx
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import MusicPlayer from "@/components/player/MusicPlayer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 p-4 gap-4 transition-colors">
      {/* سایدبار */}
      <div className="w-64 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm flex flex-col overflow-hidden transition-colors">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col gap-4 overflow-hidden relative">
        {/* تاپ‌بار */}
        <div className="h-20 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm flex-shrink-0 transition-colors">
          <Topbar />
        </div>

        {/* ناحیه محتوای اصلی */}
        <main className="flex-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 overflow-y-auto shadow-sm pb-28 transition-colors">
          {children}
        </main>
      </div>

      <MusicPlayer />
    </div>
  );
}
