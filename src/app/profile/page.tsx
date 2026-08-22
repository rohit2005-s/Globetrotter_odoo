"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency } from "@/lib/utils";
import {
  User,
  Settings,
  Heart,
  Calendar,
  Globe,
  MapPin,
  Mail,
  Save,
  Trash2,
  Sparkles,
  DollarSign,
  Compass,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default function ProfilePage() {
  const { user, currency, setCurrency, showToast, refreshUser, logout } = useAuth();
  const [profileData, setProfileData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Form edit states
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [homeCountry, setHomeCountry] = useState("United States");
  const [userCurrency, setUserCurrency] = useState("USD");
  const [language, setLanguage] = useState("English");
  const [isSaving, setIsSaving] = useState(false);

  // Active subtab
  const [activeTab, setActiveTab] = useState<"profile" | "wishlist" | "stats">("profile");

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/user/profile");
      if (res.ok) {
        const data = await res.json();
        setProfileData(data);
        setName(data.user?.name || "");
        setBio(data.user?.bio || "");
        setAvatar(data.user?.avatar || "");
        setHomeCountry(data.user?.homeCountry || "United States");
        setUserCurrency(data.user?.currency || "USD");
        setLanguage(data.user?.language || "English");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          bio,
          avatar,
          homeCountry,
          currency: userCurrency,
          language,
        }),
      });

      if (res.ok) {
        setCurrency(userCurrency);
        await refreshUser();
        showToast("Profile & preferences updated successfully!", "success");
      } else {
        const data = await res.json();
        showToast(data.error || "Update failed", "error");
      }
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const removeSavedDestination = async (cityId: string) => {
    try {
      const res = await fetch("/api/user/saved-destinations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cityId }),
      });
      if (res.ok) {
        showToast("Destination removed from wishlist", "info");
        loadProfile();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl py-20 text-center space-y-4">
        <div className="h-12 w-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-bold text-slate-500">Loading user profile...</p>
      </div>
    );
  }

  const stats = profileData?.stats || {
    totalTrips: 0,
    countriesCount: 0,
    totalDaysPlanned: 0,
    totalBudgetSum: 0,
    savedDestinationsCount: 0,
  };

  const wishlist = profileData?.savedDestinations || [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Profile Header Card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row items-center gap-6">
        <div className="relative">
          <img
            src={avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`}
            alt={name}
            className="h-24 w-24 rounded-3xl object-cover bg-emerald-100 ring-4 ring-emerald-500/20"
          />
          <span className="absolute -bottom-2 -right-2 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-black text-white shadow">
            {profileData?.user?.role || "USER"}
          </span>
        </div>

        <div className="flex-1 text-center sm:text-left space-y-1">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">{name}</h1>
          <p className="text-xs text-slate-500">{profileData?.user?.email}</p>
          <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed pt-1">
            {bio || "Exploring world destinations with personalized itinerary builder."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/trips/new"
            className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-emerald-500"
          >
            Plan Trip
          </Link>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === "profile"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          }`}
        >
          <Settings className="h-4 w-4" />
          <span>Profile & Preferences</span>
        </button>

        <button
          onClick={() => setActiveTab("wishlist")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === "wishlist"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          }`}
        >
          <Heart className="h-4 w-4 text-rose-500" />
          <span>Wishlist ({wishlist.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("stats")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === "stats"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          }`}
        >
          <Compass className="h-4 w-4 text-cyan-500" />
          <span>Travel Statistics</span>
        </button>
      </div>

      {/* Tab 1: Profile & Preferences Form */}
      {activeTab === "profile" && (
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <User className="h-4 w-4 text-emerald-600" />
              <span>Personal Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Home Country</label>
                <input
                  type="text"
                  value={homeCountry}
                  onChange={(e) => setHomeCountry(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-xs">
                Profile Bio & Travel Style
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your travel interests..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              ></textarea>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-xs">
                Avatar Image URL (Optional)
              </label>
              <input
                type="url"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-amber-500" />
              <span>Preferences & Localization</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Default Display Currency
                </label>
                <select
                  value={userCurrency}
                  onChange={(e) => setUserCurrency(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="AUD">AUD (A$)</option>
                  <option value="CAD">CAD (C$)</option>
                  <option value="SGD">SGD (S$)</option>
                  <option value="AED">AED (AED)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Preferred Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="English">English</option>
                  <option value="Spanish">Español</option>
                  <option value="French">Français</option>
                  <option value="German">Deutsch</option>
                  <option value="Japanese">日本語</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={logout}
              className="rounded-2xl border border-rose-200 px-5 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-400 dark:hover:bg-rose-950/50"
            >
              Sign Out Account
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-7 py-3 text-xs font-bold text-white shadow-lg hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 transition-all"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? "Saving Settings..." : "Save Preferences"}</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Saved Destinations Wishlist */}
      {activeTab === "wishlist" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              My Saved Travel Wishlist ({wishlist.length})
            </h3>
            <Link
              href="/cities"
              className="text-xs font-bold text-emerald-600 hover:underline"
            >
              Explore More Cities
            </Link>
          </div>

          {wishlist.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center space-y-3 dark:border-slate-800 bg-white dark:bg-slate-900">
              <Heart className="h-10 w-10 text-rose-400 mx-auto" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Your wishlist is empty</h4>
              <p className="text-xs text-slate-500">
                Browse our global destinations and tap the heart icon to save favorite cities here!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlist.map((city: any) => (
                <div
                  key={city.id}
                  className="group overflow-hidden rounded-3xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
                >
                  <div className="relative h-44 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={city.coverImage}
                      alt={city.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                    <button
                      onClick={() => removeSavedDestination(city.id)}
                      className="absolute top-3 right-3 rounded-full bg-rose-600 p-1.5 text-white shadow hover:bg-rose-700"
                      title="Remove from Wishlist"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>

                    <div className="absolute bottom-3 left-4 right-4">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                        {city.country} • {city.region}
                      </span>
                      <h4 className="text-lg font-black text-white">{city.name}</h4>
                    </div>
                  </div>

                  <div className="p-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 text-xs">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatCurrency(city.avgDailyCost, currency)}/day
                    </span>

                    <Link
                      href={`/trips/new?cityId=${city.id}`}
                      className="rounded-xl bg-emerald-600 px-3 py-1.5 font-bold text-white shadow hover:bg-emerald-500"
                    >
                      Plan Trip
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Personal Travel Statistics */}
      {activeTab === "stats" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-400 block">Total Trips Planned</span>
              <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                {stats.totalTrips}
              </p>
              <span className="text-[10px] text-slate-400">Across customized routes</span>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-400 block">Countries Visited</span>
              <p className="text-3xl font-black text-cyan-600 dark:text-cyan-400">
                {stats.countriesCount}
              </p>
              <span className="text-[10px] text-slate-400">Unique global nations</span>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-400 block">Total Days Explored</span>
              <p className="text-3xl font-black text-purple-600 dark:text-purple-400">
                {stats.totalDaysPlanned} Days
              </p>
              <span className="text-[10px] text-slate-400">Scheduled travel time</span>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-400 block">Total Budget Managed</span>
              <p className="text-3xl font-black text-amber-500">
                {formatCurrency(stats.totalBudgetSum, currency)}
              </p>
              <span className="text-[10px] text-slate-400">Tracked finances</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
