import Link from "next/link";
import { ReactNode } from "react";

export default function TesoreriaLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Tesorería</h1>
          <p className="text-slate-500">Control de flujo de caja y previsiones.</p>
        </div>
      </div>
      
      <div className="flex border-b border-slate-200 overflow-x-auto">
        <Link 
          href="/tesoreria" 
          className="px-4 py-3 text-sm font-medium border-b-2 border-transparent hover:text-slate-900 hover:border-slate-300 text-slate-500 whitespace-nowrap"
        >
          RESUMEN Y PREVISIONES
        </Link>
        <Link 
          href="/tesoreria/cobros" 
          className="px-4 py-3 text-sm font-medium border-b-2 border-transparent hover:text-slate-900 hover:border-slate-300 text-slate-500 whitespace-nowrap"
        >
          A COBRAR
        </Link>
        <Link 
          href="/tesoreria/pagos" 
          className="px-4 py-3 text-sm font-medium border-b-2 border-transparent hover:text-slate-900 hover:border-slate-300 text-slate-500 whitespace-nowrap"
        >
          A PAGAR
        </Link>
        <Link 
          href="/tesoreria/gastos" 
          className="px-4 py-3 text-sm font-medium border-b-2 border-transparent hover:text-slate-900 hover:border-slate-300 text-slate-500 whitespace-nowrap"
        >
          GASTOS GENERALES
        </Link>
      </div>
      <div>
        {children}
      </div>
    </div>
  );
}
