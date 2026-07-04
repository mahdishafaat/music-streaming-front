// src/types/index.ts

// تعریف انواع نقش‌ها و اشتراک‌ها بر اساس مستندات
export type Role = "LISTENER" | "ARTIST" | "SUPPORT" | "ADMIN";
export type SubscriptionType = "BASE" | "SILVER" | "GOLD";

// ساختار داده‌ای کاربر
export interface User {
  id: string;
  username: string; // نام کاربری تخصیص داده شده توسط سامانه
  displayName: string; // نام نمایشی
  email: string;
  role: Role;
  subscription: SubscriptionType;
  profileImage?: string; // اختیاری (کاربران پایه امکان عکس نمایه ندارند)
  followersCount: number;
  followingCount: number;
}

// ساختار داده‌ای آهنگ
export interface Song {
  id: string;
  title: string;
  artistId: string;
  albumId?: string; // تک‌آهنگ‌ها ممکنه آلبوم نداشته باشن
  coverImage?: string;
  audioUrl: string; // مسیر فایل صوتی
  lyrics?: string;
  streamsCount: number;
  listenersCount: number;
}

// ساختار داده‌ای آلبوم
export interface Album {
  id: string;
  title: string;
  artistId: string;
  coverImage: string;
  releaseDate: string;
  songIds: string[]; // لیستی از آیدی آهنگ‌های داخل آلبوم
}

// ساختار داده‌ای پلی‌لیست
export interface Playlist {
  id: string;
  title: string;
  userId: string; // سازنده پلی‌لیست
  songIds: string[];
  coverImage?: string;
  createdAt: string;
}
