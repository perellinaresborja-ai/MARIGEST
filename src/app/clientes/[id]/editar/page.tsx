"use client";

import { updateClient, getClient } from "@/app/actions/clients";
import { getProfileCookie } from "@/app/actions/profile";
import { use, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function EditarClientePage({ params }: { params: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isGranel, setIsGranel] = useState(false);

  const { id } = use(params);
  const [client, setClient] = useState<any>(null);
  
  const [type, setType] = useState("HOSTELERIA");
  const [paymentTermDays, setPaymentTermDays] = useState("0");
  const [agreementType, setAgreementType] = useState("NONE");

  useEffect(() => {
    getProfileCookie().then(profile => {
      setIsGranel(profile === "GRANEL_PREMIUM");
    });
    fetch('/api/clients/' + id).then(r => r.json()).then(data => {
      setClient(data);
      setType(data.type || "HOSTELERIA");
      setPaymentTermDays(data.paymentTerm?.days?.toString() || "0");
      setAgreementType(data.agreement?.type || "NONE");
    });
  }, [id]);


  if (!client) return <div className="p-8 text-center text-slate-500">Cargando datos del cliente...</div>;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    // Ensure Select values are added to the data payload since base-ui might not inject hidden inputs
    data.type = type;
    data.paymentTermDays = paymentTermDays;
    data.agreementType = agreementType;
    
    const res = await updateClient(id, data);
    
    if (res.success) {
      toast.success("Cliente actualizado correctamente.");
      router.push("/clientes/" + id);
    } else {
      toast.error("Error al guardar: " + res.error);
    }
    setLoading(false);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Editar Cliente</h1>
        <p className="text-slate-500">{client.commercialName}</p>
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
                <Input id="commercialName" name="commercialName" required defaultValue={client.commercialName} />
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
                <Input id="legalName" name="legalName" defaultValue={client.legalName || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cifNif">CIF/NIF</Label>
                <Input id="cifNif" name="cifNif" defaultValue={client.cifNif || ""} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fiscalAddress">Dirección Fiscal</Label>
              <Input id="fiscalAddress" name="fiscalAddress" defaultValue={client.fiscalAddress || ""} />
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
                <Input id="contactPerson" name="contactPerson" defaultValue={client.contactPerson || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" name="phone" defaultValue={client.phone || ""} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email de Contacto</Label>
                <Input id="email" name="email" type="email" defaultValue={client.email || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="billingEmail">Email de Facturación (Envío auto)</Label>
                <Input id="billingEmail" name="billingEmail" type="email" defaultValue={client.billingEmail || ""} />
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

            {!isGranel && (
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
                      <Input name="paramX" type="number" defaultValue={client.agreement?.paramX} className="w-24" />
                    </div>
                    <span className="text-2xl font-light text-slate-400 mt-4">+</span>
                    <div className="space-y-1">
                      <Label className="text-xs">Regalamos (Y)</Label>
                      <Input name="paramY" type="number" defaultValue={client.agreement?.paramY} className="w-24" />
                    </div>
                  </div>
                )}
                
                {agreementType === "DISCOUNT_PERCENT" && (
                  <div className="bg-slate-50 p-4 rounded-md border w-48">
                    <Label className="text-xs">Porcentaje de descuento</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input name="paramFloat" type="number" step="0.1" defaultValue={client.agreement?.paramFloat} />
                      <span className="text-slate-500">%</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" disabled={loading} className="bg-brand-900 hover:bg-brand-800 text-white">
            {loading ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </div>
  );
}
