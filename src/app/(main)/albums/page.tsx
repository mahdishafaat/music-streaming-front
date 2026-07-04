// src/app/(main)/albums/page.tsx
"use client";

import { useEffect, useState } from "react";
import { getStorageItem } from "@/utils/storage";
import { Album, User, Song } from "@/types";
import AlbumCard from "@/components/ui/AlbumCard";
import SongCard from "@/components/ui/SongCard";

export default function AlbumsPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [singles, setSingles] = useState<Song[]>([]);
  const [artists, setArtists] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const storedAlbums = getStorageItem<Album[]>("albums") || [];
      const storedArtists = getStorageItem<User[]>("artists") || [];
      const storedSongs = getStorageItem<Song[]>("songs") || [];

      // پیدا کردن تک‌آهنگ‌ها (آهنگ‌هایی که albumId ندارند یا albumId آن‌ها در لیست آلبوم‌ها نیست)
      // در معماری فعلی ما، اگر albumId خالی باشد یعنی Single است
      const orphanSongs = storedSongs.filter((song) => !song.albumId);

      setAlbums(storedAlbums);
      setSingles(orphanSongs);
      setArtists(storedArtists);
      setIsLoading(false);
    };

    loadData();
  }, []);

  const getArtistName = (artistId: string) => {
    const artist = artists.find((a) => a.id === artistId);
    return artist ? artist.displayName : "Unknown Artist";
  };

  return (
    <div className="flex flex-col gap-10 pb-10 transition-colors">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Albums & Singles
        </h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10 text-gray-500 dark:text-gray-400">
          Loading library...
        </div>
      ) : (
        <>
          {/* بخش آلبوم‌ها */}
          {albums.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Albums
              </h2>
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
          )}

          {/* بخش تک‌آهنگ‌ها */}
          {singles.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Singles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {singles.map((song) => (
                  <SongCard
                    key={song.id}
                    song={song}
                    artistName={getArtistName(song.artistId)}
                    contextSongs={singles}
                  />
                ))}
              </div>
            </section>
          )}

          {/* اگر نه آلبومی بود نه تک‌آهنگی */}
          {albums.length === 0 && singles.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <svg
                className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                ></path>
              </svg>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                No music yet
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Your library is waiting to be filled.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
