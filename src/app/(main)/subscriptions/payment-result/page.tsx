"use client";

import { useSearchParams } from "next/navigation";

export default function PaymentResultPage() {
  const searchParams = useSearchParams();

  const status = searchParams.get("status");
  const isSuccess = status === "success";

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
        {isSuccess ? (
          <>
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-600">
              ✓
            </div>

            <h1 className="text-2xl font-bold">Payment Successful</h1>

            <p className="mt-3 text-muted-foreground">
              Your subscription payment was completed successfully.
            </p>
          </>
        ) : (
          <>
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl text-red-600">
              ✕
            </div>

            <h1 className="text-2xl font-bold">Payment Failed</h1>

            <p className="mt-3 text-muted-foreground">
              The payment was not completed successfully.
            </p>
          </>
        )}

        <a
          href="http://localhost:3000/profile"
          className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground transition hover:opacity-90"
        >
          Go to Profile
        </a>
      </div>
    </div>
  );
}