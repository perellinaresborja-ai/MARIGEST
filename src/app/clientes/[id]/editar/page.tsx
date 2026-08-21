"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useState, useEffect, use } from "react";
import { toast } from "sonner";
import { updateClient } from "@/app/actions/clients";

export default function EditarClientePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [loading, setLoading] = useState(false);
  const [client, setClient] = useState<any>(null);
  const [agreementType, setAgreementType] = useState("NONE");

  useEffect(() => {
    fetch('/api/clients/' + id).then(r => r.json()).then(data => {
      setClient(data);
      if (data.agreement) {
        setAgreementType(data.agreement.type);
      }
    });
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    const res = await updateClient(id, data);
    
    if (res.success) {
      toast.success("Cliente actualizado correctamente.");
      router.push("/clientes/" + id);
    } else {
      toast.error("Error al guardar: " + res.error);
    }
    setLoading(false);
  }

  if (!client) return <div className="p-8">Cargando...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Editar Cliente</h1>
        <p className="text-slate-500">Modifica los datos de {client.commercialName}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle>Datos Principales</CardTitle>
            <CardDescription>Información comercial y fiscal.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="commercialName">Nombre Comercial *</Label>
                <Input id="commercialName" name="commercialName" required defaultValue={client.commercialName} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Cliente *</Label>
                <Select name="type" defaultValue={client.type}>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="legalName">Razón Social</Label>
                <Input id="legalName" name="legalName" defaultValue={client.legalName || ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cifNif">CIF/NIF</Label>
                <Input id="cifNif" name="cifNif" defaultValue={client.cifNif || ''} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fiscalAddress">Dirección Fiscal</Label>
              <Input id="fiscalAddress" name="fiscalAddress" defaultValue={client.fiscalAddress || ''} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle>Contacto y Facturación</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactPerson">Persona de Contacto</Label>
                <Input id="contactPerson" name="contactPerson" defaultValue={client.contactPerson || ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" name="phone" defaultValue={client.phone || ''} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email de Contacto</Label>
                <Input id="email" name="email" type="email" defaultValue={client.email || ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="billingEmail">Email de Facturación (Envío auto)</Label>
                <Input id="billingEmail" name="billingEmail" type="email" defaultValue={client.billingEmail || ''} />
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
              <Select name="paymentTermDays" defaultValue={client.paymentTerm?.days?.toString() || "0"}>
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
            
            <p className="text-xs text-slate-400 mt-2">Nota: Editar acuerdos especiales aún requiere hacerlo desde la base de datos para no romper operaciones en curso.</p>

          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" disabled={loading} className="bg-rose-900 hover:bg-rose-800 text-white">
            {loading ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </div>
  );
}
