"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "@/config/api";

type ApiTicket = {
  id: number;
  user: { id: number; email: string; display_name: string };
  subject: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  created_at: string;
  updated_at: string;
};

type ApiMessage = {
  id: number;
  ticket: number;
  sender: { id: number; email: string; display_name: string };
  message: string;
  created_at: string;
};

const statusMap = {
  open: { label: "Open", className: "bg-red-100 text-red-700" },
  in_progress: {
    label: "In Progress",
    className: "bg-yellow-100 text-yellow-700",
  },
  resolved: { label: "Resolved", className: "bg-blue-100 text-blue-700" },
  closed: { label: "Closed", className: "bg-gray-100 text-gray-700" },
};

export default function TicketsTab() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<ApiTicket[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(true);
  const [ticketError, setTicketError] = useState<string | null>(null);

  const [activeTicket, setActiveTicket] = useState<ApiTicket | null>(null);
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [replyText, setReplyText] = useState("");

  const fetchTickets = async () => {
    setIsLoadingTickets(true);
    setTicketError(null);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_BASE_URL}/ticket/tickets/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Failed to fetch tickets: ${res.status}`);
      const data = await res.json();
      setTickets(data);
    } catch (error) {
      setTicketError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsLoadingTickets(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchMessages = async (ticketId: number) => {
    setIsLoadingMessages(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_BASE_URL}/ticket/tickets/${ticketId}/messages/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) throw new Error(`Failed to fetch messages: ${res.status}`);
      const data = await res.json();
      setMessages(data);
    } catch (error) {
      console.error("Error loading messages", error);
      alert("Could not load messages for this ticket.");
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleTicketClick = (ticket: ApiTicket) => {
    setActiveTicket(ticket);
    fetchMessages(ticket.id);
  };

  const handleBackToTickets = () => {
    setActiveTicket(null);
    setMessages([]);
    setReplyText("");
  };

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !replyText.trim()) return;

    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_BASE_URL}/ticket/tickets/${activeTicket.id}/messages/create/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message: replyText.trim() }),
        },
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to send reply");
      }

      const newMsg = await res.json();
      setMessages((prev) => [...prev, newMsg]);
      setReplyText("");
      await fetchTickets();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Network error");
    }
  };

  return (
    <div className="animate-fade-in relative">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Support Tickets
      </h2>

      {activeTicket ? (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl flex flex-col h-[600px] shadow-sm">
          <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 rounded-t-2xl">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                Ticket #{activeTicket.id}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                User:{" "}
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {activeTicket.user.display_name}
                </span>{" "}
                | Subject:{" "}
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {activeTicket.subject}
                </span>
              </p>
            </div>
            <button
              onClick={handleBackToTickets}
              className="px-5 py-2 bg-gray-200 dark:bg-gray-700 rounded-xl text-sm font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Go Back
            </button>
          </div>

          <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6">
            {isLoadingMessages ? (
              <p className="text-center text-gray-500">Loading messages...</p>
            ) : messages.length === 0 ? (
              <p className="text-center text-gray-500">No messages yet.</p>
            ) : (
              messages.map((msg) => {
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
                    <p className="text-base leading-relaxed">{msg.message}</p>
                    <span className="text-xs opacity-70 mt-3 block font-medium">
                      {new Date(msg.created_at).toLocaleString()}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl">
            <form onSubmit={sendReply} className="flex gap-3">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply here..."
                className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-green-500 dark:text-white"
                disabled={activeTicket?.status === "closed"}
              />
              <button
                type="submit"
                disabled={
                  activeTicket?.status === "closed" || !replyText.trim()
                }
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-8 py-3.5 rounded-xl font-bold transition-colors shadow-sm"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
          {isLoadingTickets ? (
            <div className="p-8 text-center text-gray-500">
              Loading tickets...
            </div>
          ) : ticketError ? (
            <div className="p-8 text-center text-red-500">
              Error: {ticketError}
            </div>
          ) : (
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
                {tickets.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                      No tickets found.
                    </td>
                  </tr>
                ) : (
                  tickets.map((tck) => {
                    const statusInfo =
                      statusMap[tck.status] || statusMap.closed;
                    return (
                      <tr
                        key={tck.id}
                        onClick={() => handleTicketClick(tck)}
                        className="border-b border-gray-100 dark:border-gray-750 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer group"
                      >
                        <td className="p-5 font-bold text-gray-900 dark:text-white group-hover:text-green-600 transition-colors">
                          #{tck.id}
                        </td>
                        <td className="p-5 text-gray-600 dark:text-gray-300">
                          {tck.user.display_name}
                        </td>
                        <td className="p-5 text-gray-600 dark:text-gray-300 truncate max-w-[300px]">
                          {tck.subject}
                        </td>
                        <td className="p-5 text-gray-500 text-sm">
                          {new Date(tck.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-5">
                          <span
                            className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-wide ${statusInfo.className}`}
                          >
                            {statusInfo.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
