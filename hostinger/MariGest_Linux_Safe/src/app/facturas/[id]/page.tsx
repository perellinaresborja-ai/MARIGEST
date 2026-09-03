import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Download, ArrowLeft } from "lucide-react";
import Link from "next/link";

import { PrintButton } from "@/components/PrintButton";

export default async function FacturaViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      lines: true,
      order: {
        include: {
          client: {
            include: {
              paymentTerm: true
            }
          }
        }
      }
    }
  });

  if (!invoice) notFound();

  const client = invoice.order.client;

  return (
    <div className="min-h-screen bg-slate-100 py-8 print:bg-white print:py-0">
      
      {/* Controles (ocultos al imprimir) */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden px-4">
        <Link href="/ventas">
          <Button variant="outline" className="bg-white"><ArrowLeft className="w-4 h-4 mr-2"/> Volver a Ventas</Button>
        </Link>
        <div className="flex gap-4">
          <PrintButton />
        </div>
      </div>

      {/* Papel A4 */}
      <div className="max-w-[21cm] min-h-[29.7cm] mx-auto bg-white shadow-lg print:shadow-none p-[2cm] text-slate-800">
        
        {/* Cabecera */}
        <div className="flex justify-between items-start border-b-2 border-slate-200 pb-8 mb-8">
          <div>
            {/* Logo inyectado */}
            <img src="/cellernazihalogo.jpg" alt="Celler Naziha Logo" className="h-36 w-auto mb-4 -mt-4 object-contain mix-blend-multiply" />
            <h1 className="text-3xl font-black text-rose-900 tracking-tighter">FACTURA</h1>
            <p className="text-slate-500 font-medium mt-1">Nº {invoice.number}</p>
            <p className="text-slate-500 text-sm">Fecha: {new Date(invoice.date).toLocaleDateString()}</p>
          </div>
          
          <div className="text-right text-sm space-y-1">
            <p className="font-bold text-lg text-slate-900">CELLER NAZIHA S.L.</p>
            <p>B54936604</p>
            <p>Carrer Serra Puig Campana 30E</p>
            <p>03530 La Nucía (Alicante)</p>
            <p>cellernaziha@gmail.com</p>
          </div>
        </div>

        {/* Datos Cliente */}
        <div className="mb-12">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Facturado a:</h3>
          <div className="bg-slate-50 p-4 rounded-lg">
            <p className="font-bold text-lg">{client.legalName || client.commercialName}</p>
            {client.cifNif && <p className="text-slate-600">CIF/NIF: {client.cifNif}</p>}
            {client.fiscalAddress && <p className="text-slate-600">{client.fiscalAddress}</p>}
            {!client.cifNif && !client.fiscalAddress && <p className="text-slate-400 text-sm italic">Faltan datos fiscales en la ficha del cliente.</p>}
          </div>
        </div>

        {/* Líneas de Factura */}
        <table className="w-full mb-12 text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-200">
              <th className="py-3 font-bold text-slate-600 uppercase text-xs tracking-wider">Concepto</th>
              <th className="py-3 font-bold text-slate-600 uppercase text-xs tracking-wider text-center">Cantidad</th>
              <th className="py-3 font-bold text-slate-600 uppercase text-xs tracking-wider text-right">Precio Ud.</th>
              <th className="py-3 font-bold text-slate-600 uppercase text-xs tracking-wider text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoice.lines.map((line: any) => (
              <tr key={line.id}>
                <td className="py-4">
                  <p className="font-bold">{line.description}</p>
                  {line.unitPrice === 0 && <p className="text-xs text-rose-600">Promoción comercial 100% dto.</p>}
                </td>
                <td className="py-4 text-center">{line.quantity}</td>
                <td className="py-4 text-right">{line.unitPrice === 0 ? "0.00" : line.unitPrice.toFixed(2)} €</td>
                <td className="py-4 text-right font-medium">{line.total.toFixed(2)} €</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totales */}
        <div className="flex justify-end">
          <div className="w-72 space-y-3">
            <div className="flex justify-between text-slate-600">
              <span>Base Imponible</span>
              <span>{invoice.subtotal.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>IVA (21%)</span>
              <span>{invoice.vat.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between border-t-2 border-slate-900 pt-3">
              <span className="font-black text-xl">TOTAL</span>
              <span className="font-black text-xl text-rose-900">{invoice.total.toFixed(2)} €</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-slate-200 flex justify-between items-start text-xs text-slate-500">
          <div>
            <p className="font-bold text-slate-700 mb-1">Cuentas para transferencia:</p>
            <p>BBVA: ES3301821141810101507270</p>
            <p>SABADELL: ES4600817330000002747579</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-slate-700 mb-1">Condiciones de pago:</p>
            <p>{client.paymentTerm?.name || 'Al contado'}</p>
          </div>
        </div>

      </div>
    </div>
  );
}
