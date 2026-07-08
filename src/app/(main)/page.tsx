// src/app/(main)/page.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { usePlayer } from "@/context/PlayerContext"; // اضافه شدن برای پخش آهنگ‌های ویژه
import { getStorageItem } from "@/utils/storage";
import { Album, Song, Artist } from "@/types";
import AlbumCard from "@/components/ui/AlbumCard";
import SongCard from "@/components/ui/SongCard";

export default function HomePage() {
  const { user } = useAuth();
  const { playSong } = usePlayer(); // گرفتن تابع پخش

  const [albums, setAlbums] = useState<Album[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const storedAlbums = getStorageItem<Album[]>("albums") || [];
      const storedSongs = getStorageItem<Song[]>("songs") || [];
      const storedArtists = getStorageItem<Artist[]>("artists") || [];

      setAlbums(storedAlbums);
      setSongs(storedSongs);
      setArtists(storedArtists);
    };

    loadData();
  }, []);

  const getArtistName = (artistId: string) => {
    const artist = artists.find((a) => a.id === artistId);
    return artist ? artist.name : "Unknown Artist";
  };

  // گرفتن ۲ آهنگ (مثلاً ۲ آهنگ آخر دیتابیس) به عنوان آهنگ‌های ویژه گلد
  const exclusiveSongs = songs.slice(-2);

  return (
    <div className="flex flex-col gap-10 pb-8 transition-colors">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors">
          Good morning, {user?.displayName?.split(" ")[0] || "Guest"}
        </h1>
      </div>

      {user?.subscription === "GOLD" && (
        <section className="bg-gradient-to-r from-green-600 to-green-400 rounded-2xl p-6 text-white shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">
              🌟 Gold Exclusive: Early Access
            </h2>
          </div>
          <p className="text-green-50 mb-5">
            Listen to the newest drops before anyone else.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exclusiveSongs.length > 0 ? (
              exclusiveSongs.map((song) => (
                <div
                  key={`exclusive-${song.id}`}
                  onClick={() => playSong(song, exclusiveSongs)}
                  className="bg-white/20 backdrop-blur-sm rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:bg-white/30 transition-all group shadow-sm"
                >
                  <div className="relative w-12 h-12 rounded-lg flex-shrink-0 overflow-hidden bg-white/10">
                    <Image
                      src={song.coverImage || "/default-cover.png"}
                      alt={song.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
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
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-white truncate">
                      {song.title}
                    </h4>
                    <p className="text-sm text-green-100 truncate">
                      {getArtistName(song.artistId)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-green-100 text-sm font-medium">
                No exclusive tracks available right now.
              </div>
            )}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">
            Latest Albums
          </h2>
          <button className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
            Show all
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {albums.map((album) => (
            <AlbumCard
              key={album.id}
              album={album}
              artistName={getArtistName(album.artistId)}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 transition-colors">
          Most Listened Songs
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* برای اینکه دیتای اصلیمون به هم نریزه، یک کپی از آرایه می‌گیریم و بعد سورت می‌کنیم */}
          {[...songs]
            .sort((a, b) => b.listenersCount - a.listenersCount)
            .map((song) => (
              <SongCard
                key={song.id}
                song={song}
                artistName={getArtistName(song.artistId)}
                contextSongs={songs}
              />
            ))}
        </div>
      </section>
    </div>
  );
}
