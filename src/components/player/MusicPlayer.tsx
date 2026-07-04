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

  // استیت جدید برای کنترل باز و بسته بودن پاپ‌آپ صف پخش
  const [showQueue, setShowQueue] = useState(false);

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
    <div className="fixed bottom-0 left-0 right-0 h-24 bg-white border-t border-gray-200 px-6 flex items-center justify-between z-50 shadow-lg">
      {/* پنل شناور صف پخش */}
      {showQueue && (
        <div className="absolute bottom-[100px] right-6 w-80 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border border-gray-100 overflow-hidden flex flex-col max-h-[400px] z-50">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-900">Play Queue</h3>
            <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
              {queue.length} tracks
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
            {queue.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">
                Queue is empty
              </div>
            ) : (
              queue.map((song, index) => {
                const isPlayingThis = currentSong.id === song.id;
                return (
                  <div
                    key={`${song.id}-${index}`}
                    onClick={() => playSong(song)} // با کلیک روی آهنگ، مستقیماً پخش می‌شود
                    className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-colors ${isPlayingThis ? "bg-green-50" : "hover:bg-gray-50"}`}
                  >
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
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
                        className={`text-sm font-semibold truncate ${isPlayingThis ? "text-green-700" : "text-gray-900"}`}
                      >
                        {song.title}
                      </span>
                      <span className="text-xs text-gray-500 truncate">
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

      {/* بخش اول: کاور، نام و آمار */}
      <div className="flex items-center gap-4 w-1/4 min-w-[250px]">
        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
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
            href={currentSong.albumId ? `/albums/${currentSong.albumId}` : "#"}
            className="font-bold text-gray-900 hover:text-green-600 truncate transition-colors"
          >
            {currentSong.title}
          </Link>
          <span className="text-xs text-gray-500 truncate mb-0.5">
            <Link
              href={`/artist/${currentSong.artistId}`}
              className="hover:underline"
            >
              {currentSong.artistId}
            </Link>
          </span>
          {user?.subscription === "GOLD" && (
            <span className="text-[10px] font-medium text-amber-600 truncate bg-amber-50 inline-block px-1.5 py-0.5 rounded-md mt-1 w-max">
              {(currentSong.streamsCount / 1000000).toFixed(1)}M Streams
            </span>
          )}
        </div>
      </div>

      {/* بخش دوم: کنترل‌ها و نوار پیشرفت */}
      <div className="flex flex-col items-center justify-center gap-2 w-2/4 max-w-[600px]">
        <div className="flex items-center gap-6">
          <button
            onClick={toggleShuffle}
            className={`transition-colors ${isShuffle ? "text-green-600" : "text-gray-400 hover:text-gray-600"}`}
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
            className="text-gray-600 hover:text-green-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </button>
          <button
            onClick={togglePlay}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-green-100 text-green-700 hover:bg-green-600 hover:text-white transition-all shadow-sm"
          >
            {isPlaying ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
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
            className="text-gray-600 hover:text-green-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
          </button>
          <button
            onClick={cycleRepeat}
            className={`transition-colors flex items-center justify-center relative ${repeatMode !== "OFF" ? "text-green-600" : "text-gray-400 hover:text-gray-600"}`}
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
              <span className="absolute -top-1.5 -right-1.5 text-[9px] font-bold bg-green-100 rounded-full w-3.5 h-3.5 flex items-center justify-center">
                1
              </span>
            )}
          </button>
        </div>
        <div className="w-full flex items-center gap-2">
          <div
            className="h-2 w-full bg-gray-200 rounded-full overflow-hidden cursor-pointer relative"
            onClick={handleSeek}
          >
            <div
              className="absolute top-0 left-0 h-full bg-green-500 rounded-full transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* بخش سوم: آیکون صف، متن آهنگ و ولوم */}
      <div className="flex items-center justify-end gap-4 w-1/4 min-w-[200px]">
        {/* دکمه متن آهنگ (Lyrics) - برای مرحله بعد */}
        <button
          className="text-gray-400 hover:text-green-600 transition-colors"
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

        {/* دکمه صف پخش (Queue) متصل به استیت showQueue */}
        <button
          onClick={() => setShowQueue(!showQueue)}
          className={`transition-colors ${showQueue ? "text-green-600" : "text-gray-400 hover:text-green-600"}`}
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

        <div className="w-px h-6 bg-gray-200 mx-1"></div>

        <button
          onClick={() => setIsMuted(!isMuted)}
          className="text-gray-400 hover:text-green-600 transition-colors"
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
          className="w-20 h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-green-600 focus:outline-none"
        />
      </div>

      <audio
        ref={audioRef}
        src={currentSong.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={playNext}
        loop={repeatMode === "ONE"}
      />
    </div>
  );
}
