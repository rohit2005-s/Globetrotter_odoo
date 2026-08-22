"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency, formatDate, formatDateShort, calculateDurationDays, getCategoryBadgeColor } from "@/lib/utils";
import {
  Calendar,
  MapPin,
  Clock,
  Plus,
  Trash2,
  Share2,
  Copy,
  Printer,
  Edit3,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  DollarSign,
  AlertTriangle,
  Layers,
  Sparkles,
  PieChart as PieIcon,
  BarChart3,
  CalendarDays,
  ExternalLink,
  X,
  Compass,
  Tag,
  Check,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

export default function TripHubPage() {
  const params = useParams();
  const tripId = params.id as string;
  const router = useRouter();
  const { user, currency, showToast } = useAuth();

  const [trip, setTrip] = useState<any | null>(null);
  const [budgetSummary, setBudgetSummary] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"builder" | "view" | "budget" | "timeline">("builder");

  // City catalog for adding stops & activities
  const [allCities, setAllCities] = useState<any[]>([]);

  // Modals state
  const [isAddStopOpen, setIsAddStopOpen] = useState(false);
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [selectedStopForActivity, setSelectedStopForActivity] = useState<any | null>(null);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isEditTripOpen, setIsEditTripOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Form states
  const [stopCityId, setStopCityId] = useState("");
  const [stopArrival, setStopArrival] = useState("");
  const [stopDeparture, setStopDeparture] = useState("");
  const [stopHotel, setStopHotel] = useState("");
  const [stopHotelCost, setStopHotelCost] = useState("0");
  const [stopNotes, setStopNotes] = useState("");

  const [activityMode, setActivityMode] = useState<"catalog" | "custom">("catalog");
  const [selectedCatalogActivityId, setSelectedCatalogActivityId] = useState("");
  const [customActTitle, setCustomActTitle] = useState("");
  const [customActCost, setCustomActCost] = useState("25");
  const [actScheduledDate, setActScheduledDate] = useState("");
  const [actTimeSlot, setActTimeSlot] = useState("MORNING");
  const [actCustomTime, setActCustomTime] = useState("09:30 AM");
  const [actNotes, setActNotes] = useState("");

  const [expenseTitle, setExpenseTitle] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("FOOD");
  const [expenseDate, setExpenseDate] = useState("");

  const [editTitle, setEditTitle] = useState("");
  const [editBudget, setEditBudget] = useState("1500");
  const [editIsPublic, setEditIsPublic] = useState(true);

  // Fetch full trip details and budget
  const loadTripData = async () => {
    try {
      setLoading(true);
      const [tripRes, budgetRes, citiesRes] = await Promise.all([
        fetch(`/api/trips/${tripId}`),
        fetch(`/api/trips/${tripId}/budget-summary`),
        fetch(`/api/cities?limit=50`),
      ]);

      if (tripRes.ok) {
        const tData = await tripRes.json();
        setTrip(tData.trip);
        setEditTitle(tData.trip.title);
        setEditBudget(tData.trip.totalBudget?.toString() || "1500");
        setEditIsPublic(tData.trip.isPublic);

        if (tData.trip.startDate) {
          setStopArrival(new Date(tData.trip.startDate).toISOString().split("T")[0]);
          setStopDeparture(new Date(tData.trip.endDate).toISOString().split("T")[0]);
          setActScheduledDate(new Date(tData.trip.startDate).toISOString().split("T")[0]);
          setExpenseDate(new Date(tData.trip.startDate).toISOString().split("T")[0]);
        }
      }

      if (budgetRes.ok) {
        const bData = await budgetRes.json();
        setBudgetSummary(bData.summary);
      }

      if (citiesRes.ok) {
        const cData = await citiesRes.json();
        setAllCities(cData.cities || []);
        if (cData.cities?.length > 0 && !stopCityId) {
          setStopCityId(cData.cities[0].id);
        }
      }
    } catch (e) {
      console.error("Trip Hub data error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTripData();
  }, [tripId, user]);

  // Stop Operations
  const handleAddStop = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/trips/${tripId}/stops`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cityId: stopCityId,
          arrivalDate: stopArrival,
          departureDate: stopDeparture,
          accommodationName: stopHotel,
          accommodationCost: parseFloat(stopHotelCost) || 0,
          notes: stopNotes,
        }),
      });

      if (res.ok) {
        showToast("City stop added to route!", "success");
        setIsAddStopOpen(false);
        setStopHotel("");
        setStopHotelCost("0");
        setStopNotes("");
        loadTripData();
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to add stop", "error");
      }
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleMoveStop = async (stopIndex: number, direction: "up" | "down") => {
    if (!trip || !trip.stops) return;
    const newStops = [...trip.stops];
    const targetIndex = direction === "up" ? stopIndex - 1 : stopIndex + 1;
    if (targetIndex < 0 || targetIndex >= newStops.length) return;

    // Swap
    const temp = newStops[stopIndex];
    newStops[stopIndex] = newStops[targetIndex];
    newStops[targetIndex] = temp;

    const orderedStopIds = newStops.map((s) => s.id);
    try {
      await fetch(`/api/trips/${tripId}/stops`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedStopIds }),
      });
      loadTripData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteStop = async (stopId: string) => {
    try {
      const res = await fetch(`/api/trips/${tripId}/stops?stopId=${stopId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast("Stop removed from itinerary", "info");
        loadTripData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Activity Operations
  const openAddActivityModal = (stop: any) => {
    setSelectedStopForActivity(stop);
    setActScheduledDate(new Date(stop.arrivalDate).toISOString().split("T")[0]);
    if (stop.city?.activities?.length > 0) {
      setSelectedCatalogActivityId(stop.city.activities[0].id);
      setCustomActCost(stop.city.activities[0].cost?.toString() || "25");
    }
    setIsAddActivityOpen(true);
  };

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStopForActivity) return;

    try {
      const payload: any = {
        stopId: selectedStopForActivity.id,
        scheduledDate: actScheduledDate,
        timeSlot: actTimeSlot,
        customTime: actCustomTime,
        notes: actNotes,
      };

      if (activityMode === "catalog" && selectedCatalogActivityId) {
        payload.activityId = selectedCatalogActivityId;
      } else {
        payload.customTitle = customActTitle;
        payload.customCost = parseFloat(customActCost) || 0;
      }

      const res = await fetch(`/api/trips/${tripId}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast("Activity added to day plan!", "success");
        setIsAddActivityOpen(false);
        setCustomActTitle("");
        setActNotes("");
        loadTripData();
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to add activity", "error");
      }
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleToggleActivityCompleted = async (stopActivity: any) => {
    try {
      await fetch(`/api/trips/${tripId}/activities`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stopActivityId: stopActivity.id,
          isCompleted: !stopActivity.isCompleted,
        }),
      });
      loadTripData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteActivity = async (stopActivityId: string) => {
    try {
      await fetch(`/api/trips/${tripId}/activities?stopActivityId=${stopActivityId}`, {
        method: "DELETE",
      });
      showToast("Activity removed", "info");
      loadTripData();
    } catch (e) {
      console.error(e);
    }
  };

  // Expense Operations
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseTitle || !expenseAmount) return;

    try {
      const res = await fetch(`/api/trips/${tripId}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: expenseTitle,
          amount: parseFloat(expenseAmount),
          category: expenseCategory,
          date: expenseDate,
        }),
      });

      if (res.ok) {
        showToast("Expense logged to budget ledger!", "success");
        setIsAddExpenseOpen(false);
        setExpenseTitle("");
        setExpenseAmount("");
        loadTripData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      await fetch(`/api/trips/${tripId}/expenses?expenseId=${expenseId}`, {
        method: "DELETE",
      });
      showToast("Expense entry deleted", "info");
      loadTripData();
    } catch (e) {
      console.error(e);
    }
  };

  // Edit Trip Meta
  const handleUpdateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/trips/${tripId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          totalBudget: parseFloat(editBudget),
          isPublic: editIsPublic,
        }),
      });
      if (res.ok) {
        showToast("Trip details updated!", "success");
        setIsEditTripOpen(false);
        loadTripData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center space-y-4">
        <div className="h-12 w-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-bold text-slate-500">Loading Itinerary Hub...</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="mx-auto max-w-md py-20 text-center space-y-4">
        <h2 className="text-xl font-bold">Trip Not Found</h2>
        <p className="text-xs text-slate-500">This itinerary may have been removed or made private.</p>
        <button
          onClick={() => router.push("/trips")}
          className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white"
        >
          Return to My Trips
        </button>
      </div>
    );
  }

  const durationDays = calculateDurationDays(trip.startDate, trip.endDate);
  const totalStops = trip.stops?.length || 0;
  const totalActs = trip.stops?.reduce((acc: number, s: any) => acc + (s.activities?.length || 0), 0) || 0;

  return (
    <div className="min-h-screen pb-20">
      {/* 1. Trip Hero / Header */}
      <div className="relative overflow-hidden bg-slate-900 text-white">
        <div className="absolute inset-0">
          <img
            src={trip.coverImage || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&auto=format&fit=crop&q=80"}
            alt={trip.title}
            className="h-full w-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent"></div>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-emerald-500/20 px-3 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                  {trip.status}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-emerald-400" />
                  <span>
                    {formatDate(trip.startDate)} – {formatDate(trip.endDate)} ({durationDays} Days)
                  </span>
                </span>
                {trip.isPublic && (
                  <span className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-[11px] font-bold text-cyan-300 border border-cyan-500/30">
                    Public Share Enabled
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
                <span>{trip.title}</span>
                <button
                  onClick={() => setIsEditTripOpen(true)}
                  className="rounded-full p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
                  title="Edit Trip Settings"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
              </h1>

              {trip.description && (
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                  {trip.description}
                </p>
              )}
            </div>

            {/* Quick action bar */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsAddStopOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-emerald-500 transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>Add City Stop</span>
              </button>
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 px-3.5 py-2.5 text-xs font-bold text-white backdrop-blur-md transition-all"
              >
                <Share2 className="h-4 w-4 text-emerald-400" />
                <span>Share</span>
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 px-3.5 py-2.5 text-xs font-bold text-white backdrop-blur-md transition-all no-print"
              >
                <Printer className="h-4 w-4 text-cyan-400" />
                <span>Print / PDF</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-white/10 pt-4">
            <div className="rounded-2xl bg-white/5 p-3 backdrop-blur-sm border border-white/5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Stops in Route</span>
              <span className="text-xl font-black text-emerald-400">{totalStops} Cities</span>
            </div>
            <div className="rounded-2xl bg-white/5 p-3 backdrop-blur-sm border border-white/5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Planned Activities</span>
              <span className="text-xl font-black text-cyan-400">{totalActs} Activities</span>
            </div>
            <div className="rounded-2xl bg-white/5 p-3 backdrop-blur-sm border border-white/5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Estimated Spend</span>
              <span className="text-xl font-black text-amber-400">
                {formatCurrency(budgetSummary?.totalEstimated || 0, trip.currency)}
              </span>
            </div>
            <div className="rounded-2xl bg-white/5 p-3 backdrop-blur-sm border border-white/5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Target Budget</span>
              <span className="text-xl font-black text-white">
                {formatCurrency(trip.totalBudget, trip.currency)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs (The 4 Hub Modes) */}
      <div className="sticky top-16 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 no-print">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto py-2">
            {[
              { id: "builder", label: "Itinerary Builder", icon: Layers, screen: "Screen 5" },
              { id: "view", label: "Itinerary View", icon: Compass, screen: "Screen 6" },
              { id: "budget", label: "Budget & Cost Breakdown", icon: PieIcon, screen: "Screen 9" },
              { id: "timeline", label: "Calendar & Timeline", icon: CalendarDays, screen: "Screen 10" },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Tab Contents */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ========================================================================= */}
        {/* TAB 1: ITINERARY BUILDER (Screen 5) */}
        {/* ========================================================================= */}
        {activeTab === "builder" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-50/70 dark:bg-emerald-950/30 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/50">
              <div>
                <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                  Interactive Route & Activity Builder
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Add destinations, reorder stop sequences, and assign activities to specific days and time slots.
                </p>
              </div>
              <button
                onClick={() => setIsAddStopOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-emerald-500 whitespace-nowrap self-start sm:self-auto"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Stop</span>
              </button>
            </div>

            {trip.stops.length === 0 ? (
              <div className="rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center space-y-3 dark:border-slate-800 bg-white dark:bg-slate-900">
                <MapPin className="h-10 w-10 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Your route is empty</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Click "Add City Stop" to choose your first destination and assemble your schedule.
                </p>
                <button
                  onClick={() => setIsAddStopOpen(true)}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow"
                >
                  Add First Stop
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {trip.stops.map((stop: any, stopIndex: number) => (
                  <div
                    key={stop.id}
                    className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm transition-all"
                  >
                    {/* Stop Header */}
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-xs font-black text-white shadow-sm">
                          {stopIndex + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-black text-slate-900 dark:text-white">
                              {stop.city?.name}
                            </h3>
                            <span className="text-xs text-slate-500">({stop.city?.country})</span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                            <span>
                              {formatDate(stop.arrivalDate)} → {formatDate(stop.departureDate)}
                            </span>
                            <span>•</span>
                            <span>{calculateDurationDays(stop.arrivalDate, stop.departureDate)} Days</span>
                          </p>
                        </div>
                      </div>

                      {/* Stop Controls & Actions */}
                      <div className="flex items-center gap-2">
                        {/* Move Up/Down */}
                        <div className="flex items-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-0.5">
                          <button
                            disabled={stopIndex === 0}
                            onClick={() => handleMoveStop(stopIndex, "up")}
                            className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30"
                            title="Move Stop Up"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            disabled={stopIndex === trip.stops.length - 1}
                            onClick={() => handleMoveStop(stopIndex, "down")}
                            className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30"
                            title="Move Stop Down"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => openAddActivityModal(stop)}
                          className="flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-500"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Add Activity</span>
                        </button>

                        <button
                          onClick={() => handleDeleteStop(stop.id)}
                          className="rounded-xl border border-slate-200 dark:border-slate-700 p-1.5 text-slate-400 hover:text-rose-600 hover:border-rose-300"
                          title="Remove Stop"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Accommodation info & notes */}
                    <div className="px-6 py-3 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-600 dark:text-slate-400 gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-white">🏨 Stay:</span>
                        <span>{stop.accommodationName || "No hotel specified"}</span>
                        {stop.accommodationCost > 0 && (
                          <span className="rounded-md bg-sky-100 dark:bg-sky-950 px-2 py-0.5 font-bold text-sky-800 dark:text-sky-300">
                            {formatCurrency(stop.accommodationCost, trip.currency)}
                          </span>
                        )}
                      </div>
                      {stop.notes && (
                        <p className="text-[11px] text-slate-500 italic max-w-md truncate">
                          "{stop.notes}"
                        </p>
                      )}
                    </div>

                    {/* Activities scheduled for this stop */}
                    <div className="p-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Scheduled Experiences ({stop.activities?.length || 0})
                        </h4>
                      </div>

                      {(!stop.activities || stop.activities.length === 0) ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-6 text-center text-xs text-slate-400">
                          No activities assigned yet. Click "+ Add Activity" above to schedule attractions or food tours.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {stop.activities.map((act: any) => {
                            const title = act.customTitle || act.activity?.title || "Activity";
                            const cost = act.customCost !== null ? act.customCost : act.activity?.cost || 0;
                            const image = act.activity?.image || stop.city?.coverImage;
                            const category = act.activity?.category || "ACTIVITY";

                            return (
                              <div
                                key={act.id}
                                className={`flex items-start gap-3 rounded-2xl border p-3.5 transition-all ${
                                  act.isCompleted
                                    ? "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60"
                                    : "bg-white dark:bg-slate-800 border-slate-200/80 dark:border-slate-700 shadow-sm"
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() => handleToggleActivityCompleted(act)}
                                  className={`mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-lg border transition-colors ${
                                    act.isCompleted
                                      ? "bg-emerald-600 border-emerald-600 text-white"
                                      : "border-slate-300 hover:border-emerald-500"
                                  }`}
                                >
                                  {act.isCompleted && <Check className="h-3.5 w-3.5" />}
                                </button>

                                <img
                                  src={image}
                                  alt={title}
                                  className="h-14 w-14 rounded-xl object-cover flex-shrink-0"
                                />

                                <div className="flex-1 overflow-hidden space-y-1">
                                  <div className="flex items-center justify-between gap-1">
                                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold border ${getCategoryBadgeColor(category)}`}>
                                      {category}
                                    </span>
                                    <span className="text-xs font-black text-slate-900 dark:text-white">
                                      {formatCurrency(cost, trip.currency)}
                                    </span>
                                  </div>

                                  <h5 className={`text-xs font-bold text-slate-900 dark:text-white truncate ${act.isCompleted ? "line-through" : ""}`}>
                                    {title}
                                  </h5>

                                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                                    <span>
                                      {formatDateShort(act.scheduledDate)} • {act.customTime || act.timeSlot}
                                    </span>
                                    <button
                                      onClick={() => handleDeleteActivity(act.id)}
                                      className="text-slate-400 hover:text-rose-600"
                                      title="Remove Activity"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: ITINERARY VIEW (Screen 6) */}
        {/* ========================================================================= */}
        {activeTab === "view" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Day-by-Day Master Itinerary
                </h3>
                <p className="text-xs text-slate-500">
                  Comprehensive chronological flow of all destinations, activities, times, and estimated expenses.
                </p>
              </div>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-600 dark:bg-slate-800 dark:hover:bg-emerald-600"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print Schedule</span>
              </button>
            </div>

            <div className="space-y-8">
              {trip.stops.map((stop: any, stopIdx: number) => {
                const stopDays = calculateDurationDays(stop.arrivalDate, stop.departureDate);
                const stopStartMs = new Date(stop.arrivalDate).getTime();

                return (
                  <div key={stop.id} className="space-y-4">
                    {/* City Stop Banner */}
                    <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 shadow-md">
                      <img
                        src={stop.city?.coverImage}
                        alt={stop.city?.name}
                        className="absolute inset-0 h-full w-full object-cover opacity-25"
                      />
                      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-400">
                            Stop {stopIdx + 1} of {trip.stops.length}
                          </span>
                          <h3 className="text-2xl font-black text-white">
                            {stop.city?.name}, {stop.city?.country}
                          </h3>
                          <p className="text-xs text-slate-300">
                            {formatDate(stop.arrivalDate)} – {formatDate(stop.departureDate)} ({stopDays} Days)
                          </p>
                        </div>

                        <div className="rounded-2xl bg-black/40 backdrop-blur-md p-3 border border-white/10 text-xs space-y-1">
                          <p>
                            <strong>🏨 Hotel:</strong> {stop.accommodationName || "Not set"} (
                            {formatCurrency(stop.accommodationCost, trip.currency)})
                          </p>
                          <p className="text-slate-300">
                            <strong>Season:</strong> {stop.city?.popularSeason}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Day-by-Day Cards */}
                    <div className="space-y-4 pl-0 sm:pl-4">
                      {Array.from({ length: stopDays }).map((_, dayOffset) => {
                        const currentDayDate = new Date(stopStartMs + dayOffset * 24 * 60 * 60 * 1000);
                        const dateStr = currentDayDate.toISOString().split("T")[0];

                        // Find activities for this day
                        const dayActivities = stop.activities.filter(
                          (a: any) => new Date(a.scheduledDate).toISOString().split("T")[0] === dateStr
                        );

                        const dayTotalCost = dayActivities.reduce(
                          (sum: number, a: any) => sum + (a.customCost !== null ? a.customCost : a.activity?.cost || 0),
                          0
                        );

                        return (
                          <div
                            key={dayOffset}
                            className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4"
                          >
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                              <div className="flex items-center gap-2.5">
                                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-slate-100 text-xs font-black text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                                  D{dayOffset + 1}
                                </span>
                                <div>
                                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                                    {currentDayDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                                  </h4>
                                </div>
                              </div>
                              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                Day Activity Cost: {formatCurrency(dayTotalCost, trip.currency)}
                              </span>
                            </div>

                            {dayActivities.length === 0 ? (
                              <p className="text-xs text-slate-400 italic py-2">
                                Free exploration / No scheduled activities for this day.
                              </p>
                            ) : (
                              <div className="space-y-2.5">
                                {dayActivities.map((act: any) => {
                                  const actTitle = act.customTitle || act.activity?.title;
                                  const actCost = act.customCost !== null ? act.customCost : act.activity?.cost || 0;
                                  const actImg = act.activity?.image || stop.city?.coverImage;

                                  return (
                                    <div
                                      key={act.id}
                                      className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-3 border border-slate-100 dark:border-slate-800"
                                    >
                                      <div className="flex items-center gap-3">
                                        <img
                                          src={actImg}
                                          alt={actTitle}
                                          className="h-11 w-11 rounded-xl object-cover"
                                        />
                                        <div>
                                          <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                                              {act.customTime || act.timeSlot}
                                            </span>
                                            <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                                              {actTitle}
                                            </h5>
                                          </div>
                                          {act.notes && (
                                            <p className="text-[11px] text-slate-500 mt-0.5">
                                              Note: {act.notes}
                                            </p>
                                          )}
                                        </div>
                                      </div>

                                      <span className="text-xs font-black text-slate-900 dark:text-white">
                                        {formatCurrency(actCost, trip.currency)}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: BUDGET & COST BREAKDOWN (Screen 9) */}
        {/* ========================================================================= */}
        {activeTab === "budget" && budgetSummary && (
          <div className="space-y-8">
            {/* Overbudget Alerts */}
            {budgetSummary.alerts?.map((alert: any, idx: number) => (
              <div
                key={idx}
                className={`flex items-center gap-3 rounded-2xl p-4 text-xs font-semibold border ${
                  alert.type === "danger"
                    ? "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-200"
                    : alert.type === "warning"
                    ? "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-200"
                    : alert.type === "info"
                    ? "bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/50 dark:text-sky-200"
                    : "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-200"
                }`}
              >
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                <span>{alert.message}</span>
              </div>
            ))}

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-1">
                <span className="text-xs font-bold text-slate-400">Total Planned Budget</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white">
                  {formatCurrency(budgetSummary.totalBudget, trip.currency)}
                </p>
                <span className="text-[10px] text-slate-400">Fixed target threshold</span>
              </div>

              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-1">
                <span className="text-xs font-bold text-slate-400">Total Estimated Cost</span>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(budgetSummary.totalEstimated, trip.currency)}
                </p>
                <span className="text-[10px] text-slate-400">
                  {budgetSummary.budgetUsedPercent}% of budget allocated
                </span>
              </div>

              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-1">
                <span className="text-xs font-bold text-slate-400">Remaining Buffer</span>
                <p
                  className={`text-2xl font-black ${
                    budgetSummary.remainingBudget < 0 ? "text-rose-600" : "text-cyan-600 dark:text-cyan-400"
                  }`}
                >
                  {formatCurrency(budgetSummary.remainingBudget, trip.currency)}
                </p>
                <span className="text-[10px] text-slate-400">
                  {budgetSummary.remainingBudget < 0 ? "Exceeded allowance" : "Available to spend"}
                </span>
              </div>

              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-1">
                <span className="text-xs font-bold text-slate-400">Avg. Daily Expenditure</span>
                <p className="text-2xl font-black text-amber-500">
                  {formatCurrency(budgetSummary.avgDailyCost, trip.currency)}
                </p>
                <span className="text-[10px] text-slate-400">Per day across {durationDays} days</span>
              </div>
            </div>

            {/* Interactive Charts (Pie & Bar) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Category Breakdown (Pie Chart) */}
              <div className="lg:col-span-5 rounded-3xl border border-slate-200/80 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <PieIcon className="h-4 w-4 text-emerald-600" />
                    <span>Category Spending Share</span>
                  </h3>
                  <p className="text-xs text-slate-500">Automatic aggregation of stay, activities, and logs.</p>
                </div>

                <div className="h-64 w-full my-4">
                  {budgetSummary.pieData?.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={budgetSummary.pieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={4}
                        >
                          {budgetSummary.pieData.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: any) => formatCurrency(Number(value), trip.currency)} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-slate-400">
                      No expenses calculated yet.
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 border-t border-slate-100 dark:border-slate-800 pt-3">
                  {budgetSummary.pieData?.map((item: any) => (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                        <span className="text-slate-600 dark:text-slate-300 font-medium">{item.name}</span>
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {formatCurrency(item.value, trip.currency)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Day-by-Day Bar Chart */}
              <div className="lg:col-span-7 rounded-3xl border border-slate-200/80 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-cyan-600" />
                    <span>Daily Cost Distribution</span>
                  </h3>
                  <p className="text-xs text-slate-500">Day-by-day cost comparison for accommodation & activities.</p>
                </div>

                <div className="h-64 w-full my-4">
                  {budgetSummary.dailyBreakdown?.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={budgetSummary.dailyBreakdown}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                        <XAxis dataKey="displayDate" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip formatter={(value: any) => formatCurrency(Number(value), trip.currency)} />
                        <Bar dataKey="stay" stackId="a" fill="#38bdf8" name="Stay" />
                        <Bar dataKey="activities" stackId="a" fill="#34d399" name="Activities" />
                        <Bar dataKey="other" stackId="a" fill="#fbbf24" name="Other" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-slate-400">
                      No days to graph.
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-3 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Stacked breakdown per day of travel</span>
                  <span className="font-bold text-emerald-600">
                    Highest Day: {formatCurrency(Math.max(...(budgetSummary.dailyBreakdown?.map((d: any) => d.total) || [0])), trip.currency)}
                  </span>
                </div>
              </div>
            </div>

            {/* Custom Expense Ledger (Manual Expenses) */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-amber-500" />
                    <span>Logged Expense Ledger</span>
                  </h3>
                  <p className="text-xs text-slate-500">Record flights, insurance, food allowances, and misc costs.</p>
                </div>
                <button
                  onClick={() => setIsAddExpenseOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Log Expense</span>
                </button>
              </div>

              {trip.expenses?.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-6 text-center text-xs text-slate-400">
                  No additional custom expenses logged yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold uppercase text-slate-400 dark:border-slate-800 dark:bg-slate-800">
                      <tr>
                        <th className="px-4 py-2.5">Title</th>
                        <th className="px-4 py-2.5">Category</th>
                        <th className="px-4 py-2.5">Date</th>
                        <th className="px-4 py-2.5 text-right">Amount</th>
                        <th className="px-4 py-2.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {trip.expenses.map((exp: any) => (
                        <tr key={exp.id}>
                          <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{exp.title}</td>
                          <td className="px-4 py-3">
                            <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${getCategoryBadgeColor(exp.category)}`}>
                              {exp.category}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-500">{formatDate(exp.date)}</td>
                          <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-white">
                            {formatCurrency(exp.amount, trip.currency)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleDeleteExpense(exp.id)}
                              className="text-slate-400 hover:text-rose-600"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: CALENDAR & TIMELINE (Screen 10) */}
        {/* ========================================================================= */}
        {activeTab === "timeline" && (
          <div className="space-y-8">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Chronological Visual Timeline & Calendar View
                </h3>
                <p className="text-xs text-slate-500">
                  Follow the route sequence and scheduled time blocks along an interactive vertical timeline.
                </p>
              </div>
            </div>

            {/* Vertical Flow Timeline */}
            <div className="relative pl-6 sm:pl-10 space-y-8 before:absolute before:left-3 sm:before:left-5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-teal-500 before:to-cyan-500">
              {trip.stops.map((stop: any, stopIdx: number) => (
                <div key={stop.id} className="relative space-y-4">
                  {/* Timeline Stop Node Marker */}
                  <div className="absolute -left-6 sm:-left-10 top-0 flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-emerald-600 text-white font-black text-xs shadow-lg ring-4 ring-white dark:ring-slate-950">
                    {stopIdx + 1}
                  </div>

                  {/* Stop Information Card */}
                  <div className="rounded-3xl border border-slate-200/80 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div>
                        <h4 className="text-lg font-black text-slate-900 dark:text-white">
                          {stop.city?.name}, {stop.city?.country}
                        </h4>
                        <span className="text-xs text-slate-500">
                          {formatDate(stop.arrivalDate)} → {formatDate(stop.departureDate)}
                        </span>
                      </div>
                      <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                        {calculateDurationDays(stop.arrivalDate, stop.departureDate)} Days Stay
                      </span>
                    </div>

                    {/* Timeline Activity Flow */}
                    <div className="space-y-3">
                      {stop.activities.map((act: any) => {
                        const title = act.customTitle || act.activity?.title;
                        const cost = act.customCost !== null ? act.customCost : act.activity?.cost || 0;
                        return (
                          <div
                            key={act.id}
                            className="flex items-center justify-between rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-3.5 border border-slate-100 dark:border-slate-800"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                <Clock className="h-4 w-4" />
                              </div>
                              <div>
                                <span className="text-[10px] font-bold text-slate-400 block uppercase">
                                  {formatDateShort(act.scheduledDate)} • {act.customTime || act.timeSlot}
                                </span>
                                <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                                  {title}
                                </h5>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                              {formatCurrency(cost, trip.currency)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: ADD STOP */}
      {/* ========================================================================= */}
      {isAddStopOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-600" />
                <span>Add City Stop to Route</span>
              </h3>
              <button onClick={() => setIsAddStopOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddStop} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Select Destination City *
                </label>
                <select
                  value={stopCityId}
                  onChange={(e) => setStopCityId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-medium"
                >
                  {allCities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name} ({city.country}) - {city.costIndex}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Arrival Date *</label>
                  <input
                    type="date"
                    required
                    value={stopArrival}
                    onChange={(e) => setStopArrival(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Departure Date *</label>
                  <input
                    type="date"
                    required
                    min={stopArrival}
                    value={stopDeparture}
                    onChange={(e) => setStopDeparture(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Accommodation / Hotel</label>
                  <input
                    type="text"
                    placeholder="e.g. Central Boutique Hotel"
                    value={stopHotel}
                    onChange={(e) => setStopHotel(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Stay Total Cost ({trip.currency})</label>
                  <input
                    type="number"
                    min="0"
                    value={stopHotelCost}
                    onChange={(e) => setStopHotelCost(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Stop Notes</label>
                <textarea
                  rows={2}
                  placeholder="Check-in times, transit notes..."
                  value={stopNotes}
                  onChange={(e) => setStopNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddStopOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2 font-bold text-white shadow hover:bg-emerald-500"
                >
                  Add to Route
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD ACTIVITY */}
      {/* ========================================================================= */}
      {isAddActivityOpen && selectedStopForActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="h-4 w-4 text-emerald-600" />
                  <span>Add Activity in {selectedStopForActivity.city?.name}</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Pick from curated local experiences or create a custom plan.
                </p>
              </div>
              <button onClick={() => setIsAddActivityOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mode switch */}
            <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActivityMode("catalog")}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  activityMode === "catalog"
                    ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
                }`}
              >
                Curated City Catalog ({selectedStopForActivity.city?.activities?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setActivityMode("custom")}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  activityMode === "custom"
                    ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
                }`}
              >
                Custom Activity
              </button>
            </div>

            <form onSubmit={handleAddActivity} className="space-y-4 text-xs">
              {activityMode === "catalog" ? (
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Select Curated Experience
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {selectedStopForActivity.city?.activities?.map((act: any) => {
                      const isSelected = selectedCatalogActivityId === act.id;
                      return (
                        <div
                          key={act.id}
                          onClick={() => setSelectedCatalogActivityId(act.id)}
                          className={`flex items-center gap-3 rounded-2xl border p-2.5 cursor-pointer transition-all ${
                            isSelected
                              ? "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/60 ring-2 ring-emerald-500/30"
                              : "border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <img
                            src={act.image}
                            alt={act.title}
                            className="h-12 w-12 rounded-xl object-cover"
                          />
                          <div className="flex-1 overflow-hidden">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {act.title}
                            </p>
                            <span className="text-[10px] text-slate-400">
                              {act.durationHours}h • ★ {act.rating}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                            {formatCurrency(act.cost, trip.currency)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Activity Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sunset drinks at rooftop bar"
                      value={customActTitle}
                      onChange={(e) => setCustomActTitle(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Estimated Cost ({trip.currency})
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={customActCost}
                      onChange={(e) => setCustomActCost(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Scheduled Date *</label>
                  <input
                    type="date"
                    required
                    min={new Date(selectedStopForActivity.arrivalDate).toISOString().split("T")[0]}
                    max={new Date(selectedStopForActivity.departureDate).toISOString().split("T")[0]}
                    value={actScheduledDate}
                    onChange={(e) => setActScheduledDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Time Slot</label>
                  <select
                    value={actTimeSlot}
                    onChange={(e) => setActTimeSlot(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="MORNING">Morning</option>
                    <option value="AFTERNOON">Afternoon</option>
                    <option value="EVENING">Evening</option>
                    <option value="NIGHT">Night</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Specific Time (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 10:00 AM"
                  value={actCustomTime}
                  onChange={(e) => setActCustomTime(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Notes / Booking Details</label>
                <textarea
                  rows={2}
                  placeholder="Booking codes, meeting points..."
                  value={actNotes}
                  onChange={(e) => setActNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddActivityOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2 font-bold text-white shadow hover:bg-emerald-500"
                >
                  Add Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: LOG EXPENSE */}
      {/* ========================================================================= */}
      {isAddExpenseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-amber-500" />
                <span>Log Custom Expense</span>
              </h3>
              <button onClick={() => setIsAddExpenseOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Expense Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flight Tickets NYC to Paris"
                  value={expenseTitle}
                  onChange={(e) => setExpenseTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Amount ({trip.currency}) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-semibold"
                  >
                    <option value="TRANSPORT">Transport</option>
                    <option value="ACCOMMODATION">Accommodation</option>
                    <option value="ACTIVITIES">Activities</option>
                    <option value="FOOD">Food & Dining</option>
                    <option value="MISC">Miscellaneous</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Date</label>
                <input
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddExpenseOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2 font-bold text-white shadow hover:bg-emerald-500"
                >
                  Log Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SHARE PUBLIC LINK (Screen 11 Integration) */}
      {/* ========================================================================= */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Share2 className="h-4 w-4 text-emerald-600" />
                <span>Share Public Itinerary</span>
              </h3>
              <button onClick={() => setIsShareModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Anyone with this link can view this beautiful read-only itinerary and clone it into their own GlobeTrotter account!
            </p>

            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
              <input
                type="text"
                readOnly
                value={`${typeof window !== "undefined" ? window.location.origin : ""}/share/${trip.shareToken}`}
                className="w-full bg-transparent text-xs text-slate-700 dark:text-slate-200 outline-none truncate"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/share/${trip.shareToken}`);
                  showToast("Copied public link!", "success");
                }}
                className="flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500"
              >
                <Copy className="h-3 w-3" />
                <span>Copy</span>
              </button>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <Link
                href={`/share/${trip.shareToken}`}
                target="_blank"
                className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
              >
                <span>Preview Public Page</span>
                <ExternalLink className="h-3 w-3" />
              </Link>

              <button
                onClick={() => setIsShareModalOpen(false)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white dark:bg-slate-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT TRIP SETTINGS */}
      {/* ========================================================================= */}
      {isEditTripOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Edit Trip Settings</h3>
              <button onClick={() => setIsEditTripOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateTrip} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Trip Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Target Budget ({trip.currency})</label>
                <input
                  type="number"
                  min="100"
                  value={editBudget}
                  onChange={(e) => setEditBudget(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">Public Sharing</span>
                  <span className="text-[11px] text-slate-400">Allow friends to view and clone trip</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditIsPublic(!editIsPublic)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    editIsPublic ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      editIsPublic ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditTripOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2 font-bold text-white shadow hover:bg-emerald-500"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
