// src/app/(main)/rooms/[id]/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import { API_BASE_URL } from "@/config/api"

type Member = {
  id: number;
  username: string;
  display_name: string;
  profile_image: string | null;
};

type RoomStatus = {
  id: string;
  members: Member[];
  members_count: number;
  current_song: string | null;
  current_song_url: string | null;
  current_song_title: string;
  current_position: number;
  is_playing: boolean;
  created_at: string;
  updated_at: string;
};

export default function RoomPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [roomStatus, setRoomStatus] = useState<RoomStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);

  const audioRef = useRef<HTMLAudioElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const isUpdatingFromServer = useRef(false);

  const getHeaders = (): HeadersInit => {
    const token = localStorage.getItem("access_token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const connectWebSocket = (token: string) => {
    const wsUrl = `ws://127.0.0.1:8000/ws/rooms/${id}/?token=${token}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "state_update") {
          const newState = data.data;
          setRoomStatus(newState);
          setMembers(newState.members);

          if (audioRef.current) {
            isUpdatingFromServer.current = true;
            if (newState.current_song_url) {
                const audioUrl = newState.current_song_url.startsWith("http")
                    ? newState.current_song_url
                    : `${API_BASE_URL}${newState.current_song_url}`;

                if (audioRef.current.src !== audioUrl) {
                    audioRef.current.src = audioUrl;
                }
            }
            audioRef.current.currentTime = newState.current_position;
            if (newState.is_playing) {
              audioRef.current.play().catch(() => {});
            } else {
              audioRef.current.pause();
            }
            setTimeout(() => {
              isUpdatingFromServer.current = false;
            }, 100);
          }
        } else if (data.type === "room_closed") {
          alert(data.data?.detail || "Room has been closed.");
          router.push("/rooms");
        }
      } catch (e) {
        console.error("WebSocket message error:", e);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return ws;
  };

  const sendAction = (action: string, payload?: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action, ...payload }));
    } else {
      console.warn("WebSocket not open, action not sent");
    }
  };

  // ---- Audio event handlers with flag check ----
  const handlePlay = () => {
    if (!roomStatus || isUpdatingFromServer.current) return;
    sendAction("play");
  };

  const handlePause = () => {
    if (!roomStatus || isUpdatingFromServer.current) return;
    sendAction("pause");
  };

  const handleSeek = (position: number) => {
    if (!roomStatus || isUpdatingFromServer.current) return;
    sendAction("seek", { position });
  };

  // ---- Upload ----
  const handleUpload = async (file: File, title?: string) => {
    const formData = new FormData();
    formData.append("audio_file", file);
    if (title) formData.append("title", title);

    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_BASE_URL}/rooms/rooms/${id}/upload/`, {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: formData,
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Upload failed");
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // ---- Leave ----
  const handleLeave = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/rooms/rooms/${id}/leave/`, {
        method: "POST",
        headers: getHeaders(),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Leave failed");
      }
      const data = await res.json();
      if (data.detail && data.detail.includes("deleted")) {
        alert(data.detail);
      }
      router.push("/rooms");
    } catch (err: any) {
      alert(err.message);
    }
  };

  // ---- Init ----
  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const initRoom = async () => {
      try {
        // 1. Join
        const joinRes = await fetch(`${API_BASE_URL}/rooms/rooms/${id}/join/`, {
          method: "POST",
          headers: getHeaders(),
        });
        if (!joinRes.ok) {
          const err = await joinRes.json().catch(() => ({}));
          throw new Error(err.detail || "Failed to join room");
        }

        // 2. Status
        const statusRes = await fetch(`${API_BASE_URL}/rooms/rooms/${id}/status/`, {
          headers: getHeaders(),
        });
        if (!statusRes.ok) {
          const err = await statusRes.json().catch(() => ({}));
          throw new Error(err.detail || "Failed to get room status");
        }
        const data: RoomStatus = await statusRes.json();
        setRoomStatus(data);
        setMembers(data.members);

        // 3. WebSocket
        const token = localStorage.getItem("access_token");
        if (token) {
          connectWebSocket(token);
        } else {
          throw new Error("No access token found");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initRoom();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [id, user, router]);

  // ---- Sync audio when roomStatus changes (initial) ----
  useEffect(() => {
    if (!audioRef.current || !roomStatus) return;
    if (roomStatus.current_song_url) {
        const audioUrl = roomStatus.current_song_url.startsWith("http")
            ? roomStatus.current_song_url
            : `${API_BASE_URL}${roomStatus.current_song_url}`;

        if (audioRef.current.src !== audioUrl) {
            audioRef.current.src = audioUrl;
        }

        isUpdatingFromServer.current = true;
        audioRef.current.currentTime = roomStatus.current_position;

        if (roomStatus.is_playing) {
            audioRef.current.play().catch((error) => {
            console.error("Audio play failed:", error);
            });
        } else {
            audioRef.current.pause();
        }

        setTimeout(() => {
            isUpdatingFromServer.current = false;
        }, 100);
    }
  }, [roomStatus]);

  // ---- Render ----
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="text-gray-500">Loading room...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!roomStatus) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="text-gray-500">Room not found</div>
      </div>
    );
  }

  const hasSong = !!roomStatus.current_song_url;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          🎵 Room
        </h1>
        <button
          onClick={handleLeave}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold transition-colors"
        >
          Leave Room
        </button>
      </div>

      {/* Members */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-bold text-gray-900 dark:text-white">Members</span>
          <span className="text-sm text-gray-500">({members.length})</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {members.map((member) => (
            <div key={member.id} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
              {member.profile_image ? (
                <Image
                  src={`${API_BASE_URL}${member.profile_image}`}
                  alt={member.display_name}
                  width={24}
                  height={24}
                  className="rounded-full"
                  unoptimized
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold">
                  {member.display_name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {member.display_name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Player */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {roomStatus.current_song_title || "No song playing"}
          </h2>
          {roomStatus.current_song_title && (
            <p className="text-sm text-gray-500">
              Progress: {Math.floor(roomStatus.current_position)}s
            </p>
          )}
        </div>

        <audio
          ref={audioRef}
          onPlay={handlePlay}
          onPause={handlePause}
          onSeeked={() => {
            if (!isUpdatingFromServer.current && audioRef.current) {
              handleSeek(audioRef.current.currentTime);
            }
          }}
          className="hidden"
        />

        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              if (roomStatus.is_playing) {
                handlePause();
              } else {
                handlePlay();
              }
            }}
            disabled={!hasSong}
            className="w-12 h-12 rounded-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white flex items-center justify-center text-xl transition-colors"
          >
            {roomStatus.is_playing ? "⏸" : "▶"}
          </button>

          <div className="flex-1 flex items-center gap-2">
            <span className="text-xs text-gray-500">
              {Math.floor(roomStatus.current_position)}s
            </span>
            <input
              type="range"
              min="0"
              max={hasSong ? 300 : 0}
              value={roomStatus.current_position}
              onChange={(e) => {
                const pos = parseFloat(e.target.value);
                if (audioRef.current) {
                  audioRef.current.currentTime = pos;
                  handleSeek(pos);
                }
              }}
              disabled={!hasSong}
              className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Upload */}
        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Upload new song
          </label>
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const title = prompt("Enter song title (optional):", file.name);
                handleUpload(file, title || undefined);
              }
              e.target.value = "";
            }}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 dark:file:bg-gray-700 dark:file:text-white"
          />
        </div>
      </div>
    </div>
  );
}