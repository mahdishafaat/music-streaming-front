"use client";

import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/config/api";

type RealArtistRequest = {
  id: number;
  user_email: string;
  user_display_name: string;
  stage_name: string;
  portfolio: string;
  status: "pending" | "approved" | "rejected";
  reason: string;
  created_at: string;
};

export default function ArtistsTab() {
  const [artistRequests, setArtistRequests] = useState<RealArtistRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);

  const fetchArtistRequests = async () => {
    setIsLoadingRequests(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_BASE_URL}/accounts/artist-requests/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setArtistRequests(data);
      }
    } catch (error) {
      console.error("Failed to fetch artist requests", error);
    } finally {
      setIsLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchArtistRequests();
  }, []);

  const handleApproveArtist = async (id: number) => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_BASE_URL}/accounts/artist-requests/${id}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: "approved" }),
        },
      );
      if (res.ok) {
        alert("Artist approved successfully!");
        fetchArtistRequests();
      } else {
        alert("Failed to approve artist.");
      }
    } catch (error) {
      console.error(error);
      alert("Network error.");
    }
  };

  const handleRejectArtist = async (id: number) => {
    const reason = prompt("Please enter the reason for rejection:");
    if (reason !== null) {
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch(
          `${API_BASE_URL}/accounts/artist-requests/${id}/`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ status: "rejected", reason }),
          },
        );
        if (res.ok) {
          alert(`Request rejected. Reason: ${reason}`);
          fetchArtistRequests();
        }
      } catch (error) {
        console.error(error);
        alert("Network error.");
      }
    }
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Artist Approval Requests
      </h2>

      {isLoadingRequests ? (
        <div className="p-8 text-center text-gray-500">
          Loading requests from backend...
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-sm border-b border-gray-200 dark:border-gray-700">
                <th className="p-5 font-medium">User Name</th>
                <th className="p-5 font-medium">Requested Stage Name</th>
                <th className="p-5 font-medium">Email</th>
                <th className="p-5 font-medium">Status</th>
                <th className="p-5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {artistRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No requests found.
                  </td>
                </tr>
              ) : (
                artistRequests.map((req) => (
                  <tr
                    key={req.id}
                    className="border-b border-gray-100 dark:border-gray-750 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                  >
                    <td className="p-5 text-gray-900 dark:text-white">
                      {req.user_display_name}
                    </td>
                    <td className="p-5 font-bold text-gray-900 dark:text-white">
                      {req.stage_name}
                    </td>
                    <td className="p-5 text-gray-600 dark:text-gray-300">
                      {req.user_email}
                    </td>
                    <td className="p-5">
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase ${
                          req.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : req.status === "approved"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="p-5 flex justify-end gap-3">
                      <button
                        onClick={() => window.open(req.portfolio, "_blank")}
                        className="px-4 py-2 text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-colors"
                      >
                        Portfolio
                      </button>
                      {req.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleApproveArtist(req.id)}
                            className="px-4 py-2 text-xs font-bold bg-green-50 text-green-600 hover:bg-green-100 rounded-xl transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectArtist(req.id)}
                            className="px-4 py-2 text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
