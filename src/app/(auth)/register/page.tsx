// src/app/(auth)/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // فیلدهای مطابق با ListenerRegistrationSerializer بک‌اند
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("male"); // مقدار پیش‌فرض
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  // State نمایش حریم خصوصی
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    // اعتبارسنجی اولیه پسورد در فرانت‌اند
    if (password !== password2) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      // ارسال درخواست به اندپوینت بک‌اند
      const response = await fetch(
        "http://127.0.0.1:8000/accounts/register/listener/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            display_name: displayName,
            birth_date: birthDate,
            gender,
            password,
            password2,
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        // هدایت به صفحه لاگین پس از ثبت‌نام موفق
        router.push("/login?registered=true");
      } else {
        // مدیریت خطاهای دریافتی از جنگو (مثلا ایمیل تکراری یا فرمت اشتباه)
        const firstError = Object.values(data)[0] as string[];
        setError(firstError[0] || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Registration Error:", error);
      setError("Failed to connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 py-12">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-600 mb-2">
            Create Account
          </h1>
          <p className="text-gray-500">Join the Spotify Clone platform</p>
        </div>

        {/* نمایش پیام خطا در صورت وجود */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100 text-center">
            {error}
          </div>
        )}

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
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-400 transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Gender
              </label>
              <select
                required
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-400 transition-all"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

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

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              required
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-400 transition-all"
              placeholder="Repeat your password"
            />
          </div>

          <div className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              required
              id="privacy"
              className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500 cursor-pointer"
            />
            <label htmlFor="privacy" className="text-sm text-gray-600">
              I accept the{" "}
              <span
                onClick={(e) => {
                  e.preventDefault();
                  setShowPrivacyPolicy(true);
                }}
                className="text-green-600 cursor-pointer hover:underline font-medium"
              >
                Privacy Policy
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 text-white font-medium py-3 rounded-xl hover:bg-green-700 transition-colors mt-4 disabled:opacity-70"
          >
            {isLoading ? "Creating Account..." : "Sign Up"}
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl border border-gray-100 flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-green-700">
                Privacy Policy
              </h2>
              <button
                onClick={() => setShowPrivacyPolicy(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors text-xl font-bold"
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
              className="mt-6 w-full bg-green-50 text-green-700 font-bold py-3 rounded-xl hover:bg-green-100 transition-colors border border-green-100"
            >
              I Understand
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
