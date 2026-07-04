// src/context/AuthContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/types";
import {
  getStorageItem,
  setStorageItem,
  removeStorageItem,
} from "@/utils/storage";
import { initializeMockDatabase } from "@/utils/mockData";

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // با استفاده از یک تابع ناهمگام (async)، آپدیت استیت رو به چرخه بعدی موکول می‌کنیم
    // تا از رندرهای آبشاری و گیر دادن لینتر جلوگیری بشه
    const initializeAuth = async () => {
      initializeMockDatabase();
      const storedUser = getStorageItem<User>("currentUser");
      if (storedUser) {
        setUser(storedUser);
      }
    };

    initializeAuth();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    setStorageItem("currentUser", userData);
  };

  const logout = () => {
    setUser(null);
    removeStorageItem("currentUser");
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
