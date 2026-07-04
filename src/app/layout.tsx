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
    <html lang="fa" dir="rtl">
      <body
        className={`${inter.className} bg-gray-50 text-gray-900 antialiased`}
      >
        {/* AuthProvider کل برنامه رو در بر می‌گیره */}
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
