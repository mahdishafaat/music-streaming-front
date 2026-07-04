// src/components/layout/Sidebar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "Home", path: "/" },
  { name: "Playlists", path: "/playlists" },
  { name: "Albums & Singles", path: "/albums" },
  { name: "Profile", path: "/profile" },
  { name: "Settings", path: "/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 transition-colors">
      <div className="p-6">
        <Link
          href="/"
          className="text-2xl font-bold text-green-600 dark:text-green-500 tracking-tight transition-colors"
        >
          Spotify Clone
        </Link>
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

      <div className="p-4 border-t border-gray-100 dark:border-gray-700 mt-auto transition-colors">
        <div className="w-8 h-8 rounded-full bg-gray-900 dark:bg-gray-600 text-white flex items-center justify-center text-xs font-bold transition-colors">
          N
        </div>
      </div>
    </div>
  );
}
