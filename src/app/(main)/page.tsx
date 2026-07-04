// src/app/(main)/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getStorageItem } from "@/utils/storage";
import { Album, Song, User } from "@/types";
import AlbumCard from "@/components/ui/AlbumCard";
import SongCard from "@/components/ui/SongCard";

export default function HomePage() {
  const { user } = useAuth();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [artists, setArtists] = useState<User[]>([]);

  useEffect(() => {
    // با قرار دادن منطق درون یک تابع ناهمگام، استیت‌ها در چرخه بعدی جاوااسکریپت آپدیت می‌شوند
    // و از رندر آبشاری (Cascading Render) جلوگیری می‌شود.
    const loadData = async () => {
      const storedAlbums = getStorageItem<Album[]>("albums") || [];
      const storedSongs = getStorageItem<Song[]>("songs") || [];
      const storedArtists = getStorageItem<User[]>("artists") || [];

      setAlbums(storedAlbums);
      setSongs(storedSongs);
      setArtists(storedArtists);
    };

    loadData();
  }, []);

  // یک تابع کمکی برای پیدا کردن نام هنرمند از روی آیدی
  const getArtistName = (artistId: string) => {
    const artist = artists.find((a) => a.id === artistId);
    return artist ? artist.displayName : "Unknown Artist";
  };

  return (
    <div className="flex flex-col gap-10 pb-8">
      {/* پیام خوش‌آمدگویی */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Good morning, {user?.displayName?.split(" ")[0] || "Guest"}
        </h1>
      </div>

      {/* بخش اختصاصی اشتراک طلایی (دسترسی زودهنگام) */}
      {user?.subscription === "GOLD" && (
        <section className="bg-gradient-to-r from-green-600 to-green-400 rounded-2xl p-6 text-white shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">
              🌟 Gold Exclusive: Early Access
            </h2>
          </div>
          <p className="text-green-50 mb-4">
            Listen to the newest drops before anyone else.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* اینجا بعداً آهنگ‌های ویژه قرار می‌گیره */}
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:bg-white/30 transition-colors">
              <div className="w-12 h-12 bg-white/40 rounded-lg flex-shrink-0 animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 bg-white/40 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-white/30 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* آخرین آلبوم‌ها */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Latest Albums</h2>
          <button className="text-sm font-medium text-gray-500 hover:text-green-600 transition-colors">
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

      {/* آهنگ‌های پرشنونده */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Most Listened Songs
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* مرتب‌سازی آهنگ‌ها بر اساس تعداد شنونده به صورت نزولی */}
          {songs
            .sort((a, b) => b.listenersCount - a.listenersCount)
            .map((song) => (
              <SongCard
                key={song.id}
                song={song}
                artistName={getArtistName(song.artistId)}
              />
            ))}
        </div>
      </section>
    </div>
  );
}
