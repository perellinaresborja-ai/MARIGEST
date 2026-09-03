"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { setProfileCookie } from "@/app/actions/profile";

export function ProfileSelector({ currentProfile }: { currentProfile: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [profile, setProfile] = useState(currentProfile);

  const handleProfileChange = (newProfile: string) => {
    setProfile(newProfile);
    // Cambiar inmediatamente en el DOM para asegurar que las variables CSS mutan
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-brand', newProfile === "GRANEL_PREMIUM" ? "granel" : "puig");
    }
    
    startTransition(async () => {
      await setProfileCookie(newProfile);
      router.push("/");
      router.refresh();
    });
  };

  return (
    <div className="flex bg-slate-100 p-1 rounded-lg">
      <button
        onClick={() => handleProfileChange("VERMUT")}
        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
          profile === "VERMUT"
            ? "bg-white text-brand-900 shadow-sm"
            : "text-slate-500 hover:text-slate-700"
        }`}
        disabled={isPending}
      >
        PUIG CAMPANA
      </button>
      <button
        onClick={() => handleProfileChange("GRANEL_PREMIUM")}
        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
          profile === "GRANEL_PREMIUM"
            ? "bg-white text-emerald-700 shadow-sm"
            : "text-slate-500 hover:text-slate-700"
        }`}
        disabled={isPending}
      >
        GRANEL PREMIUM
      </button>
    </div>
  );
}
