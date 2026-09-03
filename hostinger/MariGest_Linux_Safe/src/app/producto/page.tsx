import { getStockOverview } from "@/lib/stock";
import { getStockMovements } from "@/app/actions/stock";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function ProductoPage() {
  const stock = await getStockOverview();
  const rojo = stock.find((s) => s.type === "ROJO");
  const blanco = stock.find((s) => s.type === "BLANCO");
  
  const movements = await getStockMovements(20);

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      BOTTLING: "Entrada Embotelladora",
      SALE: "Venta",
      ROTURA: "Rotura", // Map BREAKAGE to Rotura
      BREAKAGE: "Rotura",
      SHRINKAGE: "Merma",
      SAMPLE: "Muestra",
      PROMOTION: "Promoción",
      TASTING: "Cata",
      EVENT: "Salida Evento",
      REPLACEMENT: "Reposición",
      RETURN: "Devolución",
      ADJUSTMENT: "Ajuste",
      TRANSFER: "Transferencia"
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center bg-slate-900 text-white p-6 rounded-xl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock y Movimientos</h1>
          <p className="text-slate-400 font-medium">Control de almacén, embotelladora y eventos.</p>
        </div>
        <Link href="/producto/nuevo">
          <Button className="bg-rose-600 hover:bg-rose-500 text-white shadow-lg h-12 px-6">
            <Plus className="w-5 h-5 mr-2" />
            NUEVO MOVIMIENTO
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ROJO */}
        <Card className="border-rose-100 shadow-sm">
          <CardHeader className="bg-rose-50/50 pb-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-rose-900">Vermut Rojo</CardTitle>
              <span className="text-2xl font-bold text-rose-900">{rojo?.total || 0} ud</span>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-4 border-b pb-4">
              <div className="text-center w-full">
                <p className="text-sm text-slate-500 font-medium">Disponible Almacén Principal</p>
                <p className="text-3xl font-light text-slate-800">{rojo?.almacen || 0}</p>
              </div>
              <div className="w-px h-12 bg-slate-200 mx-4"></div>
              <div className="text-center w-full hover:bg-slate-50 rounded-lg transition-colors p-2 cursor-pointer">
                <Link href="/producto/eventos">
                  <p className="text-sm text-slate-500 font-medium">Fuera en eventos</p>
                  <p className="text-3xl font-light text-slate-800">{rojo?.fuera || 0}</p>
                </Link>
              </div>
            </div>
            <p className="text-xs text-center text-slate-400 mt-2">Equivalente: ~{Math.floor((rojo?.total || 0) / 6)} cajas totales</p>
          </CardContent>
        </Card>

        {/* BLANCO */}
        <Card className="border-amber-100 shadow-sm">
          <CardHeader className="bg-amber-50/50 pb-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-amber-700">Vermut Blanco</CardTitle>
              <span className="text-2xl font-bold text-amber-700">{blanco?.total || 0} ud</span>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-4 border-b pb-4">
              <div className="text-center w-full">
                <p className="text-sm text-slate-500 font-medium">Disponible Almacén Principal</p>
                <p className="text-3xl font-light text-slate-800">{blanco?.almacen || 0}</p>
              </div>
              <div className="w-px h-12 bg-slate-200 mx-4"></div>
              <div className="text-center w-full hover:bg-slate-50 rounded-lg transition-colors p-2 cursor-pointer">
                <Link href="/producto/eventos">
                  <p className="text-sm text-slate-500 font-medium">Fuera en eventos</p>
                  <p className="text-3xl font-light text-slate-800">{blanco?.fuera || 0}</p>
                </Link>
              </div>
            </div>
            <p className="text-xs text-center text-slate-400 mt-2">Equivalente: ~{Math.floor((blanco?.total || 0) / 6)} cajas totales</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Últimos Movimientos</CardTitle>
        </CardHeader>
        <CardContent>
          {movements.length === 0 ? (
            <p className="text-slate-500 text-sm">No hay movimientos registrados.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Fecha</th>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3">Producto</th>
                    <th className="px-4 py-3 text-right">Cantidad</th>
                    <th className="px-4 py-3 text-right">Stock Final</th>
                    <th className="px-4 py-3 rounded-tr-lg">Motivo / Usuario</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map(mov => {
                    const isPositive = mov.stockAfter > mov.stockBefore;
                    return (
                      <tr key={mov.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="px-4 py-3 text-slate-500">{new Date(mov.date).toLocaleString()}</td>
                        <td className="px-4 py-3 font-medium">{getTypeLabel(mov.type)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${mov.product.type === 'ROJO' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>
                            {mov.product.name}
                          </span>
                        </td>
                        <td className={`px-4 py-3 text-right font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {isPositive ? '+' : '-'}{mov.quantity}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-500">{mov.stockAfter}</td>
                        <td className="px-4 py-3">
                          <div className="truncate max-w-[200px]" title={mov.reason || '-'}>{mov.reason || '-'}</div>
                          <div className="text-xs text-slate-400">{mov.user}</div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
