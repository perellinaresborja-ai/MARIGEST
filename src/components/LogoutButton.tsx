"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { logout } from "@/app/actions/auth";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/login");
    router.refresh();
  }

  return (
    <button 
      onClick={handleLogout}
      className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-brand-900 transition-colors ml-4"
      title="Cerrar sesión"
    >
      <LogOut className="h-4 w-4" />
      <span className="hidden md:inline">Salir</span>
    </button>
  );
}
