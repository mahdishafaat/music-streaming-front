// src/app/(main)/studio/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

// تایپ برای دریافت آلبوم‌های خود هنرمند تا بتونه موزیک رو بهشون وصل کنه
type ArtistAlbum = { id: number; title: string };

export default function StudioPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"music" | "album">("music");
  const [albums, setAlbums] = useState<ArtistAlbum[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    // محدودیت دسترسی: فقط هنرمندان
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
          // تغییر مسیر به اندپوینت جدید
          const res = await fetch("http://127.0.0.1:8000/music/my-albums/", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            // حالا دیتا دقیقاً یک آرایه از آلبوم‌هاست
            setAlbums(data || []);
          }
        } catch (error) {
          console.error("Failed to fetch artist albums", error);
        }
      };
      fetchMyAlbums();
    }
  }, [user]);

  if (!user || user.role !== "ARTIST") return null;

  const handleAlbumSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: "", type: "" });

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        "http://127.0.0.1:8000/music/albums/create/",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            // نکته: وقتی FormData می‌فرستیم، نباید Content-Type رو دستی ست کنیم
          },
          body: formData,
        },
      );

      if (response.ok) {
        setMessage({ text: "Album created successfully!", type: "success" });
        form.reset();
      } else {
        setMessage({
          text: "Failed to create album. Check your inputs.",
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

  const handleMusicSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: "", type: "" });

    const form = e.currentTarget;
    const formData = new FormData(form);

    // تبدیل فرمت MM:SS به فرمت استاندارد 00:MM:SS برای جنگو
    const durationInput = formData.get("duration") as string;
    if (durationInput && durationInput.length === 5) {
      // e.g. "03:45"
      formData.set("duration", `00:${durationInput}`);
    }

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        "http://127.0.0.1:8000/music/musics/create/",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

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
      console.error(error);
      setMessage({ text: "Network error occurred.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12 transition-colors">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
          Artist Studio
        </h1>
        <p className="text-gray-500">
          Upload your new tracks and manage your albums.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-gray-200 dark:border-gray-700 pb-px">
        <button
          onClick={() => {
            setActiveTab("music");
            setMessage({ text: "", type: "" });
          }}
          className={`pb-3 font-bold text-sm transition-all border-b-2 ${
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
          className={`pb-3 font-bold text-sm transition-all border-b-2 ${
            activeTab === "album"
              ? "border-green-500 text-green-600 dark:text-green-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          Create New Album
        </button>
      </div>

      {message.text && (
        <div
          className={`mb-6 p-4 rounded-xl text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"}`}
        >
          {message.text}
        </div>
      )}

      {/* MUSIC UPLOAD FORM */}
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

      {/* ALBUM CREATION FORM */}
      {activeTab === "album" && (
        <form
          onSubmit={handleAlbumSubmit}
          className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col gap-5 animate-fade-in"
        >
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
    </div>
  );
}
