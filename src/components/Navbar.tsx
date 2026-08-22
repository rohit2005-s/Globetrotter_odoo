"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Compass,
  MapPin,
  Calendar,
  Layers,
  PlusCircle,
  User,
  LogOut,
  ShieldCheck,
  Globe,
  Sparkles,
  ChevronDown,
  Menu,
  X,
  Heart,
  Settings,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout, openAuthModal, demoLogin, currency, setCurrency } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);

  const navLinks = [
    { name: "Dashboard", href: "/", icon: Compass },
    { name: "My Trips", href: "/trips", icon: Calendar },
    { name: "Explore Cities", href: "/cities", icon: MapPin },
    { name: "Activities", href: "/activities", icon: Layers },
    ...(user?.role === "ADMIN" ? [{ name: "Admin Hub", href: "/admin", icon: ShieldCheck }] : []),
  ];

  const currencies = ["USD", "EUR", "GBP", "JPY", "INR", "AUD", "CAD", "SGD", "AED"];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Globe className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                Globe<span className="text-emerald-600 dark:text-emerald-400">Trotter</span>
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 -mt-1">
                Travel Planner
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`} />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Action Controls & User Auth */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Quick Demo Switcher for judges */}
          <div className="flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 p-1 text-xs border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 px-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> Demo:
            </span>
            <button
              onClick={() => demoLogin("USER")}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                user?.role === "USER"
                  ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
              }`}
            >
              Traveler
            </button>
            <button
              onClick={() => demoLogin("ADMIN")}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                user?.role === "ADMIN"
                  ? "bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
              }`}
            >
              Admin
            </button>
          </div>

          {/* Currency Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 shadow-sm"
            >
              <span>{currency}</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>
            {isCurrencyOpen && (
              <div className="absolute right-0 mt-2 w-28 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 shadow-xl z-50 animate-in fade-in">
                {currencies.map((curr) => (
                  <button
                    key={curr}
                    onClick={() => {
                      setCurrency(curr);
                      setIsCurrencyOpen(false);
                    }}
                    className={`flex w-full items-center justify-between px-3 py-1.5 text-xs ${
                      currency === curr
                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 font-bold"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    <span>{curr}</span>
                    {currency === curr && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Plan New Trip CTA */}
          <Link
            href="/trips/new"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 hover:from-emerald-500 hover:to-teal-500 active:scale-95 transition-all"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Plan New Trip</span>
          </Link>

          {/* User Profile / Auth Button */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 p-1 hover:ring-2 hover:ring-emerald-500/30 transition-all"
              >
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                  alt={user.name}
                  className="h-8 w-8 rounded-full object-cover bg-emerald-100"
                />
                <span className="hidden xl:inline text-xs font-semibold text-slate-800 dark:text-slate-200 pr-1">
                  {user.name.split(" ")[0]}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400 pr-1" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 shadow-2xl z-50">
                  <div className="border-b border-slate-100 dark:border-slate-700 px-3 py-2">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    <span className="mt-1 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {user.role}
                    </span>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      <User className="h-4 w-4 text-slate-400" />
                      <span>My Profile & Settings</span>
                    </Link>
                    <Link
                      href="/trips"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span>My Trips & Itineraries</span>
                    </Link>
                    <Link
                      href="/profile#wishlist"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      <Heart className="h-4 w-4 text-rose-500" />
                      <span>Saved Wishlist</span>
                    </Link>
                    {user.role === "ADMIN" && (
                      <Link
                        href="/admin"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40"
                      >
                        <ShieldCheck className="h-4 w-4 text-purple-500" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-700 pt-1">
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        logout();
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      <LogOut className="h-4 w-4 text-red-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openAuthModal("login")}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Log In
              </button>
              <button
                onClick={() => openAuthModal("signup")}
                className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 shadow-sm"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-2 md:hidden">
          <Link
            href="/trips/new"
            className="flex items-center justify-center rounded-lg bg-emerald-600 p-2 text-white shadow-sm"
          >
            <PlusCircle className="h-5 w-5" />
          </Link>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {isMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-6 space-y-3">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 font-bold"
                      : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon className="h-5 w-5 text-emerald-600" />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Demo Switch:</span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  demoLogin("USER");
                  setIsMenuOpen(false);
                }}
                className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-emerald-600"
              >
                Traveler
              </button>
              <button
                onClick={() => {
                  demoLogin("ADMIN");
                  setIsMenuOpen(false);
                }}
                className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-purple-600"
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
