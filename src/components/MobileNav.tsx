"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { ProfileSelector } from "./ProfileSelector";

export function MobileNav({ isGranel, currentProfile }: { isGranel?: boolean, currentProfile: string }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);
  const close = () => setIsOpen(false);

  return (
    <div className="md:hidden">
      <button onClick={toggle} className="p-2 text-slate-600 hover:text-brand-900 transition-colors">
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b shadow-lg z-50 flex flex-col p-4 gap-4 text-lg font-medium text-slate-600">
          <div className="pb-4 border-b flex justify-center">
            <ProfileSelector currentProfile={currentProfile} />
          </div>
          <Link href="/" onClick={close} className="hover:text-brand-900 transition-colors py-2 border-b">HOY</Link>
          <Link href="/clientes" onClick={close} className="hover:text-brand-900 transition-colors py-2 border-b">CLIENTES</Link>
          <Link href="/ventas" onClick={close} className="hover:text-brand-900 transition-colors py-2 border-b">VENTAS</Link>
          <Link href="/producto" onClick={close} className="hover:text-brand-900 transition-colors py-2 border-b">PRODUCTO</Link>
          <Link href="/tesoreria" onClick={close} className="hover:text-brand-900 transition-colors py-2 border-b">TESORERÍA</Link>
          <Link href="/negocio" onClick={close} className="hover:text-brand-900 transition-colors py-2 border-b">RESUMEN</Link>
          <div className="flex flex-col gap-4 pt-4 mt-2">
            <Link href="/gestoria" onClick={close} className="hover:text-brand-900 transition-colors text-slate-500">GESTORÍA</Link>
            <Link href="/configuracion" onClick={close} className="hover:text-brand-900 transition-colors text-slate-500">CONFIGURACIÓN</Link>
          </div>
        </div>
      )}
    </div>
  );
}

