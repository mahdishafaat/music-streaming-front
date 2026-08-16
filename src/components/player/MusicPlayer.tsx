// src/components/player/MusicPlayer.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePlayer } from "@/context/PlayerContext";
import { useAuth } from "@/context/AuthContext";
import AddToPlaylistModal from "@/components/ui/AddToPlaylistModal";

export default function MusicPlayer() {
  const {
    currentSong,
    isPlaying,
    queue,
    togglePlay,
    playNext,
    playPrevious,
    isShuffle,
    toggleShuffle,
    repeatMode,
    cycleRepeat,
    playSong,
    volume,
    setVolume,
  } = usePlayer();
  const { user } = useAuth();
  const audioRef = useRef<HTMLAudioElement>(null);

  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (currentSong) {
      setIsLiked(currentSong.isLiked || false);
    }
  }, [currentSong]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current
          .play()
          .catch((e) => console.log("Audio play error:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSong]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (currentSong && isPlaying) {
      const recordStream = async () => {
        try {
          const token = localStorage.getItem("access_token");
          if (!token) return;
          await fetch(
            `http://127.0.0.1:8000/music/musics/${currentSong.id}/stream/`,
            {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
            },
          );
        } catch (error) {
          console.error("Failed to record stream", error);
        }
      };
      const timer = setTimeout(recordStream, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentSong, isPlaying]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      if (duration) setProgress((current / duration) * 100);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation(); // جلوگیری از بسته شدن پلیر فول اسکرین
    if (audioRef.current && audioRef.current.duration) {
      const rect = e.currentTarget.getBoundingClientRect();
      const percentage = (e.clientX - rect.left) / rect.width;
      audioRef.current.currentTime = percentage * audioRef.current.duration;
      setProgress(percentage * 100);
    }
  };

  const handleLikeToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("Please login to like tracks.");
      return;
    }

    setIsLiked(!isLiked);

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/music/musics/${currentSong?.id}/like/`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) {
        setIsLiked(isLiked);
        if (res.status === 401) alert("Session expired. Please login again.");
      }
    } catch (error) {
      setIsLiked(isLiked);
      console.error("Like update failed:", error);
    }
  };

  if (!currentSong) return null;

  const artistName = (currentSong as any).artistName || "Unknown Artist";

  return (
    <>
      {/* --- DESKTOP PLAYER --- */}
      <div className="hidden md:flex fixed bottom-0 left-0 right-0 h-24 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 items-center justify-between z-[90] shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:shadow-none transition-colors">
        <div className="flex items-center gap-4 w-1/4 min-w-[250px]">
          <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 shrink-0 border border-gray-100 dark:border-gray-700">
            <Image
              src={currentSong.coverImage || "/default-cover.png"}
              alt={currentSong.title}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="flex flex-col min-w-0 pr-2">
            <Link
              href={
                currentSong.albumId ? `/albums/${currentSong.albumId}` : "#"
              }
              className="font-black text-gray-900 dark:text-white hover:text-green-600 truncate text-sm"
            >
              {currentSong.title}
            </Link>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate mt-0.5">
              <Link
                href={`/artists/${currentSong.artistId}`}
                className="hover:underline hover:text-green-600"
              >
                {artistName}
              </Link>
            </span>
          </div>
          <button
            onClick={handleLikeToggle}
            className={`w-8 h-8 flex items-center justify-center rounded-full hover:scale-110 ${isLiked ? "text-red-500" : "text-gray-400 hover:text-red-500"}`}
          >
            <svg
              className="w-5 h-5"
              fill={isLiked ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={isLiked ? "0" : "2"}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </div>

        <div className="flex flex-col items-center justify-center gap-2 w-2/4 max-w-[600px]">
          <div className="flex items-center gap-6">
            <button
              onClick={toggleShuffle}
              className={`${isShuffle ? "text-green-600" : "text-gray-400 hover:text-gray-900"}`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 8L20 12L16 16"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 16L4 12L8 8"
                />
              </svg>
            </button>
            <button
              onClick={playPrevious}
              className="text-gray-600 dark:text-gray-400 hover:text-green-600"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
              </svg>
            </button>
            <button
              onClick={togglePlay}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 hover:bg-green-600 hover:text-white transition-all shadow-sm"
            >
              {isPlaying ? (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 ml-1"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
            <button
              onClick={playNext}
              className="text-gray-600 dark:text-gray-400 hover:text-green-600"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </button>
            <button
              onClick={cycleRepeat}
              className={`relative flex items-center justify-center ${repeatMode !== "OFF" ? "text-green-600" : "text-gray-400 hover:text-gray-900"}`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {repeatMode === "ONE" && (
                <span className="absolute -top-1.5 -right-1.5 text-[9px] font-bold bg-green-100 text-green-600 rounded-full w-3.5 h-3.5 flex items-center justify-center">
                  1
                </span>
              )}
            </button>
          </div>
          <div className="w-full flex items-center gap-2">
            <div
              className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden cursor-pointer relative"
              onClick={handleSeek}
            >
              <div
                className="absolute top-0 left-0 h-full bg-green-500 rounded-full pointer-events-none"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 w-1/4 min-w-[200px]">
          <button
            onClick={() => setShowLyrics(true)}
            className={`${showLyrics ? "text-green-600" : "text-gray-400 hover:text-green-600"}`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </button>
          <button
            onClick={() => setShowQueue(!showQueue)}
            className={`${showQueue ? "text-green-600" : "text-gray-400 hover:text-green-600"}`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h7"
              />
            </svg>
          </button>
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1"></div>
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="text-gray-400 hover:text-green-600"
          >
            {isMuted || volume === 0 ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
              </svg>
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setVolume(parseFloat(e.target.value));
              if (parseFloat(e.target.value) > 0 && isMuted) setIsMuted(false);
            }}
            className="w-20 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-green-600 focus:outline-none"
          />
        </div>
      </div>

      {/* --- MOBILE MINI PLAYER --- */}
      {!isFullScreen && (
        <div
          onClick={() => setIsFullScreen(true)}
          className="md:hidden fixed bottom-4 left-2 right-2 h-16 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl px-4 flex items-center justify-between z-[90] shadow-[0_8px_30px_rgb(0,0,0,0.12)] cursor-pointer"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-gray-100 shrink-0">
              <Image
                src={currentSong.coverImage || "/default-cover.png"}
                alt={currentSong.title}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-sm text-gray-900 dark:text-white truncate">
                {currentSong.title}
              </span>
              <span className="text-xs text-gray-500 truncate">
                {artistName}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleLikeToggle}
              className={`p-2 ${isLiked ? "text-red-500" : "text-gray-400"}`}
            >
              <svg
                className="w-5 h-5"
                fill={isLiked ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={isLiked ? "0" : "2"}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              className="w-10 h-10 flex items-center justify-center text-gray-900 dark:text-white"
            >
              {isPlaying ? (
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
          </div>
          <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 pointer-events-none"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* --- MOBILE FULL SCREEN PLAYER --- */}
      {isFullScreen && (
        <div className="md:hidden fixed inset-0 bg-white dark:bg-gray-900 z-[100] flex flex-col p-6 overflow-y-auto animate-fade-in pb-10">
          <div className="flex justify-between items-center mb-8 shrink-0 pt-2">
            <button
              onClick={() => setIsFullScreen(false)}
              className="text-gray-500 p-2"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <span className="text-xs font-bold tracking-widest uppercase text-gray-500">
              Now Playing
            </span>
            <button
              onClick={() => setShowQueue(true)}
              className="text-gray-500 p-2"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h7"
                />
              </svg>
            </button>
          </div>

          <div className="relative w-full aspect-square max-w-[350px] mx-auto rounded-3xl overflow-hidden shadow-2xl mb-8 bg-gray-100 shrink-0">
            <Image
              src={currentSong.coverImage || "/default-cover.png"}
              alt={currentSong.title}
              fill
              className="object-cover"
              unoptimized
            />
          </div>

          <div className="flex justify-between items-center mb-8">
            <div className="flex flex-col min-w-0 pr-4">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white truncate">
                {currentSong.title}
              </h2>
              <span className="text-lg text-gray-500 truncate mt-1">
                {artistName}
              </span>
            </div>
            <button
              onClick={handleLikeToggle}
              className={`p-2 transition-all hover:scale-110 ${isLiked ? "text-red-500" : "text-gray-400"}`}
            >
              <svg
                className="w-8 h-8"
                fill={isLiked ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={isLiked ? "0" : "1.5"}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>
          </div>

          <div className="w-full flex items-center gap-2 mb-8">
            <div
              className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden cursor-pointer relative"
              onClick={handleSeek}
            >
              <div
                className="absolute top-0 left-0 h-full bg-green-500 rounded-full pointer-events-none"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between mb-8 px-2">
            <button
              onClick={toggleShuffle}
              className={`p-2 ${isShuffle ? "text-green-600" : "text-gray-400"}`}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 8L20 12L16 16"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 16L4 12L8 8"
                />
              </svg>
            </button>
            <button
              onClick={playPrevious}
              className="text-gray-900 dark:text-white p-2"
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
              </svg>
            </button>
            <button
              onClick={togglePlay}
              className="w-20 h-20 flex items-center justify-center rounded-full bg-green-500 text-white shadow-lg hover:scale-105"
            >
              {isPlaying ? (
                <svg
                  className="w-8 h-8"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg
                  className="w-8 h-8 ml-2"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
            <button
              onClick={playNext}
              className="text-gray-900 dark:text-white p-2"
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </button>
            <button
              onClick={cycleRepeat}
              className={`p-2 relative ${repeatMode !== "OFF" ? "text-green-600" : "text-gray-400"}`}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {repeatMode === "ONE" && (
                <span className="absolute top-0 right-0 text-[10px] font-bold bg-green-100 text-green-600 rounded-full w-4 h-4 flex items-center justify-center">
                  1
                </span>
              )}
            </button>
          </div>

          <div className="flex justify-between items-center mt-auto px-4">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="text-gray-500 flex items-center gap-2 font-bold text-sm"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Playlist
            </button>
            <button
              onClick={() => setShowLyrics(true)}
              className="text-gray-500 flex items-center gap-2 font-bold text-sm"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Lyrics
            </button>
          </div>
        </div>
      )}

      {/* --- MODALS --- */}
      {showQueue && (
        <div className="fixed bottom-[90px] right-4 md:bottom-[100px] md:right-6 w-[calc(100vw-2rem)] md:w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col max-h-[400px] z-[110]">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <h3 className="font-bold text-gray-900 dark:text-white">
              Play Queue
            </h3>
            <button
              onClick={() => setShowQueue(false)}
              className="md:hidden text-gray-500"
            >
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {queue.map((song, index) => (
              <div
                key={`${song.id}-${index}`}
                onClick={() => playSong(song)}
                className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer ${currentSong.id === song.id ? "bg-green-50" : "hover:bg-gray-50"}`}
              >
                <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0">
                  <Image
                    src={song.coverImage || "/default-cover.png"}
                    alt={song.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <span
                  className={`text-sm font-bold truncate ${currentSong.id === song.id ? "text-green-700" : "text-gray-900"}`}
                >
                  {song.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showLyrics && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[120]">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg p-8 flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black">Lyrics</h2>
              <button onClick={() => setShowLyrics(false)} className="text-xl">
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto text-lg text-center whitespace-pre-line font-medium">
              {currentSong.lyrics || "No lyrics available for this track."}
            </div>
          </div>
        </div>
      )}

      <AddToPlaylistModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        song={currentSong}
      />
      <audio
        ref={audioRef}
        src={currentSong.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={playNext}
        loop={repeatMode === "ONE"}
      />
    </>
  );
}
