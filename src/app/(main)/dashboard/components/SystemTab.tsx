"use client";

import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/config/api";

type DashboardStats = {
  current_month_revenue: number;
  active_users: number;
  subscription_distribution: { base: number; silver: number; gold: number };
};

type PlanPrice = {
  id: number;
  duration_months: number;
  price: string;
  is_active: boolean;
};
type Plan = { id: number; name: string; prices: PlanPrice[] };

export default function SystemTab() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null,
  );
  const [statsLoading, setStatsLoading] = useState(true);

  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [updatingPrice, setUpdatingPrice] = useState<{
    [key: number]: boolean;
  }>({});

  const fetchDashboardStats = async () => {
    setStatsLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_BASE_URL}/subscriptions/admin/dashboard/stats/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) {
        const data = await res.json();
        setDashboardStats(data);
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchPlans = async () => {
    setPlansLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_BASE_URL}/subscriptions/admin/plans/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPlans(data);
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
    } finally {
      setPlansLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    fetchPlans();
  }, []);

  const handlePriceChange = (
    planId: number,
    priceId: number,
    newPrice: number,
  ) => {
    setPlans((prevPlans) =>
      prevPlans.map((plan) =>
        plan.id === planId
          ? {
              ...plan,
              prices: plan.prices.map((p) =>
                p.id === priceId ? { ...p, price: newPrice.toString() } : p,
              ),
            }
          : plan,
      ),
    );
  };

  const handleUpdatePrice = async (priceId: number) => {
    const priceObj = plans
      .flatMap((p) => p.prices)
      .find((p) => p.id === priceId);
    if (!priceObj) return;

    setUpdatingPrice((prev) => ({ ...prev, [priceId]: true }));
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_BASE_URL}/subscriptions/admin/subscription-prices/${priceId}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ price: parseFloat(priceObj.price) }),
        },
      );
      if (res.ok) {
        alert("Price updated successfully!");
        fetchPlans();
      } else {
        const error = await res.json().catch(() => ({}));
        alert(`Failed to update: ${error.detail || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error updating price:", error);
      alert("Network error");
    } finally {
      setUpdatingPrice((prev) => ({ ...prev, [priceId]: false }));
    }
  };

  const stats = dashboardStats;
  const totalSubscribers = stats
    ? stats.subscription_distribution.base +
      stats.subscription_distribution.silver +
      stats.subscription_distribution.gold
    : 0;
  const basePct = totalSubscribers
    ? (stats?.subscription_distribution.base / totalSubscribers) * 100
    : 0;
  const silverPct = totalSubscribers
    ? (stats?.subscription_distribution.silver / totalSubscribers) * 100
    : 0;
  const goldPct = totalSubscribers
    ? (stats?.subscription_distribution.gold / totalSubscribers) * 100
    : 0;

  return (
    <div className="animate-fade-in flex flex-col gap-10">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-4">
        System Settings & Reports
      </h2>

      {statsLoading ? (
        <div className="p-8 text-center text-gray-500">
          Loading dashboard stats...
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl text-white shadow-lg shadow-green-500/20">
                <p className="text-sm font-medium text-green-100 mb-2 tracking-wide">
                  Current Month Revenue
                </p>
                <h4 className="text-4xl font-black break-all">
                  {stats.current_month_revenue.toLocaleString()} Rials
                </h4>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white shadow-lg shadow-blue-500/20">
                <p className="text-sm font-medium text-blue-100 mb-2 tracking-wide">
                  Active Users
                </p>
                <h4 className="text-4xl font-black">
                  {stats.active_users.toLocaleString()}
                </h4>
              </div>
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
                  Base Plan ({Math.round(basePct)}%)
                </li>
                <li className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                  <span className="w-4 h-4 rounded-full bg-blue-500 shadow-sm"></span>{" "}
                  Silver Plan ({Math.round(silverPct)}%)
                </li>
                <li className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                  <span className="w-4 h-4 rounded-full bg-yellow-500 shadow-sm"></span>{" "}
                  Gold Plan ({Math.round(goldPct)}%)
                </li>
              </ul>
            </div>
            <div
              className="w-40 h-40 rounded-full shadow-inner border-[6px] border-white dark:border-gray-800"
              style={{
                background: `conic-gradient(#3B82F6 0% ${silverPct}%, #EAB308 ${silverPct}% ${silverPct + goldPct}%, #9CA3AF ${silverPct + goldPct}% 100%)`,
              }}
            ></div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-red-500">
          Failed to load stats.
        </div>
      )}

      <section className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-8">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Manage Subscription Prices
        </h3>
        {plansLoading ? (
          <div className="p-4 text-center text-gray-500">Loading plans...</div>
        ) : plans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm"
              >
                <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-2">
                  {plan.name}
                </h4>
                <div className="space-y-3">
                  {plan.prices.map((price) => (
                    <div
                      key={price.id}
                      className="flex flex-wrap items-center gap-2"
                    >
                      <span className="text-sm text-gray-600 dark:text-gray-300 min-w-[65px]">
                        {price.is_active ? "Active" : "Inactive"}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-300 min-w-[45px]">
                        {price.duration_months}m
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        value={parseFloat(price.price)}
                        onChange={(e) =>
                          handlePriceChange(
                            plan.id,
                            price.id,
                            parseFloat(e.target.value),
                          )
                        }
                        className="w-24 px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 text-sm"
                      />
                      <button
                        onClick={() => handleUpdatePrice(price.id)}
                        disabled={updatingPrice[price.id]}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded text-sm transition-colors"
                      >
                        {updatingPrice[price.id] ? "Saving..." : "Update"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500">No plans found.</div>
        )}
      </section>
    </div>
  );
}
