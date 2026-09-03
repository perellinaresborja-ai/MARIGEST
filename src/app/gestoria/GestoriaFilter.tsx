"use client";

import { useRouter } from "next/navigation";

export function GestoriaFilter({ currentFilter }: { currentFilter: string }) {
  const router = useRouter();
  
  return (
    <div className="flex bg-slate-100 p-1 rounded-lg w-fit mt-4">
      <button
        onClick={() => router.push(`?profile=GENERAL`)}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
          currentFilter === "GENERAL" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
        }`}
      >
        GENERAL
      </button>
      <button
        onClick={() => router.push(`?profile=VERMUT`)}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
          currentFilter === "VERMUT" ? "bg-white text-brand-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
        }`}
      >
        PUIG CAMPANA
      </button>
      <button
        onClick={() => router.push(`?profile=GRANEL_PREMIUM`)}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
          currentFilter === "GRANEL_PREMIUM" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
        }`}
      >
        GRANEL PREMIUM
      </button>
    </div>
  );
}
