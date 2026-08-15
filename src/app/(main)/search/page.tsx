// src/app/(main)/search/page.tsx
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { usePlayer } from "@/context/PlayerContext";
import { useAuth } from "@/context/AuthContext";
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
// Convert API Song to the Song type expected by SongCard
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

// Convert API Album to the Album type expected by AlbumCard
const toAlbumType = (apiAlbum: SearchAlbum) => ({
  id: apiAlbum.id.toString(),
  title: apiAlbum.title,
  artistId: apiAlbum.artist_id?.toString() || "unknown",
  artistName: apiAlbum.artist_name || "Various Artists",
  coverImage: `http://127.0.0.1:8000/${apiAlbum.cover}` || "/default-album.png",
  releaseDate: apiAlbum.release_date,
  songIds: [],
});

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { playSong } = usePlayer();

  // Get query from URL
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);

  // Sorting
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
    return `http://127.0.0.1:8000${path}`;
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
        url.searchParams.append("limit", "20"); // you can adjust or make it configurable

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

  // ---- Debounce and trigger search ----
  useEffect(() => {
    const timer = setTimeout(() => {
      // Update URL with query (for shareability)
      if (query.trim()) {
        router.replace(`/search?q=${encodeURIComponent(query.trim())}`, {
          scroll: false,
        });
      } else {
        router.replace("/search", { scroll: false });
      }
      fetchResults(query, sortBy);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [query, sortBy, fetchResults, router]);

  // ---- Initial load from URL ----
  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      fetchResults(initialQuery, sortBy);
    }
  }, [initialQuery, sortBy, fetchResults]);

  // ---- Handle sort change ----
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as "listeners" | "date");
  };

  // ---- Helper to render artist card ----
  const renderArtistCard = (artist: SearchArtist) => {
    const imageUrl = getFullUrl(artist.profile_image);
    return (
      <Link
        key={artist.id}
        href={`/artists/${artist.id}`}
        className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all group"
      >
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-green-400 to-blue-500">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={artist.stage_name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-6xl font-black text-white opacity-70">
                {artist.stage_name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          {artist.is_verified && (
            <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1 shadow-lg">
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
        <div className="p-4">
          <h3 className="font-bold text-gray-900 dark:text-white truncate">
            {artist.stage_name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {artist.followers_count.toLocaleString()} followers
          </p>
          {artist.bio && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 line-clamp-2">
              {artist.bio}
            </p>
          )}
        </div>
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
      {/* Search bar + sort */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1 relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for songs, albums, artists..."
            className="w-full px-5 py-3.5 pl-12 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 dark:text-white transition-shadow shadow-sm"
          />
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <label
            htmlFor="sort"
            className="text-sm font-medium text-gray-600 dark:text-gray-300"
          >
            Sort by:
          </label>
          <select
            id="sort"
            value={sortBy}
            onChange={handleSortChange}
            className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:text-white text-sm font-medium cursor-pointer"
          >
            <option value="listeners">Listeners</option>
            <option value="date">Release Date</option>
          </select>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      )}

      {/* No query – initial state */}
      {!loading && !query.trim() && !hasSearched && (
        <div className="flex flex-col items-center justify-center flex-1 py-20 text-center">
          <svg
            className="w-20 h-20 text-gray-300 dark:text-gray-600 mb-4"
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Search for music
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Find your favorite songs, albums, and artists.
          </p>
        </div>
      )}

      {/* No results */}
      {!loading && query.trim() && !hasResults && hasSearched && (
        <div className="flex flex-col items-center justify-center flex-1 py-20 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            No results for &quot;{query}&quot;
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Try adjusting your search or check your spelling.
          </p>
        </div>
      )}

      {/* Results */}
      {!loading && hasResults && (
        <div className="flex flex-col gap-10">
          {/* Artists */}
          {results.artists.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Artists
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {results.artists.map(renderArtistCard)}
              </div>
            </section>
          )}

          {/* Songs */}
          {results.songs.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Songs
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.songs.map((song) => {
                  const songData = toSongType(song);
                  return (
                    <SongCard
                      key={song.id}
                      song={songData}
                      artistName={song.artist_name}
                      contextSongs={results.songs.map(toSongType)}
                    />
                  );
                })}
              </div>
            </section>
          )}

          {/* Albums */}
          {results.albums.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Albums
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
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
