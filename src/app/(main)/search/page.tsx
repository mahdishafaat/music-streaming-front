// src/app/(main)/search/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { getStorageItem } from "@/utils/storage";
import { Song, Album, User } from "@/types";
import SongCard from "@/components/ui/SongCard";
import AlbumCard from "@/components/ui/AlbumCard";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [allAlbums, setAllAlbums] = useState<Album[]>([]);
  const [allArtists, setAllArtists] = useState<User[]>([]);

  // دریافت اطلاعات اولیه با روش صحیح
  useEffect(() => {
    const loadInitialData = async () => {
      setAllSongs(getStorageItem<Song[]>("songs") || []);
      setAllAlbums(getStorageItem<Album[]>("albums") || []);
      setAllArtists(getStorageItem<User[]>("artists") || []);
    };

    loadInitialData();
  }, []);

  // استفاده از useMemo به جای useEffect برای فیلتر کردن (بهینه‌ترین روش ری‌اکت)
  const filteredSongs = useMemo(() => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    return allSongs.filter((song) =>
      song.title.toLowerCase().includes(lowerQuery),
    );
  }, [query, allSongs]);

  const filteredAlbums = useMemo(() => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    return allAlbums.filter((album) =>
      album.title.toLowerCase().includes(lowerQuery),
    );
  }, [query, allAlbums]);

  const getArtistName = (artistId: string) => {
    const artist = allArtists.find((a) => a.id === artistId);
    return artist ? artist.displayName : "Unknown Artist";
  };

  return (
    <div className="flex flex-col gap-8 pb-10 transition-colors min-h-full">
      {!query.trim() && (
        <div className="flex flex-col items-center justify-center flex-1 py-20 text-center">
          <svg
            className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Search for content
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Type in the top search bar to find songs and albums.
          </p>
        </div>
      )}

      {query.trim() &&
        filteredSongs.length === 0 &&
        filteredAlbums.length === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 py-20 text-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No results found for &quot;{query}&quot;
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Please make sure your words are spelled correctly.
            </p>
          </div>
        )}

      {filteredSongs.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 transition-colors">
            Songs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSongs.map((song) => (
              <SongCard
                key={song.id}
                song={song}
                artistName={getArtistName(song.artistId)}
                contextSongs={filteredSongs}
              />
            ))}
          </div>
        </section>
      )}

      {filteredAlbums.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 transition-colors mt-4">
            Albums
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredAlbums.map((album) => (
              <AlbumCard
                key={album.id}
                album={album}
                artistName={getArtistName(album.artistId)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
