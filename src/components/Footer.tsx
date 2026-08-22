import React from "react";
import Link from "next/link";
import { Globe, Heart, Compass, MapPin, Layers, Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-900 text-slate-400 dark:border-slate-800 transition-colors">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1 */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-md">
                <Globe className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Globe<span className="text-emerald-400">Trotter</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Personalized, intelligent, and collaborative travel planning platform. Dream, design, and organize multi-city adventures with ease.
            </p>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-800/80 px-3 py-1 text-[11px] font-medium text-emerald-400 border border-slate-700/60">
              <Sparkles className="h-3 w-3" />
              <span>Odoo Hackathon 2026</span>
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Trip Planning</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/trips/new" className="hover:text-emerald-400 transition-colors">
                  Create New Itinerary
                </Link>
              </li>
              <li>
                <Link href="/trips" className="hover:text-emerald-400 transition-colors">
                  My Trips & Schedules
                </Link>
              </li>
              <li>
                <Link href="/cities" className="hover:text-emerald-400 transition-colors">
                  Explore Global Destinations
                </Link>
              </li>
              <li>
                <Link href="/activities" className="hover:text-emerald-400 transition-colors">
                  Activity Catalog
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Features</h3>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                <span>Relational Multi-City Routes</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-400"></span>
                <span>Automated Budget & Charts</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
                <span>Interactive Day Timelines</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
                <span>Public Shareable Links</span>
              </li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">GlobeTrotter Stack</h3>
            <p className="text-xs leading-relaxed text-slate-400">
              Built with Next.js 14, React, TypeScript, Tailwind CSS, Prisma Relational ORM, SQLite/PostgreSQL, and Recharts.
            </p>
            <p className="text-[11px] text-slate-500 flex items-center gap-1 pt-2">
              Made with <Heart className="h-3 w-3 text-rose-500 fill-rose-500 inline" /> for travelers worldwide.
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} GlobeTrotter Inc. All rights reserved.</p>
          <p>Odoo Hackathon Full-Stack Submission</p>
        </div>
      </div>
    </footer>
  );
}
