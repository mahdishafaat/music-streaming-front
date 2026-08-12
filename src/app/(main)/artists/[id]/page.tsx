// src/app/(main)/artists/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { usePlayer } from "@/context/PlayerContext";
import { Album, Song } from "@/types";
import AlbumCard from "@/components/ui/AlbumCard";
import SongCard from "@/components/ui/SongCard";

interface ApiArtistBasic {
  id: number;
  stage_name: string;
}

interface ApiMusic {
  id: number;
  title: string;
  cover?: string | null;
  audio_file: string;
  lyrics?: string;
  artists?: ApiArtistBasic[];
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

interface ApiArtistDetail {
  id: number;
  user_display_name: string;
  stage_name: string;
  bio: string;
  is_verified: boolean;
  singles: ApiMusic[];
  albums: ApiAlbum[];
}

interface DisplaySong extends Song {
  artistName: string;
}

interface DisplayAlbum extends Album {
  artistName: string;
}

export default function ArtistProfilePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { playSong } = usePlayer();

  const [artist, setArtist] = useState<ApiArtistDetail | null>(null);
  const [albums, setAlbums] = useState<DisplayAlbum[]>([]);
  const [singles, setSingles] = useState<DisplaySong[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({ listeners: 0, streams: 0 });

  const getFullUrl = (path?: string | null): string => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `http://127.0.0.1:8000${path}`;
  };

  useEffect(() => {
    const fetchArtistData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const headers: Record<string, string> = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        let res = await fetch(`http://127.0.0.1:8000/accounts/artists/${id}/`, {
          headers,
          cache: "no-store",
        });

        if (res.status === 401) {
          res = await fetch(`http://127.0.0.1:8000/accounts/artists/${id}/`, {
            cache: "no-store",
          });
        }

        if (res.ok) {
          const data: ApiArtistDetail = await res.json();
          setArtist(data);

          const mappedSingles: DisplaySong[] = (data.singles || []).map(
            (m) => ({
              id: m.id.toString(),
              title: m.title,
              artistId: data.id.toString(),
              artistName: data.stage_name,
              albumId: "",
              coverImage: getFullUrl(m.cover),
              audioUrl: getFullUrl(m.audio_file),
              streamsCount: m.streams_count || 0,
              likesCount: m.likes_count || 0,
              isLiked: m.is_liked || false,
              listenersCount: 0,
              lyrics: m.lyrics || "",
            }),
          );

          const mappedAlbums: DisplayAlbum[] = (data.albums || []).map((a) => ({
            id: a.id.toString(),
            title: a.title,
            artistId: data.id.toString(),
            artistName: data.stage_name,
            coverImage: getFullUrl(a.cover),
            releaseDate: a.release_date,
            songIds: a.musics?.map((m) => m.id.toString()) || [],
          }));

          setSingles(mappedSingles);
          setAlbums(mappedAlbums);

          const totalStreams = mappedSingles.reduce(
            (sum, song) => sum + (song.streamsCount || 0),
            0,
          );
          setStats({
            streams: totalStreams,
            listeners: Math.floor(totalStreams * 0.7),
          });
          setIsFollowing(false);
        }
      } catch (error) {
        console.error("Error fetching artist data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchArtistData();
    }
  }, [id]);

  const handleToggleFollow = async () => {
    if (!artist) return;
    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("Please login to follow artists.");
      return;
    }

    try {
      if (isFollowing) {
        const res = await fetch(
          `http://127.0.0.1:8000/accounts/unfollow/?display_name=${artist.user_display_name}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (res.ok) setIsFollowing(false);
      } else {
        const res = await fetch("http://127.0.0.1:8000/accounts/follow/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ display_name: artist.user_display_name }),
        });
        if (res.ok) setIsFollowing(true);
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };

  const handlePlayAll = () => {
    if (singles.length > 0) {
      playSong(singles[0], singles);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-[50vh] text-gray-500 font-bold">
        Loading artist data...
      </div>
    );
  if (!artist)
    return (
      <div className="flex justify-center items-center h-[70vh] font-bold text-gray-500">
        Artist not found.
      </div>
    );

  const artistImageUrl =
    "https://images.unsplash.com/photo-1516280440502-86927d2c3dfb?auto=format&fit=crop&q=80";

  return (
    <div className="flex flex-col gap-10 pb-12 transition-colors max-w-6xl mx-auto w-full animate-fade-in">
      <div className="relative h-[40vh] md:h-[50vh] min-h-[300px] w-full rounded-3xl overflow-hidden shadow-lg group">
        <Image
          src={artistImageUrl}
          alt={artist.stage_name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 flex flex-col md:flex-row items-end justify-between gap-6">
          <div className="flex flex-col gap-3">
            {artist.is_verified && (
              <div className="flex items-center gap-1.5 text-blue-400 bg-blue-500/10 backdrop-blur-md px-3 py-1 rounded-full w-fit">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                <span className="text-sm font-bold tracking-wide">
                  Verified Artist
                </span>
              </div>
            )}
            <h1 className="text-5xl md:text-7xl font-black text-white drop-shadow-lg tracking-tight">
              {artist.stage_name}
            </h1>
            <p className="text-gray-300 max-w-2xl text-sm md:text-base line-clamp-2">
              {artist.bio || "No biography available."}
            </p>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <button
              onClick={handlePlayAll}
              disabled={singles.length === 0}
              className="w-14 h-14 bg-green-500 hover:bg-green-400 hover:scale-105 text-white rounded-full flex items-center justify-center shadow-xl transition-all disabled:opacity-50"
            >
              <svg
                className="w-6 h-6 ml-1 text-black"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
            <button
              onClick={handleToggleFollow}
              className={`px-6 py-2.5 rounded-full font-bold text-sm border-2 transition-colors ${isFollowing ? "border-gray-500 text-gray-300 hover:border-white" : "border-white text-white hover:bg-white hover:text-black"}`}
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        <div className="flex-1 flex flex-col gap-10">
          {singles.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Popular Singles
              </h2>
              <div className="flex flex-col gap-2">
                {singles.map((song, index) => (
                  <div key={song.id} className="flex items-center gap-4 group">
                    <span className="w-5 text-center text-gray-400 font-medium">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <SongCard
                        song={song}
                        artistName={artist.stage_name}
                        contextSongs={singles}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
          {albums.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Albums
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {albums.map((album) => (
                  <AlbumCard
                    key={album.id}
                    album={album}
                    artistName={artist.stage_name}
                  />
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 sticky top-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Artist Stats
            </h3>
            {user?.subscription === "GOLD" ? (
              <div className="flex flex-col gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Estimated Listeners
                  </p>
                  <p className="text-3xl font-black text-gray-900 dark:text-white">
                    {stats.listeners.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Total Streams
                  </p>
                  <p className="text-3xl font-black text-gray-900 dark:text-white">
                    {stats.streams.toLocaleString()}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-4 bg-gray-100 dark:bg-gray-800 rounded-xl text-center border border-dashed border-gray-300 dark:border-gray-600">
                <svg
                  className="w-10 h-10 text-yellow-500 mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <h4 className="font-bold text-gray-900 dark:text-white mb-1">
                  Premium Insight
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  Upgrade to GOLD to see detailed statistics.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
