// src/app/(main)/studio/edit/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

// همون تایپ‌هایی که تو داشبورد استفاده کردیم
type ArtistAlbum = { id: number; title: string };
type MusicDetail = {
  id: number;
  title: string;
  album: number | null;
  genre: string;
  collaborators: string;
  release_date: string;
  duration: string;
  lyrics: string;
};

export default function EditTrackPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const trackId = params.id as string;

  const [albums, setAlbums] = useState<ArtistAlbum[]>([]);
  const [trackData, setTrackData] = useState<MusicDetail | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });

  // محافظت از روت (فقط آرتیست)
  useEffect(() => {
    if (user && user.role !== "ARTIST") {
      router.push("/");
    }
  }, [user, router]);

  // واکشی لیست آلبوم‌های هنرمند برای دراپ‌داون
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

  // واکشی اطلاعات قبلی آهنگ برای پر کردن فرم
  useEffect(() => {
    if (user?.role === "ARTIST" && trackId) {
      const fetchTrackDetail = async () => {
        setIsFetching(true);
        try {
          const token = localStorage.getItem("access_token");
          // از همون ویوی Edit در بک‌اند با متد GET استفاده می‌کنیم
          const res = await fetch(
            `http://127.0.0.1:8000/music/musics/${trackId}/edit/`,
            {
              method: "GET",
              headers: { Authorization: `Bearer ${token}` },
            },
          );

          if (res.ok) {
            const data = await res.json();
            setTrackData(data);
          } else {
            setMessage({
              text: "Track not found or you don't have permission.",
              type: "error",
            });
          }
        } catch (error) {
          console.error(error); // 🌟 این خط رو اضافه کن تا error استفاده بشه
          setMessage({ text: "Failed to load track data.", type: "error" });
        } finally {
          setIsFetching(false);
        }
      };
      fetchTrackDetail();
    }
  }, [trackId, user]);

  if (!user || user.role !== "ARTIST") return null;

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: "", type: "" });

    const form = e.currentTarget;
    const formData = new FormData(form);

    // تبدیل فرمت MM:SS به فرمت استاندارد 00:MM:SS برای جنگو
    const durationInput = formData.get("duration") as string;
    if (durationInput && durationInput.length === 5) {
      formData.set("duration", `00:${durationInput}`);
    } else if (!durationInput) {
      // اگر تغییر نداد و خالی فرستاد، کلا فیلد رو حذف می‌کنیم تا بک‌اند گیر نده
      formData.delete("duration");
    }

    // اگر کاور یا فایل صوتی جدیدی انتخاب نشده، اون‌ها رو از FormData حذف می‌کنیم
    // تا بک‌اند فایل‌های قبلی رو پاک نکنه
    const audioFile = formData.get("audio_file") as File;
    if (audioFile && audioFile.size === 0) {
      formData.delete("audio_file");
    }

    const coverFile = formData.get("cover") as File;
    if (coverFile && coverFile.size === 0) {
      formData.delete("cover");
    }

    try {
      const token = localStorage.getItem("access_token");
      // استفاده از متد PATCH برای آپدیت جزئی
      const response = await fetch(
        `http://127.0.0.1:8000/music/musics/${trackId}/edit/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      if (response.ok) {
        setMessage({ text: "Track updated successfully!", type: "success" });
        // بعد از یک ثانیه برگرده به داشبورد
        setTimeout(() => {
          router.push("/studio");
        }, 1500);
      } else {
        setMessage({
          text: "Failed to update track. Check your inputs.",
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

  if (!trackData && !isFetching) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Track Not Found
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

  // تبدیل مدت زمان (مثلاً 00:03:45) به MM:SS
  const formatDuration = (durStr: string) => {
    if (!durStr) return "";
    const parts = durStr.split(":");
    if (parts.length === 3) {
      return `${parts[1]}:${parts[2]}`; // MM:SS
    }
    return durStr;
  };

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
            Edit Track
          </h1>
          <p className="text-gray-500">
            Update details for &quot;{trackData?.title}&quot;
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
              Track Title
            </label>
            <input
              type="text"
              name="title"
              defaultValue={trackData?.title}
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
              defaultValue={trackData?.album?.toString() || ""}
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

          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
              Collaborating Artists (Optional)
            </label>
            <input
              type="text"
              name="collaborators"
              defaultValue={trackData?.collaborators}
              placeholder="e.g. The Weeknd, Ariana Grande"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 outline-none dark:text-white"
            />
            <p className="text-xs text-gray-500">Separated by commas.</p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
              Genre
            </label>
            <input
              type="text"
              name="genre"
              defaultValue={trackData?.genre}
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
                defaultValue={trackData?.release_date}
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
                defaultValue={formatDuration(trackData?.duration || "")}
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
              Replace Audio File (Optional)
            </label>
            <input
              type="file"
              name="audio_file"
              accept="audio/*"
              className="w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100 cursor-pointer"
            />
            <p className="text-xs text-gray-500">
              Leave empty to keep the current audio.
            </p>
          </div>

          <div className="flex flex-col gap-2">
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
        </div>

        <div className="flex flex-col gap-2 mt-2">
          <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
            Lyrics (Optional)
          </label>
          <textarea
            name="lyrics"
            defaultValue={trackData?.lyrics}
            rows={4}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 outline-none dark:text-white resize-none"
            placeholder="Paste track lyrics here..."
          ></textarea>
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
