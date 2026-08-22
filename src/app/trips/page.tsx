"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency, formatDate, calculateDurationDays } from "@/lib/utils";
import {
  Calendar,
  MapPin,
  Clock,
  PlusCircle,
  Search,
  Trash2,
  Copy,
  Share2,
  ExternalLink,
  Edit3,
  LayoutGrid,
  List,
  Sparkles,
  DollarSign,
  AlertTriangle,
} from "lucide-react";

export default function MyTripsPage() {
  const router = useRouter();
  const { user, currency, showToast } = useAuth();
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Deletion modal state
  const [tripToDelete, setTripToDelete] = useState<any | null>(null);

  const loadTrips = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/trips?status=${statusFilter}&search=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setTrips(data.trips || []);
      }
    } catch (e) {
      console.error("Failed to load trips", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrips();
  }, [user, statusFilter, searchQuery]);

  const handleCloneTrip = async (tripId: string, title: string) => {
    try {
      const res = await fetch(`/api/trips/${tripId}/clone`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        showToast(`Cloned "${title}" successfully!`, "success");
        loadTrips();
      } else {
        showToast(data.error || "Failed to clone trip", "error");
      }
    } catch (e: any) {
      showToast(e.message || "Network error", "error");
    }
  };

  const confirmDeleteTrip = async () => {
    if (!tripToDelete) return;
    try {
      const res = await fetch(`/api/trips/${tripToDelete.id}`, { method: "DELETE" });
      if (res.ok) {
        showToast(`Trip "${tripToDelete.title}" deleted`, "info");
        setTripToDelete(null);
        loadTrips();
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to delete", "error");
      }
    } catch (e: any) {
      showToast(e.message || "Network error", "error");
    }
  };

  const copyShareLink = (shareToken: string) => {
    const url = `${window.location.origin}/share/${shareToken}`;
    navigator.clipboard.writeText(url);
    showToast("Shareable link copied to clipboard!", "success");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-3 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Itinerary Management</span>
          </span>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            My Travel Itineraries
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            View, edit, duplicate, and monitor all your customized multi-city trips and budget estimates.
          </p>
        </div>

        <Link
          href="/trips/new"
          className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-500 hover:to-teal-500 transition-all"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Plan New Trip</span>
        </Link>
      </div>

      {/* Filter & Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {["ALL", "UPCOMING", "ONGOING", "COMPLETED", "DRAFT"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === status
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              {status === "ALL" ? "All Trips" : status.charAt(0) + status.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Search & View Mode */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search trips or cities..."
              className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode("grid")}
              className={`rounded-lg p-1.5 transition-all ${
                viewMode === "grid"
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                  : "text-slate-400 hover:text-slate-600"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`rounded-lg p-1.5 transition-all ${
                viewMode === "table"
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                  : "text-slate-400 hover:text-slate-600"
              }`}
              title="Table View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main List / Grid Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-72 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
          ))}
        </div>
      ) : trips.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-12 text-center space-y-4 bg-white dark:bg-slate-900">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
            <Calendar className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No matching itineraries found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery || statusFilter !== "ALL"
              ? "Try adjusting your search query or status filter."
              : "You have not planned any trips yet. Create your first itinerary in seconds!"}
          </p>
          <Link
            href="/trips/new"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-500"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Create New Trip</span>
          </Link>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => {
            const duration = calculateDurationDays(trip.startDate, trip.endDate);
            return (
              <div
                key={trip.id}
                className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                {/* Photo & badges */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={trip.coverImage || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop&q=80"}
                    alt={trip.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent"></div>

                  {/* Status Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider backdrop-blur-md ${
                        trip.status === "UPCOMING"
                          ? "bg-blue-600/90 text-white"
                          : trip.status === "ONGOING"
                          ? "bg-emerald-600/90 text-white"
                          : trip.status === "COMPLETED"
                          ? "bg-slate-700/90 text-slate-200"
                          : "bg-amber-600/90 text-white"
                      }`}
                    >
                      {trip.status}
                    </span>
                    {trip.isPublic && (
                      <span className="rounded-full bg-emerald-950/80 border border-emerald-500/50 px-2 py-0.5 text-[10px] font-bold text-emerald-300 backdrop-blur-md">
                        Public
                      </span>
                    )}
                  </div>

                  {/* Quick Card Controls */}
                  <div className="absolute top-3 right-3 flex items-center gap-1">
                    <button
                      onClick={() => handleCloneTrip(trip.id, trip.title)}
                      className="rounded-full bg-black/50 p-1.5 text-white backdrop-blur-md hover:bg-black/80 transition-colors"
                      title="Clone / Duplicate Trip"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    {trip.shareToken && (
                      <button
                        onClick={() => copyShareLink(trip.shareToken)}
                        className="rounded-full bg-black/50 p-1.5 text-white backdrop-blur-md hover:bg-emerald-600 transition-colors"
                        title="Copy Public Share Link"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => setTripToDelete(trip)}
                      className="rounded-full bg-black/50 p-1.5 text-white backdrop-blur-md hover:bg-rose-600 transition-colors"
                      title="Delete Trip"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="text-base font-bold text-white drop-shadow truncate">
                      {trip.title}
                    </h3>
                    <p className="text-[11px] text-slate-300 flex items-center gap-1.5">
                      <Calendar className="h-3 w-3 text-emerald-400" />
                      <span>
                        {formatDate(trip.startDate)} – {formatDate(trip.endDate)} ({duration} Days)
                      </span>
                    </p>
                  </div>
                </div>

                {/* Card Content Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  {/* Stops and activities */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-rose-500" />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {trip.destinationCount} Stops
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-teal-500" />
                        <span>{trip.activityCount} Activities</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                      <strong>Route:</strong> {trip.destinationsList || "No stops added yet"}
                    </p>
                  </div>

                  {/* Budget Progress Meter */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-500 dark:text-slate-400">
                        Spent: {formatCurrency(trip.totalEstimatedCost, trip.currency)}
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

                  {/* Primary CTA */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <Link
                      href={`/trips/${trip.id}`}
                      className="flex-1 text-center rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-emerald-600 dark:bg-slate-800 dark:hover:bg-emerald-600 transition-colors"
                    >
                      Open Itinerary Hub & Builder
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table List View */
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-800/50">
                <tr>
                  <th className="px-6 py-4">Trip Details</th>
                  <th className="px-4 py-4">Date Range</th>
                  <th className="px-4 py-4">Stops & Route</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Budget Progress</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {trips.map((trip) => {
                  const duration = calculateDurationDays(trip.startDate, trip.endDate);
                  return (
                    <tr key={trip.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={trip.coverImage || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=300&auto=format&fit=crop&q=80"}
                            alt={trip.title}
                            className="h-12 w-12 rounded-xl object-cover"
                          />
                          <div>
                            <Link
                              href={`/trips/${trip.id}`}
                              className="font-bold text-slate-900 hover:text-emerald-600 dark:text-white"
                            >
                              {trip.title}
                            </Link>
                            <span className="block text-[10px] text-slate-400">
                              Created {formatDate(trip.createdAt)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
                        </div>
                        <span className="text-[10px] text-slate-400">{duration} Days</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {trip.destinationCount} Stops
                        </span>
                        <p className="text-[11px] text-slate-400 truncate max-w-[180px]">
                          {trip.destinationsList || "No stops"}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                            trip.status === "UPCOMING"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                              : trip.status === "ONGOING"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          {trip.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                          {formatCurrency(trip.totalEstimatedCost, trip.currency)} / {formatCurrency(trip.totalBudget, trip.currency)}
                        </div>
                        <div className="h-1.5 w-24 rounded-full bg-slate-100 mt-1 dark:bg-slate-800">
                          <div
                            className={`h-full rounded-full ${
                              trip.budgetUsedPercent > 100 ? "bg-rose-500" : "bg-emerald-500"
                            }`}
                            style={{ width: `${Math.min(100, trip.budgetUsedPercent)}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/trips/${trip.id}`}
                            className="rounded-lg bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300"
                          >
                            Open
                          </Link>
                          <button
                            onClick={() => handleCloneTrip(trip.id, trip.title)}
                            className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            title="Clone"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setTripToDelete(trip)}
                            className="rounded-lg p-1 text-slate-400 hover:text-rose-600"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {tripToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Delete Trip Itinerary?
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Are you sure you want to delete <strong>"{tripToDelete.title}"</strong>? This will permanently remove all scheduled stops and activity plans.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setTripToDelete(null)}
                className="flex-1 rounded-xl border border-slate-200 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteTrip}
                className="flex-1 rounded-xl bg-rose-600 py-2 text-xs font-bold text-white shadow hover:bg-rose-500"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
