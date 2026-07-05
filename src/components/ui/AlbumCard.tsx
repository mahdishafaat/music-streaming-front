// src/components/ui/AlbumCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Album } from "@/types";

interface AlbumCardProps {
  album: Album;
  artistName: string;
}

export default function AlbumCard({ album, artistName }: AlbumCardProps) {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/albums/${album.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group flex flex-col gap-3 p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl hover:bg-green-50 dark:hover:bg-gray-700 transition-colors cursor-pointer shadow-sm"
    >
      <div className="relative w-full aspect-square rounded-xl overflow-hidden shadow-sm bg-gray-100 dark:bg-gray-700">
        <Image
          src={album.coverImage || "/default-cover.png"}
          alt={album.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          unoptimized
        />
      </div>
      <div className="flex flex-col min-w-0">
        <h3 className="font-bold text-gray-900 dark:text-white truncate group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
          {album.title}
        </h3>
        {/* تغییر span به Link برای هدایت به صفحه هنرمند */}
        <Link
          href={`/artists/${album.artistId}`}
          onClick={(e) => e.stopPropagation()}
          className="text-sm text-gray-500 dark:text-gray-400 truncate hover:text-green-600 dark:hover:text-green-400 hover:underline transition-colors w-fit"
        >
          {artistName}
        </Link>
      </div>
    </div>
  );
}