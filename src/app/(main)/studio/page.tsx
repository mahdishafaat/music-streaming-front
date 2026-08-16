// src/app/(main)/studio/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { API_BASE_URL } from "@/config/api";

type ArtistAlbum = { id: number; title: string; cover?: string };
type PublishedMusic = {
  id: number;
  title: string;
  coverImage?: string;
  cover?: string;
  streams_count?: number;
  listeners_count?: number;
};

export default function StudioPage() {
  const { user } = useAuth();
  const router = useRouter();

  // 🌟 تب جدید manage اضافه شد
  const [activeTab, setActiveTab] = useState<"music" | "album" | "manage">(
    "music",
  );
  const [albums, setAlbums] = useState<ArtistAlbum[]>([]);
  const [myMusics, setMyMusics] = useState<PublishedMusic[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    if (user && user.role !== "ARTIST") {
      router.push("/");
    }
  }, [user, router]);

  // دریافت آلبوم‌های هنرمند برای دراپ‌داون فرم موزیک
  useEffect(() => {
    if (user?.role === "ARTIST") {
      const fetchMyAlbums = async () => {
        try {
          const token = localStorage.getItem("access_token");
          const res = await fetch("http://127.0.0.1:8000/music/my-albums/", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            setAlbums(data || []);
          }
        } catch (error) {
          console.error("Failed to fetch artist albums", error);
        }
      };
      fetchMyAlbums();
    }
  }, [user]);

  // 🌟 دریافت لیست آهنگ‌های هنرمند برای تب مدیریت آثار
  const fetchMyMusics = async () => {
    try {
      const token = localStorage.getItem("access_token");
      // فرض بر این است که یک اندپوینت برای آثار خود هنرمند در بک‌اند داریم
      // اگر نداریم باید در music/views.py ساخته شود
      const res = await fetch("http://127.0.0.1:8000/music/my-musics/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMyMusics(data.results || data || []);
      }
    } catch (error) {
      console.error("Failed to fetch artist musics", error);
    }
  };

  useEffect(() => {
    if (activeTab === "manage" && user?.role === "ARTIST") {
      fetchMyMusics();
    }
  }, [activeTab, user]);

  if (!user || user.role !== "ARTIST") return null;

  // ------------ Handlers ------------

  const handleAlbumSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: "", type: "" });

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_BASE_URL}/music/albums/create/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        setMessage({ text: "Album created successfully!", type: "success" });
        form.reset();
        // رفرش لیست آلبوم‌ها
        const res = await fetch("http://127.0.0.1:8000/music/my-albums/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setAlbums(await res.json());
      } else {
        setMessage({
          text: "Failed to create album. Check your inputs.",
          type: "error",
        });
      }
    } catch (error) {
      setMessage({ text: "Network error occurred.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMusicSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: "", type: "" });

    const form = e.currentTarget;
    const formData = new FormData(form);

    const durationInput = formData.get("duration") as string;
    if (durationInput && durationInput.length === 5) {
      formData.set("duration", `00:${durationInput}`);
    }

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_BASE_URL}/music/musics/create/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        setMessage({ text: "Music uploaded successfully!", type: "success" });
        form.reset();
      } else {
        setMessage({
          text: "Failed to upload music. Check your inputs.",
          type: "error",
        });
      }
    } catch (error) {
      setMessage({ text: "Network error occurred.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  // 🌟 فانکشن حذف موزیک
  const handleDeleteMusic = async (id: number) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this track? This action cannot be undone.",
      )
    )
      return;

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `http://127.0.0.1:8000/music/musics/${id}/delete/`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        setMessage({ text: "Track deleted successfully.", type: "success" });
        setMyMusics(myMusics.filter((m) => m.id !== id));
      } else {
        setMessage({ text: "Failed to delete track.", type: "error" });
      }
    } catch (error) {
      setMessage({ text: "Network error during deletion.", type: "error" });
    }
  };
  // 🌟 تابع حذف آلبوم
  const handleDeleteAlbum = async (id: number) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this album? Warning: This might affect the tracks inside it!",
      )
    )
      return;

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `http://127.0.0.1:8000/music/albums/${id}/delete/`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        setMessage({ text: "Album deleted successfully.", type: "success" });
        setAlbums(albums.filter((a) => a.id !== id));
      } else {
        setMessage({ text: "Failed to delete album.", type: "error" });
      }
    } catch (error) {
      setMessage({ text: "Network error during deletion.", type: "error" });
    }
  };

  // ------------ Render ------------

  return (
    <div className="max-w-5xl mx-auto pb-12 transition-colors">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
          Artist Studio
        </h1>
        <p className="text-gray-500">
          Upload new tracks, create albums, and manage your published works.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 mb-8 border-b border-gray-200 dark:border-gray-700 pb-px overflow-x-auto [&::-webkit-scrollbar]:hidden">
        <button
          onClick={() => {
            setActiveTab("music");
            setMessage({ text: "", type: "" });
          }}
          className={`pb-3 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${
            activeTab === "music"
              ? "border-green-500 text-green-600 dark:text-green-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          Upload New Track
        </button>
        <button
          onClick={() => {
            setActiveTab("album");
            setMessage({ text: "", type: "" });
          }}
          className={`pb-3 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${
            activeTab === "album"
              ? "border-green-500 text-green-600 dark:text-green-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          Create New Album
        </button>
        {/* 🌟 تب جدید مدیریت آثار */}
        <button
          onClick={() => {
            setActiveTab("manage");
            setMessage({ text: "", type: "" });
          }}
          className={`pb-3 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${
            activeTab === "manage"
              ? "border-green-500 text-green-600 dark:text-green-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          Manage Published Works
        </button>
      </div>

      {message.text && (
        <div
          className={`mb-6 p-4 rounded-xl text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"}`}
        >
          {message.text}
        </div>
      )}

      {/* ---------------- MUSIC UPLOAD FORM ---------------- */}
      {activeTab === "music" && (
        <form
          onSubmit={handleMusicSubmit}
          className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col gap-5 animate-fade-in"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                Track Title
              </label>
              <input
                type="text"
                name="title"
                required
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 outline-none dark:text-white"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                Select Album (Optional)
              </label>
              <select
                name="album"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 outline-none dark:text-white"
              >
                <option value="">-- Single Release (No Album) --</option>
                {albums.map((al) => (
                  <option key={al.id} value={al.id}>
                    {al.title}
                  </option>
                ))}
              </select>
            </div>

            {/* 🌟 فیلد جدید: هنرمندان همکار */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                Collaborating Artists (Optional)
              </label>
              <input
                type="text"
                name="collaborators"
                placeholder="e.g. The Weeknd, Ariana Grande (comma separated)"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 outline-none dark:text-white"
              />
              <p className="text-xs text-gray-500">
                Separated by commas. These artists will appear alongside your
                name.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                Genre
              </label>
              <input
                type="text"
                name="genre"
                placeholder="e.g. Pop, Hip-Hop"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 outline-none dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Release Date
                </label>
                <input
                  type="date"
                  name="release_date"
                  required
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 outline-none dark:text-gray-300"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Duration
                </label>
                <input
                  type="text"
                  name="duration"
                  required
                  placeholder="03:45"
                  pattern="[0-5][0-9]:[0-5][0-9]"
                  title="Format: MM:SS"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 outline-none dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                Audio File (.mp3, .wav)
              </label>
              <input
                type="file"
                name="audio_file"
                accept="audio/*"
                required
                className="w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                Track Cover Image (Optional)
              </label>
              <input
                type="file"
                name="cover"
                accept="image/*"
                className="w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-2">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
              Lyrics (Optional)
            </label>
            <textarea
              name="lyrics"
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 outline-none dark:text-white resize-none"
              placeholder="Paste track lyrics here..."
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-50"
          >
            {isLoading ? "Uploading Track..." : "Publish Track"}
          </button>
        </form>
      )}

      {/* ---------------- ALBUM CREATION FORM ---------------- */}
      {activeTab === "album" && (
        <form
          onSubmit={handleAlbumSubmit}
          className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col gap-5 animate-fade-in"
        >
          {/* کدهای فرم آلبوم بدون تغییر نسبت به قبل */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
              Album Title
            </label>
            <input
              type="text"
              name="title"
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
              required
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 outline-none dark:text-gray-300"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
              Album Cover (Optional)
            </label>
            <input
              type="file"
              name="cover"
              accept="image/*"
              className="w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-50"
          >
            {isLoading ? "Creating Album..." : "Create Album"}
          </button>
        </form>
      )}

      {/* ---------------- 🌟 MANAGE WORKS TAB (ویرایش و حذف) ---------------- */}
      {activeTab === "manage" && (
        <div className="animate-fade-in flex flex-col gap-10">
          {/* بخش مدیریت آهنگ‌ها */}
          <div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4">
              Published Tracks
            </h2>
            {myMusics.length === 0 ? (
              <div className="bg-gray-50 dark:bg-gray-800/50 p-8 rounded-2xl text-center border border-gray-200 dark:border-gray-700">
                <p className="text-gray-500 font-medium">
                  No tracks published yet.
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <th className="p-4 pl-6">Track</th>
                      <th className="p-4 text-center hidden md:table-cell">
                        Streams
                      </th>
                      <th className="p-4 text-center hidden sm:table-cell">
                        Revenue
                      </th>
                      <th className="p-4 text-right pr-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                    {myMusics.map((music) => {
                      const cover =
                        music.coverImage || music.cover || "/default-cover.png";
                      const streams = music.streams_count || 0;
                      const revenue = (streams * 0.003).toFixed(2);

                      return (
                        <tr
                          key={`music-${music.id}`}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                        >
                          <td className="p-4 pl-6 flex items-center gap-4">
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-200 shrink-0">
                              <Image
                                src={cover}
                                alt={music.title}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 dark:text-white truncate max-w-[150px] md:max-w-xs">
                                {music.title}
                              </p>
                            </div>
                          </td>
                          <td className="p-4 text-center hidden md:table-cell font-bold text-gray-700 dark:text-gray-300">
                            {streams.toLocaleString()}
                          </td>
                          <td className="p-4 text-center hidden sm:table-cell font-bold text-green-600 dark:text-green-400">
                            ${revenue}
                          </td>
                          <td className="p-4 text-right pr-6">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() =>
                                  router.push(`/studio/edit/${music.id}`)
                                }
                                className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 rounded-lg transition-colors"
                                title="Edit Track"
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
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteMusic(music.id)}
                                className="p-2 text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 rounded-lg transition-colors"
                                title="Delete Track"
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
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* بخش مدیریت آلبوم‌ها */}
          <div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4">
              Published Albums
            </h2>
            {albums.length === 0 ? (
              <div className="bg-gray-50 dark:bg-gray-800/50 p-8 rounded-2xl text-center border border-gray-200 dark:border-gray-700">
                <p className="text-gray-500 font-medium">
                  No albums created yet.
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <th className="p-4 pl-6">Album</th>
                      <th className="p-4 text-right pr-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                    {albums.map((album) => {
                      // 🌟 دریافت عکس آلبوم
                      const cover = album.cover || "/default-cover.png";

                      return (
                        <tr
                          key={`album-${album.id}`}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                        >
                          <td className="p-4 pl-6 flex items-center gap-4">
                            {/* 🌟 نمایش عکس واقعی به جای آیکون */}
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-200 shrink-0">
                              <Image
                                src={cover}
                                alt={album.title}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 dark:text-white truncate max-w-[200px] md:max-w-xs">
                                {album.title}
                              </p>
                            </div>
                          </td>
                          <td className="p-4 text-right pr-6">
                            <div className="flex items-center justify-end gap-2">
                              {/* 🌟 دکمه جدید برای ویرایش آلبوم */}
                              <button
                                onClick={() =>
                                  router.push(`/studio/edit-album/${album.id}`)
                                }
                                className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 rounded-lg transition-colors"
                                title="Edit Album"
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
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteAlbum(album.id)}
                                className="p-2 text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 rounded-lg transition-colors"
                                title="Delete Album"
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
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
