// src/app/(main)/albums/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { usePlayer } from "@/context/PlayerContext";
import SongCard from "@/components/ui/SongCard";
import { Song } from "@/types";
import { API_BASE_URL } from '@/config/api';
interface ApiArtist {
  id: number;
  stage_name: string;
}

interface ApiMusic {
  id: number;
  title: string;
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

export default function AlbumDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { playSong } = usePlayer();

  const [album, setAlbum] = useState<ApiAlbum | null>(null);
  const [songs, setSongs] = useState<DisplaySong[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getFullUrl = (path?: string | null): string => {
    if (!path) return "/default-cover.png";
    if (path.startsWith("http")) return path;
    return `${API_BASE_URL}${path}`;
  };

  useEffect(() => {
    const fetchAlbum = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const headers: Record<string, string> = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        let res = await fetch(`${API_BASE_URL}/music/albums/${id}/`, {
          headers,
          cache: "no-store",
        });

        if (res.status === 401) {
          res = await fetch(`${API_BASE_URL}/music/albums/${id}/`, {
            cache: "no-store",
          });
        }

        if (res.ok) {
          const data: ApiAlbum = await res.json();
          setAlbum(data);

          const mappedSongs: DisplaySong[] = (data.musics || []).map(
            (m: ApiMusic) => ({
              id: m.id.toString(),
              title: m.title,
              artistId: m.artists?.[0]?.id?.toString() || "unknown",
              artistName: m.artists?.[0]?.stage_name || "Unknown Artist",
              albumId: data.id.toString(),
              coverImage: getFullUrl(m.cover || data.cover),
              audioUrl: getFullUrl(m.audio_file),
              streamsCount: m.streams_count || 0,
              likesCount: m.likes_count || 0,
              isLiked: m.is_liked || false,
              listenersCount: 0,
              lyrics: m.lyrics || "",
            }),
          );

          setSongs(mappedSongs);
        }
      } catch (error) {
        console.error("Error fetching album:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchAlbum();
  }, [id]);

  const handlePlayAlbum = () => {
    if (songs.length > 0) {
      playSong(songs[0], songs);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500 dark:text-gray-400 font-bold">
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
          className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-bold"
        >
          Go Back
        </button>
      </div>
    );
  }

  const albumArtistName =
    album.musics?.[0]?.artists?.[0]?.stage_name || "Various Artists";

  return (
    <div className="flex flex-col gap-8 pb-10 transition-colors max-w-5xl mx-auto w-full animate-fade-in">
      <div className="flex flex-col md:flex-row items-end gap-6 pb-6 border-b border-gray-200 dark:border-gray-700">
        <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <Image
            src={getFullUrl(album.cover)}
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
            <span className="font-bold text-gray-900 dark:text-white">
              {albumArtistName}
            </span>
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              •{" "}
              {album.release_date
                ? album.release_date.split("-")[0]
                : "Unknown"}
            </span>
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              • {songs.length} songs
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={handlePlayAlbum}
          disabled={songs.length === 0}
          className="w-14 h-14 flex items-center justify-center rounded-full bg-green-600 text-white hover:bg-green-500 hover:scale-105 transition-all shadow-lg shadow-green-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-7 h-7 ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      </div>

      <div className="flex flex-col gap-2 mt-4">
        <div className="flex items-center px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 mb-2">
          <div className="w-8 text-center">#</div>
          <div className="flex-1">Title & Stats</div>
        </div>

        {songs.length === 0 ? (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            No songs found in this album.
          </div>
        ) : (
          songs.map((song, index) => (
            <div key={song.id} className="flex items-center gap-4 group">
              <div className="w-8 text-center text-sm font-medium text-gray-400 dark:text-gray-500">
                {index + 1}
              </div>
              <div className="flex-1">
                <SongCard
                  song={song}
                  artistName={song.artistName}
                  contextSongs={songs}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
