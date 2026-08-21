import { getDashboardData } from "@/app/actions/dashboard";
import { getNegocioDashboard } from "@/app/actions/negocio";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default async function Home() {
  const data = await getDashboardData();
  const negocio = await getNegocioDashboard();
  const maxChartValue = Math.max(...data.chartData.map(d => d.total), 1000); // Para altura proporcional

  return (
    <div className="space-y-8 pb-10">
      
      {/* 1. KPIs SUPERIORES */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-slate-500 uppercase">Ventas este mes</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-2xl font-bold text-slate-900">{data.ventasMes.toFixed(2)} €</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-slate-500 uppercase">Ventas este año</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-2xl font-bold text-slate-900">{data.ventasAno.toFixed(2)} €</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-slate-500 uppercase">A Cobrar</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-2xl font-bold text-slate-900">{data.aCobrarTotal.toFixed(2)} €</p>
          </CardContent>
        </Card>

        <Card className={`shadow-sm ${data.vencidoTotal > 0 ? 'border-rose-300 bg-rose-50/50' : ''}`}>
          <CardHeader className="p-4 pb-2">
            <CardTitle className={`text-xs font-medium uppercase ${data.vencidoTotal > 0 ? 'text-rose-800' : 'text-slate-500'}`}>
              Vencido
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className={`text-2xl font-bold ${data.vencidoTotal > 0 ? 'text-rose-900' : 'text-slate-900'}`}>
              {data.vencidoTotal.toFixed(2)} €
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-slate-500 uppercase">A Pagar</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-2xl font-bold text-slate-900">{data.aPagarTotal.toFixed(2)} €</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-dashed">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-slate-500 uppercase">Margen Est.</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-2xl font-bold text-slate-900">{negocio.kpis.margenEstimado.toFixed(2)} €</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2. ALERTAS */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-800">Necesita Atención</h2>
          {data.alertas.length === 0 ? (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-emerald-800 font-medium flex items-center gap-2">
              <span className="text-xl">✓</span> Todo al día
            </div>
          ) : (
            <div className="space-y-2">
              {data.alertas.map((alerta, i) => (
                <div key={i} className={`rounded-xl p-4 border text-sm font-medium ${
                  alerta.type === 'danger' ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}>
                  ⚠️ {alerta.message}
                </div>
              ))}
            </div>
          )}

          {/* EVOLUCIÓN (Gráfico) */}
          <Card className="shadow-sm mt-6">
            <CardHeader>
              <CardTitle className="text-base">Evolución (Ventas)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-40 flex items-end justify-between gap-2 pt-4">
                {data.chartData.map((d, i) => {
                  const height = d.total === 0 ? 4 : (d.total / maxChartValue) * 100;
                  return (
                    <div key={i} className="flex flex-col items-center gap-2 flex-1 group relative">
                      {d.total > 0 && (
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-slate-800 text-white text-xs px-2 py-1 rounded transition-opacity">
                          {d.total.toFixed(0)}€
                        </div>
                      )}
                      <div className="w-full bg-slate-100 rounded-t-sm relative flex items-end" style={{ height: '100%' }}>
                        <div 
                          className="w-full bg-rose-900 rounded-t-sm transition-all" 
                          style={{ height: `${height}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-slate-500 capitalize">{d.label}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 3. STOCK Y PRÓXIMOS COBROS */}
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Stock Actual</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Rojo */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-800">Vermut Rojo</span>
                  <span className="font-bold text-rose-900">{data.rojo.total} ud</span>
                </div>
                <div className="text-xs text-slate-500 flex justify-between">
                  <span>Almacén: {data.rojo.almacen}</span>
                  <span>Eventos: {data.rojo.fuera}</span>
                </div>
              </div>
              <div className="border-t border-slate-100"></div>
              {/* Blanco */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-800">Vermut Blanco</span>
                  <span className="font-bold text-amber-600">{data.blanco.total} ud</span>
                </div>
                <div className="text-xs text-slate-500 flex justify-between">
                  <span>Almacén: {data.blanco.almacen}</span>
                  <span>Eventos: {data.blanco.fuera}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-base">Próximos Cobros</CardTitle>
            </CardHeader>
            <CardContent>
              {data.proximosCobros.length === 0 ? (
                <p className="text-sm text-slate-500">No hay cobros pendientes.</p>
              ) : (
                <div className="space-y-3">
                  {data.proximosCobros.map(c => {
                    const isOverdue = new Date(c.dueDate) < new Date();
                    return (
                      <div key={c.id} className="flex justify-between items-center text-sm border-b pb-2 last:border-0 last:pb-0">
                        <div>
                          <p className="font-medium truncate max-w-[120px]">{c.client?.commercialName || 'Cliente'}</p>
                          <p className="text-xs text-slate-500">{new Date(c.dueDate).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{(c.amount - c.paidAmount).toFixed(2)} €</p>
                          <span className={`inline-block w-2 h-2 rounded-full ${isOverdue ? 'bg-rose-500' : 'bg-amber-500'}`}></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 4. ACTIVIDAD RECIENTE */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          {data.recentOrders.length === 0 ? (
            <p className="text-sm text-slate-500">No hay actividad reciente.</p>
          ) : (
            <div className="divide-y">
              {data.recentOrders.map(order => (
                <div key={order.id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">Venta generada - {order.client.commercialName}</p>
                    <p className="text-xs text-slate-500">{new Date(order.date).toLocaleString()} • {order.totalBottles} botellas</p>
                  </div>
                  <Link href={`/clientes/${order.clientId}`}>
                    <span className="text-xs font-medium text-rose-900 hover:underline">Ver</span>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
    </div>
  );
}
