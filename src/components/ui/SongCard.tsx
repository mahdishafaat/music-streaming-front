// src/components/ui/SongCard.tsx
import Image from "next/image";
import { Song } from "@/types";

interface SongCardProps {
  song: Song;
  artistName: string;
}

export default function SongCard({ song, artistName }: SongCardProps) {
  return (
    <div className="group flex items-center justify-between p-3 bg-white border border-gray-100 rounded-2xl hover:bg-green-50 transition-colors shadow-sm cursor-pointer">
      <div className="flex items-center gap-4">
        <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
          <Image
            src={song.coverImage || "/default-cover.png"}
            alt={song.title}
            fill
            className="object-cover"
            unoptimized
          />
          {/* افکت هاور برای پخش آهنگ */}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <svg
              className="w-6 h-6 text-white ml-1"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        <div className="flex flex-col">
          <h3 className="font-bold text-gray-900 truncate">{song.title}</h3>
          <span className="text-sm text-gray-500 truncate">{artistName}</span>
        </div>
      </div>
      <div className="text-sm text-green-600 font-medium px-4 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* بعداً اینجا می‌تونیم منطق پخش آهنگ رو متصل کنیم */}
        Play Now
      </div>
    </div>
  );
}
