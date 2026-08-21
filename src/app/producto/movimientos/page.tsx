import { prisma } from "@/lib/prisma";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MovementType } from "@prisma/client";

export default async function MovimientosPage() {
  const movements = await prisma.stockMovement.findMany({
    orderBy: { date: 'desc' },
    include: { product: true, fromLocation: true, toLocation: true },
    take: 100 // Limit for performance in this view
  });

  const translateType = (t: MovementType) => {
    const map: Record<string, string> = {
      PURCHASE: "Compra",
      SALE: "Venta",
      TRANSFER: "Traslado",
      PROMOTION: "Promoción",
      REPLACEMENT: "Reposición",
      SAMPLE: "Muestra",
      TASTING: "Degustación",
      EVENT: "Evento",
      COURTESY: "Cortesía",
      BREAKAGE: "Rotura",
      SHRINKAGE: "Merma",
      INTERNAL: "Interno",
      ADJUSTMENT: "Ajuste",
      OTHER: "Otro"
    };
    return map[t] || t;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Movimientos de Stock</h1>
        <p className="text-slate-500">Historial completo de trazabilidad.</p>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Origen</TableHead>
              <TableHead>Destino</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                  No hay movimientos registrados.
                </TableCell>
              </TableRow>
            ) : (
              movements.map(m => (
                <TableRow key={m.id}>
                  <TableCell className="text-xs">{new Date(m.date).toLocaleString()}</TableCell>
                  <TableCell className="font-medium text-xs">{m.product.name}</TableCell>
                  <TableCell className="text-xs font-bold">{m.quantity} bot.</TableCell>
                  <TableCell className="text-xs"><span className="bg-slate-100 px-2 py-1 rounded">{translateType(m.type)}</span></TableCell>
                  <TableCell className="text-xs text-slate-500">{m.fromLocation?.name || "Proveedor / Externo"}</TableCell>
                  <TableCell className="text-xs text-slate-500">{m.toLocation?.name || "Salida Empresa"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
