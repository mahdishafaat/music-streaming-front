"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

// ایمپورت کردن کامپوننت‌های خرد شده
import ArtistsTab from "./components/ArtistsTab";
import TicketsTab from "./components/TicketsTab";
import AuditTab from "./components/AuditTab";
import SystemTab from "./components/SystemTab";

type Tab = "artists" | "tickets" | "audit" | "system";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("artists");

  // چک کردن سطح دسترسی
  useEffect(() => {
    if (user) {
      if (user.role !== "ADMIN" && user.role !== "SUPPORT") {
        router.push("/");
      }
    }
  }, [user, router]);

  // تا زمانی که وضعیت لاگین مشخص نشده چیزی نشون نده
  if (!user) return <div className="p-10 text-center">Loading...</div>;
  if (user.role !== "ADMIN" && user.role !== "SUPPORT") return null;

  const isAdmin = user.role === "ADMIN";

  return (
    <div className="flex flex-col md:flex-row min-h-[80vh] gap-10 transition-colors max-w-7xl mx-auto w-full pb-12">
      <aside className="w-full md:w-72 flex-shrink-0 flex flex-col gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-3xl h-fit sticky top-6 shadow-sm">
        <div className="pb-6 mb-3 border-b border-gray-200 dark:border-gray-700">
          <h1 className="font-black text-2xl text-gray-900 dark:text-white tracking-tight">
            Admin Panel
          </h1>
          <p className="text-sm text-gray-500 mt-2 font-medium">
            Access Level:{" "}
            <span className="font-bold text-green-600">
              {isAdmin ? "System Admin" : "Support Team"}
            </span>
          </p>
        </div>

        <button
          onClick={() => setActiveTab("artists")}
          className={`flex items-center gap-4 w-full text-left px-5 py-3.5 rounded-xl font-bold transition-all ${
            activeTab === "artists"
              ? "bg-green-600 text-white shadow-md shadow-green-600/20"
              : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
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
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          Artist Approvals
        </button>

        <button
          onClick={() => setActiveTab("tickets")}
          className={`flex items-center gap-4 w-full text-left px-5 py-3.5 rounded-xl font-bold transition-all ${
            activeTab === "tickets"
              ? "bg-green-600 text-white shadow-md shadow-green-600/20"
              : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
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
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            ></path>
          </svg>
          Support Tickets
        </button>

        {isAdmin && (
          <>
            <div className="h-px w-full bg-gray-200 dark:bg-gray-700 my-3"></div>

            <button
              onClick={() => setActiveTab("audit")}
              className={`flex items-center gap-4 w-full text-left px-5 py-3.5 rounded-xl font-bold transition-all ${
                activeTab === "audit"
                  ? "bg-green-600 text-white shadow-md shadow-green-600/20"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
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
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                ></path>
              </svg>
              Financial Audit
            </button>

            <button
              onClick={() => setActiveTab("system")}
              className={`flex items-center gap-4 w-full text-left px-5 py-3.5 rounded-xl font-bold transition-all ${
                activeTab === "system"
                  ? "bg-green-600 text-white shadow-md shadow-green-600/20"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
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
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                ></path>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                ></path>
              </svg>
              Settings & Stats
            </button>
          </>
        )}
      </aside>

      <main className="flex-1 min-w-0">
        {/* رندر کردن کامپوننت متناسب با تب انتخابی */}
        {activeTab === "artists" && <ArtistsTab />}
        {activeTab === "tickets" && <TicketsTab />}
        {isAdmin && activeTab === "audit" && <AuditTab />}
        {isAdmin && activeTab === "system" && <SystemTab />}
      </main>
    </div>
  );
}
