// src/app/(main)/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getStorageItem } from "@/utils/storage";
import { Album, Song, Artist } from "@/types";
import AlbumCard from "@/components/ui/AlbumCard";
import SongCard from "@/components/ui/SongCard";

export default function HomePage() {
  const { user } = useAuth();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]); // تغییر به Artist

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
    // استفاده از .name به جای .displayName
    return artist ? artist.name : "Unknown Artist";
  };

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
          <p className="text-green-50 mb-4">
            Listen to the newest drops before anyone else.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          {songs
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