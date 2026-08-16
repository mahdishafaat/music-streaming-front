// src/app/(main)/playlists/[id]/page.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Playlist, Song } from "@/types";
import SongCard from "@/components/ui/SongCard";
import { usePlayer } from "@/context/PlayerContext";
import Image from "next/image";
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

  // استیت‌های منوی دراپ‌داون و مدال ویرایش
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // استیت برای لودینگِ حذف آهنگ
  const [removingSongId, setRemovingSongId] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  const getFullUrl = (path?: string | null): string => {
    if (!path) return "/default-cover.png";
    if (path.startsWith("http")) return path;
    return `${API_BASE_URL}${path}`;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchPlaylistData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          setIsLoading(false);
          return;
        }

        const res = await fetch(
          `${API_BASE_URL}/music/playlists/${playlistId}/`,
          {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
          },
        );

        if (res.ok) {
          const data: ApiPlaylistDetail = await res.json();

          const finalCoverUrl = data.cover
            ? data.cover.startsWith("http")
              ? data.cover
              : `${API_BASE_URL}${data.cover}`
            : undefined;

          setPlaylist({
            id: data.id.toString(),
            title: data.name,
            songIds: data.musics.map((m) => m.id.toString()),
            userId: "me",
            createdAt: data.created_at || new Date().toISOString(),
            coverImage: finalCoverUrl,
          });

          setEditName(data.name);

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

  const handleDeletePlaylist = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this playlist? This action cannot be undone.",
      )
    )
      return;

    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_BASE_URL}/music/playlists/${playlistId}/delete/`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.ok || res.status === 204) {
        router.push("/playlists");
      } else {
        alert("Failed to delete playlist.");
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleUpdatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;

    setIsUpdating(true);
    try {
      const token = localStorage.getItem("access_token");
      const formData = new FormData();
      formData.append("name", editName.trim());

      const res = await fetch(
        `${API_BASE_URL}/music/playlists/${playlistId}/update/`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        },
      );

      if (res.ok) {
        const updatedData = await res.json();
        setPlaylist((prev) =>
          prev ? { ...prev, title: updatedData.name } : null,
        );
        setIsEditModalOpen(false);
      } else {
        alert("Failed to update playlist.");
      }
    } catch (error) {
      console.error("Update error:", error);
    } finally {
      setIsUpdating(false);
      setIsMenuOpen(false);
    }
  };

  // 🌟 تابع حذف آهنگ از پلی‌لیست
  const handleRemoveSong = async (songId: string) => {
    if (!confirm("Remove this song from the playlist?")) return;

    setRemovingSongId(songId);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_BASE_URL}/music/playlists/${playlistId}/remove-music/`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ music_id: parseInt(songId) }),
        },
      );

      if (res.ok || res.status === 204) {
        // آپدیت کردن استیت‌ها بدون نیاز به رفرش
        setPlaylistSongs((prev) => prev.filter((song) => song.id !== songId));
        setPlaylist((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            songIds: prev.songIds.filter((id) => id !== songId),
          };
        });
      } else {
        const errorData = await res.json();
        alert(errorData.detail || "Failed to remove song.");
      }
    } catch (error) {
      console.error("Remove song error:", error);
    } finally {
      setRemovingSongId(null);
    }
  };

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
    <div className="flex flex-col gap-8 pb-10 transition-colors animate-fade-in max-w-5xl mx-auto w-full relative">
      <div className="flex flex-col md:flex-row items-end gap-6 pb-6 border-b border-gray-200 dark:border-gray-700 relative">
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

        <div className="flex flex-col gap-3 flex-1 min-w-0 w-full relative">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
            Playlist
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white truncate pr-12">
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

          <div
            className="absolute top-0 right-0 md:bottom-2 md:top-auto"
            ref={menuRef}
          >
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 z-50 py-1 overflow-hidden">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    ></path>
                  </svg>
                  Edit Details
                </button>
                <button
                  onClick={handleDeletePlaylist}
                  className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 border-t border-gray-100 dark:border-gray-700"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    ></path>
                  </svg>
                  Delete
                </button>
              </div>
            )}
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
            <div
              key={song.id}
              className="flex items-center gap-2 group transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/40 rounded-xl pr-2"
            >
              <div className="w-10 text-center text-sm font-medium text-gray-400 dark:text-gray-500 flex-shrink-0">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <SongCard
                  song={song}
                  artistName={song.artistName}
                  contextSongs={playlistSongs}
                />
              </div>

              {/* 🌟 دکمه حذف آهنگ که با هاور ظاهر می‌شود */}
              <div className="flex-shrink-0 w-10 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleRemoveSong(song.id)}
                  disabled={removingSongId === song.id}
                  className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-50 transition-colors"
                  title="Remove from playlist"
                >
                  {removingSongId === song.id ? (
                    <svg
                      className="animate-spin w-5 h-5 text-red-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      ></path>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Edit Playlist
            </h2>
            <form onSubmit={handleUpdatePlaylist}>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border-none rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white mb-4 outline-none"
                placeholder="Playlist name"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating || !editName.trim()}
                  className="px-4 py-2 font-bold bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {isUpdating ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
