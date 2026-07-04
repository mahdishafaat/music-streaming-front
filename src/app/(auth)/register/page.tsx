// src/app/(auth)/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { User } from "@/types";

export default function RegisterPage() {
  const [accountType, setAccountType] = useState<"LISTENER" | "ARTIST">(
    "LISTENER",
  );
  const router = useRouter();
  const { login } = useAuth();

  // فیلدهای مشترک
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // فیلدهای شنونده
  const [displayName, setDisplayName] = useState("");

  // فیلدهای هنرمند
  const [stageName, setStageName] = useState("");
  const [portfolio, setPortfolio] = useState("");

  // State جدید برای کنترل نمایش حریم خصوصی
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    if (accountType === "LISTENER") {
      const newUser: User = {
        id: `user_${Date.now()}`,
        username: `user_${Math.floor(Math.random() * 10000)}`, // سیستم نام کاربری اختصاص می‌دهد
        displayName: displayName,
        email: email,
        role: "LISTENER",
        subscription: "BASE",
        followersCount: 0,
        followingCount: 0,
      };
      login(newUser);
      router.push("/");
    } else {
      // فرم هنرمند در فاز واقعی به بک‌اند ارسال می‌شود و در وضعیت انتظار قرار می‌گیرد
      alert(
        "Your request as an artist has been submitted and is pending approval from support.",
      );
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 py-12">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-green-600 mb-2">
            Create Account
          </h1>
          <p className="text-gray-500">Join the Spotify Clone platform</p>
        </div>

        {/* انتخابگر نوع حساب کاربری */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-8">
          <button
            type="button"
            onClick={() => setAccountType("LISTENER")}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              accountType === "LISTENER"
                ? "bg-white text-green-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Listener
          </button>
          <button
            type="button"
            onClick={() => setAccountType("ARTIST")}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              accountType === "ARTIST"
                ? "bg-white text-green-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Artist
          </button>
        </div>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-400 transition-all"
              placeholder="Enter your email"
            />
          </div>

          {accountType === "LISTENER" ? (
            // فرم مخصوص کاربران عادی
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-400 transition-all"
                  placeholder="How should we call you?"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Birth Date
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-400 transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Gender
                  </label>
                  <select
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-400 transition-all"
                  >
                    <option value="">Select...</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </>
          ) : (
            // فرم مخصوص هنرمندان
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Stage Name
                </label>
                <input
                  type="text"
                  required
                  value={stageName}
                  onChange={(e) => setStageName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-400 transition-all"
                  placeholder="Your artist name"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Portfolio Link
                </label>
                <input
                  type="url"
                  required
                  value={portfolio}
                  onChange={(e) => setPortfolio(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-400 transition-all"
                  placeholder="Link to your previous works"
                />
              </div>
            </>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-400 transition-all"
              placeholder="Create a password"
            />
          </div>

          {accountType === "LISTENER" && (
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                required
                id="privacy"
                className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
              />
              <label htmlFor="privacy" className="text-sm text-gray-600">
                I accept the{" "}
                <span
                  onClick={() => setShowPrivacyPolicy(true)}
                  className="text-green-600 cursor-pointer hover:underline"
                >
                  Privacy Policy
                </span>
              </label>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-green-600 text-white font-medium py-3 rounded-xl hover:bg-green-700 transition-colors mt-4"
          >
            {accountType === "LISTENER" ? "Sign Up" : "Submit Application"}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6 text-sm">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-green-600 hover:text-green-700 font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
      {/* مُدال حریم خصوصی */}
      {showPrivacyPolicy && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl border border-gray-100 flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-green-700">
                Privacy Policy
              </h2>
              <button
                onClick={() => setShowPrivacyPolicy(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 text-sm text-gray-600 flex flex-col gap-3">
              <p>
                <strong>1. Data Collection:</strong> We collect your display
                name, email, and birth date strictly for providing personalized
                music streaming services.
              </p>
              <p>
                <strong>2. Data Usage:</strong> Your listening history is saved
                locally in this phase. Once fully deployed, it will be securely
                stored to recommend new tracks and calculate artist payouts.
              </p>
              <p>
                <strong>3. User Rights:</strong> You have the right to request
                deletion of your account and all associated data at any time
                through the application settings.
              </p>
            </div>

            <button
              onClick={() => setShowPrivacyPolicy(false)}
              className="mt-6 w-full bg-green-100 text-green-700 font-medium py-3 rounded-xl hover:bg-green-200 transition-colors"
            >
              I Understand
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
