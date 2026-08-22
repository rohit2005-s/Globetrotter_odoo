"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency, formatDate, getCategoryBadgeColor } from "@/lib/utils";
import {
  Layers,
  Search,
  Clock,
  Star,
  MapPin,
  Plus,
  Sparkles,
  Filter,
  Check,
  X,
} from "lucide-react";

export default function ActivitiesPage() {
  const { user, currency, showToast } = useAuth();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userTrips, setUserTrips] = useState<any[]>([]);

  // Search & Filter
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [maxCost, setMaxCost] = useState("");

  // Add to Stop modal
  const [selectedActivity, setSelectedActivity] = useState<any | null>(null);
  const [selectedTripId, setSelectedTripId] = useState("");
  const [selectedStopId, setSelectedStopId] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("MORNING");

  const categories = [
    "ALL",
    "SIGHTSEEING",
    "FOOD",
    "ADVENTURE",
    "CULTURE",
    "NATURE",
    "NIGHTLIFE",
  ];

  const loadActivities = async () => {
    try {
      setLoading(true);
      const url = `/api/activities?search=${encodeURIComponent(search)}&category=${category}${
        maxCost ? `&maxCost=${maxCost}` : ""
      }`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setActivities(data.activities || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadUserTrips = async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/trips");
      if (res.ok) {
        const data = await res.json();
        setUserTrips(data.trips || []);
        if (data.trips?.length > 0) {
          setSelectedTripId(data.trips[0].id);
          if (data.trips[0].stops?.length > 0) {
            setSelectedStopId(data.trips[0].stops[0].id);
            setScheduledDate(new Date(data.trips[0].stops[0].arrivalDate).toISOString().split("T")[0]);
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadActivities();
  }, [search, category, maxCost]);

  useEffect(() => {
    loadUserTrips();
  }, [user]);

  const handleTripSelectionChange = (tId: string) => {
    setSelectedTripId(tId);
    const target = userTrips.find((t) => t.id === tId);
    if (target && target.stops?.length > 0) {
      setSelectedStopId(target.stops[0].id);
      setScheduledDate(new Date(target.stops[0].arrivalDate).toISOString().split("T")[0]);
    } else {
      setSelectedStopId("");
    }
  };

  const handleAddActivityToTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTripId || !selectedStopId || !selectedActivity) {
      showToast("Please choose a valid itinerary stop", "error");
      return;
    }

    try {
      const res = await fetch(`/api/trips/${selectedTripId}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stopId: selectedStopId,
          activityId: selectedActivity.id,
          scheduledDate,
          timeSlot,
        }),
      });

      if (res.ok) {
        showToast(`Added "${selectedActivity.title}" to trip!`, "success");
        setSelectedActivity(null);
      } else {
        const d = await res.json();
        showToast(d.error || "Failed to add", "error");
      }
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const activeSelectedTrip = userTrips.find((t) => t.id === selectedTripId);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-3 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Screen 8: Activity Catalog & Experiences</span>
          </span>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Curated Experiences & Things To Do
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Browse world-class sightseeing, food tastings, nature hikes, and adventure tours to enrich your travel days.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="space-y-4 rounded-3xl bg-white dark:bg-slate-900 p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search experiences, tours, museums, keywords..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 whitespace-nowrap">Max Price:</span>
            <input
              type="number"
              min="0"
              placeholder="e.g. 100"
              value={maxCost}
              onChange={(e) => setMaxCost(e.target.value)}
              className="w-28 rounded-2xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all whitespace-nowrap ${
                category === cat
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              {cat === "ALL" ? "All Categories" : cat.charAt(0) + cat.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Activities Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-72 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center space-y-3 dark:border-slate-800 bg-white dark:bg-slate-900">
          <Layers className="h-10 w-10 text-emerald-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No activities found</h3>
          <p className="text-xs text-slate-500">Try changing your search terms or category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((act) => (
            <div
              key={act.id}
              className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm hover:shadow-xl transition-all duration-300"
            >
              {/* Photo & Category badge */}
              <div className="relative h-44 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src={act.image}
                  alt={act.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                <span className={`absolute top-3 left-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold border backdrop-blur-md ${getCategoryBadgeColor(act.category)}`}>
                  {act.category}
                </span>

                <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md px-2 py-0.5 text-[11px] font-bold text-amber-400 border border-white/10">
                  <Star className="h-3 w-3 fill-amber-400" />
                  <span>{act.rating}</span>
                </div>

                <div className="absolute bottom-3 left-4 right-4">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                    {act.city?.name}, {act.city?.country}
                  </span>
                  <h3 className="text-base font-bold text-white drop-shadow truncate">
                    {act.title}
                  </h3>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                  {act.description}
                </p>

                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 text-xs">
                  <div className="flex items-center gap-1 text-slate-500">
                    <Clock className="h-3.5 w-3.5 text-teal-500" />
                    <span>{act.durationHours} Hours</span>
                  </div>

                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    {formatCurrency(act.cost, currency)}
                  </span>
                </div>

                <button
                  onClick={() => setSelectedActivity(act)}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-500 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add to My Trip Plan</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add to Specific Trip Stop */}
      {selectedActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white truncate max-w-[280px]">
                  Add "{selectedActivity.title}"
                </h3>
                <span className="text-[11px] text-emerald-600 font-semibold">
                  {formatCurrency(selectedActivity.cost, currency)} • {selectedActivity.city?.name}
                </span>
              </div>
              <button onClick={() => setSelectedActivity(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {userTrips.length === 0 ? (
              <div className="text-center py-4 space-y-3">
                <p className="text-slate-500">You don't have any active itineraries created yet.</p>
                <Link
                  href="/trips/new"
                  className="inline-block rounded-xl bg-emerald-600 px-4 py-2 font-bold text-white"
                >
                  Create Trip First
                </Link>
              </div>
            ) : (
              <form onSubmit={handleAddActivityToTrip} className="space-y-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Select Itinerary
                  </label>
                  <select
                    value={selectedTripId}
                    onChange={(e) => handleTripSelectionChange(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {userTrips.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title} ({t.destinationCount} stops)
                      </option>
                    ))}
                  </select>
                </div>

                {activeSelectedTrip?.stops?.length === 0 ? (
                  <p className="text-rose-500 text-xs py-2">
                    This trip doesn't have any city stops yet. Please add a city stop in the Itinerary Hub first.
                  </p>
                ) : (
                  <>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Select City Stop
                      </label>
                      <select
                        value={selectedStopId}
                        onChange={(e) => setSelectedStopId(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      >
                        {activeSelectedTrip?.stops?.map((s: any) => (
                          <option key={s.id} value={s.id}>
                            {s.city?.name} ({formatDate(s.arrivalDate)} - {formatDate(s.departureDate)})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Date</label>
                        <input
                          type="date"
                          required
                          value={scheduledDate}
                          onChange={(e) => setScheduledDate(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Time Slot</label>
                        <select
                          value={timeSlot}
                          onChange={(e) => setTimeSlot(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        >
                          <option value="MORNING">Morning</option>
                          <option value="AFTERNOON">Afternoon</option>
                          <option value="EVENING">Evening</option>
                          <option value="NIGHT">Night</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setSelectedActivity(null)}
                    className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600 dark:border-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedStopId}
                    className="rounded-xl bg-emerald-600 px-5 py-2 font-bold text-white shadow hover:bg-emerald-500 disabled:opacity-50"
                  >
                    Add Experience
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
