"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";
import { toast } from "sonner";
import { createExpense } from "@/app/actions/tesoreria";

const CATEGORIES = [
  "Personal", "Vasos / Material", "Transporte", "Combustible",
  "Publicidad", "Imprenta", "Hielo", "Dietas", "Alquiler", 
  "Luz / Suministros", "Gestoría", "Seguros", "Eventos", "Otros"
];

export default function NuevoGastoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [base, setBase] = useState(0);
  const [vatPercent, setVatPercent] = useState(21);
  const [total, setTotal] = useState(0);
  const [isPaid, setIsPaid] = useState(false);

  // Auto calculate VAT and Total
  useEffect(() => {
    const calculatedVat = base * (vatPercent / 100);
    setTotal(parseFloat((base + calculatedVat).toFixed(2)));
  }, [base, vatPercent]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      supplierName: formData.get("supplierName") as string,
      documentNo: formData.get("documentNo") as string,
      concept: formData.get("concept") as string,
      category: formData.get("category") as string,
      baseAmount: base,
      vatPercent,
      vatAmount: parseFloat((base * (vatPercent / 100)).toFixed(2)),
      amount: total,
      isPaid,
      dueDate: formData.get("dueDate") ? new Date(formData.get("dueDate") as string) : undefined,
      paymentMethod: formData.get("paymentMethod") as string
    };

    if (data.amount <= 0) {
      toast.error("El importe debe ser mayor que cero.");
      setLoading(false);
      return;
    }

    try {
      await createExpense(data);
      toast.success("Gasto registrado correctamente.");
      router.push("/tesoreria/gastos");
    } catch (error: any) {
      toast.error(error.message || "Error al registrar el gasto.");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/tesoreria/gastos">
          <Button variant="outline">Volver</Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Nuevo Gasto</h1>
          <p className="text-slate-500">Registra un gasto no comercial.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Detalles del Gasto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Proveedor (opcional)</Label>
                <Input name="supplierName" placeholder="Ej: Iberdrola" />
              </div>
              <div className="space-y-2">
                <Label>Nº Documento (opcional)</Label>
                <Input name="documentNo" placeholder="Nº Factura / Ticket" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Concepto</Label>
                <Input name="concept" required placeholder="Ej: Luz almacén Agosto" />
              </div>
              <div className="space-y-2">
                <Label>Categoría</Label>
                <Select name="category" defaultValue="Otros" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona..." />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Importes (Autocalculados)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Base Imponible (€)</Label>
                <Input 
                  type="number" step="0.01" min="0" required 
                  value={base} onChange={e => setBase(parseFloat(e.target.value)||0)}
                />
              </div>
              <div className="space-y-2">
                <Label>IVA (%)</Label>
                <Select 
                  value={vatPercent.toString()} 
                  onValueChange={val => setVatPercent(parseFloat(val))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="21">21%</SelectItem>
                    <SelectItem value="10">10%</SelectItem>
                    <SelectItem value="4">4%</SelectItem>
                    <SelectItem value="0">0% (Exento)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>TOTAL (€)</Label>
                <Input type="text" readOnly value={total.toFixed(2)} className="bg-slate-50 font-bold" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-brand-100">
          <CardHeader className="bg-brand-50/30">
            <CardTitle>Estado del Pago</CardTitle>
            <CardDescription>¿Has pagado ya este gasto o queda pendiente?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="flex items-center space-x-2">
              <Switch checked={isPaid} onCheckedChange={setIsPaid} id="isPaid" />
              <Label htmlFor="isPaid" className="font-bold cursor-pointer">El gasto ya está pagado en este momento</Label>
            </div>
            
            {!isPaid && (
              <div className="pt-4 border-t space-y-2">
                <p className="text-sm text-slate-500 mb-2">Se creará un registro de "A PAGAR" en Tesorería.</p>
                <Label>Vencimiento previsto</Label>
                <Input name="dueDate" type="date" className="w-1/2" defaultValue={new Date().toISOString().split('T')[0]} />
              </div>
            )}
            
            {isPaid && (
              <div className="pt-4 border-t space-y-2">
                <Label>Forma de pago utilizada</Label>
                <Input name="paymentMethod" placeholder="Ej: Tarjeta, Transferencia, Efectivo" defaultValue="Transferencia" className="w-1/2" />
              </div>
            )}
          </CardContent>
        </Card>

        <Button type="submit" disabled={loading} className="w-full h-14 text-lg bg-slate-900 hover:bg-slate-800">
          {loading ? "Registrando..." : "GUARDAR GASTO"}
        </Button>
      </form>
    </div>
  );
}
