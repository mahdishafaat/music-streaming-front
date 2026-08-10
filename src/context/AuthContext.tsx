// src/context/AuthContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  // تابع لاگین حالا توکن‌ها رو هم دریافت می‌کنه
  login: (userData: User, tokens: { access: string; refresh: string }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      // این خط باعث میشه آپدیت استیت از حالت همگام خارج بشه و لینتر دیگه خطا نده
      await Promise.resolve();

      const storedUser = localStorage.getItem("user");
      const accessToken = localStorage.getItem("access_token");

      if (storedUser && accessToken) {
        setUser(JSON.parse(storedUser));
      }
    };

    initializeAuth();
  }, []);

  const login = (
    userData: User,
    tokens: { access: string; refresh: string },
  ) => {
    setUser(userData);
    // ذخیره اطلاعات کاربر و توکن‌های JWT در مرورگر
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("access_token", tokens.access);
    localStorage.setItem("refresh_token", tokens.refresh);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
