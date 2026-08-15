// src/app/(main)/subscriptions/page.tsx
"use client";

import { useEffect, useState } from "react";

// ---------- Types ----------
interface Plan {
  id: number;
  name: string;
  max_daily_streams: number | null;
  max_playlists: number | null;
  can_upload_profile_image: boolean;
  can_download: boolean;
  can_early_access: boolean;
  can_view_statistics: boolean;
  is_active: boolean;
}

interface Price {
  id: number;
  plan: Plan;
  duration_months: number;
  price: string;
  is_active: boolean;
}

// ---------- Component ----------
export default function SubscriptionsPage() {
  const [prices, setPrices] = useState<Price[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---- API Helpers ----
  const getHeaders = (): HeadersInit => {
    const token = localStorage.getItem("access_token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        setLoading(true);
        // Change this URL according to your API base path
        const res = await fetch(`http://127.0.0.1:8000/subscriptions/prices/`, {
          headers: getHeaders(),
        });

        if (!res.ok) throw new Error("Failed to load subscription plans");

        const data: Price[] = await res.json();
        setPrices(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
  }, []);

  // Group prices by plan
  const plansMap = prices.reduce<
    Record<number, { plan: Plan; prices: Price[] }>
  >((acc, price) => {
    const planId = price.plan.id;
    if (!acc[planId]) {
      acc[planId] = { plan: price.plan, prices: [] };
    }
    acc[planId].prices.push(price);
    return acc;
  }, {});

  const plans = Object.values(plansMap);

  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (redirectUrl) {
      // Navigate when the state changes
      window.location.href = redirectUrl;
    }
  }, [redirectUrl]);

  const handleSelectPrice = async (priceId: number) => {
    try {
      const res = await fetch(
        "http://127.0.0.1:8000/subscriptions/payments/create/",
        {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({ price_id: priceId }),
        },
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to create payment");
      }

      const data = await res.json();
      // data = { payment_id, authority, payment_url }

      // Instead of window.location.href = ..., set the state
      setRedirectUrl(data.payment_url);
    } catch (err) {
      console.error(err);
      alert(
        err instanceof Error
          ? err.message
          : "Something went wrong while creating payment",
      );
    }
  };

  // ---------- UI ----------
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-lg text-red-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg bg-primary px-6 py-2 text-white"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Choose a Plan</h1>
        <p className="mt-2 text-muted-foreground">
          Select the plan that fits you best and enjoy premium features
        </p>
      </div>

      {plans.length === 0 ? (
        <p className="text-center text-muted-foreground">No plans found.</p>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {plans.map(({ plan, prices }) => (
            <div
              key={plan.id}
              className="flex flex-col rounded-2xl border bg-card p-6 shadow-sm transition hover:shadow-md"
            >
              {/* Plan Header */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold">{plan.name}</h2>

                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    {plan.max_daily_streams === null
                      ? "Unlimited daily streams"
                      : `Up to ${plan.max_daily_streams} daily streams`}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    {plan.max_playlists === null
                      ? "Unlimited playlists"
                      : `Up to ${plan.max_playlists} playlists`}
                  </li>
                  {plan.can_download && (
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      Download songs
                    </li>
                  )}
                  {plan.can_upload_profile_image && (
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      Upload profile image
                    </li>
                  )}
                  {plan.can_early_access && (
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      Early access
                    </li>
                  )}
                  {plan.can_view_statistics && (
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      View statistics
                    </li>
                  )}
                </ul>
              </div>

              {/* Price Options */}
              <div className="mt-auto space-y-3">
                {prices
                  .sort((a, b) => a.duration_months - b.duration_months)
                  .map((price) => (
                    <button
                      key={price.id}
                      onClick={() => handleSelectPrice(price.id)}
                      className="flex w-full items-center justify-between rounded-xl border bg-background px-4 py-3 text-left transition hover:border-primary hover:bg-primary/5"
                    >
                      <div>
                        <div className="font-medium">
                          {price.duration_months === 1
                            ? "1 Month"
                            : `${price.duration_months} Months`}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {Number(price.price).toLocaleString()} Toman
                        </div>
                      </div>
                      <span className="rounded-lg bg-primary px-3 py-1.5 text-sm text-primary-foreground">
                        Select
                      </span>
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
