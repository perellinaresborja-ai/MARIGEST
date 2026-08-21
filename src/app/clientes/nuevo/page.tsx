"use client";

import { createClient } from "@/app/actions/clients";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function NuevoClientePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("HOSTELERIA");
  const [paymentTermDays, setPaymentTermDays] = useState("0");
  const [agreementType, setAgreementType] = useState("NONE");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    // Ensure Select values are added to the data payload since base-ui might not inject hidden inputs
    data.type = type;
    data.paymentTermDays = paymentTermDays;
    data.agreementType = agreementType;
    
    const res = await createClient(data);
    
    if (res.success) {
      toast.success("Cliente guardado correctamente. Ya no tendrás que volver a introducir estos datos.");
      router.push("/clientes");
    } else {
      toast.error("Error al guardar: " + res.error);
    }
    setLoading(false);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Nuevo Cliente</h1>
        <p className="text-slate-500">Mari introduce lo mínimo. MariGest hace el resto.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle>Datos Principales</CardTitle>
            <CardDescription>Información comercial y fiscal.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="commercialName">Nombre Comercial *</Label>
                <Input id="commercialName" name="commercialName" required placeholder="Ej: Restaurante El Puerto" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Cliente *</Label>
                <Select name="type" value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HOSTELERIA">Hostelería</SelectItem>
                    <SelectItem value="DISTRIBUIDOR">Distribuidor</SelectItem>
                    <SelectItem value="PARTICULAR">Particular</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="legalName">Razón Social</Label>
                <Input id="legalName" name="legalName" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cifNif">CIF/NIF</Label>
                <Input id="cifNif" name="cifNif" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fiscalAddress">Dirección Fiscal</Label>
              <Input id="fiscalAddress" name="fiscalAddress" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle>Contacto y Facturación</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactPerson">Persona de Contacto</Label>
                <Input id="contactPerson" name="contactPerson" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" name="phone" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email de Contacto</Label>
                <Input id="email" name="email" type="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="billingEmail">Email de Facturación (Envío auto)</Label>
                <Input id="billingEmail" name="billingEmail" type="email" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle>Acuerdos y Tesorería</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="paymentTermDays">Plazo de Pago (Días)</Label>
              <Select name="paymentTermDays" value={paymentTermDays} onValueChange={setPaymentTermDays}>
                <SelectTrigger>
                  <SelectValue placeholder="Al contado (0 días)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Al contado (0 días)</SelectItem>
                  <SelectItem value="15">15 días</SelectItem>
                  <SelectItem value="30">30 días</SelectItem>
                  <SelectItem value="60">60 días</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <Label>Acuerdo Comercial Permanente</Label>
              <Select name="agreementType" value={agreementType} onValueChange={setAgreementType}>
                <SelectTrigger>
                  <SelectValue placeholder="Sin acuerdo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">Sin acuerdo especial (Aplica tarifa base)</SelectItem>
                  <SelectItem value="PROMO_X_Y">Promoción X + Y (Ej: 12 + 2)</SelectItem>
                  <SelectItem value="DISCOUNT_PERCENT">Descuento Global (%)</SelectItem>
                  <SelectItem value="SPECIAL_PRICE">Precio Especial Fijo (€)</SelectItem>
                  <SelectItem value="MANUAL">Otro (Manual)</SelectItem>
                </SelectContent>
              </Select>

              {agreementType === "PROMO_X_Y" && (
                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-md border">
                  <div className="space-y-1">
                    <Label className="text-xs">Por cada (X) botellas</Label>
                    <Input name="paramX" type="number" placeholder="Ej: 12" className="w-24" />
                  </div>
                  <span className="text-2xl font-light text-slate-400 mt-4">+</span>
                  <div className="space-y-1">
                    <Label className="text-xs">Regalamos (Y)</Label>
                    <Input name="paramY" type="number" placeholder="Ej: 2" className="w-24" />
                  </div>
                </div>
              )}
              
              {agreementType === "DISCOUNT_PERCENT" && (
                <div className="bg-slate-50 p-4 rounded-md border w-48">
                  <Label className="text-xs">Porcentaje de descuento</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input name="paramFloat" type="number" step="0.1" placeholder="10" />
                    <span className="text-slate-500">%</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" disabled={loading} className="bg-rose-900 hover:bg-rose-800 text-white">
            {loading ? "Guardando..." : "Guardar Cliente"}
          </Button>
        </div>
      </form>
    </div>
  );
}
