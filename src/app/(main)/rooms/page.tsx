// src/app/(main)/rooms/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function RoomsPage() {
  const { user } = useAuth();
  const router = useRouter();

  // State for create
  const [creating, setCreating] = useState(false);
  const [newRoomLink, setNewRoomLink] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  // State for join
  const [joinUuid, setJoinUuid] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  const getHeaders = () => {
    const token = localStorage.getItem("access_token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  // Create a new room
  const handleCreateRoom = async () => {
    setCreating(true);
    setCreateError(null);
    setNewRoomLink(null);
    try {
      const res = await fetch("http://127.0.0.1:8000/rooms/rooms/", {
        method: "POST",
        headers: getHeaders(),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.detail || "Failed to create room");
      }
      const data = await res.json();
      // data.invite_link is the full URL to the room
      setNewRoomLink(data.invite_link);
    } catch (err: any) {
      setCreateError(err.message || "Network error");
    } finally {
      setCreating(false);
    }
  };

  // Join an existing room by UUID
  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinUuid.trim()) return;

    setJoining(true);
    setJoinError(null);
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/rooms/rooms/${joinUuid.trim()}/join/`,
        {
          method: "POST",
          headers: getHeaders(),
        }
      );
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.detail || "Failed to join room");
      }
      // Success – redirect to the room page
      router.push(`/rooms/${joinUuid.trim()}`);
    } catch (err: any) {
      setJoinError(err.message || "Network error");
    } finally {
      setJoining(false);
    }
  };

  // If user not logged in, show a message (optional)
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Please log in to access rooms
        </h2>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        🎧 Rooms – Group Listening
      </h1>

      {/* Create Room Section */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Create a New Room
        </h2>
        <button
          onClick={handleCreateRoom}
          disabled={creating}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold rounded-xl transition-colors shadow-md"
        >
          {creating ? "Creating..." : "Create Room"}
        </button>

        {createError && (
          <div className="mt-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-xl text-sm">
            {createError}
          </div>
        )}

        {newRoomLink && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your room is ready! Share this link to invite others:
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                readOnly
                value={newRoomLink}
                className="flex-1 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(newRoomLink);
                  alert("Link copied to clipboard!");
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-colors"
              >
                Copy Link
              </button>
              <button
                onClick={() => {
                  // Extract UUID from link and redirect
                  const uuidMatch = newRoomLink.match(/\/([0-9a-f-]+)\/?$/);
                  if (uuidMatch) {
                    router.push(`/rooms/${uuidMatch[1]}`);
                  }
                }}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold transition-colors"
              >
                Go to Room
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Join Room Section */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Join an Existing Room
        </h2>
        <form onSubmit={handleJoinRoom} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Enter room ID (UUID)"
            value={joinUuid}
            onChange={(e) => setJoinUuid(e.target.value)}
            className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-gray-900 dark:text-white"
          />
          <button
            type="submit"
            disabled={joining || !joinUuid.trim()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition-colors"
          >
            {joining ? "Joining..." : "Join Room"}
          </button>
        </form>
        {joinError && (
          <div className="mt-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-xl text-sm">
            {joinError}
          </div>
        )}
        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          You can also paste the full invite link; we&apos;ll extract the ID.
        </p>
      </div>
    </div>
  );
}