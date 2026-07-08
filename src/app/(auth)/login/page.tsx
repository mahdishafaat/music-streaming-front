// src/app/(auth)/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { User } from "@/types";
import { getStorageItem } from "@/utils/storage";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // ۱. دریافت لیست تمام کاربران تستی از دیتابیس لوکال
    const users = getStorageItem<User[]>("users") || [];

    // ۲. بررسی اینکه آیا ایمیل وارد شده با کاربران تستی ما (ادمین یا پشتیبان) تطابق دارد یا خیر
    const existingUser = users.find((u) => u.email === email);

    if (existingUser) {
      // اگر کاربر پیدا شد (مثلاً admin@test.com وارد شده بود)، با اطلاعات واقعی خودش لاگین کن
      login(existingUser);

      // اگر ادمین یا پشتیبان بود، مستقیم بفرستش داشبورد، وگرنه بفرست صفحه اصلی
      if (existingUser.role === "ADMIN" || existingUser.role === "SUPPORT") {
        router.push("/dashboard");
      } else {
        router.push("/");
      }
    } else {
      // اگر ایمیل جدید بود، یک کاربر عادی (LISTENER) بساز و لاگین کن
      const mockUser: User = {
        id: `test-id-${Date.now()}`,
        username: email.split("@")[0],
        displayName: "Test User",
        email: email,
        role: "LISTENER",
        subscription: "BASE",
        followersCount: 0,
        followingCount: 0,
      };

      login(mockUser);
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-600 mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-500">Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-400 transition-all"
              placeholder="Enter your email (e.g. admin@test.com)"
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-400 transition-all"
              placeholder="Enter any password"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white font-medium py-3 rounded-xl hover:bg-green-700 transition-colors mt-2"
          >
            Sign In
          </button>
        </form>

        {/* اضافه کردن راهنمای ورود برای دسترسی سریع‌تر تو زمان تست */}
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-500 text-left">
          <p className="font-bold mb-1">تست اکانت‌ها (رمز دلخواه):</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>
              Admin:{" "}
              <code className="bg-gray-200 px-1 rounded">admin@test.com</code>
            </li>
            <li>
              Support:{" "}
              <code className="bg-gray-200 px-1 rounded">support@test.com</code>
            </li>
          </ul>
        </div>

        <p className="text-center text-gray-600 mt-6 text-sm">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-green-600 hover:text-green-700 font-medium"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
