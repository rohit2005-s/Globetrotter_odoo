"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  bio?: string | null;
  homeCountry?: string | null;
  currency: string;
  language: string;
  role: string;
  tripCount?: number;
  savedCount?: number;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  currency: string;
  setCurrency: (curr: string) => void;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (data: any) => Promise<boolean>;
  demoLogin: (role?: "USER" | "ADMIN") => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthModalOpen: boolean;
  authModalMode: "login" | "signup" | "forgot";
  openAuthModal: (mode?: "login" | "signup" | "forgot") => void;
  closeAuthModal: () => void;
  toasts: ToastMessage[];
  showToast: (message: string, type?: "success" | "error" | "info" | "warning") => void;
  removeToast: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currency, setCurrencyState] = useState("USD");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "signup" | "forgot">("login");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: "success" | "error" | "info" | "warning" = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const setCurrency = (curr: string) => {
    setCurrencyState(curr);
    localStorage.setItem("gt_currency", curr);
  };

  const refreshUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        if (data.user?.currency) {
          setCurrencyState(data.user.currency);
        }
      } else {
        setUser(null);
      }
    } catch (e) {
      console.error("Failed to load user:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const savedCurr = localStorage.getItem("gt_currency");
    if (savedCurr) setCurrencyState(savedCurr);
    refreshUser();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Login failed", "error");
        return false;
      }
      setUser(data.user);
      if (data.user.currency) setCurrencyState(data.user.currency);
      setIsAuthModalOpen(false);
      showToast(`Welcome back, ${data.user.name}!`, "success");
      return true;
    } catch (e: any) {
      showToast(e.message || "Network error", "error");
      return false;
    }
  };

  const signup = async (formData: any): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Signup failed", "error");
        return false;
      }
      setUser(data.user);
      setIsAuthModalOpen(false);
      showToast(`Account created! Welcome to GlobeTrotter, ${data.user.name}!`, "success");
      return true;
    } catch (e: any) {
      showToast(e.message || "Network error", "error");
      return false;
    }
  };

  const demoLogin = async (role: "USER" | "ADMIN" = "USER"): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/demo-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Demo login failed", "error");
        return false;
      }
      setUser(data.user);
      if (data.user.currency) setCurrencyState(data.user.currency);
      setIsAuthModalOpen(false);
      showToast(`Logged in as ${role === "ADMIN" ? "Admin (Eleanor)" : "Demo Traveler (Alex)"}!`, "success");
      return true;
    } catch (e: any) {
      showToast(e.message || "Demo login error", "error");
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      showToast("Logged out successfully", "info");
    } catch (e) {
      console.error(e);
    }
  };

  const openAuthModal = (mode: "login" | "signup" | "forgot" = "login") => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        currency,
        setCurrency,
        login,
        signup,
        demoLogin,
        logout,
        refreshUser,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
