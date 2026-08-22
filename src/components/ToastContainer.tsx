"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

export default function ToastContainer() {
  const { toasts, removeToast } = useAuth();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let Icon = CheckCircle2;
        let bg = "bg-emerald-950 border-emerald-800 text-emerald-100";

        if (toast.type === "error") {
          Icon = AlertCircle;
          bg = "bg-rose-950 border-rose-800 text-rose-100";
        } else if (toast.type === "warning") {
          Icon = AlertTriangle;
          bg = "bg-amber-950 border-amber-800 text-amber-100";
        } else if (toast.type === "info") {
          Icon = Info;
          bg = "bg-sky-950 border-sky-800 text-sky-100";
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 shadow-xl backdrop-blur-md transition-all animate-in slide-in-from-bottom-2 ${bg}`}
          >
            <div className="flex items-center gap-2.5">
              <Icon className="h-5 w-5 flex-shrink-0" />
              <p className="text-xs font-medium leading-tight">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="rounded-full p-1 opacity-70 hover:opacity-100 hover:bg-white/10"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
