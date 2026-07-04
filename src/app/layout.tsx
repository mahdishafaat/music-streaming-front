// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Spotify Clone",
  description: "Music Streaming Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // زبان رو به انگلیسی تغییر دادیم و dir="rtl" رو حذف کردیم (پیش‌فرض ltr است)
    <html lang="en">
      <body
        className={`${inter.className} bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 antialiased selection:bg-green-200 selection:text-gray-900`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
