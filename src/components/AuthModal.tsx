"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { X, Mail, Lock, User, Sparkles, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function AuthModal() {
  const { isAuthModalOpen, authModalMode, openAuthModal, closeAuthModal, login, signup, demoLogin, showToast } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [homeCountry, setHomeCountry] = useState("United States");
  const [currency, setCurrency] = useState("USD");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (authModalMode === "login") {
      await login(email, password);
    } else if (authModalMode === "signup") {
      await signup({ name, email, password, homeCountry, currency });
    } else if (authModalMode === "forgot") {
      setForgotSent(true);
      showToast("Password reset instructions sent to your email!", "success");
    }

    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        {/* Header gradient bar */}
        <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"></div>

        <button
          onClick={closeAuthModal}
          className="absolute right-4 top-5 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Title & Tabs */}
          <div className="mb-6">
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {authModalMode === "login" && "Welcome back!"}
              {authModalMode === "signup" && "Start your journey"}
              {authModalMode === "forgot" && "Reset your password"}
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {authModalMode === "login" && "Sign in to access your customized itineraries and travel stats."}
              {authModalMode === "signup" && "Create an account to design and budget multi-city trips."}
              {authModalMode === "forgot" && "Enter your account email to receive a recovery link."}
            </p>

            {/* Tab switchers */}
            {authModalMode !== "forgot" && (
              <div className="mt-4 flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => openAuthModal("login")}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all ${
                    authModalMode === "login"
                      ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => openAuthModal("signup")}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all ${
                    authModalMode === "signup"
                      ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
                  }`}
                >
                  Create Account
                </button>
              </div>
            )}
          </div>

          {/* 1-Click Demo Buttons for Fast Evaluation */}
          {authModalMode !== "forgot" && (
            <div className="mb-6 rounded-2xl bg-emerald-50/70 p-3.5 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50">
              <div className="flex items-center gap-1.5 mb-2.5">
                <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  Hackathon 1-Click Instant Login
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => demoLogin("USER")}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 shadow-sm border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/50 transition-all"
                >
                  <User className="h-3.5 w-3.5" />
                  <span>Traveler (Alex)</span>
                </button>
                <button
                  type="button"
                  onClick={() => demoLogin("ADMIN")}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-purple-700 dark:text-purple-300 shadow-sm border border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/50 transition-all"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Admin (Eleanor)</span>
                </button>
              </div>
            </div>
          )}

          {/* Form */}
          {forgotSent ? (
            <div className="py-6 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Email Sent!</h3>
              <p className="text-xs text-slate-500">
                Please check your inbox for instructions to reset your password.
              </p>
              <button
                type="button"
                onClick={() => {
                  setForgotSent(false);
                  openAuthModal("login");
                }}
                className="mt-2 text-xs font-bold text-emerald-600 hover:underline"
              >
                Return to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {authModalMode === "signup" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Maya Lin"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {authModalMode !== "forgot" && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                    {authModalMode === "login" && (
                      <button
                        type="button"
                        onClick={() => openAuthModal("forgot")}
                        className="text-[11px] font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {authModalMode === "signup" && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Home Country
                    </label>
                    <input
                      type="text"
                      value={homeCountry}
                      onChange={(e) => setHomeCountry(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Currency
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="JPY">JPY (¥)</option>
                      <option value="INR">INR (₹)</option>
                    </select>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 transition-all"
              >
                <span>
                  {isSubmitting
                    ? "Processing..."
                    : authModalMode === "login"
                    ? "Sign In to Account"
                    : authModalMode === "signup"
                    ? "Complete Registration"
                    : "Send Reset Link"}
                </span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
