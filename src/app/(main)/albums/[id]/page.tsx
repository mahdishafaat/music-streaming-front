// src/app/(main)/albums/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { getStorageItem } from "@/utils/storage";
import { Album, Song, User } from "@/types";
import SongCard from "@/components/ui/SongCard";
import { usePlayer } from "@/context/PlayerContext";

export default function AlbumDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const albumId = params.id as string;
  const { playSong } = usePlayer();

  const [album, setAlbum] = useState<Album | null>(null);
  const [artist, setArtist] = useState<User | null>(null);
  const [albumSongs, setAlbumSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAlbumData = async () => {
      // دریافت تمام دیتاها از استوریج
      const allAlbums = getStorageItem<Album[]>("albums") || [];
      const allSongs = getStorageItem<Song[]>("songs") || [];
      const allArtists = getStorageItem<User[]>("artists") || [];

      // پیدا کردن آلبوم فعلی با استفاده از ID موجود در URL
      const foundAlbum = allAlbums.find((a) => a.id === albumId);

      if (foundAlbum) {
        setAlbum(foundAlbum);

        // پیدا کردن هنرمندِ این آلبوم
        const foundArtist = allArtists.find(
          (a) => a.id === foundAlbum.artistId,
        );
        if (foundArtist) setArtist(foundArtist);

        // فیلتر کردن آهنگ‌هایی که متعلق به این آلبوم هستن
        const filteredSongs = allSongs.filter(
          (song) => song.albumId === albumId,
        );
        setAlbumSongs(filteredSongs);
      }

      setIsLoading(false);
    };

    fetchAlbumData();
  }, [albumId]);

  // هندلر برای پخش کل آلبوم
  const handlePlayAlbum = () => {
    if (albumSongs.length > 0) {
      // آهنگ اول رو پخش می‌کنیم و کل آهنگ‌های آلبوم رو به عنوان صف می‌فرستیم
      playSong(albumSongs[0], albumSongs);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500 dark:text-gray-400">
        Loading album details...
      </div>
    );
  }

  if (!album) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Album not found
        </h2>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-10 transition-colors">
      {/* هدر آلبوم (کاور، عنوان، اطلاعات هنرمند) */}
      <div className="flex flex-col md:flex-row items-end gap-6 pb-6 border-b border-gray-200 dark:border-gray-700">
        <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <Image
            src={album.coverImage || "/default-cover.png"}
            alt={album.title}
            fill
            className="object-cover"
            unoptimized
          />
        </div>

        <div className="flex flex-col gap-3 flex-1 min-w-0 w-full">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
            Album
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white truncate">
            {album.title}
          </h1>

          <div className="flex items-center gap-2 mt-2">
            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
              {artist?.profileImage && (
                <Image
                  src={artist.profileImage}
                  alt={artist.displayName}
                  fill
                  className="object-cover"
                  unoptimized
                />
              )}
            </div>
            <span className="font-bold text-gray-900 dark:text-white">
              {artist?.displayName || "Unknown Artist"}
            </span>
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              • {new Date(album.releaseDate).getFullYear()}
            </span>
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              • {albumSongs.length} songs
            </span>
          </div>
        </div>
      </div>

      {/* دکمه‌های کنترل (پخش کل آلبوم) */}
      <div className="flex items-center gap-4">
        <button
          onClick={handlePlayAlbum}
          disabled={albumSongs.length === 0}
          className="w-14 h-14 flex items-center justify-center rounded-full bg-green-600 text-white hover:bg-green-500 hover:scale-105 transition-all shadow-lg shadow-green-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-7 h-7 ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
        <button className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-gray-900 dark:hover:border-white hover:text-gray-900 dark:hover:text-white transition-colors">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            ></path>
          </svg>
        </button>
      </div>

      {/* لیست آهنگ‌های آلبوم */}
      <div className="flex flex-col gap-2 mt-4">
        <div className="flex items-center px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 mb-2">
          <div className="w-8 text-center">#</div>
          <div className="flex-1">Title</div>
          <div className="w-24 text-right pr-4">Streams</div>
        </div>

        {albumSongs.length === 0 ? (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            No songs found in this album.
          </div>
        ) : (
          albumSongs.map((song, index) => (
            <div key={song.id} className="flex items-center gap-4 group">
              {/* شماره آهنگ تو آلبوم */}
              <div className="w-8 text-center text-sm font-medium text-gray-400 dark:text-gray-500">
                {index + 1}
              </div>
              <div className="flex-1">
                {/* از همون SongCard قبلی استفاده می‌کنیم تا یکپارچگی حفظ بشه */}
                <SongCard
                  song={song}
                  artistName={artist?.displayName || "Unknown Artist"}
                  contextSongs={albumSongs}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
