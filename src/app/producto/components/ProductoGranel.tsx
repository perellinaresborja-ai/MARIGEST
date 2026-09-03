import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export async function ProductoGranel() {
  const seeds = await prisma.seedProduct.findMany({ orderBy: { name: 'asc' } });
  
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center bg-emerald-900 text-white p-6 rounded-xl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Catálogo de Semillas</h1>
          <p className="text-emerald-100/80 font-medium">Lista de productos registrados de Granel Premium.</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-emerald-900">Productos Registrados</CardTitle>
          <CardDescription>Los productos se crean automáticamente desde el panel de Ventas al usar una nueva referencia.</CardDescription>
        </CardHeader>
        <CardContent>
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-500 border-b">
                <th className="pb-3 font-medium">Referencia</th>
                <th className="pb-3 font-medium">Nombre</th>
                <th className="pb-3 font-medium">IVA</th>
                <th className="pb-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {seeds.map((s) => (
                <tr key={s.id} className="border-b border-slate-100">
                  <td className="py-3 font-mono font-medium text-slate-700">{s.reference}</td>
                  <td className="py-3 font-medium">{s.name}</td>
                  <td className="py-3 text-slate-500">{s.vat}%</td>
                  <td className="py-3">
                    {s.active ? 
                      <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-bold">ACTIVO</span> : 
                      <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">INACTIVO</span>
                    }
                  </td>
                </tr>
              ))}
              {seeds.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-slate-500">No hay productos registrados todavía.</td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
