import { prisma } from "@/lib/prisma";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import PaymentModal from "../components/PaymentModal";

export default async function PagosPage() {
  const transactions = await prisma.transaction.findMany({
    where: { type: "PAYABLE" },
    include: { supplier: true },
    orderBy: { dueDate: 'asc' }
  });

  const now = new Date();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">A Pagar</h2>
          <p className="text-slate-500">Deudas a proveedores y gastos.</p>
        </div>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Vencimiento</TableHead>
              <TableHead>Proveedor / Origen</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Pendiente</TableHead>
              <TableHead className="text-center">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                  No hay pagos registrados.
                </TableCell>
              </TableRow>
            ) : (
              transactions.map(t => {
                const pending = t.amount - t.paidAmount;
                const isVencido = new Date(t.dueDate) < now && pending > 0;
                
                return (
                  <TableRow key={t.id} className={isVencido ? 'bg-rose-50/20' : ''}>
                    <TableCell className={isVencido ? 'text-rose-700 font-bold' : ''}>
                      {new Date(t.dueDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium">{t.supplier?.name || 'Desconocido'}</TableCell>
                    <TableCell>
                      {t.status === "PAID" ? (
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-bold">PAGADO</span>
                      ) : t.status === "PARTIAL" ? (
                        <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-bold">PARCIAL</span>
                      ) : isVencido ? (
                        <span className="bg-rose-100 text-rose-800 px-2 py-1 rounded text-xs font-bold">VENCIDO</span>
                      ) : (
                        <span className="bg-slate-100 text-slate-800 px-2 py-1 rounded text-xs font-bold">PENDIENTE</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {pending > 0 ? (
                        <span className="font-bold">{pending.toFixed(2)} €</span>
                      ) : (
                        <span className="text-slate-400">0.00 €</span>
                      )}
                      <div className="text-xs text-slate-400 mt-1">Total: {t.amount.toFixed(2)}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      {t.status !== "PAID" && (
                        <PaymentModal 
                          transaction={t} 
                          title="Registrar Pago" 
                          triggerText="PAGAR"
                          variant="outline"
                        />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
