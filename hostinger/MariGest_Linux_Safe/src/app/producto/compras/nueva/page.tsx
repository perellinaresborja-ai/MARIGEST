"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { toast } from "sonner";
import { createPurchase } from "@/app/actions/purchases";

export default function NuevaCompraPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      supplierName: formData.get("supplierName") as string,
      invoiceNo: formData.get("invoiceNo") as string,
      date: new Date(formData.get("date") as string),
      boxesRojo: parseInt(formData.get("boxesRojo") as string) || 0,
      boxesBlanco: parseInt(formData.get("boxesBlanco") as string) || 0,
      total: parseFloat(formData.get("total") as string) || 0,
      dueDate: new Date(formData.get("dueDate") as string),
    };

    if (data.boxesRojo === 0 && data.boxesBlanco === 0) {
      toast.error("Debes registrar al menos 1 caja.");
      setLoading(false);
      return;
    }

    try {
      await createPurchase(data);
      toast.success("Compra registrada. Stock actualizado.");
      router.push("/producto/compras");
    } catch (error: any) {
      toast.error(error.message || "Error al registrar la compra.");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/producto/compras">
          <Button variant="outline">Volver</Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Nueva Compra</h1>
          <p className="text-slate-500">Añade stock al Almacén Principal.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Datos de la Factura</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="supplierName">Proveedor</Label>
              <Input id="supplierName" name="supplierName" required placeholder="Ej: Bodegas Vermut SL" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invoiceNo">Nº Factura</Label>
                <Input id="invoiceNo" name="invoiceNo" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Fecha</Label>
                <Input id="date" name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Producto Recibido (Cajas)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Cajas Vermut Rojo</Label>
              <Input type="number" name="boxesRojo" min="0" defaultValue="0" className="w-32" />
            </div>
            <div className="flex items-center justify-between">
              <Label>Cajas Vermut Blanco</Label>
              <Input type="number" name="boxesBlanco" min="0" defaultValue="0" className="w-32" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Importe y Pago</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="total">Total Factura (€)</Label>
                <Input id="total" name="total" type="number" step="0.01" min="0" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Vencimiento del Pago</Label>
                <Input id="dueDate" name="dueDate" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={loading} className="w-full h-14 text-lg bg-slate-900 hover:bg-slate-800">
          {loading ? "Registrando..." : "GUARDAR COMPRA Y AÑADIR STOCK"}
        </Button>
      </form>
    </div>
  );
}
