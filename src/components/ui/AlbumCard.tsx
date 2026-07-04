// src/components/ui/AlbumCard.tsx
import Image from "next/image";
import Link from "next/link";
import { Album } from "@/types";

interface AlbumCardProps {
  album: Album;
  artistName: string;
}

export default function AlbumCard({ album, artistName }: AlbumCardProps) {
  return (
    <Link
      href={`/albums/${album.id}`}
      className="group flex flex-col gap-3 p-4 bg-white border border-gray-100 rounded-2xl hover:bg-green-50 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
    >
      <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-100">
        <Image
          src={album.coverImage}
          alt={album.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          unoptimized
        />
      </div>
      <div className="flex flex-col">
        <h3 className="font-bold text-gray-900 truncate">{album.title}</h3>
        <span className="text-sm text-gray-500 truncate hover:text-green-600 transition-colors">
          {artistName}
        </span>
      </div>
    </Link>
  );
}
