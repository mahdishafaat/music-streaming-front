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
    <div className="flex h-screen bg-gray-50 p-4 gap-4">
      {/* سایدبار با حاشیه ۱۶ پیکسل */}
      <div className="w-64 bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col overflow-hidden">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        {/* تاپ‌بار با حاشیه ۱۶ پیکسل */}
        <div className="h-20 bg-white border border-gray-100 rounded-2xl shadow-sm flex-shrink-0">
          <Topbar />
        </div>

        {/* ناحیه محتوای اصلی */}
        <main className="flex-1 bg-white border border-gray-100 rounded-2xl p-6 overflow-y-auto shadow-sm pb-28">
          {children}
        </main>
      </div>
      <MusicPlayer />
    </div>
  );
}
