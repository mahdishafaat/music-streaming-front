// src/app/(main)/albums/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Album, Song } from "@/types";
import AlbumCard from "@/components/ui/AlbumCard";
import SongCard from "@/components/ui/SongCard";
import { API_BASE_URL } from '@/config/api';

// تعریف تایپ‌های دقیق برای دیتای دریافتی از بک‌اند
interface ApiArtist {
  id: number;
  stage_name: string;
}

interface ApiMusic {
  id: number;
  title: string;
  album?: number | null;
  cover?: string | null;
  audio_file: string;
  lyrics?: string;
  artists?: ApiArtist[];
  streams_count: number;
  likes_count: number;
  is_liked: boolean;
}

interface ApiAlbum {
  id: number;
  title: string;
  cover?: string | null;
  release_date: string;
  musics?: ApiMusic[];
}

interface DisplaySong extends Song {
  artistName: string;
}

interface DisplayAlbum extends Album {
  artistName: string;
}

export default function AlbumsPage() {
  const [albums, setAlbums] = useState<DisplayAlbum[]>([]);
  const [singles, setSingles] = useState<DisplaySong[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getFullUrl = (path?: string | null): string => {
    if (!path) return "/default-cover.png";
    if (path.startsWith("http")) return path;
    return `${API_BASE_URL}${path}`;
  };

  useEffect(() => {
    const fetchRealData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const headers: Record<string, string> = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        let [musicRes, albumRes] = await Promise.all([
          fetch(`${API_BASE_URL}/music/musics/`, {
            headers,
            cache: "no-store",
          }),
          fetch(`${API_BASE_URL}/music/albums/`, {
            headers,
            cache: "no-store",
          }),
        ]);

        // اگر توکن منقضی شده بود، اطلاعات را پابلیک دریافت می‌کنیم
        if (musicRes.status === 401 || albumRes.status === 401) {
          const publicRes = await Promise.all([
            fetch(`${API_BASE_URL}/music/musics/`, { cache: "no-store" }),
            fetch(`${API_BASE_URL}/music/albums/`, { cache: "no-store" }),
          ]);
          musicRes = publicRes[0];
          albumRes = publicRes[1];
        }

        if (musicRes.ok && albumRes.ok) {
          const musicsData: ApiMusic[] = await musicRes.json();
          const albumsData: ApiAlbum[] = await albumRes.json();

          // مپ کردن آلبوم‌ها
          const mappedAlbums: DisplayAlbum[] = albumsData.map(
            (a: ApiAlbum) => ({
              id: a.id.toString(),
              title: a.title,
              artistId:
                a.musics?.[0]?.artists?.[0]?.id?.toString() || "unknown",
              artistName:
                a.musics?.[0]?.artists?.[0]?.stage_name || "Various Artists",
              coverImage: getFullUrl(a.cover),
              releaseDate: a.release_date,
              songIds: a.musics?.map((m) => m.id.toString()) || [],
            }),
          );

          // جدا کردن تک‌آهنگ‌ها (آهنگ‌هایی که فیلد album در دیتابیس آن‌ها null است)
          const mappedSingles: DisplaySong[] = musicsData
            .filter((m: ApiMusic) => !m.album)
            .map((m: ApiMusic) => ({
              id: m.id.toString(),
              title: m.title,
              artistId: m.artists?.[0]?.id?.toString() || "unknown",
              artistName: m.artists?.[0]?.stage_name || "Unknown Artist",
              albumId: "",
              coverImage: getFullUrl(m.cover),
              audioUrl: getFullUrl(m.audio_file),
              streamsCount: m.streams_count || 0,
              likesCount: m.likes_count || 0,
              isLiked: m.is_liked || false,
              listenersCount: 0,
              lyrics: m.lyrics || "",
            }));

          setAlbums(mappedAlbums);
          setSingles(mappedSingles);
        }
      } catch (error) {
        console.error("Failed to fetch library data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRealData();
  }, []);

  return (
    <div className="flex flex-col gap-10 pb-10 transition-colors animate-fade-in">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white">
          Albums & Singles
        </h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10 font-bold text-gray-500 dark:text-gray-400">
          Loading library...
        </div>
      ) : (
        <>
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
                    artistName={album.artistName}
                  />
                ))}
              </div>
            </section>
          )}

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
                    artistName={song.artistName}
                    contextSongs={singles}
                  />
                ))}
              </div>
            </section>
          )}

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
                  strokeWidth="1.5"
                  d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                ></path>
              </svg>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                No music yet
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                The library is empty. Go to Studio to drop some hits!
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
