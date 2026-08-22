"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Compass,
  Calendar,
  MapPin,
  ArrowRight,
  PlusCircle,
  TrendingUp,
  Sparkles,
  DollarSign,
  Heart,
  Search,
  CheckCircle2,
  Clock,
  Navigation,
  Globe,
  Share2,
} from "lucide-react";

export default function HomePage() {
  const { user, currency, openAuthModal, showToast } = useAuth();
  const [trips, setTrips] = useState<any[]>([]);
  const [popularCities, setPopularCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [tripsRes, citiesRes] = await Promise.all([
          fetch("/api/trips"),
          fetch("/api/cities?limit=6"),
        ]);

        if (tripsRes.ok) {
          const tData = await tripsRes.json();
          setTrips(tData.trips || []);
        }

        if (citiesRes.ok) {
          const cData = await citiesRes.json();
          setPopularCities(cData.cities || []);
        }
      } catch (e) {
        console.error("Dashboard data load error:", e);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [user]);

  const upcomingTrips = trips.filter((t) => t.status === "UPCOMING" || t.status === "ONGOING");
  const totalPlannedBudget = trips.reduce((sum, t) => sum + (t.totalBudget || 0), 0);
  const totalDestinationsVisited = trips.reduce((sum, t) => sum + (t.destinationCount || 0), 0);

  const toggleSaveCity = async (cityId: string) => {
    try {
      const res = await fetch("/api/user/saved-destinations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cityId }),
      });
      const data = await res.json();
      if (res.ok) {
        setPopularCities((prev) =>
          prev.map((c) => (c.id === cityId ? { ...c, isSaved: data.saved } : c))
        );
        showToast(data.message, "success");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-950 text-white pt-12 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Glow circles */}
        <div className="absolute top-0 left-1/4 -translate-y-1/2 w-96 h-96 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 translate-y-1/2 w-96 h-96 rounded-full bg-teal-500/15 blur-3xl pointer-events-none"></div>

        <div className="mx-auto max-w-7xl relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-900/60 border border-emerald-700/50 px-3.5 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-md mb-6 animate-in fade-in">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Next-Gen Travel Planning Engine</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
                Dream, Design & <br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  Organize Your Trips.
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
                Build day-wise multi-city itineraries, automatically forecast budgets, discover curated local activities, and visualize your journeys on interactive timelines.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/trips/new"
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-teal-400 active:scale-95 transition-all"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Start Planning Free</span>
                </Link>
                <Link
                  href="/cities"
                  className="flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 px-5 py-3 text-sm font-bold text-white backdrop-blur-md transition-all"
                >
                  <Compass className="h-4 w-4 text-emerald-400" />
                  <span>Explore Destinations</span>
                </Link>
              </div>
            </div>

            {/* Quick Stats Banner */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Traveler Profile</span>
                    <h3 className="text-lg font-bold text-white">{user ? user.name : "Alex Morgan (Demo)"}</h3>
                  </div>
                  <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                    {user?.homeCountry || "Global Explorer"}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-2xl bg-white/5 p-3 border border-white/5">
                    <span className="text-2xl font-black text-emerald-400 block">
                      {trips.length}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">Trips Created</span>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-3 border border-white/5">
                    <span className="text-2xl font-black text-cyan-400 block">
                      {totalDestinationsVisited}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">Stops Planned</span>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-3 border border-white/5">
                    <span className="text-2xl font-black text-amber-400 block">
                      {formatCurrency(totalPlannedBudget, currency)}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">Budget Tracked</span>
                  </div>
                </div>

                {upcomingTrips.length > 0 && (
                  <div className="rounded-2xl bg-emerald-900/40 p-3.5 border border-emerald-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">
                          Next Upcoming Adventure
                        </span>
                        <h4 className="text-xs font-bold text-white truncate max-w-[170px]">
                          {upcomingTrips[0].title}
                        </h4>
                      </div>
                    </div>
                    <Link
                      href={`/trips/${upcomingTrips[0].id}`}
                      className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-all"
                    >
                      View
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Content Hub */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="space-y-12">
          {/* Quick Search & Filter Bar */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 p-4 shadow-xl border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search destinations, cities, activities..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              <Link
                href="/cities?region=Europe"
                className="rounded-xl bg-slate-100 dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-700 whitespace-nowrap transition-colors"
              >
                🇪🇺 Europe
              </Link>
              <Link
                href="/cities?region=Asia"
                className="rounded-xl bg-slate-100 dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-700 whitespace-nowrap transition-colors"
              >
                🇯🇵 Asia
              </Link>
              <Link
                href="/cities?region=Americas"
                className="rounded-xl bg-slate-100 dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-700 whitespace-nowrap transition-colors"
              >
                🇺🇸 Americas
              </Link>
              <Link
                href="/activities"
                className="rounded-xl bg-slate-100 dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-700 whitespace-nowrap transition-colors"
              >
                🎡 Top Activities
              </Link>
            </div>
          </div>

          {/* 3. Upcoming Trips Grid / List */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <span>My Active & Upcoming Trips</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Track timelines, scheduled stops, and live budget utilization.
                </p>
              </div>
              <Link
                href="/trips"
                className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
              >
                <span>View All ({trips.length})</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-64 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
                ))}
              </div>
            ) : trips.length === 0 ? (
              <div className="rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-8 text-center space-y-3 bg-white dark:bg-slate-900">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
                  <Compass className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">No trips planned yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Start your first dream adventure by picking cities and assembling day-wise activities.
                </p>
                <Link
                  href="/trips/new"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-emerald-500"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Plan First Trip</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trips.slice(0, 3).map((trip) => (
                  <div
                    key={trip.id}
                    className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-md hover:shadow-xl transition-all duration-300"
                  >
                    {/* Cover photo */}
                    <div className="relative h-44 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <img
                        src={trip.coverImage || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop&q=80"}
                        alt={trip.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                      <div className="absolute top-3 right-3 flex items-center gap-1.5">
                        <span className="rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-white border border-white/20">
                          {trip.status}
                        </span>
                        {trip.isPublic && (
                          <span className="rounded-full bg-emerald-600/90 backdrop-blur-md px-2 py-1 text-[10px] font-bold text-white">
                            Public
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-3 left-4 right-4">
                        <h3 className="text-base font-bold text-white drop-shadow truncate">
                          {trip.title}
                        </h3>
                        <p className="text-[11px] text-slate-300 flex items-center gap-1.5">
                          <Calendar className="h-3 w-3 text-emerald-400" />
                          <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
                        </p>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      {/* Stops & Activity Count */}
                      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-rose-500" />
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {trip.destinationCount} Stops
                          </span>
                          <span className="text-[11px] text-slate-400 truncate max-w-[130px]">
                            ({trip.destinationsList || "No stops yet"})
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-teal-500" />
                          <span>{trip.activityCount} Activities</span>
                        </div>
                      </div>

                      {/* Budget progress */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-slate-500 dark:text-slate-400">
                            Estimated: {formatCurrency(trip.totalEstimatedCost, trip.currency)}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            Budget: {formatCurrency(trip.totalBudget, trip.currency)}
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div
                            className={`h-full rounded-full transition-all ${
                              trip.budgetUsedPercent > 100
                                ? "bg-rose-500"
                                : trip.budgetUsedPercent > 80
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            }`}
                            style={{ width: `${Math.min(100, trip.budgetUsedPercent)}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <Link
                          href={`/trips/${trip.id}`}
                          className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                        >
                          <span>Open Itinerary Hub</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                        {trip.shareToken && (
                          <Link
                            href={`/share/${trip.shareToken}`}
                            target="_blank"
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            title="Open Public Share Link"
                          >
                            <Share2 className="h-4 w-4" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 4. Curated Global Destinations Explorer */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-rose-500" />
                  <span>Popular Global Destinations</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Explore top trending cities with daily cost index, highlights, and activity options.
                </p>
              </div>
              <Link
                href="/cities"
                className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
              >
                <span>Browse All Destinations</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularCities.map((city) => (
                <div
                  key={city.id}
                  className="group overflow-hidden rounded-3xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
                >
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={city.coverImage}
                      alt={city.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                    {/* Wishlist button */}
                    <button
                      onClick={() => toggleSaveCity(city.id)}
                      className={`absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-all ${
                        city.isSaved
                          ? "bg-rose-500 text-white"
                          : "bg-black/40 text-white hover:bg-rose-500 hover:text-white"
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${city.isSaved ? "fill-white" : ""}`} />
                    </button>

                    {/* Rating badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-amber-400 border border-white/10">
                      ★ {city.rating}
                    </div>

                    <div className="absolute bottom-3 left-4 right-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                        {city.country} • {city.region}
                      </span>
                      <h3 className="text-lg font-black text-white">{city.name}</h3>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {city.description}
                    </p>

                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Avg. Daily Cost</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {formatCurrency(city.avgDailyCost, currency)} / day
                        </span>
                      </div>

                      <Link
                        href={`/trips/new?cityId=${city.id}`}
                        className="flex items-center gap-1 rounded-xl bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 dark:hover:bg-emerald-900 transition-colors"
                      >
                        <PlusCircle className="h-3.5 w-3.5" />
                        <span>Plan Trip</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
