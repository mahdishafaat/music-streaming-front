// src/app/(main)/users/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from '@/config/api';

interface ApiUserDetail {
  id: number;
  display_name: string;
  role: string;
  profile_image: string | null;
}

export default function UserProfilePage() {
  const { id } = useParams();
  const { user } = useAuth();

  const [profileUser, setProfileUser] = useState<ApiUserDetail | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [followersCount, setFollowersCount] = useState<number | null>(null);
  const [followingCount, setFollowingCount] = useState<number | null>(null);

  const getFullUrl = (path?: string | null): string => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const normalizedPath = path.replace(/\\/g, "/");
    const prefix = normalizedPath.startsWith("/") ? "" : "/";
    return `${API_BASE_URL}${prefix}${normalizedPath}`;
  };

  const getHeaders = (): HeadersInit => {
    const token = localStorage.getItem("access_token");
    return { ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/accounts/users/${id}/`, {
          headers: getHeaders(),
          cache: "no-store",
        });
        if (!res.ok) throw new Error("User not found");
        const data = await res.json();
        setProfileUser(data);

        // Fetch follow stats
        const statsRes = await fetch(
          `${API_BASE_URL}/accounts/users/${id}/follow-stats/`,
          {
            headers: getHeaders(),
          },
        );
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setFollowersCount(statsData.followers_count);
          setFollowingCount(statsData.following_count);
        }

        // Fetch follow status if logged in
        if (user) {
          const statusRes = await fetch(
            `${API_BASE_URL}/accounts/me/follows/${id}/`,
            {
              headers: getHeaders(),
            },
          );
          if (statusRes.ok) {
            const statusData = await statusRes.json();
            setIsFollowing(statusData.is_following);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchUserData();
  }, [id, user]);

  const handleToggleFollow = async () => {
    if (!profileUser) return;
    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("Please login to follow users.");
      return;
    }

    try {
      if (isFollowing) {
        const res = await fetch(
          `${API_BASE_URL}/accounts/unfollow/?display_name=${profileUser.display_name}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (res.ok) {
          setIsFollowing(false);
          setFollowersCount((prev) => (prev !== null ? prev - 1 : prev));
        }
      } else {
        const res = await fetch(`${API_BASE_URL}/accounts/follow/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ display_name: profileUser.display_name }),
        });
        if (res.ok) {
          setIsFollowing(true);
          setFollowersCount((prev) => (prev !== null ? prev + 1 : prev));
        }
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-[50vh] text-gray-500 font-bold">
        Loading user data...
      </div>
    );
  if (!profileUser)
    return (
      <div className="flex justify-center items-center h-[70vh] font-bold text-gray-500">
        User not found.
      </div>
    );

  const profileImage = profileUser.profile_image
    ? getFullUrl(profileUser.profile_image)
    : null;

  // 🌟 حل مشکل تایپ اسکریپت با تبدیل هر دو به String
  const isSelf = user?.id ? String(user.id) === String(profileUser.id) : false;

  return (
    <div className="flex flex-col gap-10 pb-12 transition-colors max-w-4xl mx-auto w-full animate-fade-in mt-10">
      <div className="flex flex-col md:flex-row items-center md:items-end gap-8 bg-gray-50 dark:bg-gray-800/40 p-10 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm">
        {/* 🌟 حل اخطارهای Tailwind با جایگزینی shrink-0 و bg-linear-to-tr */}
        <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden shadow-2xl shrink-0 bg-linear-to-tr from-green-400 to-blue-500 border-4 border-white dark:border-gray-900 flex items-center justify-center">
          {profileImage && !profileImage.includes("base_profile") ? (
            <Image
              src={profileImage}
              alt={profileUser.display_name}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <span className="text-6xl md:text-7xl font-bold text-white uppercase shadow-sm">
              {profileUser.display_name[0]}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-4 flex-1 text-center md:text-left min-w-0 w-full">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-green-600 dark:text-green-400 mb-1 block">
              User Profile
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white truncate">
              {profileUser.display_name}
            </h1>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-6 text-sm font-medium text-gray-600 dark:text-gray-300">
            <span className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full text-xs uppercase tracking-wider font-bold">
              {profileUser.role}
            </span>
            <span>
              <strong className="text-gray-900 dark:text-white text-lg">
                {followersCount ?? "—"}
              </strong>{" "}
              Followers
            </span>
            <span>
              <strong className="text-gray-900 dark:text-white text-lg">
                {followingCount ?? "—"}
              </strong>{" "}
              Following
            </span>
          </div>
        </div>

        {!isSelf && (
          <div className="shrink-0 mt-4 md:mt-0">
            <button
              onClick={handleToggleFollow}
              className={`px-8 py-3 rounded-full font-bold text-sm border-2 transition-all shadow-md ${
                isFollowing
                  ? "border-gray-300 text-gray-700 bg-gray-100 hover:border-red-400 hover:text-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:border-red-500 dark:hover:text-red-400"
                  : "border-green-500 bg-green-500 text-white hover:bg-green-600 hover:border-green-600 hover:scale-105"
              }`}
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
