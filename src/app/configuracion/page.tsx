import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";

export default function ConfiguracionPage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Configuración</h1>
        <p className="text-slate-500">Parámetros maestros del negocio. Los cambios aquí afectan a todas las nuevas operaciones.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* EMPRESA */}
        <Card>
          <CardHeader>
            <CardTitle>Celler Naziha S.L.</CardTitle>
            <CardDescription>Datos fiscales y de contacto de la empresa.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Razón Social</Label>
              <Input defaultValue="Celler Naziha S.L." />
            </div>
            <div className="space-y-2">
              <Label>CIF / NIF</Label>
              <Input defaultValue="B54936604" />
            </div>
            <div className="space-y-2">
              <Label>Dirección</Label>
              <Input defaultValue="Carrer Serra Puig Campana 30E, 03530 La Nucía (Alicante)" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input defaultValue="cellernaziha@gmail.com" />
            </div>
          </CardContent>
        </Card>

        {/* COSTES Y PRODUCTO */}
        <Card className="border-brand-200">
          <CardHeader className="bg-brand-50/50">
            <CardTitle>Costes Analíticos</CardTitle>
            <CardDescription>Se utilizan para calcular rentabilidades en el módulo de Negocio. (Valor fijo sin inventario contable).</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="space-y-2">
              <Label>Coste Vermut Rojo (€/botella)</Label>
              <Input type="number" step="0.01" defaultValue={4.05} className="font-bold text-brand-900" />
            </div>
            <div className="space-y-2">
              <Label>Coste Vermut Blanco (€/botella)</Label>
              <Input type="number" step="0.01" defaultValue={4.05} className="font-bold text-brand-900" />
            </div>
            <div className="space-y-2">
              <Label>Unidades por Caja</Label>
              <Input type="number" defaultValue={6} />
            </div>
          </CardContent>
        </Card>

        {/* FACTURACIÓN Y FISCAL */}
        <Card>
          <CardHeader>
            <CardTitle>Facturación y Fiscal</CardTitle>
            <CardDescription>Impuestos y numeración.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>IVA por defecto (%)</Label>
              <Input type="number" defaultValue={21} />
            </div>
            <div className="space-y-2">
              <Label>Serie de Facturación Actual</Label>
              <Input defaultValue="F-026041" />
              <p className="text-xs text-slate-500 mt-1">Las facturas se generan correlativamente desde F-026041 en adelante.</p>
            </div>
          </CardContent>
        </Card>

        {/* COMERCIAL */}
        <Card>
          <CardHeader>
            <CardTitle>Comercial y Tarifas</CardTitle>
            <CardDescription>Parámetros por defecto para ventas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>PVP Hostelería</Label>
                <Input defaultValue="8.20" />
              </div>
              <div className="space-y-2">
                <Label>PVP Distribuidor</Label>
                <Input defaultValue="6.40" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Plazo de Pago por Defecto</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option>Al Contado</option>
                <option>A 30 días</option>
                <option>A 60 días</option>
              </select>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
