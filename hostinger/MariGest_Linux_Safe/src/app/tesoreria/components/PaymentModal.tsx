"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { addPayment } from "@/app/actions/tesoreria";
import { useRouter } from "next/navigation";

export default function PaymentModal({ 
  transaction, 
  title, 
  triggerText = "MARCAR COMO COBRADO",
  variant = "default" 
}: { 
  transaction: any, 
  title: string,
  triggerText?: string,
  variant?: "default" | "outline" | "secondary"
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const pendingAmount = transaction.amount - transaction.paidAmount;

  const [amount, setAmount] = useState(pendingAmount);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [method, setMethod] = useState(transaction.expectedMethod || "Transferencia");
  const [notes, setNotes] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (amount <= 0 || amount > pendingAmount) {
      return toast.error("Importe inválido.");
    }

    setLoading(true);
    try {
      await addPayment(transaction.id, amount, method, new Date(date), notes);
      toast.success("Operación registrada correctamente.");
      setOpen(false);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size="sm">{triggerText}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Original: {transaction.amount.toFixed(2)} € | Cobrado/Pagado: {transaction.paidAmount.toFixed(2)} € <br/>
            <strong>Pendiente: {pendingAmount.toFixed(2)} €</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Importe a registrar (€)</Label>
            <Input 
              type="number" 
              step="0.01" 
              min="0.01" 
              max={pendingAmount} 
              value={amount} 
              onChange={e => setAmount(parseFloat(e.target.value) || 0)} 
              required 
            />
            {amount < pendingAmount && amount > 0 && (
              <p className="text-xs text-amber-600 font-medium">Este será un registro PARCIAL. Quedarán {(pendingAmount - amount).toFixed(2)} € pendientes.</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha real</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Forma (Ej: Efectivo, Transferencia)</Label>
              <Input value={method} onChange={e => setMethod(e.target.value)} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Observaciones (opcional)</Label>
            <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Ej: Pago de la primera mitad" />
          </div>

          <Button type="submit" className="w-full mt-4" disabled={loading}>
            {loading ? "Registrando..." : "CONFIRMAR"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
