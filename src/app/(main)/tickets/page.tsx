// src/app/(main)/tickets/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from '@/config/api';
// ========== TYPES ==========
type Ticket = {
  id: number;
  user: {
    id: number;
    email: string;
    display_name: string;
  };
  subject: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  created_at: string;
  updated_at: string;
};

type Message = {
  id: number;
  ticket: number;
  sender: {
    id: number;
    email: string;
    display_name: string;
  };
  message: string;
  created_at: string;
};

// ========== STATUS MAP ==========
const statusMap: Record<Ticket["status"], { label: string; className: string }> = {
  open: { label: "Open", className: "bg-red-100 text-red-700" },
  in_progress: { label: "In Progress", className: "bg-yellow-100 text-yellow-700" },
  resolved: { label: "Resolved", className: "bg-blue-100 text-blue-700" },
  closed: { label: "Closed", className: "bg-gray-100 text-gray-700" },
};

export default function TicketsPage() {
  const { user } = useAuth();
  const router = useRouter();

  // ---- State ----
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active ticket (chat view)
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [replyText, setReplyText] = useState("");

  // New ticket modal
  const [showModal, setShowModal] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [creating, setCreating] = useState(false);

  // ---- API Helpers ----
  const getHeaders = (): HeadersInit => {
    const token = localStorage.getItem("access_token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  // ---- Fetch tickets ----
  const fetchTickets = async () => {
    setLoadingTickets(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/ticket/users/tickets/`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error("Failed to load tickets");
      const data = await res.json();
      setTickets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoadingTickets(false);
    }
  };

  // ---- Fetch messages for a ticket ----
  const fetchMessages = async (ticketId: number) => {
    setLoadingMessages(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/ticket/users/tickets/${ticketId}/messages/`,
        { headers: getHeaders() }
      );
      if (!res.ok) throw new Error("Failed to load messages");
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      alert("Could not load messages");
    } finally {
      setLoadingMessages(false);
    }
  };

  // ---- Send a reply ----
  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket) return;
    if (!replyText.trim()) return;

    try {
      const res = await fetch(
        `${API_BASE_URL}/ticket/tickets/${activeTicket.id}/messages/create/`,
        {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({ message: replyText.trim() }),
        }
      );
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to send reply");
      }
      const newMsg = await res.json();
      setMessages((prev) => [...prev, newMsg]);
      setReplyText("");
      // Optionally refresh ticket list to reflect status change
      fetchTickets();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Network error");
    }
  };

  // ---- Create a new ticket ----
  const createTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim()) {
      alert("Subject is required");
      return;
    }
    setCreating(true);
    try {
      // First, create the ticket
      const res = await fetch(`${API_BASE_URL}/ticket/tickets/create/`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ subject: newSubject.trim() }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to create ticket");
      }
      const newTicket: Ticket = await res.json();

      // If an initial message was provided, send it
      if (newMessage.trim()) {
        const msgRes = await fetch(
          `${API_BASE_URL}/ticket/tickets/${newTicket.id}/messages/`,
          {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({ message: newMessage.trim() }),
          }
        );
        if (!msgRes.ok) {
          console.warn("Ticket created but initial message failed");
        }
      }

      // Refresh the list and close modal
      await fetchTickets();
      setShowModal(false);
      setNewSubject("");
      setNewMessage("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Network error");
    } finally {
      setCreating(false);
    }
  };

  // ---- Click a ticket to view ----
  const handleTicketClick = async (ticket: Ticket) => {
    setActiveTicket(ticket);
    await fetchMessages(ticket.id);
  };

  // ---- Go back to list ----
  const handleBack = () => {
    setActiveTicket(null);
    setMessages([]);
    setReplyText("");
  };

  // ---- Initial load ----
  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    fetchTickets();
  }, [user, router]);

  // ---- Render helpers ----
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  // ---- Loading / Error screens ----
  if (!user) return null;

  // ---- Main render ----
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          My Support Tickets
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold transition-colors shadow-md"
        >
          + New Ticket
        </button>
      </div>

      {loadingTickets ? (
        <div className="text-center p-12 text-gray-500">Loading your tickets...</div>
      ) : error ? (
        <div className="text-center p-12 text-red-500">Error: {error}</div>
      ) : activeTicket ? (
        // ---- CHAT VIEW ----
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl flex flex-col h-[600px] shadow-sm">
          {/* Header */}
          <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 rounded-t-2xl">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                Ticket #{activeTicket.id}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Subject:{" "}
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {activeTicket.subject}
                </span>
                {" | "}
                Status:{" "}
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    statusMap[activeTicket.status].className
                  }`}
                >
                  {statusMap[activeTicket.status].label}
                </span>
              </p>
            </div>
            <button
              onClick={handleBack}
              className="px-5 py-2 bg-gray-200 dark:bg-gray-700 rounded-xl text-sm font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              ← Back
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6">
            {loadingMessages ? (
              <p className="text-center text-gray-500">Loading messages...</p>
            ) : messages.length === 0 ? (
              <p className="text-center text-gray-500">No messages yet. Start the conversation!</p>
            ) : (
              messages.map((msg) => {
                // const isSender = msg.sender.id === user?.id;
                const isSender = String(msg.sender.id) === String(user?.id);
                return (
                  <div
                    key={msg.id}
                    className={`max-w-[80%] p-5 rounded-2xl ${
                      isSender
                        ? "self-end bg-green-50 dark:bg-green-900/40 border border-green-100 dark:border-green-800 text-green-900 dark:text-green-100 rounded-tr-none"
                        : "self-start bg-gray-100 dark:bg-gray-700 rounded-tl-none"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">
                        {msg.sender.display_name}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatDate(msg.created_at)}
                      </span>
                    </div>
                    <p className="text-base leading-relaxed">{msg.message}</p>
                  </div>
                );
              })
            )}
          </div>

          {/* Reply form */}
          <div className="p-5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl">
            <form onSubmit={sendReply} className="flex gap-3">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply here..."
                className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-green-500 dark:text-white"
                disabled={activeTicket.status === "closed"}
              />
              <button
                type="submit"
                disabled={activeTicket.status === "closed" || !replyText.trim()}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-8 py-3.5 rounded-xl font-bold transition-colors shadow-sm"
              >
                Send
              </button>
            </form>
            {activeTicket.status === "closed" && (
              <p className="text-sm text-red-500 mt-2">This ticket is closed. You cannot reply.</p>
            )}
          </div>
        </div>
      ) : (
        // ---- TICKET LIST ----
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
          {tickets.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p className="text-lg">You have no tickets yet.</p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold transition-colors"
              >
                Create your first ticket
              </button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-sm border-b border-gray-200 dark:border-gray-700">
                  <th className="p-5 font-medium">Ticket ID</th>
                  <th className="p-5 font-medium">Subject</th>
                  <th className="p-5 font-medium">Status</th>
                  <th className="p-5 font-medium">Created</th>
                  <th className="p-5 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => {
                  const statusInfo = statusMap[ticket.status];
                  return (
                    <tr
                      key={ticket.id}
                      className="border-b border-gray-100 dark:border-gray-750 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                    >
                      <td className="p-5 font-bold text-gray-900 dark:text-white">
                        #{ticket.id}
                      </td>
                      <td className="p-5 text-gray-600 dark:text-gray-300 truncate max-w-[300px]">
                        {ticket.subject}
                      </td>
                      <td className="p-5">
                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-wide ${statusInfo.className}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="p-5 text-gray-500 text-sm">
                        {formatDate(ticket.created_at)}
                      </td>
                      <td className="p-5">
                        <button
                          onClick={() => handleTicketClick(ticket)}
                          className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-xs font-bold transition-colors"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ---- Modal: Create Ticket ---- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Create New Ticket
            </h2>
            <form onSubmit={createTicket}>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="Brief summary of your issue"
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 dark:text-white outline-none"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Initial Message (optional)
                </label>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Describe your issue in detail..."
                  rows={4}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 dark:text-white outline-none resize-none"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setNewSubject("");
                    setNewMessage("");
                  }}
                  className="px-5 py-2.5 bg-gray-200 dark:bg-gray-700 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !newSubject.trim()}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-5 py-2.5 rounded-xl font-bold transition-colors shadow-md"
                >
                  {creating ? "Creating..." : "Create Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}