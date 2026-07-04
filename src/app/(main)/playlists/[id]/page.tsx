// src/app/(main)/playlists/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getStorageItem } from "@/utils/storage";
import { Playlist, Song, User } from "@/types";
import SongCard from "@/components/ui/SongCard";
import { usePlayer } from "@/context/PlayerContext";
import Image from "next/image";

export default function PlaylistDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const playlistId = params.id as string;

  // توابع و استیت‌های پلیر رو وارد می‌کنیم تا دکمه آپدیت بشه
  const { playSong, isPlaying, currentSong, togglePlay } = usePlayer();

  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [playlistSongs, setPlaylistSongs] = useState<Song[]>([]);
  const [artists, setArtists] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlaylistData = async () => {
      const allPlaylists = getStorageItem<Playlist[]>("playlists") || [];
      const allSongs = getStorageItem<Song[]>("songs") || [];
      const allArtists = getStorageItem<User[]>("artists") || [];

      const foundPlaylist = allPlaylists.find((p) => p.id === playlistId);

      if (foundPlaylist) {
        setPlaylist(foundPlaylist);

        const filteredSongs = allSongs.filter((song) =>
          foundPlaylist.songIds?.includes(song.id),
        );
        setPlaylistSongs(filteredSongs);
        setArtists(allArtists);
      }

      setIsLoading(false);
    };

    fetchPlaylistData();
  }, [playlistId]);

  const getArtistName = (artistId: string) => {
    const artist = artists.find((a) => a.id === artistId);
    return artist ? artist.displayName : "Unknown Artist";
  };

  // بررسی می‌کنیم آیا یکی از آهنگ‌های این پلی‌لیست در حال پخش هست یا نه
  const isCurrentSongInPlaylist = playlistSongs.some(
    (song) => song.id === currentSong?.id,
  );
  const isThisPlaylistPlaying = isPlaying && isCurrentSongInPlaylist;

  const handlePlayPlaylist = () => {
    if (playlistSongs.length === 0) return;

    if (isThisPlaylistPlaying) {
      // اگر در حال پخش بود، متوقفش کن
      togglePlay();
    } else if (isCurrentSongInPlaylist && !isPlaying) {
      // اگر آهنگِ همین پلی‌لیست متوقف شده بود، ادامه‌اش رو پخش کن
      togglePlay();
    } else {
      // در غیر این صورت، از اولین آهنگ پلی‌لیست شروع به پخش کن
      playSong(playlistSongs[0], playlistSongs);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500 dark:text-gray-400">
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
          className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-10 transition-colors">
      {/* هدر پلی‌لیست */}
      <div className="flex flex-col md:flex-row items-end gap-6 pb-6 border-b border-gray-200 dark:border-gray-700">
        <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
          {playlist.coverImage ? (
            <Image
              src={playlist.coverImage}
              alt={playlist.title}
              fill
              className="object-cover"
              unoptimized
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

      {/* دکمه‌های کنترل */}
      <div className="flex items-center gap-4">
        <button
          onClick={handlePlayPlaylist}
          disabled={playlistSongs.length === 0}
          className="w-14 h-14 flex items-center justify-center rounded-full bg-green-600 text-white hover:bg-green-500 hover:scale-105 transition-all shadow-lg shadow-green-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {/* حالا با توجه به وضعیت پخش، آیکون به درستی تغییر می‌کند */}
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

      {/* لیست آهنگ‌های پلی‌لیست */}
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
                  artistName={getArtistName(song.artistId)}
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
