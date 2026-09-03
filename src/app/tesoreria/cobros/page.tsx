import { prisma } from "@/lib/prisma";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import PaymentModal from "../components/PaymentModal";

export default async function CobrosPage() {
  const transactions = await prisma.transaction.findMany({
    where: { type: "RECEIVABLE" },
    include: { client: true },
    orderBy: { dueDate: 'asc' }
  });

  const now = new Date();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">A Cobrar</h2>
          <p className="text-slate-500">Facturas pendientes de clientes.</p>
        </div>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Vencimiento</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Pendiente</TableHead>
              <TableHead className="text-center">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                  No hay cobros registrados.
                </TableCell>
              </TableRow>
            ) : (
              transactions.map(t => {
                const pending = t.amount - t.paidAmount;
                const isVencido = new Date(t.dueDate) < now && pending > 0;
                
                return (
                  <TableRow key={t.id} className={isVencido ? 'bg-brand-50/20' : ''}>
                    <TableCell className={isVencido ? 'text-brand-700 font-bold' : ''}>
                      {new Date(t.dueDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium">{t.client?.commercialName}</TableCell>
                    <TableCell>
                      {t.status === "PAID" ? (
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-bold">COBRADO</span>
                      ) : t.status === "PARTIAL" ? (
                        <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-bold">PARCIAL</span>
                      ) : isVencido ? (
                        <span className="bg-brand-100 text-brand-800 px-2 py-1 rounded text-xs font-bold">VENCIDO</span>
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
                          title="Registrar Cobro" 
                          triggerText="COBRAR"
                          variant="default"
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
