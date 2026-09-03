"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createRefund } from "@/app/actions/refunds";
import { useRouter } from "next/navigation";

export function RefundButton({ invoiceId, lines }: { invoiceId: string, lines: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [returnStock, setReturnStock] = useState(true);
  const [refundData, setRefundData] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleRefund = async () => {
    try {
      setIsSubmitting(true);
      const linesToRefund = Object.entries(refundData).map(([lineId, quantity]) => ({
        lineId, quantity
      })).filter(l => l.quantity > 0);

      if (linesToRefund.length === 0) {
        alert("Debes indicar al menos una cantidad a abonar.");
        setIsSubmitting(false);
        return;
      }

      const res = await createRefund(invoiceId, linesToRefund, returnStock);
      if (res.success) {
        alert("Abono creado correctamente.");
        setIsOpen(false);
        router.push(`/facturas/${res.rectificativaId}`);
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button variant="destructive" onClick={() => setIsOpen(true)}>Hacer Abono</Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Emitir Factura Rectificativa (Abono)</h2>
            <p className="text-sm text-slate-500 mb-4">Indica cuántas botellas/cajas quieres abonar de cada línea.</p>
            
            <div className="space-y-4 max-h-[60vh] overflow-y-auto mb-4">
              {lines.map(line => {
                const available = line.quantity - line.refundedQuantity;
                return (
                  <div key={line.id} className="flex justify-between items-center p-3 bg-slate-50 rounded">
                    <div>
                      <p className="font-medium text-sm">{line.description}</p>
                      <p className="text-xs text-slate-500">Disponible para abono: {available} ud</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        min="0" 
                        max={available}
                        className="w-20 border rounded px-2 py-1"
                        value={refundData[line.id] || ""}
                        onChange={(e) => {
                          const val = Math.min(available, Math.max(0, parseInt(e.target.value) || 0));
                          setRefundData({ ...refundData, [line.id]: val });
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-2 mb-6 p-3 bg-brand-50 rounded text-brand-900 border border-brand-100">
              <input 
                type="checkbox" 
                id="returnStock" 
                checked={returnStock} 
                onChange={(e) => setReturnStock(e.target.checked)}
                className="w-5 h-5 accent-brand-700"
              />
              <label htmlFor="returnStock" className="text-sm font-medium cursor-pointer">
                ¿La mercancía abonada vuelve físicamente al almacén? (Suma stock)
              </label>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
              <Button variant="destructive" onClick={handleRefund} disabled={isSubmitting}>
                {isSubmitting ? "Emitiendo..." : "Confirmar Abono"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
