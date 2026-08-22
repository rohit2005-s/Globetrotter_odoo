"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency, formatDate, formatDateShort, calculateDurationDays, getCategoryBadgeColor } from "@/lib/utils";
import {
  Globe,
  Calendar,
  MapPin,
  Clock,
  Copy,
  Share2,
  Heart,
  Sparkles,
  ExternalLink,
  Printer,
  Check,
  User,
  ArrowRight,
} from "lucide-react";

export default function PublicShareTripPage() {
  const params = useParams();
  const token = params.token as string;
  const router = useRouter();
  const { user, currency, showToast, openAuthModal } = useAuth();

  const [trip, setTrip] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [cloning, setCloning] = useState(false);

  useEffect(() => {
    async function loadPublicTrip() {
      try {
        setLoading(true);
        const res = await fetch(`/api/trips/share/${token}`);
        if (res.ok) {
          const data = await res.json();
          setTrip(data.trip);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadPublicTrip();
  }, [token]);

  const handleCloneTrip = async () => {
    if (!user) {
      showToast("Please log in or sign up to copy this trip to your account!", "info");
      openAuthModal("login");
      return;
    }

    if (!trip) return;
    setCloning(true);
    try {
      const res = await fetch(`/api/trips/${trip.id}/clone`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        showToast("Trip copied to your account! Opening itinerary...", "success");
        router.push(`/trips/${data.clonedTripId}`);
      } else {
        showToast(data.error || "Failed to clone trip", "error");
      }
    } catch (e: any) {
      showToast(e.message, "error");
    } finally {
      setCloning(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast("Shareable link copied to clipboard!", "success");
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent(`Check out this amazing travel itinerary on GlobeTrotter: "${trip?.title}"! 🌍✈️`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(window.location.href)}`, "_blank");
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(`Check out this travel plan on GlobeTrotter: "${trip?.title}" ${window.location.href}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl py-20 text-center space-y-4">
        <div className="h-12 w-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-bold text-slate-500">Loading public itinerary...</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="mx-auto max-w-md py-20 text-center space-y-4">
        <h2 className="text-xl font-bold">Trip Not Found</h2>
        <p className="text-xs text-slate-500">This itinerary may have been removed or made private by the creator.</p>
        <Link href="/" className="inline-block rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white">
          Return to GlobeTrotter
        </Link>
      </div>
    );
  }

  const durationDays = calculateDurationDays(trip.startDate, trip.endDate);

  return (
    <div className="min-h-screen pb-20">
      {/* 1. Public Hero Banner */}
      <div className="relative overflow-hidden bg-slate-900 text-white">
        <div className="absolute inset-0">
          <img
            src={trip.coverImage || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&auto=format&fit=crop&q=80"}
            alt={trip.title}
            className="h-full w-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent"></div>
        </div>

        <div className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-950/80 border border-emerald-500/40 px-3.5 py-1 text-xs font-bold text-emerald-300 backdrop-blur-md">
              <Globe className="h-3.5 w-3.5" />
              <span>Public Community Itinerary</span>
            </div>

            {/* Social Share Group */}
            <div className="flex items-center gap-2">
              <button
                onClick={copyLink}
                className="flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md transition-all"
              >
                <Copy className="h-3.5 w-3.5 text-emerald-400" />
                <span>Copy Link</span>
              </button>
              <button
                onClick={shareOnWhatsApp}
                className="rounded-xl bg-emerald-600/90 hover:bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow transition-all"
              >
                WhatsApp
              </button>
              <button
                onClick={shareOnTwitter}
                className="rounded-xl bg-sky-500/90 hover:bg-sky-500 px-3 py-1.5 text-xs font-bold text-white shadow transition-all"
              >
                X / Twitter
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              {trip.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              {trip.description || "An inspiring multi-city travel itinerary created on GlobeTrotter."}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-2">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-emerald-400" />
                <span>
                  {formatDate(trip.startDate)} – {formatDate(trip.endDate)} ({durationDays} Days)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-rose-400" />
                <span>{trip.stops?.length || 0} City Destinations</span>
              </div>
              {trip.user && (
                <div className="flex items-center gap-1.5">
                  <User className="h-4 w-4 text-cyan-400" />
                  <span>Curated by {trip.user.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Prominent "Copy Trip to My Account" CTA */}
          <div className="rounded-3xl bg-emerald-950/80 border border-emerald-500/40 p-5 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span>Love this itinerary? Make it your own!</span>
              </h3>
              <p className="text-xs text-slate-300">
                Clone all stops, schedules, and activities to your personal dashboard with 1 click.
              </p>
            </div>

            <button
              onClick={handleCloneTrip}
              disabled={cloning}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 px-6 py-3 text-xs font-black text-slate-950 shadow-xl hover:from-emerald-400 hover:to-teal-300 active:scale-95 disabled:opacity-50 transition-all whitespace-nowrap"
            >
              <Copy className="h-4 w-4" />
              <span>{cloning ? "Cloning Trip..." : "Copy Trip to My Account"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Public Itinerary Day-Wise Flow */}
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 space-y-10">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <MapPin className="h-5 w-5 text-emerald-600" />
            <span>Complete Route Breakdown</span>
          </h2>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print View</span>
          </button>
        </div>

        {trip.stops?.map((stop: any, stopIdx: number) => {
          const stopDays = calculateDurationDays(stop.arrivalDate, stop.departureDate);
          return (
            <div
              key={stop.id}
              className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4"
            >
              {/* City Header */}
              <div className="relative h-44 w-full overflow-hidden bg-slate-900 text-white">
                <img
                  src={stop.city?.coverImage}
                  alt={stop.city?.name}
                  className="h-full w-full object-cover opacity-30"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>

                <div className="absolute bottom-4 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      Stop {stopIdx + 1} of {trip.stops.length}
                    </span>
                    <h3 className="text-2xl font-black text-white">{stop.city?.name}, {stop.city?.country}</h3>
                    <p className="text-xs text-slate-300">
                      {formatDate(stop.arrivalDate)} – {formatDate(stop.departureDate)} ({stopDays} Days)
                    </p>
                  </div>

                  {stop.accommodationName && (
                    <div className="rounded-xl bg-black/40 backdrop-blur-md px-3 py-1.5 text-xs border border-white/10">
                      🏨 Stay: {stop.accommodationName}
                    </div>
                  )}
                </div>
              </div>

              {/* Scheduled activities list */}
              <div className="p-6 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Experiences in {stop.city?.name} ({stop.activities?.length || 0})
                </h4>

                {stop.activities?.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">
                    Free exploration days scheduled for this city.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {stop.activities.map((act: any) => {
                      const title = act.customTitle || act.activity?.title;
                      const cost = act.customCost !== null ? act.customCost : act.activity?.cost || 0;
                      const image = act.activity?.image || stop.city?.coverImage;
                      const category = act.activity?.category || "ACTIVITY";

                      return (
                        <div
                          key={act.id}
                          className="flex items-center gap-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-3 border border-slate-100 dark:border-slate-800"
                        >
                          <img
                            src={image}
                            alt={title}
                            className="h-12 w-12 rounded-xl object-cover"
                          />
                          <div className="flex-1 overflow-hidden">
                            <span className={`inline-block rounded px-1.5 py-0.5 text-[9px] font-bold border ${getCategoryBadgeColor(category)}`}>
                              {category}
                            </span>
                            <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {title}
                            </h5>
                            <span className="text-[10px] text-slate-500">
                              {formatDateShort(act.scheduledDate)} • {act.customTime || act.timeSlot}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
