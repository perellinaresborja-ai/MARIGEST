import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ClientProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      agreement: true,
      paymentTerm: true,
      transactions: {
        where: { type: "RECEIVABLE" },
        orderBy: { dueDate: "asc" }
      },
      orders: {
        include: {
          invoice: true
        },
        orderBy: { date: 'desc' },
        take: 5
      }
    }
  });

  if (!client) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/clientes">
          <Button variant="outline">Volver</Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{client.commercialName}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Datos del Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500 font-medium">Tipo</p>
                <p>{client.type}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Persona de contacto</p>
                <p>{client.contactPerson || '-'}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Teléfono</p>
                <p>{client.phone || '-'}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Email</p>
                <p>{client.email || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Condiciones y Facturación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500 font-medium">Acuerdo Comercial</p>
                <p>{client.agreement?.name || 'Tarifa Base'}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Plazo de pago</p>
                <p>{client.paymentTerm?.name || 'Al contado'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-slate-500 font-medium">Razón Social</p>
                <p>{client.legalName || '-'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-slate-500 font-medium">CIF/NIF</p>
                <p>{client.cifNif || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500 uppercase">Total Pendiente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{client.transactions.reduce((sum, t) => sum + (t.amount - t.paidAmount), 0).toFixed(2)} €</p>
          </CardContent>
        </Card>
        <Card className="bg-rose-50 border-rose-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-rose-800 uppercase">Vencido</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-rose-900">
              {client.transactions.filter(t => (t.amount - t.paidAmount) > 0 && new Date(t.dueDate) < new Date()).reduce((sum, t) => sum + (t.amount - t.paidAmount), 0).toFixed(2)} €
            </p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50 border-emerald-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-emerald-800 uppercase">Pagado / Histórico</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-emerald-900">
              {client.transactions.reduce((sum, t) => sum + t.paidAmount, 0).toFixed(2)} €
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Últimas Ventas</CardTitle>
        </CardHeader>
        <CardContent>
          {client.orders.length === 0 ? (
            <p className="text-slate-500 text-sm">No hay ventas registradas para este cliente.</p>
          ) : (
            <div className="space-y-4">
              {client.orders.map(order => (
                <div key={order.id} className="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium">Factura: {order.invoice?.number || 'Pendiente'}</p>
                    <p className="text-sm text-slate-500">{new Date(order.date).toLocaleDateString()} - {order.totalBottles} botellas</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{order.invoice?.total.toFixed(2)} €</p>
                    <span className="text-xs text-rose-900 bg-rose-50 px-2 py-1 rounded">Cobrado (Test)</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
