"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { calculateDurationDays, formatCurrency } from "@/lib/utils";
import {
  Calendar,
  MapPin,
  Image as ImageIcon,
  DollarSign,
  Lock,
  Globe,
  ArrowRight,
  Sparkles,
  Check,
  Compass,
  X,
} from "lucide-react";

const SAMPLE_COVERS = [
  {
    label: "European Architecture",
    url: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1200&auto=format&fit=crop&q=80",
  },
  {
    label: "Tokyo City Lights",
    url: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200&auto=format&fit=crop&q=80",
  },
  {
    label: "Tropical Paradise",
    url: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&auto=format&fit=crop&q=80",
  },
  {
    label: "Mountain Wanderlust",
    url: "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=1200&auto=format&fit=crop&q=80",
  },
  {
    label: "New York Skyline",
    url: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200&auto=format&fit=crop&q=80",
  },
  {
    label: "Historic Roman Heritage",
    url: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200&auto=format&fit=crop&q=80",
  },
];

function CreateTripForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preSelectedCityId = searchParams.get("cityId");
  const { user, currency, showToast } = useAuth();

  const today = new Date().toISOString().split("T")[0];
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(nextWeek);
  const [totalBudget, setTotalBudget] = useState("1800");
  const [tripCurrency, setTripCurrency] = useState(currency || "USD");
  const [coverImage, setCoverImage] = useState(SAMPLE_COVERS[0].url);
  const [customCoverUrl, setCustomCoverUrl] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  // Available cities from DB
  const [availableCities, setAvailableCities] = useState<any[]>([]);
  const [selectedCityIds, setSelectedCityIds] = useState<string[]>([]);
  const [citySearch, setCitySearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchCities() {
      try {
        const res = await fetch("/api/cities?limit=50");
        if (res.ok) {
          const data = await res.json();
          setAvailableCities(data.cities || []);

          if (preSelectedCityId) {
            setSelectedCityIds([preSelectedCityId]);
            const city = data.cities?.find((c: any) => c.id === preSelectedCityId);
            if (city) {
              setTitle(`Adventure in ${city.name}`);
              setCoverImage(city.coverImage);
            }
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    fetchCities();
  }, [preSelectedCityId]);

  const durationDays = calculateDurationDays(startDate, endDate);

  const toggleCity = (cityId: string) => {
    if (selectedCityIds.includes(cityId)) {
      setSelectedCityIds(selectedCityIds.filter((id) => id !== cityId));
    } else {
      setSelectedCityIds([...selectedCityIds, cityId]);
      if (!title) {
        const city = availableCities.find((c) => c.id === cityId);
        if (city) setTitle(`Trip to ${city.name}`);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      showToast("Please provide a trip title", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title,
        description,
        startDate,
        endDate,
        totalBudget: parseFloat(totalBudget) || 1500,
        currency: tripCurrency,
        coverImage: customCoverUrl.trim() || coverImage,
        isPublic,
        cityIds: selectedCityIds,
      };

      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Failed to create trip", "error");
        setIsSubmitting(false);
        return;
      }

      showToast("Trip created successfully! Building itinerary...", "success");
      router.push(`/trips/${data.trip.id}`);
    } catch (err: any) {
      showToast(err.message || "Network error", "error");
      setIsSubmitting(false);
    }
  };

  const filteredCities = availableCities.filter(
    (c) =>
      c.name.toLowerCase().includes(citySearch.toLowerCase()) ||
      c.country.toLowerCase().includes(citySearch.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-3 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-2">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Step 1: Initiate Your Travel Plan</span>
        </span>
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          Create New Itinerary
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Define your trip dates, target budget, destinations, and let GlobeTrotter structure your day-wise plan.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Card 1: Basic Information */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Compass className="h-4 w-4 text-emerald-600" />
            <span>Trip Basics & Dates</span>
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Trip Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. European Summer Odyssey 2026"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Start Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                End Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="date"
                  required
                  min={startDate}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Duration Indicator */}
          <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 p-3 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/50">
            <span className="font-semibold">Calculated Trip Duration:</span>
            <span className="font-black text-sm">{durationDays} Days / {Math.max(1, durationDays - 1)} Nights</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Description & Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What are the goals or highlights of this adventure?"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            ></textarea>
          </div>
        </div>

        {/* Card 2: Destinations / City Stops */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="h-4 w-4 text-rose-500" />
                <span>Select Initial City Stops</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pick the cities you plan to visit. You can reorder and add more stops in the builder anytime!
              </p>
            </div>
            <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-300">
              {selectedCityIds.length} Selected
            </span>
          </div>

          {/* Search cities */}
          <input
            type="text"
            value={citySearch}
            onChange={(e) => setCitySearch(e.target.value)}
            placeholder="Search cities from database..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />

          {/* Selected Cities Badges */}
          {selectedCityIds.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {selectedCityIds.map((id, index) => {
                const city = availableCities.find((c) => c.id === id);
                if (!city) return null;
                return (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-sm"
                  >
                    <span>Stop {index + 1}: {city.name}</span>
                    <button
                      type="button"
                      onClick={() => toggleCity(id)}
                      className="rounded-full hover:bg-emerald-700 p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          {/* Cities Grid Picker */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto pr-1">
            {filteredCities.map((city) => {
              const isSelected = selectedCityIds.includes(city.id);
              return (
                <button
                  type="button"
                  key={city.id}
                  onClick={() => toggleCity(city.id)}
                  className={`flex items-center gap-2.5 rounded-2xl p-2 text-left border transition-all ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 ring-2 ring-emerald-500/30"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <img
                    src={city.coverImage}
                    alt={city.name}
                    className="h-10 w-10 rounded-xl object-cover"
                  />
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{city.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{city.country}</p>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-emerald-600 ml-auto flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Card 3: Target Budget & Currency */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-amber-500" />
            <span>Target Budget Allocation</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Estimated Total Budget
              </label>
              <input
                type="number"
                min="100"
                step="50"
                value={totalBudget}
                onChange={(e) => setTotalBudget(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-sm font-bold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Currency
              </label>
              <select
                value={tripCurrency}
                onChange={(e) => setTripCurrency(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
                <option value="INR">INR (₹)</option>
                <option value="AUD">AUD (A$)</option>
                <option value="CAD">CAD (C$)</option>
                <option value="SGD">SGD (S$)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Card 4: Cover Image & Visibility */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-cyan-500" />
            <span>Cover Photo & Sharing</span>
          </h2>

          {/* Sample cover gallery */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Select Curated Cover Photo
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {SAMPLE_COVERS.map((sample, idx) => {
                const isSelected = coverImage === sample.url && !customCoverUrl;
                return (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => {
                      setCoverImage(sample.url);
                      setCustomCoverUrl("");
                    }}
                    className={`relative h-24 rounded-2xl overflow-hidden border-2 transition-all ${
                      isSelected ? "border-emerald-500 ring-2 ring-emerald-500/30 scale-[1.02]" : "border-transparent opacity-75 hover:opacity-100"
                    }`}
                  >
                    <img src={sample.url} alt={sample.label} className="h-full w-full object-cover" />
                    <span className="absolute bottom-1 left-2 text-[10px] font-bold text-white drop-shadow bg-black/40 px-1.5 py-0.5 rounded">
                      {sample.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Or Custom Image URL (Optional)
            </label>
            <input
              type="url"
              value={customCoverUrl}
              onChange={(e) => setCustomCoverUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Privacy Switch */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${isPublic ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950" : "bg-slate-100 text-slate-600 dark:bg-slate-800"}`}>
                {isPublic ? <Globe className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  {isPublic ? "Public Itinerary" : "Private Trip"}
                </h4>
                <p className="text-[11px] text-slate-500">
                  {isPublic ? "Generate shareable link for friends & community to view or copy." : "Only visible to your account."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsPublic(!isPublic)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isPublic ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-700"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isPublic ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Submit action */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-2xl border border-slate-200 dark:border-slate-700 px-6 py-3 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-emerald-500/25 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 transition-all"
          >
            <span>{isSubmitting ? "Creating Trip..." : "Save & Open Itinerary Builder"}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

export default function CreateTripPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs">Loading form...</div>}>
      <CreateTripForm />
    </Suspense>
  );
}
