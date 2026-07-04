// src/components/layout/Sidebar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Playlists", href: "/playlists" },
    { name: "Albums & Singles", href: "/albums" },
    { name: "Profile", href: "/profile" },
    { name: "Settings", href: "/settings" },
  ];

  return (
    <aside className="flex flex-col h-full py-6 px-4">
      <div className="mb-8 px-2">
        <h1 className="text-2xl font-bold text-green-600 tracking-tight">
          Spotify Clone
        </h1>
      </div>

      <nav className="flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              // استفاده از حاشیه ۱۲ پیکسل برای کانتینرهای داخلی و طیف سبز روشن برای حالت فعال
              className={`px-4 py-3 rounded-xl transition-all font-medium ${
                isActive
                  ? "bg-green-100 text-green-800"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
