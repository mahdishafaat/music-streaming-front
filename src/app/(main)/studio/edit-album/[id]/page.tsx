// src/app/(main)/studio/edit-album/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

type AlbumDetail = {
  id: number;
  title: string;
  cover: string | null;
  release_date: string;
};

export default function EditAlbumPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const albumId = params.id as string;

  const [albumData, setAlbumData] = useState<AlbumDetail | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    if (user && user.role !== "ARTIST") {
      router.push("/");
    }
  }, [user, router]);

  useEffect(() => {
    if (user?.role === "ARTIST" && albumId) {
      const fetchAlbumDetail = async () => {
        setIsFetching(true);
        try {
          const token = localStorage.getItem("access_token");
          const res = await fetch(
            `http://127.0.0.1:8000/music/albums/${albumId}/edit/`,
            {
              method: "GET",
              headers: { Authorization: `Bearer ${token}` },
            },
          );

          if (res.ok) {
            const data = await res.json();
            setAlbumData(data);
          } else {
            setMessage({
              text: "Album not found or you don't have permission.",
              type: "error",
            });
          }
        } catch (error) {
          console.error(error);
          setMessage({ text: "Failed to load album data.", type: "error" });
        } finally {
          setIsFetching(false);
        }
      };
      fetchAlbumDetail();
    }
  }, [albumId, user]);

  if (!user || user.role !== "ARTIST") return null;

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: "", type: "" });

    const form = e.currentTarget;
    const formData = new FormData(form);

    const coverFile = formData.get("cover") as File;
    if (coverFile && coverFile.size === 0) {
      formData.delete("cover");
    }

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `http://127.0.0.1:8000/music/albums/${albumId}/edit/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      if (response.ok) {
        setMessage({ text: "Album updated successfully!", type: "success" });
        setTimeout(() => {
          router.push("/studio");
        }, 1500);
      } else {
        setMessage({
          text: "Failed to update album. Check your inputs.",
          type: "error",
        });
      }
    } catch (error) {
      console.error(error);
      setMessage({ text: "Network error occurred.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-green-500 opacity-80"></div>
      </div>
    );
  }

  if (!albumData && !isFetching) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Album Not Found
        </h2>
        <Link
          href="/studio"
          className="text-green-600 font-bold hover:underline"
        >
          Return to Studio
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-12 transition-colors">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.push("/studio")}
          className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-sm hover:bg-gray-50 border border-gray-100 dark:border-gray-700"
        >
          <svg
            className="w-6 h-6 text-gray-700 dark:text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </button>
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-1">
            Edit Album
          </h1>
          <p className="text-gray-500">
            Update details for &quot;{albumData?.title}&quot;
          </p>
        </div>
      </div>

      {message.text && (
        <div
          className={`mb-6 p-4 rounded-xl text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"}`}
        >
          {message.text}
        </div>
      )}

      <form
        onSubmit={handleEditSubmit}
        className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col gap-5 animate-fade-in"
      >
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
            Album Title
          </label>
          <input
            type="text"
            name="title"
            defaultValue={albumData?.title}
            required
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 outline-none dark:text-white"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
            Release Date
          </label>
          <input
            type="date"
            name="release_date"
            defaultValue={albumData?.release_date}
            required
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 outline-none dark:text-gray-300"
          />
        </div>

        <div className="flex flex-col gap-2 mt-2">
          <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
            Replace Cover Image (Optional)
          </label>
          <input
            type="file"
            name="cover"
            accept="image/*"
            className="w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100 cursor-pointer"
          />
          <p className="text-xs text-gray-500">
            Leave empty to keep the current cover.
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-50"
        >
          {isLoading ? "Saving Changes..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
