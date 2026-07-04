// src/components/player/MusicPlayer.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePlayer } from "@/context/PlayerContext";
import { useAuth } from "@/context/AuthContext";

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
  } = usePlayer();
  const { user } = useAuth();
  const audioRef = useRef<HTMLAudioElement>(null);

  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

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

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      if (duration) setProgress((current / duration) * 100);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current && audioRef.current.duration) {
      const rect = e.currentTarget.getBoundingClientRect();
      const percentage = (e.clientX - rect.left) / rect.width;
      audioRef.current.currentTime = percentage * audioRef.current.duration;
      setProgress(percentage * 100);
    }
  };

  if (!currentSong) return null;

  return (
    <>
      {/* ========================================= */}
      {/* 1. DESKTOP PLAYER */}
      {/* ========================================= */}
      <div className="hidden md:flex fixed bottom-0 left-0 right-0 h-24 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 items-center justify-between z-40 shadow-lg transition-colors">
        <div className="flex items-center gap-4 w-1/4 min-w-[250px]">
          <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0 border border-gray-100 dark:border-gray-700">
            <Image
              src={currentSong.coverImage || "/default-cover.png"}
              alt={currentSong.title}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="flex flex-col min-w-0">
            <Link
              href={
                currentSong.albumId ? `/albums/${currentSong.albumId}` : "#"
              }
              className="font-bold text-gray-900 dark:text-white hover:text-green-600 dark:hover:text-green-400 truncate transition-colors"
            >
              {currentSong.title}
            </Link>
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate mb-0.5">
              <Link
                href={`/artist/${currentSong.artistId}`}
                className="hover:underline"
              >
                {currentSong.artistId}
              </Link>
            </span>
            {user?.subscription === "GOLD" && (
              <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 truncate bg-amber-50 dark:bg-amber-900/30 inline-block px-1.5 py-0.5 rounded-md mt-1 w-max">
                {(currentSong.streamsCount / 1000000).toFixed(1)}M Streams
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-2 w-2/4 max-w-[600px]">
          <div className="flex items-center gap-6">
            <button
              onClick={toggleShuffle}
              className={`transition-colors ${isShuffle ? "text-green-600 dark:text-green-400" : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"}`}
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
                ></path>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 8L20 12L16 16"
                ></path>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 16L4 12L8 8"
                ></path>
              </svg>
            </button>
            <button
              onClick={playPrevious}
              className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
              </svg>
            </button>
            <button
              onClick={togglePlay}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 hover:bg-green-600 dark:hover:bg-green-600 hover:text-white transition-all shadow-sm"
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
              className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </button>
            <button
              onClick={cycleRepeat}
              className={`transition-colors flex items-center justify-center relative ${repeatMode !== "OFF" ? "text-green-600 dark:text-green-400" : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"}`}
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
                ></path>
              </svg>
              {repeatMode === "ONE" && (
                <span className="absolute -top-1.5 -right-1.5 text-[9px] font-bold bg-green-100 dark:bg-green-900/50 rounded-full w-3.5 h-3.5 flex items-center justify-center">
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
                className="absolute top-0 left-0 h-full bg-green-500 rounded-full transition-all duration-100 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 w-1/4 min-w-[200px]">
          <button
            onClick={() => setShowLyrics(true)}
            className={`transition-colors ${showLyrics ? "text-green-600 dark:text-green-400" : "text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400"}`}
            title="Lyrics"
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
              ></path>
            </svg>
          </button>
          <button
            onClick={() => setShowQueue(!showQueue)}
            className={`transition-colors ${showQueue ? "text-green-600 dark:text-green-400" : "text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400"}`}
            title="Queue"
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
              ></path>
            </svg>
          </button>
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1"></div>
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400 transition-colors"
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

      {/* ========================================= */}
      {/* 2. MOBILE MINI PLAYER */}
      {/* ========================================= */}
      {!isFullScreen && (
        <div
          onClick={() => setIsFullScreen(true)}
          className="md:hidden fixed bottom-[72px] left-2 right-2 h-16 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl px-4 flex items-center justify-between z-40 shadow-[0_8px_30px_rgb(0,0,0,0.12)] cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
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
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {currentSong.artistId}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
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
              className="h-full bg-green-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* 3. MOBILE FULL SCREEN PLAYER */}
      {/* ========================================= */}
      {isFullScreen && (
        <div className="md:hidden fixed inset-0 bg-white dark:bg-gray-900 z-[60] flex flex-col p-6 animate-in slide-in-from-bottom-full duration-300 transition-colors">
          <div className="flex justify-between items-center mb-8 pt-4">
            <button
              onClick={() => setIsFullScreen(false)}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-2"
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
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <span className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
              Now Playing
            </span>
            <button
              onClick={() => setShowQueue(!showQueue)}
              className={`p-2 ${showQueue ? "text-green-600 dark:text-green-400" : "text-gray-400 dark:text-gray-500"}`}
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
                  d="M4 6h16M4 12h16M4 18h7"
                />
              </svg>
            </button>
          </div>

          <div className="relative w-full aspect-square rounded-3xl overflow-hidden shadow-2xl dark:shadow-none mb-8 bg-gray-100 dark:bg-gray-800 mx-auto max-w-sm">
            <Image
              src={currentSong.coverImage || "/default-cover.png"}
              alt={currentSong.title}
              fill
              className="object-cover"
              unoptimized
            />
          </div>

          <div className="flex flex-col min-w-0 mb-6 mx-auto max-w-sm w-full text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white truncate mb-1">
              {currentSong.title}
            </h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 truncate">
              {currentSong.artistId}
            </p>
          </div>

          <div className="mb-8 mx-auto max-w-sm w-full">
            <div
              className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden cursor-pointer relative"
              onClick={handleSeek}
            >
              <div
                className="absolute top-0 left-0 h-full bg-green-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between mb-8 mx-auto max-w-sm w-full px-4">
            <button
              onClick={toggleShuffle}
              className={`p-2 ${isShuffle ? "text-green-600 dark:text-green-400" : "text-gray-400 dark:text-gray-500"}`}
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
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                ></path>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 8L20 12L16 16"
                ></path>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 16L4 12L8 8"
                ></path>
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
              className="w-20 h-20 flex items-center justify-center rounded-full bg-green-600 text-white shadow-lg shadow-green-200 dark:shadow-none"
            >
              {isPlaying ? (
                <svg
                  className="w-10 h-10"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg
                  className="w-10 h-10 ml-2"
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
              className={`p-2 relative ${repeatMode !== "OFF" ? "text-green-600 dark:text-green-400" : "text-gray-400 dark:text-gray-500"}`}
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
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                ></path>
              </svg>
              {repeatMode === "ONE" && (
                <span className="absolute -top-1 -right-1 text-[9px] font-bold bg-green-100 dark:bg-green-900/50 rounded-full w-4 h-4 flex items-center justify-center">
                  1
                </span>
              )}
            </button>
          </div>

          <div className="mt-auto flex justify-center pb-6">
            <button
              onClick={() => setShowLyrics(true)}
              className="flex flex-col items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                ></path>
              </svg>
              <span className="text-xs font-medium uppercase tracking-wider">
                Lyrics
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* 4. SHARED MODALS */}
      {/* ========================================= */}

      {showQueue && (
        <div className="fixed bottom-[90px] right-4 md:bottom-[100px] md:right-6 w-[calc(100vw-2rem)] md:w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] dark:shadow-none border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col max-h-[400px] z-[70] transition-colors">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
            <h3 className="font-bold text-gray-900 dark:text-white">
              Play Queue
            </h3>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">
              {queue.length} tracks
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
            {queue.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                Queue is empty
              </div>
            ) : (
              queue.map((song, index) => {
                const isPlayingThis = currentSong.id === song.id;
                return (
                  <div
                    key={`${song.id}-${index}`}
                    onClick={() => playSong(song)}
                    className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-colors ${isPlayingThis ? "bg-green-50 dark:bg-green-900/20" : "hover:bg-gray-50 dark:hover:bg-gray-700/50"}`}
                  >
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-700">
                      <Image
                        src={song.coverImage || "/default-cover.png"}
                        alt={song.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      {isPlayingThis && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          {isPlaying ? (
                            <svg
                              className="w-4 h-4 text-green-400"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                            </svg>
                          ) : (
                            <svg
                              className="w-4 h-4 text-green-400 ml-0.5"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span
                        className={`text-sm font-semibold truncate ${isPlayingThis ? "text-green-700 dark:text-green-400" : "text-gray-900 dark:text-gray-200"}`}
                      >
                        {song.title}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {song.artistId}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {showLyrics && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[80]">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg p-8 shadow-2xl flex flex-col max-h-[80vh] border border-gray-100 dark:border-gray-700 transition-colors">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Lyrics
              </h2>
              <button
                onClick={() => setShowLyrics(false)}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-xl"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto text-lg text-gray-700 dark:text-gray-300 leading-relaxed text-center whitespace-pre-line font-medium">
              {currentSong.lyrics || "No lyrics available for this track."}
            </div>
            <button
              onClick={() => setShowLyrics(false)}
              className="mt-8 w-full bg-green-600 text-white font-bold py-3 rounded-2xl hover:bg-green-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

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
