import { getGestoriaData } from "@/app/actions/gestoria";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default async function GestoriaPage({ searchParams }: { searchParams: Promise<{ period?: string, start?: string, end?: string }> }) {
  const params = await searchParams;
  const period = params.period || "TRIMESTRE";
  const start = params.start;
  const end = params.end;
  
  const data = await getGestoriaData(period, start, end);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center bg-rose-50 p-6 rounded-xl border border-rose-100 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Gestoría</h1>
          <p className="text-rose-800/80 font-medium">Información de gestión interna. No constituye liquidación fiscal oficial (AEAT).</p>
        </div>
        <div className="flex flex-col items-stretch gap-2 w-full md:w-[400px]">
          <div className="flex bg-white p-1 rounded-lg text-sm border shadow-sm w-full">
            {["MES", "TRIMESTRE", "AÑO", "TODO"].map(p => (
              <a 
                key={p} 
                href={`/gestoria?period=${p}`} 
                className={`flex-1 text-center px-2 py-2 rounded-md ${period === p && !start ? 'bg-rose-900 shadow-sm font-bold text-white' : 'text-slate-600 hover:text-slate-900'}`}
              >
                {p}
              </a>
            ))}
          </div>
          
          <form action="/gestoria" method="GET" className="flex justify-between gap-1 items-center text-sm bg-white p-1.5 rounded-lg border shadow-sm w-full">
            <span className="text-slate-500 font-medium px-1">Fechas:</span>
            <input type="date" name="start" defaultValue={start} required className="border rounded px-1 py-1 text-slate-700 w-28" />
            <span className="text-slate-400">-</span>
            <input type="date" name="end" defaultValue={end} required className="border rounded px-1 py-1 text-slate-700 w-28" />
            <button type="submit" className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded font-medium border flex-1 ml-1">Ver</button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* FACTURAS EMITIDAS */}
        <Card>
          <CardHeader className="bg-slate-50 border-b">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Facturas Emitidas</CardTitle>
                <CardDescription>Ventas a clientes</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Base Imponible</span>
              <span className="font-medium">{data.emitidas.base.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">IVA Repercutido</span>
              <span className="font-bold text-slate-900">{data.emitidas.iva.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between items-center border-t pt-2 text-lg font-bold">
              <span>Total</span>
              <span>{data.emitidas.total.toFixed(2)} €</span>
            </div>
          </CardContent>
        </Card>

        {/* FACTURAS RECIBIDAS / GASTOS */}
        <Card>
          <CardHeader className="bg-slate-50 border-b">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Compras y Gastos</CardTitle>
                <CardDescription>Facturas recibidas</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Base Imponible</span>
              <span className="font-medium">{data.soportado.base.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">IVA Soportado</span>
              <span className="font-bold text-slate-900">{data.soportado.iva.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between items-center border-t pt-2 text-lg font-bold">
              <span>Total</span>
              <span>{data.soportado.total.toFixed(2)} €</span>
            </div>
          </CardContent>
        </Card>

        {/* RESUMEN IVA */}
        <Card className="bg-slate-900 text-white border-slate-800">
          <CardHeader className="border-b border-slate-800">
            <CardTitle className="text-slate-100">Resumen IVA</CardTitle>
            <CardDescription className="text-slate-400">Diferencial estimado del periodo</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">IVA Repercutido (+)</span>
              <span className="font-medium text-emerald-400">{data.emitidas.iva.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">IVA Soportado (-)</span>
              <span className="font-medium text-rose-400">{data.soportado.iva.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between items-center border-t border-slate-800 pt-4 mt-2">
              <span className="text-lg">Resultado Estimado</span>
              <span className={`text-2xl font-bold ${data.diferenciaIva > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {data.diferenciaIva > 0 ? 'A PAGAR' : 'A COMPENSAR'}
              </span>
            </div>
            <div className="text-right text-3xl font-black">
              {Math.abs(data.diferenciaIva).toFixed(2)} €
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-center pt-8">
        <a href={`/api/export-gestoria?period=${period}${start ? `&start=${start}&end=${end}` : ''}`}>
          <Button size="lg" className="bg-slate-900 hover:bg-slate-800 h-14 px-8 text-lg shadow-lg">
            <Download className="w-5 h-5 mr-3" />
            EXPORTAR {start ? 'FECHAS SELECCIONADAS' : period} (EXCEL XLSX)
          </Button>
        </a>
      </div>
    </div>
  );
}
