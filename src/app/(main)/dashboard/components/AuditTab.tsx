// src/app/(main)/dashboard/components/AuditTab.tsx
"use client";

import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/config/api";

type Audit = {
  artistId: string;
  name: string;
  listeners: number;
  streams: number;
  reward: number;
  status: "PENDING" | "SETTLED";
};

export default function AuditTab() {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAudits = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_BASE_URL}/music/admin/financial-audit/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAudits(data);
      } else {
        console.error("Failed to fetch audit data");
      }
    } catch (error) {
      console.error("Error fetching audits:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAudits();
  }, []);

  const handleSettlePayment = async (artistId: string) => {
    if (!window.confirm("Are you sure you want to settle this payment?"))
      return;

    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_BASE_URL}/music/admin/settle-payment/${artistId}/`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.ok) {
        alert("Settlement approved successfully.");
        // رفرش کردن لیست بعد از آپدیت موفق
        fetchAudits();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.detail || "Failed to settle payment.");
      }
    } catch (error) {
      console.error(error);
      alert("Network error.");
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-500">
        Loading financial data...
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Artist Financial Audit (Current Month)
      </h2>
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-sm border-b border-gray-200 dark:border-gray-700">
              <th className="p-5 font-medium">Artist (ID)</th>
              <th className="p-5 font-medium">Unique Listeners</th>
              <th className="p-5 font-medium">Total Streams</th>
              <th className="p-5 font-medium">Calculated Reward</th>
              <th className="p-5 font-medium">Status</th>
              <th className="p-5 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {audits.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  No artist streams found for this month.
                </td>
              </tr>
            ) : (
              audits.map((audit) => (
                <tr
                  key={audit.artistId}
                  className="border-b border-gray-100 dark:border-gray-750 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                >
                  <td className="p-5">
                    <p className="font-bold text-gray-900 dark:text-white">
                      {audit.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      #{audit.artistId}
                    </p>
                  </td>
                  <td className="p-5 font-medium text-gray-600 dark:text-gray-300">
                    {audit.listeners.toLocaleString()}
                  </td>
                  <td className="p-5 font-medium text-gray-600 dark:text-gray-300">
                    {audit.streams.toLocaleString()}
                  </td>
                  <td className="p-5 font-bold text-green-600 dark:text-gray-400 text-lg">
                    $
                    {audit.reward.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="p-5">
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-wide ${
                        audit.status === "PENDING"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {audit.status === "PENDING"
                        ? "Pending Payment"
                        : "Settled"}
                    </span>
                  </td>
                  <td className="p-5 text-right">
                    {audit.status === "PENDING" ? (
                      <button
                        onClick={() => handleSettlePayment(audit.artistId)}
                        className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
                      >
                        Approve Settlement
                      </button>
                    ) : (
                      <span className="text-gray-400 text-sm font-bold px-4">
                        Completed ✓
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
