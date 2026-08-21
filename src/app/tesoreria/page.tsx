import { getTesoreriaDashboard } from "@/app/actions/tesoreria";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default async function TesoreriaPage() {
  const data = await getTesoreriaDashboard();

  return (
    <div className="space-y-8">
      {/* 1. KPIs PRINCIPALES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm border-emerald-100 bg-emerald-50/30">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-emerald-800 uppercase">A Cobrar Total</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-3xl font-bold text-emerald-900">{data.aCobrarTotal.toFixed(2)} €</p>
            <p className="text-xs text-emerald-700 mt-1">Pendiente de ingreso</p>
          </CardContent>
        </Card>
        
        <Card className={`shadow-sm ${data.vencidoCobrar > 0 ? 'border-rose-200 bg-rose-50/50' : 'border-slate-100'}`}>
          <CardHeader className="p-4 pb-2">
            <CardTitle className={`text-xs font-medium uppercase ${data.vencidoCobrar > 0 ? 'text-rose-800' : 'text-slate-500'}`}>
              Vencido (A Cobrar)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className={`text-3xl font-bold ${data.vencidoCobrar > 0 ? 'text-rose-900' : 'text-slate-400'}`}>
              {data.vencidoCobrar.toFixed(2)} €
            </p>
            <p className={`text-xs mt-1 ${data.vencidoCobrar > 0 ? 'text-rose-700' : 'text-slate-400'}`}>
              {data.vencidoCobrar > 0 ? '¡Reclamar pagos!' : 'Todo al día'}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-amber-100 bg-amber-50/30">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-amber-800 uppercase">A Pagar Total</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-3xl font-bold text-amber-900">{data.aPagarTotal.toFixed(2)} €</p>
            <p className="text-xs text-amber-700 mt-1">Proveedores y gastos</p>
          </CardContent>
        </Card>

        <Card className={`shadow-sm ${data.vencidoPagar > 0 ? 'border-rose-200 bg-rose-50/50' : 'border-slate-100'}`}>
          <CardHeader className="p-4 pb-2">
            <CardTitle className={`text-xs font-medium uppercase ${data.vencidoPagar > 0 ? 'text-rose-800' : 'text-slate-500'}`}>
              Vencido (A Pagar)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className={`text-3xl font-bold ${data.vencidoPagar > 0 ? 'text-rose-900' : 'text-slate-400'}`}>
              {data.vencidoPagar.toFixed(2)} €
            </p>
            <p className={`text-xs mt-1 ${data.vencidoPagar > 0 ? 'text-rose-700' : 'text-slate-400'}`}>
              {data.vencidoPagar > 0 ? '¡Atención pagos atrasados!' : 'Todo al día'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 2. PREVISIONES */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle>Previsiones de Liquidez</CardTitle>
          <p className="text-sm text-slate-500">Saldo previsto por tramos considerando facturas a cobrar menos facturas a pagar.</p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: "Próximos 7 días", data: data.prevision.d7 },
              { label: "Hasta 30 días", data: data.prevision.d30 },
              { label: "Hasta 60 días", data: data.prevision.d60 },
              { label: "Hasta 90 días", data: data.prevision.d90 },
            ].map((tramo, i) => (
              <div key={i} className="space-y-3">
                <h3 className="font-bold text-slate-800 border-b pb-2">{tramo.label}</h3>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Entrarán:</span>
                  <span className="text-emerald-700 font-medium">+{tramo.data.cobrar.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Saldrán:</span>
                  <span className="text-rose-700 font-medium">-{tramo.data.pagar.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base pt-2 border-t font-bold">
                  <span>Balance:</span>
                  <span className={tramo.data.balance >= 0 ? "text-emerald-700" : "text-rose-700"}>
                    {tramo.data.balance > 0 ? '+' : ''}{tramo.data.balance.toFixed(2)} €
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
