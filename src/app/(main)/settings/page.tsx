// src/app/(main)/settings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { usePlayer } from "@/context/PlayerContext";
import { API_BASE_URL } from '@/config/api';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const { volume, setVolume } = usePlayer();
  const [language, setLanguage] = useState("en");
  const [notifications, setNotifications] = useState("mentions");

  const [isLoading, setIsLoading] = useState(true);

  // دریافت تنظیمات از بک‌اند هنگام لود صفحه
  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) return;
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch(`${API_BASE_URL}/accounts/settings/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setLanguage(data.language);
          setNotifications(data.notifications);
          setVolume(data.volume);
          localStorage.setItem("app_language", data.language);
          localStorage.setItem("app_notifications", data.notifications);
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [user, setVolume]);

  // تابع جامع برای ارسال آپدیت به بک‌اند
  const updateBackendSetting = async (key: string, value: string | number) => {
    try {
      const token = localStorage.getItem("access_token");
      await fetch(`${API_BASE_URL}/accounts/settings/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ [key]: value }),
      });
    } catch (error) {
      console.error(`Failed to update ${key}:`, error);
    }
  };

  const handleLanguageChange = (val: string) => {
    setLanguage(val);
    localStorage.setItem("app_language", val);
    updateBackendSetting("language", val);
  };

  const handleNotifChange = (val: string) => {
    setNotifications(val);
    localStorage.setItem("app_notifications", val);
    updateBackendSetting("notifications", val);
  };

  const handleVolumeChangeComplete = () => {
    updateBackendSetting("volume", volume);
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Please log in to view settings
        </h2>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-green-500 opacity-80"></div>
      </div>
    );
  }

  const handleUpgradeSubscription = () => {
    router.push("/subscriptions");
  };

  const handleDeleteAccount = () => {
    const isConfirmed = window.confirm(
      "Are you absolutely sure you want to delete your account? This action cannot be undone.",
    );
    if (isConfirmed) {
      alert("Account deleted successfully.");
      logout();
      router.push("/login");
    }
  };

  const volumePercentage = Math.round(volume * 100);

  return (
    <div className="flex flex-col gap-8 pb-10 transition-colors max-w-4xl mx-auto w-full animate-fade-in">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
      </div>

      <section className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 border border-green-200 dark:border-green-800/50 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              Your Subscription
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Currently on the{" "}
              <span className="font-bold text-green-700 dark:text-green-400 uppercase tracking-wider">
                {user.subscription || "FREE"}
              </span>{" "}
              plan.
            </p>
          </div>
          <button
            onClick={handleUpgradeSubscription}
            className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors shadow-md"
          >
            Upgrade Plan
          </button>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-4">
          App Preferences
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              Language
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Choose your preferred application language.
            </p>
          </div>
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white cursor-pointer"
          >
            <option value="en">English</option>
            <option value="fa">Persian (فارسی)</option>
            <option value="fr">French</option>
          </select>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              Notifications
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Manage your notification limits and alerts.
            </p>
          </div>
          <select
            value={notifications}
            onChange={(e) => handleNotifChange(e.target.value)}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white cursor-pointer"
          >
            <option value="all">All Notifications</option>
            <option value="mentions">Important Only</option>
            <option value="none">Mute All</option>
          </select>
        </div>

        <div className="flex flex-col justify-between gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                System Default Volume
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Set the default volume level across all your devices.
              </p>
            </div>
            <span className="font-bold text-green-600 dark:text-green-400">
              {volumePercentage}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            onMouseUp={handleVolumeChangeComplete}
            onTouchEnd={handleVolumeChangeComplete}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-600"
          />
        </div>
      </section>

      <section className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded-2xl p-6 shadow-sm mt-4">
        <h2 className="text-xl font-bold text-red-700 dark:text-red-500 mb-2">
          Danger Zone
        </h2>
        <p className="text-sm text-red-600 dark:text-red-400 mb-6">
          Permanently delete your account and all of your data. This action is
          not reversible, so please continue with caution.
        </p>
        <button
          onClick={handleDeleteAccount}
          className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-sm"
        >
          Delete Account
        </button>
      </section>
    </div>
  );
}
