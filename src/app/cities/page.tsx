"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency } from "@/lib/utils";
import {
  MapPin,
  Search,
  Heart,
  PlusCircle,
  Sparkles,
  Compass,
  Star,
  DollarSign,
  Calendar,
  X,
  Plus,
  Check,
  ExternalLink,
} from "lucide-react";

function CitiesContent() {
  const searchParams = useSearchParams();
  const initialRegion = searchParams.get("region") || "ALL";

  const { user, currency, showToast } = useAuth();
  const [cities, setCities] = useState<any[]>([]);
  const [userTrips, setUserTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState(initialRegion);
  const [costIndex, setCostIndex] = useState("ALL");

  // Selected city for modal
  const [selectedCity, setSelectedCity] = useState<any | null>(null);
  const [isAddToTripOpen, setIsAddToTripOpen] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState("");

  const loadCities = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/cities?search=${encodeURIComponent(search)}&region=${region}&costIndex=${costIndex}`);
      if (res.ok) {
        const data = await res.json();
        setCities(data.cities || []);
      }
    } catch (e) {
      console.error("Cities loading error", e);
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
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadCities();
  }, [search, region, costIndex, user]);

  useEffect(() => {
    loadUserTrips();
  }, [user]);

  const toggleSaveCity = async (cityId: string) => {
    try {
      const res = await fetch("/api/user/saved-destinations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cityId }),
      });
      const data = await res.json();
      if (res.ok) {
        setCities((prev) =>
          prev.map((c) => (c.id === cityId ? { ...c, isSaved: data.saved } : c))
        );
        showToast(data.message, "success");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddCityToExistingTrip = async () => {
    if (!selectedTripId || !selectedCity) return;
    try {
      const trip = userTrips.find((t) => t.id === selectedTripId);
      const arrival = trip?.startDate ? new Date(trip.startDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0];
      const departure = trip?.endDate ? new Date(trip.endDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0];

      const res = await fetch(`/api/trips/${selectedTripId}/stops`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cityId: selectedCity.id,
          arrivalDate: arrival,
          departureDate: departure,
          accommodationName: `${selectedCity.name} Central Hotel`,
          accommodationCost: selectedCity.avgDailyCost * 0.6 * 2,
        }),
      });

      if (res.ok) {
        showToast(`Added ${selectedCity.name} to "${trip?.title}"!`, "success");
        setIsAddToTripOpen(false);
      } else {
        const d = await res.json();
        showToast(d.error || "Failed to add stop", "error");
      }
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const regions = ["ALL", "Europe", "Asia", "Americas", "Africa", "Middle East", "Oceania"];
  const costIndices = ["ALL", "BUDGET", "MODERATE", "LUXURY"];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-3 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Screen 7: City Discovery & Search</span>
          </span>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Explore Global Destinations
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Discover destinations worldwide, compare daily cost indices, seasonal weather, and seamlessly add them into your itineraries.
          </p>
        </div>

        <Link
          href="/trips/new"
          className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-500 hover:to-teal-500 transition-all"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Plan Trip with Cities</span>
        </Link>
      </div>

      {/* Filter controls */}
      <div className="space-y-4 rounded-3xl bg-white dark:bg-slate-900 p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by city name, country, or description (e.g. Paris, Tokyo, Bali)..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
          {/* Regions */}
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
            <span className="text-[11px] font-bold text-slate-400 mr-1">Region:</span>
            {regions.map((r) => (
              <button
                key={r}
                onClick={() => setRegion(r)}
                className={`rounded-xl px-3 py-1 text-xs font-bold transition-all whitespace-nowrap ${
                  region === r
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                {r === "ALL" ? "All Regions" : r}
              </button>
            ))}
          </div>

          {/* Cost Index */}
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
            <span className="text-[11px] font-bold text-slate-400 mr-1">Cost:</span>
            {costIndices.map((ci) => (
              <button
                key={ci}
                onClick={() => setCostIndex(ci)}
                className={`rounded-xl px-3 py-1 text-xs font-bold transition-all whitespace-nowrap ${
                  costIndex === ci
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                {ci === "ALL" ? "All Budgets" : ci === "BUDGET" ? "$ Budget" : ci === "MODERATE" ? "$$ Moderate" : "$$$ Luxury"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cities Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
          ))}
        </div>
      ) : cities.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center space-y-3 dark:border-slate-800 bg-white dark:bg-slate-900">
          <Compass className="h-10 w-10 text-emerald-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No cities match your criteria</h3>
          <p className="text-xs text-slate-500">Try changing the search keyword, region, or cost filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cities.map((city) => (
            <div
              key={city.id}
              className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm hover:shadow-xl transition-all duration-300"
            >
              {/* Photo & overlays */}
              <div className="relative h-52 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src={city.coverImage}
                  alt={city.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent"></div>

                {/* Rating badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-amber-400 border border-white/10">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span>{city.rating}</span>
                </div>

                {/* Wishlist toggle */}
                <button
                  onClick={() => toggleSaveCity(city.id)}
                  className={`absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-all ${
                    city.isSaved
                      ? "bg-rose-500 text-white shadow-lg"
                      : "bg-black/40 text-white hover:bg-rose-500"
                  }`}
                  title="Save to Wishlist"
                >
                  <Heart className={`h-4 w-4 ${city.isSaved ? "fill-white" : ""}`} />
                </button>

                <div className="absolute bottom-3 left-4 right-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                    {city.country} • {city.region}
                  </span>
                  <h3 className="text-xl font-black text-white">{city.name}</h3>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                  {city.description}
                </p>

                {/* Meta info pills */}
                <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Cost Index</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {city.costIndex} ({formatCurrency(city.avgDailyCost, currency)}/d)
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Best Season</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                      {city.popularSeason}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <button
                    onClick={() => setSelectedCity(city)}
                    className="flex-1 rounded-xl bg-slate-100 dark:bg-slate-800 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    Quick View
                  </button>

                  <button
                    onClick={() => {
                      setSelectedCity(city);
                      setIsAddToTripOpen(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white shadow hover:bg-emerald-500 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add to Trip</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: City Details & Quick View */}
      {selectedCity && !isAddToTripOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="relative h-60 w-full overflow-hidden bg-slate-900">
              <img
                src={selectedCity.coverImage}
                alt={selectedCity.name}
                className="h-full w-full object-cover opacity-80"
              />
              <button
                onClick={() => setSelectedCity(null)}
                className="absolute top-4 right-4 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/90"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="absolute bottom-4 left-6 right-6 text-white">
                <span className="rounded-full bg-emerald-600 px-3 py-0.5 text-[10px] font-bold uppercase">
                  {selectedCity.region}
                </span>
                <h2 className="text-3xl font-black">{selectedCity.name}, {selectedCity.country}</h2>
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {selectedCity.description}
              </p>

              <div className="grid grid-cols-3 gap-3 text-center border-y border-slate-100 dark:border-slate-800 py-3">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">AVG DAILY SPEND</span>
                  <span className="text-base font-black text-emerald-600">
                    {formatCurrency(selectedCity.avgDailyCost, currency)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">COST TIER</span>
                  <span className="text-base font-black text-slate-900 dark:text-white">
                    {selectedCity.costIndex}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">RATING</span>
                  <span className="text-base font-black text-amber-500">
                    ★ {selectedCity.rating}
                  </span>
                </div>
              </div>

              {selectedCity.activities && selectedCity.activities.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                    Top Curated Activities in {selectedCity.name}
                  </h4>
                  <div className="space-y-2">
                    {selectedCity.activities.map((act: any) => (
                      <div
                        key={act.id}
                        className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-2.5 border border-slate-100 dark:border-slate-800"
                      >
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{act.title}</span>
                        <span className="font-bold text-emerald-600">{formatCurrency(act.cost, currency)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-3">
                <Link
                  href={`/trips/new?cityId=${selectedCity.id}`}
                  className="flex-1 text-center rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-emerald-600 dark:bg-slate-800 dark:hover:bg-emerald-600 transition-colors"
                >
                  Create New Trip Here
                </Link>
                <button
                  onClick={() => setIsAddToTripOpen(true)}
                  className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-500 transition-colors"
                >
                  Add to Existing Itinerary
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add to Existing Trip Selector */}
      {isAddToTripOpen && selectedCity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Add {selectedCity.name} to Itinerary
              </h3>
              <button onClick={() => setIsAddToTripOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {userTrips.length === 0 ? (
              <div className="text-center py-4 space-y-3">
                <p className="text-slate-500">You don't have any active trips created yet.</p>
                <Link
                  href={`/trips/new?cityId=${selectedCity.id}`}
                  className="inline-block rounded-xl bg-emerald-600 px-4 py-2 font-bold text-white shadow"
                >
                  Plan New Trip
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Select Target Itinerary
                  </label>
                  <select
                    value={selectedTripId}
                    onChange={(e) => setSelectedTripId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {userTrips.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title} ({t.destinationCount} stops)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setIsAddToTripOpen(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600 dark:border-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddCityToExistingTrip}
                    className="rounded-xl bg-emerald-600 px-5 py-2 font-bold text-white shadow hover:bg-emerald-500"
                  >
                    Confirm & Add
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CitiesPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs">Loading destinations...</div>}>
      <CitiesContent />
    </Suspense>
  );
}
