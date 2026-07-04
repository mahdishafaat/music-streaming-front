// src/components/ui/PlaylistCard.tsx
import Link from "next/link";
import Image from "next/image";
import { Playlist } from "@/types";

interface PlaylistCardProps {
  playlist: Playlist;
}

export default function PlaylistCard({ playlist }: PlaylistCardProps) {
  return (
    <Link
      href={`/playlists/${playlist.id}`}
      className="group flex flex-col gap-3 p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl hover:bg-green-50 dark:hover:bg-gray-700 transition-colors cursor-pointer shadow-sm"
    >
      <div className="relative w-full aspect-square rounded-xl overflow-hidden shadow-sm bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
        {playlist.coverImage ? (
          <Image
            src={playlist.coverImage}
            alt={playlist.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            unoptimized
          />
        ) : (
          <svg
            className="w-12 h-12 text-gray-400 dark:text-gray-500"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
          </svg>
        )}
      </div>
      <div className="flex flex-col min-w-0">
        <h3 className="font-bold text-gray-900 dark:text-white truncate group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
          {playlist.title}
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400 truncate">
          {playlist.songIds?.length || 0} songs
        </span>
      </div>
    </Link>
  );
}
