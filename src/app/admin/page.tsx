"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ShieldCheck,
  Users,
  Compass,
  MapPin,
  DollarSign,
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
  Plus,
  Layers,
  Sparkles,
  Search,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
} from "recharts";

const PIE_COLORS = ["#34d399", "#38bdf8", "#fbbf24", "#a78bfa", "#f43f5e", "#818cf8"];

export default function AdminDashboardPage() {
  const { user, currency, showToast } = useAuth();
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Forms to add new city and activity directly into DB
  const [newCityName, setNewCityName] = useState("");
  const [newCityCountry, setNewCityCountry] = useState("");
  const [newCityRegion, setNewCityRegion] = useState("Europe");
  const [newCityCover, setNewCityCover] = useState("");
  const [newCityCost, setNewCityCost] = useState("120");
  const [newCityCostIndex, setNewCityCostIndex] = useState("MODERATE");
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/analytics");
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data.analytics);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [user]);

  const handleCreateCity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/cities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCityName,
          country: newCityCountry,
          region: newCityRegion,
          coverImage: newCityCover || "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop&q=80",
          avgDailyCost: parseFloat(newCityCost),
          costIndex: newCityCostIndex,
        }),
      });

      if (res.ok) {
        showToast(`City "${newCityName}" added to database!`, "success");
        setIsCityModalOpen(false);
        setNewCityName("");
        setNewCityCountry("");
        setNewCityCover("");
        loadAnalytics();
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to create city", "error");
      }
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl py-20 text-center space-y-4">
        <div className="h-12 w-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-bold text-slate-500">Loading platform analytics...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 dark:bg-purple-950/60 px-3 py-1 text-xs font-bold text-purple-800 dark:text-purple-300 mb-2">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Screen 13: Platform Admin & Analytics Hub</span>
          </span>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Operations & Analytics Control
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Monitor platform adoption, user creation metrics, popular destinations, and manage relational database records.
          </p>
        </div>

        <button
          onClick={() => setIsCityModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-2xl bg-purple-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-purple-500/20 hover:bg-purple-500 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Add New City to Database</span>
        </button>
      </div>

      {/* 1. Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold">Total Registered Users</span>
            <Users className="h-4 w-4 text-purple-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{analytics?.totalUsers}</p>
          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> Active community growth
          </span>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold">Itineraries Created</span>
            <Compass className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{analytics?.totalTrips}</p>
          <span className="text-[10px] text-slate-400">Total planned journeys</span>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold">City Stops Planned</span>
            <MapPin className="h-4 w-4 text-cyan-500" />
          </div>
          <p className="text-3xl font-black text-cyan-600 dark:text-cyan-400">{analytics?.totalStops}</p>
          <span className="text-[10px] text-slate-400">Scheduled destination nodes</span>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold">Platform Budget Volume</span>
            <DollarSign className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-3xl font-black text-amber-500">
            {formatCurrency(analytics?.totalBudgetValue || 0, currency)}
          </p>
          <span className="text-[10px] text-slate-400">Managed travel finances</span>
        </div>
      </div>

      {/* 2. Interactive Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Popular Cities Bar Chart */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200/80 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-purple-600" />
              <span>Top Visited Destinations in Itineraries</span>
            </h3>
            <p className="text-xs text-slate-500">Ranked by frequency of user stop additions.</p>
          </div>

          <div className="h-64 w-full my-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.popularCities || []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="stopsCount" fill="#714B67" name="Itinerary Stops" radius={[8, 8, 0, 0]} />
                <Bar dataKey="wishlistCount" fill="#34d399" name="Wishlisted" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-2 text-[11px] text-slate-400">
            Live metrics aggregated from relational database tables.
          </div>
        </div>

        {/* Activity Categories Distribution */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-200/80 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PieIcon className="h-4 w-4 text-emerald-600" />
              <span>Activity Categories Catalog Share</span>
            </h3>
            <p className="text-xs text-slate-500">Distribution of available experiences.</p>
          </div>

          <div className="h-64 w-full my-4">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie
                  data={analytics?.categoryDistribution || []}
                  dataKey="count"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                >
                  {analytics?.categoryDistribution?.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPie>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 border-t border-slate-100 dark:border-slate-800 pt-2">
            {analytics?.categoryDistribution?.map((cat: any, idx: number) => (
              <div key={cat.category} className="flex items-center gap-2 text-xs">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                ></span>
                <span className="text-slate-600 dark:text-slate-300 truncate">{cat.category} ({cat.count})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. User Directory & Recent Trips Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users Table */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600" />
              <span>Registered Travelers ({analytics?.users?.length || 0})</span>
            </h3>
          </div>

          <div className="overflow-x-auto max-h-72 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold uppercase text-slate-400 dark:border-slate-800 dark:bg-slate-800">
                <tr>
                  <th className="px-3 py-2">User</th>
                  <th className="px-3 py-2">Role</th>
                  <th className="px-3 py-2">Trips</th>
                  <th className="px-3 py-2">Country</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {analytics?.users?.map((u: any) => (
                  <tr key={u.id}>
                    <td className="px-3 py-2.5 font-bold text-slate-900 dark:text-white truncate max-w-[140px]">
                      {u.name}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold ${u.role === "ADMIN" ? "bg-purple-100 text-purple-800 dark:bg-purple-950" : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950"}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-semibold text-slate-700 dark:text-slate-300">{u._count?.trips || 0}</td>
                    <td className="px-3 py-2.5 text-slate-500">{u.homeCountry || "US"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Trips Stream */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Compass className="h-4 w-4 text-emerald-600" />
              <span>Recent Trips Activity</span>
            </h3>
          </div>

          <div className="overflow-x-auto max-h-72 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold uppercase text-slate-400 dark:border-slate-800 dark:bg-slate-800">
                <tr>
                  <th className="px-3 py-2">Trip</th>
                  <th className="px-3 py-2">Creator</th>
                  <th className="px-3 py-2">Budget</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {analytics?.recentTrips?.map((t: any) => (
                  <tr key={t.id}>
                    <td className="px-3 py-2.5 font-bold text-slate-900 dark:text-white truncate max-w-[140px]">
                      <Link href={`/trips/${t.id}`} className="hover:text-emerald-600">
                        {t.title}
                      </Link>
                    </td>
                    <td className="px-3 py-2.5 text-slate-500 truncate max-w-[100px]">{t.user?.name}</td>
                    <td className="px-3 py-2.5 font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(t.totalBudget, t.currency)}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[9px] font-bold">
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal: Add New City Directly into Database */}
      {isCityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Add New Destination City</h3>

            <form onSubmit={handleCreateCity} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">City Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Florence"
                  value={newCityName}
                  onChange={(e) => setNewCityName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Country *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Italy"
                    value={newCityCountry}
                    onChange={(e) => setNewCityCountry(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Region</label>
                  <select
                    value={newCityRegion}
                    onChange={(e) => setNewCityRegion(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="Europe">Europe</option>
                    <option value="Asia">Asia</option>
                    <option value="Americas">Americas</option>
                    <option value="Africa">Africa</option>
                    <option value="Middle East">Middle East</option>
                    <option value="Oceania">Oceania</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Avg Daily Cost</label>
                  <input
                    type="number"
                    min="10"
                    value={newCityCost}
                    onChange={(e) => setNewCityCost(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Cost Index</label>
                  <select
                    value={newCityCostIndex}
                    onChange={(e) => setNewCityCostIndex(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="BUDGET">BUDGET</option>
                    <option value="MODERATE">MODERATE</option>
                    <option value="LUXURY">LUXURY</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Cover Photo URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newCityCover}
                  onChange={(e) => setNewCityCover(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCityModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-purple-600 px-5 py-2 font-bold text-white shadow hover:bg-purple-500"
                >
                  Save City
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
