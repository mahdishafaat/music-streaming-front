// src/context/AuthContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/types";
import {
  getStorageItem,
  setStorageItem,
  removeStorageItem,
} from "@/utils/storage";

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}

// ایجاد کانتکست با مقدار اولیه نامشخص
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // حل مشکل هیدریشن (Hydration) در نکست‌جی‌اس
    setIsMounted(true);

    // موقع لود شدن برنامه، چک می‌کنیم آیا کاربری تو لوکال استوریج هست یا نه
    const storedUser = getStorageItem<User>("currentUser");
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    setStorageItem("currentUser", userData);
  };

  const logout = () => {
    setUser(null);
    removeStorageItem("currentUser");
  };

  // تا زمانی که کامپوننت روی کلاینت سوار نشده، چیزی رندر نمی‌کنیم تا خطای تطابق سرور/کلاینت نگیریم
  if (!isMounted) return null;

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// یک هوک کاستوم برای استفاده راحت‌تر از کانتکست
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
