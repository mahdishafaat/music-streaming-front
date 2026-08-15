// src/app/(main)/profile/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { getStorageItem } from "@/utils/storage";
import { Playlist } from "@/types";
import PlaylistCard from "@/components/ui/PlaylistCard";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ========== TYPES ==========
type ProfileData = {
  id: number;
  email: string;
  username: string;
  display_name: string;
  birth_date: string | null;
  gender: string;
  role: "listener" | "artist" | "support" | "admin";
  profile_image: string | null;
  created_at: string;
  updated_at: string;
};

type DailyStreamsData = {
  total_streams: number;
  days_active: number;
  average_daily_streams: number;
};

type FollowStatsData = {
  followers_count: number;
  following_count: number;
};

type SubscriptionData = {
  plan: {
    id: number;
    name: string;
    max_daily_streams: number;
    max_playlists: number;
    can_upload_profile_image: boolean;
    can_download: boolean;
    can_early_access: boolean;
    can_view_statistics: boolean;
    is_active: boolean;
    prices: Array<{
      id: number;
      duration_months: number;
      price: string;
      is_active: boolean;
    }>;
  };
  price: string;
  duration_months: number;
  start_date: string;
  end_date: string;
  status: string;
  is_default_base: boolean;
};

type ArtistProfileData = {
  stage_name: string;
  bio: string;
  is_verified: boolean;
  total_streams: number;
  albums: Array<{
    id: number;
    title: string;
    cover: string | null;
    release_date: string;
    created_at: string;
    musics: any[];
  }>;
  singles: any[];
};

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  // ---- State ----
  const [userPlaylists, setUserPlaylists] = useState<Playlist[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  // Profile data (common)
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Daily streams
  const [dailyStreams, setDailyStreams] = useState<DailyStreamsData | null>(
    null,
  );

  // Follow stats
  const [followStats, setFollowStats] = useState<FollowStatsData | null>(null);

  // Subscription
  const [subscription, setSubscription] = useState<SubscriptionData | null>(
    null,
  );

  // Artist profile (if role === artist)
  const [artistProfile, setArtistProfile] = useState<ArtistProfileData | null>(
    null,
  );
  console.log("artistProfile:", artistProfile);

  // Edit form state (common)
  const [editDisplayName, setEditDisplayName] = useState("");
  // Artist-only fields
  const [editStageName, setEditStageName] = useState("");
  const [editBio, setEditBio] = useState("");

  // Image upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Image modal
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---- Helper: get headers with token ----
  const getHeaders = (): HeadersInit => {
    const token = localStorage.getItem("access_token");
    return {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  // ---- Fetch all data ----
  const fetchAllData = async () => {
    setLoadingProfile(true);
    try {
      const [profileRes, streamsRes, followRes, subRes] = await Promise.all([
        fetch("http://127.0.0.1:8000/accounts/profile/me/", {
          headers: getHeaders(),
        }),
        fetch("http://127.0.0.1:8000/accounts/me/daily-streams/", {
          headers: getHeaders(),
        }),
        fetch("http://127.0.0.1:8000/accounts/users/me/follow-stats/", {
          headers: getHeaders(),
        }),
        fetch("http://127.0.0.1:8000/subscriptions/me/subscription/", {
          headers: getHeaders(),
        }),
      ]);

      if (!profileRes.ok) throw new Error("Failed to fetch profile");
      const profileData = await profileRes.json();
      setProfileData(profileData);
      setEditDisplayName(profileData.display_name);

      if (streamsRes.ok) {
        const streamsData = await streamsRes.json();
        setDailyStreams(streamsData);
      }
      if (followRes.ok) {
        const followData = await followRes.json();
        setFollowStats(followData);
      }
      if (subRes.ok) {
        const subData = await subRes.json();
        setSubscription(subData);
      }

      // If user is artist, fetch artist profile
      if (profileData.role === "artist") {
        const artistRes = await fetch(
          "http://127.0.0.1:8000/accounts/artist/profile/me/",
          {
            headers: getHeaders(),
          },
        );
        if (artistRes.ok) {
          const artistData = await artistRes.json();
          setArtistProfile(artistData);
          setEditStageName(artistData.stage_name);
          setEditBio(artistData.bio || "");
        }
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
    } finally {
      setLoadingProfile(false);
    }
  };

  // ---- Load playlists (from local storage) ----
  useEffect(() => {
    const loadPlaylists = async () => {
      const storedPlaylists = getStorageItem<Playlist[]>("playlists") || [];
      setUserPlaylists(storedPlaylists);
    };
    loadPlaylists();
  }, []);

  // ---- Fetch data when user exists ----
  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  // ---- Logout ----
  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // ---- Determine which endpoint to use ----
  const getUpdateEndpoint = () => {
    if (profileData?.role === "artist") {
      return "http://127.0.0.1:8000/accounts/profile/artist/update/";
    }
    return "http://127.0.0.1:8000/accounts/profile/update/";
  };

  // ---- Update profile (display name + artist fields) ----
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileData) return;

    // Build payload based on role
    const payload: any = {};

    if (editDisplayName !== profileData.display_name) {
      payload.display_name = editDisplayName;
    }

    if (profileData.role === "artist") {
      if (editStageName !== artistProfile?.stage_name) {
        payload.stage_name = editStageName;
      }
      if (editBio !== (artistProfile?.bio || "")) {
        payload.bio = editBio;
      }
    }

    // If nothing changed, just close form
    if (Object.keys(payload).length === 0) {
      setIsEditing(false);
      return;
    }

    setUpdatingProfile(true);
    setUpdateError(null);

    try {
      const res = await fetch(getUpdateEndpoint(), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getHeaders(),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to update profile");
      }

      const updated = await res.json();
      setProfileData((prev) => ({ ...prev!, ...updated }));
      setEditDisplayName(updated.display_name);

      // If artist, update artistProfile from response (it includes stage_name and bio)
      if (profileData.role === "artist") {
        setArtistProfile((prev) => ({
          ...prev!,
          stage_name: updated.stage_name || prev!.stage_name,
          bio: updated.bio || prev!.bio,
        }));
        setEditStageName(updated.stage_name || editStageName);
        setEditBio(updated.bio || editBio);
      }

      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : "Network error");
      setTimeout(() => setUpdateError(null), 5000);
    } finally {
      setUpdatingProfile(false);
    }
  };

  // ---- Open image modal (common for both roles) ----
  const handleImageUploadClick = () => {
    if (!profileData) return;

    // Check subscription permission
    if (subscription && !subscription.plan.can_upload_profile_image) {
      setUpdateError(
        "Your subscription plan does not allow changing your profile picture.",
      );
      setTimeout(() => setUpdateError(null), 5000);
      return;
    }

    setIsImageModalOpen(true);
    setSelectedFile(null);
    setImagePreview(null);
  };

  // ---- Handle file selection ----
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB.");
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setImagePreview(ev.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // ---- Upload the new profile image (common for both roles) ----
  const handleSaveImage = async () => {
    if (!selectedFile) {
      alert("Please select an image first.");
      return;
    }

    setUpdatingProfile(true);
    try {
      const formData = new FormData();
      formData.append("profile_image", selectedFile);

      const res = await fetch(getUpdateEndpoint(), {
        method: "PATCH",
        headers: getHeaders(), // Do NOT set Content-Type; browser will set multipart boundary
        body: formData,
      });

      if (!res.ok) {
        let errorMsg = "Failed to update profile image";
        try {
          const errorData = await res.json();
          errorMsg = errorData.detail || errorMsg;
        } catch (_) {}
        throw new Error(errorMsg);
      }

      const updated = await res.json();

      // آپدیت کردن استیت با دیتای جدید و جلوگیری از کش شدن عکس
      setProfileData((prev) => {
        if (!prev) return updated;
        return {
          ...prev,
          ...updated,
          // اضافه کردن یک تایم‌استمپ تصادفی به URL عکس تا مرورگر نسخه جدید را اجباراً لود کند
          profile_image: updated.profile_image
            ? `${updated.profile_image}?t=${new Date().getTime()}`
            : prev.profile_image,
        };
      });
      setImgError(false);
      setIsImageModalOpen(false);
      setSelectedFile(null);
      setImagePreview(null);
      // alert("Profile image updated successfully!"); // این الرت روی مخ رو هم می‌تونی کامنت کنی
    } catch (err) {
      alert(err instanceof Error ? err.message : "Network error");
    } finally {
      setUpdatingProfile(false);
    }
  };

  // ---- Render ----
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Please log in to view your profile
        </h2>
      </div>
    );
  }

  if (loadingProfile) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
        <div className="text-gray-500 dark:text-gray-400">
          Loading profile...
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
        <div className="text-red-500">
          Failed to load profile. Please refresh.
        </div>
      </div>
    );
  }

  // ---- Compute display values ----
  const displayName = profileData.display_name;
  const username = profileData.username;
  const profileImage = profileData.profile_image;
  const role = profileData.role;
  const subscriptionName = subscription?.plan?.name || "BASE";
  const followersCount = followStats?.followers_count ?? 0;
  const followingCount = followStats?.following_count ?? 0;
  const avgDailyStreams = dailyStreams?.average_daily_streams ?? 0;

  // Both listeners and artists can edit (but with different fields)
  const isEditable = role === "listener" || role === "artist";

  // 🌟 تابع هوشمند و ضدکِرَش برای ساخت URL عکس پروفایل
  const getValidImageUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    const normalizedPath = path.replace(/\\/g, "/");
    const prefix = normalizedPath.startsWith("/") ? "" : "/";
    return `http://127.0.0.1:8000${prefix}${normalizedPath}`;
  };

  const finalProfileImage = getValidImageUrl(profileImage);
  // ---- Main Render ----
  return (
    <div className="flex flex-col gap-10 pb-10 transition-colors max-w-6xl mx-auto w-full relative">
      {/* Update error banner */}
      {updateError && (
        <div className="p-4 bg-red-100 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
          {updateError}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-6 pb-8 border-b border-gray-200 dark:border-gray-800">
        {/* Profile Image */}
        <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden shadow-2xl flex-shrink-0 bg-gradient-to-tr from-green-400 to-green-600 border-4 border-white dark:border-gray-900 flex items-center justify-center group">
          {finalProfileImage && !imgError ? (
            <Image
              src={finalProfileImage}
              alt={displayName}
              fill
              className="object-cover"
              unoptimized
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="text-6xl md:text-7xl font-bold text-white uppercase shadow-sm">
              {displayName?.[0] || "U"}
            </span>
          )}

          {/* Hover layer to change photo – only if editable */}
          {isEditable && (
            <div
              onClick={handleImageUploadClick}
              className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg
                className="w-8 h-8 text-white mb-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                ></path>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                ></path>
              </svg>
              <span className="text-white text-xs font-bold">Change Photo</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 flex-1 text-center md:text-left min-w-0 w-full mt-4 md:mt-0">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
            Profile • @{username}
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-gray-900 dark:text-white truncate">
            {displayName}
          </h1>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3">
            <span className="font-bold text-yellow-600 dark:text-yellow-500 text-xs bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1 rounded-full border border-yellow-200 dark:border-yellow-800/50 uppercase">
              {subscriptionName} PLAN
            </span>
            <span className="font-bold text-blue-600 dark:text-blue-500 text-xs bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800/50 uppercase">
              {role}
            </span>
            <span className="text-gray-300 dark:text-gray-600 hidden sm:inline">
              •
            </span>
            <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">
              {followersCount.toLocaleString()}{" "}
              <span className="text-gray-500 font-normal">Followers</span>
            </span>
            <span className="text-gray-300 dark:text-gray-600 hidden sm:inline">
              •
            </span>
            <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">
              {followingCount.toLocaleString()}{" "}
              <span className="text-gray-500 font-normal">Following</span>
            </span>
            <span className="text-gray-300 dark:text-gray-600 hidden sm:inline">
              •
            </span>
            <span className="text-green-600 dark:text-green-400 text-sm font-bold">
              {avgDailyStreams.toFixed(1)}{" "}
              <span className="text-gray-500 font-normal text-xs">
                Avg Daily Streams
              </span>
            </span>
          </div>
        </div>

        <div className="mt-4 md:mt-0 flex-shrink-0 flex gap-2 items-center">
          {isEditable ? (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-6 py-2 rounded-full font-bold text-sm bg-gray-100 hover:bg-gray-200 text-gray-900 dark:bg-white dark:hover:bg-gray-200 dark:text-black transition-colors"
            >
              {isEditing ? "Cancel Edit" : "Edit Profile"}
            </button>
          ) : (
            <div className="text-sm text-gray-500 dark:text-gray-400 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700">
              Profile not editable
            </div>
          )}

          <button
            onClick={handleLogout}
            className="p-2 rounded-full border-2 border-gray-200 dark:border-gray-700 text-gray-500 hover:text-red-500 hover:border-red-500 transition-colors"
            title="Log out"
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
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              ></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Edit Profile Form (dynamic based on role) */}
      {isEditing && isEditable && (
        <section className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm animate-fade-in">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Edit Profile
          </h2>
          <form
            onSubmit={handleEditSubmit}
            className="flex flex-col gap-4 max-w-md"
          >
            {/* Common field: Display Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={editDisplayName}
                onChange={(e) => setEditDisplayName(e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                required
              />
            </div>

            {/* Artist-only fields */}
            {role === "artist" && artistProfile && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Stage Name
                  </label>
                  <input
                    type="text"
                    value={editStageName}
                    onChange={(e) => setEditStageName(e.target.value)}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bio
                  </label>
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white resize-none"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Username (cannot be changed)
              </label>
              <input
                type="text"
                value={username}
                disabled
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 cursor-not-allowed"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={updatingProfile}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-full transition-colors w-full disabled:bg-gray-400"
              >
                {updatingProfile ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Artist Profile Section (display only – shows stage_name and bio) */}
      {role === "artist" && artistProfile && (
        <section className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm animate-fade-in">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Artist Profile
          </h2>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Stage Name
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {artistProfile.stage_name}
              </p>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500 dark:text-gray-400">Bio</p>
              <p className="text-gray-700 dark:text-gray-300">
                {artistProfile.bio || "No bio yet."}
              </p>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Verified
              </p>
              <p className="text-lg font-bold text-green-600">
                {artistProfile.is_verified ? "✅ Verified" : "Not Verified"}
              </p>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Streams
              </p>
              <p className="text-lg font-bold text-blue-600">
                {artistProfile.total_streams.toLocaleString()}
              </p>
            </div>
          </div>
          {artistProfile.albums.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Albums
              </h3>
              <div className="flex flex-wrap gap-3 mt-2">
                {artistProfile.albums.slice(0, 5).map((album) => (
                  <span
                    key={album.id}
                    className="px-3 py-1 bg-white dark:bg-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300"
                  >
                    {album.title}
                  </span>
                ))}
                {artistProfile.albums.length > 5 && (
                  <span className="px-3 py-1 bg-gray-200 dark:bg-gray-600 rounded-full text-sm text-gray-500">
                    +{artistProfile.albums.length - 5} more
                  </span>
                )}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Become Artist Promo (only for listeners) */}
      {role === "listener" && (
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 shadow-lg text-white flex flex-col md:flex-row items-center justify-between gap-6 animate-fade-in">
          <div>
            <h3 className="text-2xl font-bold mb-2 text-green-400">
              Are you a creator?
            </h3>
            <p className="text-gray-300">
              Share your music with the world! Apply to become a verified artist
              on our platform and start earning from your streams.
            </p>
          </div>
          <Link
            href="/become-artist"
            className="whitespace-nowrap px-8 py-3.5 bg-green-500 hover:bg-green-400 text-black font-black rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Become an Artist
          </Link>
        </div>
      )}

      {/* Playlists Section (unchanged) */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Public Playlists
        </h2>

        {userPlaylists.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
            <svg
              className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              ></path>
            </svg>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              No playlists yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Head over to the playlists tab to create your first mix.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {userPlaylists.map((playlist) => (
              <PlaylistCard key={playlist.id} playlist={playlist} />
            ))}
          </div>
        )}
      </section>

      {/* Modal: Upload profile image (file input) */}
      {isImageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 animate-fade-in p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col gap-5">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Upload Profile Picture
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Select an image from your device (max 5MB).
            </p>

            <div className="flex flex-col gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 dark:file:bg-gray-700 dark:file:text-white"
              />
              {imagePreview && (
                <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden border-2 border-gray-300 dark:border-gray-600">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-2">
              <button
                onClick={() => {
                  setIsImageModalOpen(false);
                  setSelectedFile(null);
                  setImagePreview(null);
                }}
                className="px-4 py-2 rounded-lg font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveImage}
                disabled={!selectedFile || updatingProfile}
                className="px-4 py-2 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700 transition-colors disabled:bg-gray-400"
              >
                {updatingProfile ? "Uploading..." : "Save Photo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
