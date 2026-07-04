// src/components/layout/Topbar.tsx
"use client";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image"; // این خط اضافه شد

export default function Topbar() {
  const { user } = useAuth();

  return (
    <header className="h-full px-6 flex items-center justify-between">
      <div className="flex-1">
        {/* نوار جستجو در مراحل بعدی اینجا اضافه می‌شود */}
      </div>

      <div className="flex items-center gap-4">
        <span className="font-medium text-gray-700">
          {user ? user.displayName : "Guest User"}
        </span>

        <div className="w-10 h-10 rounded-full bg-green-100 border-2 border-green-200 flex items-center justify-center overflow-hidden relative">
          {user?.profileImage ? (
            // استفاده از کامپوننت ایمیج نکست‌جی‌اس
            <Image
              src={user.profileImage}
              alt="Profile"
              fill // پر کردن کانتینر والد
              className="object-cover"
              unoptimized // چون فعلا دیتای ماک داریم و دامنه عکس‌ها مشخص نیست، این گزینه رو فعال می‌کنیم تا به خطای دامین نخوریم
            />
          ) : (
            <span className="text-green-800 font-bold z-10">
              {user?.displayName?.charAt(0).toUpperCase() || "U"}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
