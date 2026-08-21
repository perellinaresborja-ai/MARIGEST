import { prisma } from "@/lib/prisma";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function GastosPage() {
  const expenses = await prisma.expense.findMany({
    orderBy: { date: 'desc' }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Gastos Generales</h2>
          <p className="text-slate-500">Registro de costes no relacionados con mercancía (luz, alquiler, etc).</p>
        </div>
        <Link href="/tesoreria/gastos/nuevo">
          <Button className="bg-slate-900 hover:bg-slate-800 text-white">Nuevo Gasto</Button>
        </Link>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Proveedor / Concepto</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                  No hay gastos registrados.
                </TableCell>
              </TableRow>
            ) : (
              expenses.map(e => (
                <TableRow key={e.id}>
                  <TableCell>{new Date(e.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs">{e.category}</span>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{e.supplierName || 'Varios'}</p>
                    <p className="text-xs text-slate-500">{e.concept}</p>
                  </TableCell>
                  <TableCell>
                    {e.isPaid ? (
                      <span className="text-emerald-700 text-xs font-bold">PAGADO</span>
                    ) : (
                      <span className="text-amber-700 text-xs font-bold">A PAGAR</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-bold">{e.amount.toFixed(2)} €</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
