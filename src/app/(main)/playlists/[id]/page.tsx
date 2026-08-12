// src/app/(main)/playlists/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Playlist, Song } from "@/types";
import SongCard from "@/components/ui/SongCard";
import { usePlayer } from "@/context/PlayerContext";
import Image from "next/image";

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

interface ApiPlaylistDetail {
  id: number;
  name: string;
  cover?: string | null;
  created_at: string;
  musics: ApiMusic[];
}

interface DisplaySong extends Song {
  artistName: string;
}

export default function PlaylistDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const playlistId = params.id as string;

  const { playSong, isPlaying, currentSong, togglePlay } = usePlayer();

  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [playlistSongs, setPlaylistSongs] = useState<DisplaySong[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getFullUrl = (path?: string | null): string => {
    if (!path) return "/default-cover.png";
    if (path.startsWith("http")) return path;
    return `http://127.0.0.1:8000${path}`;
  };

  useEffect(() => {
    const fetchPlaylistData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          setIsLoading(false);
          return;
        }

        const res = await fetch(
          `http://127.0.0.1:8000/music/playlists/${playlistId}/`,
          {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
          },
        );

        if (res.ok) {
          const data: ApiPlaylistDetail = await res.json();

          // چک امنیتی URL عکس برای جلوگیری از باگ Invalid URL
          const finalCoverUrl = data.cover
            ? data.cover.startsWith("http")
              ? data.cover
              : `http://127.0.0.1:8000${data.cover}`
            : undefined;

          setPlaylist({
            id: data.id.toString(),
            title: data.name,
            songIds: data.musics.map((m) => m.id.toString()),
            userId: "me",
            createdAt: data.created_at || new Date().toISOString(),
            coverImage: finalCoverUrl,
          });

          const mappedSongs: DisplaySong[] = data.musics.map((m) => ({
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

          setPlaylistSongs(mappedSongs);
        }
      } catch (error) {
        console.error("Failed to fetch playlist details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (playlistId) fetchPlaylistData();
  }, [playlistId]);

  const isCurrentSongInPlaylist = playlistSongs.some(
    (song) => song.id === currentSong?.id,
  );
  const isThisPlaylistPlaying = isPlaying && isCurrentSongInPlaylist;

  const handlePlayPlaylist = () => {
    if (playlistSongs.length === 0) return;
    if (isThisPlaylistPlaying) {
      togglePlay();
    } else if (isCurrentSongInPlaylist && !isPlaying) {
      togglePlay();
    } else {
      playSong(playlistSongs[0], playlistSongs);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 font-bold text-gray-500 dark:text-gray-400">
        Loading playlist...
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Playlist not found
        </h2>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-green-600 font-bold text-white rounded-xl hover:bg-green-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  const playlistCover =
    playlist.coverImage ||
    (playlistSongs.length > 0 ? playlistSongs[0].coverImage : null);

  return (
    <div className="flex flex-col gap-8 pb-10 transition-colors animate-fade-in max-w-5xl mx-auto w-full">
      <div className="flex flex-col md:flex-row items-end gap-6 pb-6 border-b border-gray-200 dark:border-gray-700">
        <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
          {playlistCover ? (
            <Image
              src={playlistCover}
              alt={playlist.title}
              fill
              className="object-cover"
              unoptimized
              priority
            />
          ) : (
            <svg
              className="w-24 h-24 text-gray-400 dark:text-gray-500"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          )}
        </div>

        <div className="flex flex-col gap-3 flex-1 min-w-0 w-full">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
            Playlist
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white truncate">
            {playlist.title}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="font-bold text-gray-900 dark:text-white">
              My Playlist
            </span>
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              • {playlistSongs.length} songs
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={handlePlayPlaylist}
          disabled={playlistSongs.length === 0}
          className="w-14 h-14 flex items-center justify-center rounded-full bg-green-600 text-white hover:bg-green-500 hover:scale-105 transition-all shadow-lg shadow-green-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isThisPlaylistPlaying ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg
              className="w-7 h-7 ml-1"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
      </div>

      <div className="flex flex-col gap-2 mt-4">
        {playlistSongs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
            <svg
              className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              ></path>
            </svg>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              It&apos;s a bit empty here...
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm">
              Go to your home page or albums and click the + icon on any song to
              add it to this playlist.
            </p>
          </div>
        ) : (
          playlistSongs.map((song, index) => (
            <div key={song.id} className="flex items-center gap-4 group">
              <div className="w-8 text-center text-sm font-medium text-gray-400 dark:text-gray-500">
                {index + 1}
              </div>
              <div className="flex-1">
                <SongCard
                  song={song}
                  artistName={song.artistName}
                  contextSongs={playlistSongs}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
