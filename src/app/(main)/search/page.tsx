// src/app/(main)/search/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import SongCard from "@/components/ui/SongCard";
import AlbumCard from "@/components/ui/AlbumCard";
import Image from "next/image";
import Link from "next/link";

// ========== TYPES ==========
interface SearchArtist {
  id: number;
  stage_name: string;
  bio: string;
  is_verified: boolean;
  profile_image: string | null;
  followers_count: number;
  role: string;
  artist_id?: number | null;
}

interface SearchSong {
  id: number;
  title: string;
  cover: string | null;
  audio_file: string;
  lyrics: string;
  release_date: string;
  duration: string;
  streams_count: number;
  likes_count: number;
  is_liked: boolean;
  artist_name: string;
  artist_id: number;
}

interface SearchAlbum {
  id: number;
  title: string;
  cover: string | null;
  release_date: string;
  artist_name: string;
  artist_id: number;
  song_count: number;
}

interface SearchResponse {
  songs: SearchSong[];
  albums: SearchAlbum[];
  artists: SearchArtist[];
}

// ========== CONVERTER FUNCTIONS ==========
const toSongType = (apiSong: SearchSong) => ({
  id: apiSong.id.toString(),
  title: apiSong.title,
  artistId: apiSong.artist_id?.toString() || "unknown",
  artistName: apiSong.artist_name || "Unknown Artist",
  albumId: "",
  coverImage: apiSong.cover || "/default-cover.png",
  audioUrl: apiSong.audio_file,
  streamsCount: apiSong.streams_count || 0,
  likesCount: apiSong.likes_count || 0,
  isLiked: apiSong.is_liked || false,
  listenersCount: 0,
  lyrics: apiSong.lyrics || "",
});

const toAlbumType = (apiAlbum: SearchAlbum) => ({
  id: apiAlbum.id.toString(),
  title: apiAlbum.title,
  artistId: apiAlbum.artist_id?.toString() || "unknown",
  artistName: apiAlbum.artist_name || "Various Artists",
  coverImage: apiAlbum.cover?.startsWith("http")
    ? apiAlbum.cover
    : `http://127.0.0.1:8000${apiAlbum.cover}`,
  releaseDate: apiAlbum.release_date,
  songIds: [],
});

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  // Sorting state
  const [sortBy, setSortBy] = useState<"listeners" | "date">("listeners");

  // Results state
  const [results, setResults] = useState<SearchResponse>({
    songs: [],
    albums: [],
    artists: [],
  });
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Helper to get headers
  const getHeaders = (): HeadersInit => {
    const token = localStorage.getItem("access_token");
    return {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  // Build full URL for images
  const getFullUrl = (path?: string | null): string => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const normalizedPath = path.replace(/\\/g, "/");
    const prefix = normalizedPath.startsWith("/") ? "" : "/";
    return `http://127.0.0.1:8000${prefix}${normalizedPath}`;
  };

  // ---- Fetch search results ----
  const fetchResults = useCallback(
    async (searchQuery: string, sort: string) => {
      if (!searchQuery.trim()) {
        setResults({ songs: [], albums: [], artists: [] });
        setHasSearched(false);
        return;
      }

      setLoading(true);
      setHasSearched(true);

      try {
        const url = new URL("http://127.0.0.1:8000/music/search/");
        url.searchParams.append("q", searchQuery.trim());
        url.searchParams.append("sort", sort);
        url.searchParams.append("limit", "20");

        const res = await fetch(url.toString(), {
          headers: getHeaders(),
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("Failed to fetch search results");
        }

        const data: SearchResponse = await res.json();
        setResults(data);
      } catch (error) {
        console.error("Search error:", error);
        setResults({ songs: [], albums: [], artists: [] });
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // ---- Trigger search on query or sort change ----
  useEffect(() => {
    // Topbar handles debouncing and query params, so we just fetch here.
    const timer = setTimeout(() => {
      fetchResults(query, sortBy);
    }, 150);

    return () => clearTimeout(timer);
  }, [query, sortBy, fetchResults]);

  // ---- Helper to render artist/user card ----
  const renderArtistCard = (artist: SearchArtist) => {
    const imageUrl = getFullUrl(artist.profile_image);

    // 🌟 هدایت کاملاً دقیق: اگر آرتیست بود از artist_id استفاده کن، وگرنه از id یوزر
    const profileRoute =
      artist.role === "artist" && artist.artist_id
        ? `/artists/${artist.artist_id}`
        : `/users/${artist.id}`;

    return (
      <Link
        key={artist.id}
        href={profileRoute} // 👈 مسیر جدید و هوشمند
        className="bg-white dark:bg-gray-800/60 rounded-xl overflow-hidden shadow-xs border border-gray-100 dark:border-gray-700 hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-all group flex flex-col items-center p-6 text-center"
      >
        <div className="relative w-32 h-32 rounded-full overflow-hidden shadow-lg border-4 border-white dark:border-gray-700 bg-linear-to-tr from-green-400 to-blue-500 mb-4 shrink-0">
          {imageUrl && !imageUrl.includes("base_profile") ? (
            <Image
              src={imageUrl}
              alt={artist.stage_name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-5xl font-black text-white opacity-80 shadow-sm">
                {artist.stage_name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          {artist.is_verified && (
            <div className="absolute bottom-1 right-1 bg-blue-500 rounded-full p-1 shadow-lg border-2 border-white dark:border-gray-800">
              <svg
                className="w-4 h-4 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
          )}
        </div>

        <h3 className="font-bold text-gray-900 dark:text-white truncate w-full text-lg">
          {artist.stage_name}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1 uppercase tracking-widest">
          {artist.role} {/* 👈 نمایش دقیق نقش در روی کارت */}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
          {artist.followers_count.toLocaleString()} followers
        </p>
      </Link>
    );
  };

  // ---- Render ----
  const hasResults =
    results.songs.length > 0 ||
    results.albums.length > 0 ||
    results.artists.length > 0;

  return (
    <div className="flex flex-col gap-8 pb-10 transition-colors min-h-full max-w-7xl mx-auto w-full px-4">
      {/* Header and Sorting (Only show sort if there's a query) */}
      {query.trim() && (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Search results for &quot;
            <span className="text-green-600">{query}</span>&quot;
          </h1>

          <div className="flex items-center gap-3 shrink-0">
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
              ></path>
            </svg>
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "listeners" | "date")
              }
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:text-white text-sm font-bold cursor-pointer transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <option value="listeners">Top Listeners / Popularity</option>
              <option value="date">Release Date / Newest</option>
            </select>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center py-32">
          <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-green-500 opacity-80"></div>
        </div>
      )}

      {/* No query – initial state */}
      {!loading && !query.trim() && !hasSearched && (
        <div className="flex flex-col items-center justify-center flex-1 py-32 text-center animate-fade-in">
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-6">
            <svg
              className="w-16 h-16 text-gray-400 dark:text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-3">
            What do you want to listen to?
          </h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Search for your favorite songs, albums, and users.
          </p>
        </div>
      )}

      {/* No results */}
      {!loading && query.trim() && !hasResults && hasSearched && (
        <div className="flex flex-col items-center justify-center flex-1 py-32 text-center animate-fade-in">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            No results found for &quot;{query}&quot;
          </h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Please make sure your words are spelled correctly or use less or
            different keywords.
          </p>
        </div>
      )}

      {/* Results */}
      {!loading && hasResults && (
        <div className="flex flex-col gap-12 animate-fade-in">
          {/* Artists / Users */}
          {results.artists.length > 0 && (
            <section>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">
                Users & Artists
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {results.artists.map(renderArtistCard)}
              </div>
            </section>
          )}

          {/* Songs */}
          {results.songs.length > 0 && (
            <section>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">
                Songs
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-2">
                {results.songs.map((song) => {
                  const songData = toSongType(song);
                  return (
                    <div
                      key={song.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-colors pr-2"
                    >
                      <SongCard
                        song={songData}
                        artistName={song.artist_name}
                        contextSongs={results.songs.map(toSongType)}
                      />
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Albums */}
          {results.albums.length > 0 && (
            <section>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">
                Albums
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {results.albums.map((album) => (
                  <AlbumCard
                    key={album.id}
                    album={toAlbumType(album)}
                    artistName={album.artist_name}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
