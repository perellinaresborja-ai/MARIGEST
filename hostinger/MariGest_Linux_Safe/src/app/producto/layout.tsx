import Link from "next/link";
import { ReactNode } from "react";

export default function ProductoLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-6">
      <div className="flex border-b border-slate-200 overflow-x-auto">
        <Link 
          href="/producto" 
          className="px-4 py-3 text-sm font-medium border-b-2 border-transparent hover:text-slate-900 hover:border-slate-300 text-slate-500 whitespace-nowrap"
        >
          STOCK
        </Link>
        <Link 
          href="/producto/compras" 
          className="px-4 py-3 text-sm font-medium border-b-2 border-transparent hover:text-slate-900 hover:border-slate-300 text-slate-500 whitespace-nowrap"
        >
          COMPRAS / ENTRADAS
        </Link>
        <Link 
          href="/producto/movimientos" 
          className="px-4 py-3 text-sm font-medium border-b-2 border-transparent hover:text-slate-900 hover:border-slate-300 text-slate-500 whitespace-nowrap"
        >
          MOVIMIENTOS
        </Link>
        <Link 
          href="/producto/eventos" 
          className="px-4 py-3 text-sm font-medium border-b-2 border-transparent hover:text-slate-900 hover:border-slate-300 text-slate-500 whitespace-nowrap"
        >
          EVENTOS
        </Link>
      </div>
      <div>
        {children}
      </div>
    </div>
  );
}
