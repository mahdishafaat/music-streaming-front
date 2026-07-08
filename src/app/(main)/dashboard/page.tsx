// src/app/(main)/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

type Tab = "artists" | "tickets" | "audit" | "system";
type ArtistRequest = {
  id: string;
  name: string;
  email: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  portfolioUrl: string;
};
type Ticket = {
  id: string;
  userName: string;
  subject: string;
  date: string;
  status: "OPEN" | "ANSWERED" | "CLOSED";
};
type Audit = {
  artistId: string;
  name: string;
  listeners: number;
  streams: number;
  reward: number;
  status: "PENDING" | "SETTLED";
};

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("artists");

  const [artistRequests, setArtistRequests] = useState<ArtistRequest[]>([
    {
      id: "req_1",
      name: "Dua Lipa",
      email: "dua@example.com",
      status: "PENDING",
      portfolioUrl: "https://spotify.com/dualipa",
    },
    {
      id: "req_2",
      name: "Martin Garrix",
      email: "martin@example.com",
      status: "PENDING",
      portfolioUrl: "https://soundcloud.com/martin",
    },
  ]);

  const [tickets, setTickets] = useState<Ticket[]>([
    {
      id: "TCK-101",
      userName: "john_doe",
      subject: "Subscription payment issue",
      date: "2023-10-25",
      status: "OPEN",
    },
    {
      id: "TCK-102",
      userName: "sara_smith",
      subject: "My song is not playing",
      date: "2023-10-24",
      status: "ANSWERED",
    },
  ]);

  const [audits, setAudits] = useState<Audit[]>([
    {
      artistId: "art_1",
      name: "The Weeknd",
      listeners: 1200000,
      streams: 4500000,
      reward: 4500,
      status: "PENDING",
    },
    {
      artistId: "art_2",
      name: "Daft Punk",
      listeners: 800000,
      streams: 2100000,
      reward: 2100,
      status: "SETTLED",
    },
  ]);

  const [silverPrice, setSilverPrice] = useState(4.99);
  const [goldPrice, setGoldPrice] = useState(9.99);

  const [activeTicketChat, setActiveTicketChat] = useState<Ticket | null>(null);

  useEffect(() => {
    if (user && user.role !== "ADMIN" && user.role !== "SUPPORT") {
      router.push("/");
    }
  }, [user, router]);

  if (!user) return <div className="p-10 text-center">Loading...</div>;
  if (user.role !== "ADMIN" && user.role !== "SUPPORT") return null;

  const isAdmin = user.role === "ADMIN";

  const handleApproveArtist = (id: string) => {
    setArtistRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status: "APPROVED" } : req)),
    );
    alert("Artist approved and notification sent successfully.");
  };

  const handleRejectArtist = (id: string) => {
    const reason = prompt("Please enter the reason for rejection:");
    if (reason) {
      setArtistRequests((prev) =>
        prev.map((req) =>
          req.id === id ? { ...req, status: "REJECTED" } : req,
        ),
      );
      alert(`Request rejected. Reason: ${reason}`);
    }
  };

  const handleSettlePayment = (artistId: string) => {
    setAudits((prev) =>
      prev.map((audit) =>
        audit.artistId === artistId ? { ...audit, status: "SETTLED" } : audit,
      ),
    );
    alert("Settlement approved successfully.");
  };

  const handleUpdatePrices = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Prices updated:\nSilver: $${silverPrice}\nGold: $${goldPrice}`);
  };

  const renderArtistsTab = () => (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Artist Approval Requests
      </h2>
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-sm border-b border-gray-200 dark:border-gray-700">
              <th className="p-5 font-medium">Artist Name</th>
              <th className="p-5 font-medium">Email</th>
              <th className="p-5 font-medium">Status</th>
              <th className="p-5 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {artistRequests.map((req) => (
              <tr
                key={req.id}
                className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <td className="p-5 font-bold text-gray-900 dark:text-white">
                  {req.name}
                </td>
                <td className="p-5 text-gray-600 dark:text-gray-300">
                  {req.email}
                </td>
                <td className="p-5">
                  <span
                    className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-wide ${
                      req.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-700"
                        : req.status === "APPROVED"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {req.status}
                  </span>
                </td>
                <td className="p-5 flex justify-end gap-3">
                  <button
                    onClick={() => window.open(req.portfolioUrl, "_blank")}
                    className="px-4 py-2 text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-colors"
                  >
                    View Portfolio
                  </button>
                  {req.status === "PENDING" && (
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTicketsTab = () => (
    <div className="animate-fade-in relative">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Support Tickets
      </h2>

      {activeTicketChat ? (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl flex flex-col h-[600px] shadow-sm">
          <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 rounded-t-2xl">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                Ticket: {activeTicketChat.id}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                User:{" "}
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {activeTicketChat.userName}
                </span>{" "}
                | Subject:{" "}
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {activeTicketChat.subject}
                </span>
              </p>
            </div>
            <button
              onClick={() => setActiveTicketChat(null)}
              className="px-5 py-2 bg-gray-200 dark:bg-gray-700 rounded-xl text-sm font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Go Back
            </button>
          </div>
          <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6">
            <div className="self-start max-w-[80%] bg-gray-100 dark:bg-gray-700 p-5 rounded-2xl rounded-tl-none">
              <p className="text-base text-gray-800 dark:text-gray-200 leading-relaxed">
                Hi, I bought a GOLD subscription but it is not active yet.
                Please help.
              </p>
              <span className="text-xs text-gray-400 mt-3 block font-medium">
                10:30 AM
              </span>
            </div>
            {activeTicketChat.status === "ANSWERED" && (
              <div className="self-end max-w-[80%] bg-green-50 dark:bg-green-900/40 border border-green-100 dark:border-green-800 text-green-900 dark:text-green-100 p-5 rounded-2xl rounded-tr-none">
                <p className="text-base leading-relaxed">
                  Hello. There was a payment gateway issue. Your account has
                  been activated manually.
                </p>
                <span className="text-xs opacity-70 mt-3 block font-medium">
                  11:15 AM
                </span>
              </div>
            )}
          </div>
          <div className="p-5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Type your reply here..."
                className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-green-500 dark:text-white"
              />
              <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3.5 rounded-xl font-bold transition-colors shadow-sm">
                Send
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-sm border-b border-gray-200 dark:border-gray-700">
                <th className="p-5 font-medium">Ticket ID</th>
                <th className="p-5 font-medium">User</th>
                <th className="p-5 font-medium">Subject</th>
                <th className="p-5 font-medium">Date</th>
                <th className="p-5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((tck) => (
                <tr
                  key={tck.id}
                  onClick={() => setActiveTicketChat(tck)}
                  className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer group"
                >
                  <td className="p-5 font-bold text-gray-900 dark:text-white group-hover:text-green-600 transition-colors">
                    {tck.id}
                  </td>
                  <td className="p-5 text-gray-600 dark:text-gray-300">
                    {tck.userName}
                  </td>
                  <td className="p-5 text-gray-600 dark:text-gray-300 truncate max-w-[300px]">
                    {tck.subject}
                  </td>
                  <td className="p-5 text-gray-500 text-sm">{tck.date}</td>
                  <td className="p-5">
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-wide ${
                        tck.status === "OPEN"
                          ? "bg-red-100 text-red-700"
                          : tck.status === "ANSWERED"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {tck.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderAuditTab = () => (
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
            {audits.map((audit) => (
              <tr
                key={audit.artistId}
                className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <td className="p-5">
                  <p className="font-bold text-gray-900 dark:text-white">
                    {audit.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{audit.artistId}</p>
                </td>
                <td className="p-5 font-medium text-gray-600 dark:text-gray-300">
                  {audit.listeners.toLocaleString()}
                </td>
                <td className="p-5 font-medium text-gray-600 dark:text-gray-300">
                  {audit.streams.toLocaleString()}
                </td>
                <td className="p-5 font-bold text-green-600 dark:text-green-400 text-lg">
                  ${audit.reward.toLocaleString()}
                </td>
                <td className="p-5">
                  <span
                    className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-wide ${
                      audit.status === "PENDING"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {audit.status === "PENDING" ? "Pending Payment" : "Settled"}
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSystemTab = () => (
    <div className="animate-fade-in flex flex-col gap-10">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-4">
        System Settings & Reports
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 shadow-sm">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-gray-900 dark:text-white">
            <svg
              className="w-6 h-6 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            Price Control Panel
          </h3>
          <form onSubmit={handleUpdatePrices} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Silver Subscription Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={silverPrice}
                onChange={(e) => setSilverPrice(parseFloat(e.target.value))}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 dark:text-white outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Gold Subscription Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={goldPrice}
                onChange={(e) => setGoldPrice(parseFloat(e.target.value))}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 dark:text-white outline-none transition-all"
              />
            </div>
            <button
              type="submit"
              className="mt-4 w-full bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 dark:text-black text-white font-bold py-3.5 rounded-xl transition-colors shadow-md"
            >
              Update Prices
            </button>
          </form>
        </div>

        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl text-white shadow-lg shadow-green-500/20">
              <p className="text-sm font-medium text-green-100 mb-2 tracking-wide">
                Current Month Revenue
              </p>
              <h4 className="text-4xl font-black">$42,500</h4>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white shadow-lg shadow-blue-500/20">
              <p className="text-sm font-medium text-blue-100 mb-2 tracking-wide">
                Active Users
              </p>
              <h4 className="text-4xl font-black">18.2K</h4>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm flex items-center justify-between h-full">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-5 text-lg">
                Subscription Distribution
              </h3>
              <ul className="text-sm flex flex-col gap-3 font-medium">
                <li className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                  <span className="w-4 h-4 rounded-full bg-gray-400"></span>{" "}
                  Base Plan (50%)
                </li>
                <li className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                  <span className="w-4 h-4 rounded-full bg-blue-500 shadow-sm"></span>{" "}
                  Silver Plan (30%)
                </li>
                <li className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                  <span className="w-4 h-4 rounded-full bg-yellow-500 shadow-sm"></span>{" "}
                  Gold Plan (20%)
                </li>
              </ul>
            </div>
            <div
              className="w-40 h-40 rounded-full shadow-inner border-[6px] border-white dark:border-gray-800"
              style={{
                background:
                  "conic-gradient(#3B82F6 0% 30%, #EAB308 30% 50%, #9CA3AF 50% 100%)",
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );

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
          className={`flex items-center gap-4 w-full text-left px-5 py-3.5 rounded-xl font-bold transition-all ${activeTab === "artists" ? "bg-green-600 text-white shadow-md shadow-green-600/20" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
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
          className={`flex items-center gap-4 w-full text-left px-5 py-3.5 rounded-xl font-bold transition-all ${activeTab === "tickets" ? "bg-green-600 text-white shadow-md shadow-green-600/20" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
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
              className={`flex items-center gap-4 w-full text-left px-5 py-3.5 rounded-xl font-bold transition-all ${activeTab === "audit" ? "bg-green-600 text-white shadow-md shadow-green-600/20" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
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
              className={`flex items-center gap-4 w-full text-left px-5 py-3.5 rounded-xl font-bold transition-all ${activeTab === "system" ? "bg-green-600 text-white shadow-md shadow-green-600/20" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
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
        {activeTab === "artists" && renderArtistsTab()}
        {activeTab === "tickets" && renderTicketsTab()}
        {isAdmin && activeTab === "audit" && renderAuditTab()}
        {isAdmin && activeTab === "system" && renderSystemTab()}
      </main>
    </div>
  );
}
