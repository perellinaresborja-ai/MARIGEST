"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { toast } from "sonner";
import { createEvent } from "@/app/actions/events";

export default function NuevoEventoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      place: formData.get("place") as string,
      date: new Date(formData.get("date") as string),
      boxesRojo: parseInt(formData.get("boxesRojo") as string) || 0,
      boxesBlanco: parseInt(formData.get("boxesBlanco") as string) || 0,
    };

    if (data.boxesRojo === 0 && data.boxesBlanco === 0) {
      toast.error("Debes enviar al menos 1 caja al evento.");
      setLoading(false);
      return;
    }

    try {
      await createEvent(data);
      toast.success("Evento creado y stock enviado correctamente.");
      router.push("/producto");
    } catch (error: any) {
      toast.error(error.message || "Error al crear el evento.");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/producto">
          <Button variant="outline">Volver</Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Salida a Evento</h1>
          <p className="text-slate-500">Mueve producto del almacén principal al evento.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="shadow-sm mb-6">
          <CardHeader>
            <CardTitle>Datos del Evento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Evento</Label>
              <Input id="name" name="name" required placeholder="Ej: Feria Gastronómica" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="place">Ubicación / Lugar</Label>
                <Input id="place" name="place" required placeholder="Ej: Altea" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Fecha</Label>
                <Input id="date" name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm mb-6">
          <CardHeader>
            <CardTitle>Producto a enviar</CardTitle>
            <CardDescription>Indica las cajas que salen físicamente hacia el evento.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-rose-50 rounded-xl border border-rose-100">
              <div>
                <h3 className="font-bold text-rose-900">Vermut Rojo</h3>
                <p className="text-sm text-rose-700">Cajas de 6 botellas</p>
              </div>
              <div className="w-32">
                <Input type="number" name="boxesRojo" min="0" defaultValue="0" className="text-xl text-center font-bold" />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-100">
              <div>
                <h3 className="font-bold text-amber-700">Vermut Blanco</h3>
                <p className="text-sm text-amber-600">Cajas de 6 botellas</p>
              </div>
              <div className="w-32">
                <Input type="number" name="boxesBlanco" min="0" defaultValue="0" className="text-xl text-center font-bold" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={loading} className="w-full h-14 text-lg bg-rose-900 hover:bg-rose-800">
          {loading ? "Registrando..." : "ENVIAR PRODUCTO"}
        </Button>
      </form>
    </div>
  );
}
