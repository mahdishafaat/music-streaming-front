// src/app/(main)/page.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { usePlayer } from "@/context/PlayerContext";
import { Album, Song } from "@/types";
import AlbumCard from "@/components/ui/AlbumCard";
import SongCard from "@/components/ui/SongCard";

// ========== TYPES ==========
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

interface SubscriptionData {
  plan: {
    id: number;
    name: string;
    max_daily_streams: number | null;
    max_playlists: number | null;
    can_upload_profile_image: boolean;
    can_download: boolean;
    can_early_access: boolean;
    can_view_statistics: boolean;
    is_active: boolean;
  };
  price: string;
  duration_months: number;
  start_date: string;
  end_date: string | null;
  status: string;
  is_default_base: boolean;
}

export default function HomePage() {
  const { user } = useAuth();
  const { playSong } = usePlayer();

  const [albums, setAlbums] = useState<DisplayAlbum[]>([]);
  const [songs, setSongs] = useState<DisplaySong[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Subscription state
  const [subscription, setSubscription] = useState<SubscriptionData | null>(
    null,
  );
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);

  const getFullUrl = (path?: string | null): string => {
    if (!path) return "/default-cover.png";
    if (path.startsWith("http")) return path;
    return `http://127.0.0.1:8000${path}`;
  };

  const getHeaders = (): HeadersInit => {
    const token = localStorage.getItem("access_token");
    return {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  // ---- Fetch music & albums ----
  useEffect(() => {
    const fetchMusicData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const headers: Record<string, string> = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        let [musicRes, albumRes] = await Promise.all([
          fetch("http://127.0.0.1:8000/music/musics/", {
            headers,
            cache: "no-store",
          }),
          fetch("http://127.0.0.1:8000/music/albums/", {
            headers,
            cache: "no-store",
          }),
        ]);

        // If unauthorized, try public access
        if (musicRes.status === 401 || albumRes.status === 401) {
          const publicRes = await Promise.all([
            fetch("http://127.0.0.1:8000/music/musics/", { cache: "no-store" }),
            fetch("http://127.0.0.1:8000/music/albums/", { cache: "no-store" }),
          ]);
          musicRes = publicRes[0];
          albumRes = publicRes[1];
        }

        if (musicRes.ok && albumRes.ok) {
          const musicsData: ApiMusic[] = await musicRes.json();
          const albumsData: ApiAlbum[] = await albumRes.json();

          const mappedSongs: DisplaySong[] = musicsData.map((m: ApiMusic) => ({
            id: m.id.toString(),
            title: m.title,
            artistId: m.artists?.[0]?.id?.toString() || "unknown",
            artistName: m.artists?.[0]?.stage_name || "Unknown Artist",
            albumId: m.album?.toString() || "",
            coverImage: getFullUrl(m.cover),
            audioUrl: getFullUrl(m.audio_file),
            streamsCount: m.streams_count || 0,
            likesCount: m.likes_count || 0,
            isLiked: m.is_liked || false,
            listenersCount: 0,
            lyrics: m.lyrics || "",
          }));

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

          setSongs(mappedSongs);
          setAlbums(mappedAlbums);
        } else {
          console.error("API returned an error. Check Django console.");
        }
      } catch (error) {
        console.error("Failed to fetch real data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMusicData();
  }, []);

  // ---- Fetch subscription data ----
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) {
        setSubscriptionLoading(false);
        return;
      }
      try {
        const res = await fetch(
          "http://127.0.0.1:8000/subscriptions/me/subscription/",
          {
            headers: getHeaders(),
          },
        );
        if (res.ok) {
          const data = await res.json();
          setSubscription(data);
        } else {
          // If endpoint fails, assume base plan
          setSubscription(null);
        }
      } catch (error) {
        console.error("Failed to fetch subscription:", error);
        setSubscription(null);
      } finally {
        setSubscriptionLoading(false);
      }
    };

    fetchSubscription();
  }, [user]);

  // ---- Determine if user has early access ----
  const hasEarlyAccess = subscription?.plan?.can_early_access === true;

  const exclusiveSongs = songs.slice(0, 2);

  if (isLoading) {
    return (
      <div className="p-10 text-center font-bold text-gray-500">
        Loading fresh drops...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 pb-8 transition-colors">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors">
          Good morning, {user?.displayName?.split(" ")[0] || "Guest"}
        </h1>
      </div>

      {/* Gold Exclusive section – only if user has early access */}
      {user && hasEarlyAccess && (
        <section className="bg-gradient-to-r from-green-600 to-green-400 rounded-2xl p-6 text-white shadow-md animate-fade-in">
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
                      {song.artistName}
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

      {albums.length > 0 && (
        <section className="animate-fade-in">
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
                artistName={album.artistName}
              />
            ))}
          </div>
        </section>
      )}

      <section className="animate-fade-in">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 transition-colors">
          All Tracks
        </h2>
        {songs.length === 0 ? (
          <div className="p-8 text-center text-gray-500 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
            No tracks found. Go to Studio and upload some!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {songs.map((song) => (
              <SongCard
                key={song.id}
                song={song}
                artistName={song.artistName}
                contextSongs={songs}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
