import { getNegocioDashboard } from "@/app/actions/negocio";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function NegocioPage({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  const params = await searchParams;
  const period = params.period || "MES";
  
  const data = await getNegocioDashboard(period);
  const { kpis, canales } = data;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Resumen</h1>
          <p className="text-slate-500">Rentabilidad, canales y rendimiento comercial.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg text-sm">
          {["MES", "TRIMESTRE", "AÑO", "TODO"].map(p => (
            <a 
              key={p} 
              href={`/negocio?period=${p}`} 
              className={`px-4 py-2 rounded-md ${period === p ? 'bg-white shadow-sm font-bold text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}
            >
              {p}
            </a>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-emerald-50 border-emerald-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase text-emerald-800">Facturación (Base)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-900">{kpis.facturacion.toFixed(2)} €</p>
          </CardContent>
        </Card>

        <Card className="bg-rose-50 border-rose-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase text-rose-800">Coste Producto</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-rose-900">-{kpis.costeProductoVendido.toFixed(2)} €</p>
          </CardContent>
        </Card>

        <Card className="bg-rose-50 border-rose-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase text-rose-800">Gastos Generales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-rose-900">-{kpis.gastosTotales.toFixed(2)} €</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase text-slate-300">Margen Estimado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{kpis.margenEstimado.toFixed(2)} €</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase text-slate-500">Botellas Vendidas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{kpis.botellasVendidas}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase text-slate-500">Botellas Promocionales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-600">{kpis.botellasPromo}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase text-slate-500">Pendiente de Cobro</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-700">{kpis.pendienteCobro.toFixed(2)} €</p>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-bold tracking-tight text-slate-900 pt-4">Rendimiento por Canal</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(canales).map(([canal, stats]) => {
          const margen = stats.facturacion - stats.coste;
          const porcentaje = kpis.facturacion > 0 ? (stats.facturacion / kpis.facturacion) * 100 : 0;
          
          return (
            <Card key={canal} className="shadow-sm">
              <CardHeader className="border-b bg-slate-50 pb-3">
                <CardTitle className="text-sm font-bold text-slate-800">{canal}</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Facturación</span>
                  <span className="font-bold">{stats.facturacion.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Botellas</span>
                  <span className="font-bold">{stats.botellas}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Peso en ventas</span>
                  <span className="font-bold text-amber-600">{porcentaje.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center text-sm border-t pt-2 mt-2">
                  <span className="text-slate-500">Margen bruto</span>
                  <span className="font-bold text-emerald-700">{margen.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between items-center text-xs text-rose-700">
                  <span>Pendiente cobro</span>
                  <span>{stats.pendiente.toFixed(2)} €</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
