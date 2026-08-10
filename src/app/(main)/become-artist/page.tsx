// src/app/(main)/become-artist/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function BecomeArtistPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [stageName, setStageName] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // اگر کاربر لاگین نبود یا نقش او شنونده نبود، دسترسی ندارد
  if (!user || user.role !== "LISTENER") {
    return (
      <div className="p-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Access Denied
        </h2>
        <p className="text-gray-500">
          Only standard listeners can apply to become an artist.
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        "http://127.0.0.1:8000/accounts/artist-request/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ارسال توکن JWT برای شناسایی کاربر
          },
          body: JSON.stringify({
            stage_name: stageName,
            portfolio: portfolio,
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        setMessage({
          text: "Your application has been submitted successfully! Please wait for admin approval.",
          type: "success",
        });
        setStageName("");
        setPortfolio("");
        // پس از ۳ ثانیه کاربر را به پروفایل برمی‌گردانیم
        setTimeout(() => router.push("/profile"), 3000);
      } else {
        // مدیریت خطاهای بک‌اند (مثلا درخواستی از قبل وجود داشته باشد)
        const errorMsg = Array.isArray(data)
          ? data[0]
          : (Object.values(data)[0] as string[])[0];
        setMessage({
          text: errorMsg || "Failed to submit request.",
          type: "error",
        });
      }
    } catch (err) {
      setMessage({
        text: "Cannot connect to the server. Make sure backend is running.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Artist Application
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Fill out this form to upgrade your account to an Artist profile.
          </p>
        </div>

        {message.text && (
          <div
            className={`mb-6 p-4 rounded-xl text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"}`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
              Stage Name
            </label>
            <input
              type="text"
              required
              value={stageName}
              onChange={(e) => setStageName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none dark:text-white transition-all"
              placeholder="E.g., The Weeknd"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
              Portfolio Link
            </label>
            <input
              type="url"
              required
              value={portfolio}
              onChange={(e) => setPortfolio(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none dark:text-white transition-all"
              placeholder="Link to your SoundCloud, YouTube, or previous work"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-50"
          >
            {isLoading ? "Submitting..." : "Submit Application"}
          </button>
        </form>
      </div>
    </div>
  );
}
