import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";

export default async function ComprasPage() {
  const purchases = await prisma.purchase.findMany({
    orderBy: { date: 'desc' }
  });

  // Fetch supplier names to map
  const suppliers = await prisma.supplier.findMany();
  const getSupplierName = (id: string) => suppliers.find(s => s.id === id)?.name || "Desconocido";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Compras y Entradas</h1>
          <p className="text-slate-500">Registra nuevo producto en tu almacén.</p>
        </div>
        <Link href="/producto/compras/nueva">
          <Button className="bg-slate-900 hover:bg-slate-800 text-white">Nueva Compra</Button>
        </Link>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-slate-500">
                  No hay compras registradas.
                </TableCell>
              </TableRow>
            ) : (
              purchases.map(p => (
                <TableRow key={p.id}>
                  <TableCell>{new Date(p.date).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">{getSupplierName(p.supplierId)}</TableCell>
                  <TableCell className="text-right font-bold">{p.total.toFixed(2)} €</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
