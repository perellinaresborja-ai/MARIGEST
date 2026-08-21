"use client";

import { getClients } from "@/app/actions/clients";
import { processSale } from "@/app/actions/sales";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Minus, Plus, ShoppingCart } from "lucide-react";

export default function VentaAgilPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [boxesRojo, setBoxesRojo] = useState<number | string>(0);
  const [boxesBlanco, setBoxesBlanco] = useState<number | string>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getClients().then(setClients);
  }, []);

  async function handleGenerate() {
    if (!selectedClient) {
      toast.error("Selecciona un cliente primero.");
      return;
    }
    const qtyRojo = Number(boxesRojo) || 0;
    const qtyBlanco = Number(boxesBlanco) || 0;

    if (qtyRojo === 0 && qtyBlanco === 0) {
      toast.error("Debes añadir al menos una caja.");
      return;
    }

    setLoading(true);
    const res = await processSale({
      clientId: selectedClient,
      boxesRojo: qtyRojo,
      boxesBlanco: qtyBlanco
    });

    if (res.success) {
      toast.success(
        <div className="flex flex-col gap-2">
          <span className="font-bold">¡Venta completada!</span>
          <span className="text-sm">Factura generada: {res.invoiceNumber}</span>
          <a 
            href={`/facturas/${res.invoiceId}`} 
            target="_blank"
            className="bg-rose-900 text-white text-xs text-center py-1.5 px-3 rounded mt-1 font-bold hover:bg-rose-800"
          >
            VER FACTURA Y PDF
          </a>
        </div>,
        { duration: 10000 }
      );
      
      // Reset
      setBoxesRojo(0);
      setBoxesBlanco(0);
      setSelectedClient("");
    } else {
      toast.error("Error en la venta: " + res.error);
    }
    setLoading(false);
  }

  const clientInfo = clients.find(c => c.id === selectedClient);

  return (
    <div className="max-w-2xl mx-auto mt-12 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">Ventas</h1>
        <p className="text-slate-500">Ágil en el frontal. Cumplimiento normativo por detrás.</p>
      </div>

      <Card className="border-slate-200 shadow-md">
        <CardContent className="p-8 space-y-10">
          
          {/* PASO 1: CLIENTE */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="bg-rose-100 text-rose-900 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">1</div>
              <h2 className="text-xl font-semibold">Seleccionar Cliente</h2>
            </div>
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger className="w-full text-lg h-12">
                <SelectValue placeholder="Busca o selecciona un cliente...">
                  {clientInfo ? clientInfo.commercialName : "Busca o selecciona un cliente..."}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {clients.map(c => (
                  <SelectItem key={c.id} value={c.id} className="text-base py-3">
                    {c.commercialName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {clientInfo && (
              <div className="bg-slate-50 border rounded-md p-4 text-sm flex justify-between items-start">
                <div>
                  <p className="font-medium">{clientInfo.commercialName}</p>
                  <p className="text-slate-500">{clientInfo.fiscalAddress || 'Sin dirección fiscal'}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded">
                    {clientInfo.agreement?.name || 'Tarifa Base'}
                  </p>
                  <p className="text-slate-500 mt-1">Pago: {clientInfo.paymentTerm?.name || 'Al contado'}</p>
                </div>
              </div>
            )}
          </div>

          <div className="w-full h-px bg-slate-100" />

          {/* PASO 2: PRODUCTO */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="bg-rose-100 text-rose-900 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">2</div>
              <h2 className="text-xl font-semibold">Añadir Producto</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-8">
              {/* ROJO */}
              <div className="border rounded-xl p-6 flex flex-col items-center space-y-4 shadow-sm hover:border-rose-200 transition-colors">
                <img src="/vermut-rojo.jpg" alt="Vermut Rojo" className="h-24 w-auto object-contain mb-2" />
                <h3 className="font-bold text-lg">Vermut Rojo</h3>
                
                <div className="flex items-center gap-4 bg-slate-100 p-2 rounded-lg">
                  <Button variant="outline" size="icon" onClick={() => setBoxesRojo(Math.max(0, (Number(boxesRojo) || 0) - 1))} className="h-10 w-10 shrink-0 rounded-md">
                    <Minus className="h-4 w-4" />
                  </Button>
                  <input 
                    type="number"
                    min="0"
                    value={boxesRojo}
                    onChange={(e) => setBoxesRojo(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0))}
                    className="text-2xl font-bold w-16 text-center bg-transparent border-b-2 border-transparent focus:border-rose-300 focus:outline-none hide-arrows" 
                  />
                  <Button variant="outline" size="icon" onClick={() => setBoxesRojo((Number(boxesRojo) || 0) + 1)} className="h-10 w-10 shrink-0 rounded-md">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <span className="text-sm text-slate-500 font-medium">Cajas (6 uds.)</span>
              </div>

              {/* BLANCO */}
              <div className="border rounded-xl p-6 flex flex-col items-center space-y-4 shadow-sm hover:border-amber-200 transition-colors">
                <img src="/vermut-blanco.jpg" alt="Vermut Blanco" className="h-24 w-auto object-contain mb-2" />
                <h3 className="font-bold text-lg">Vermut Blanco</h3>
                
                <div className="flex items-center gap-4 bg-slate-100 p-2 rounded-lg">
                  <Button variant="outline" size="icon" onClick={() => setBoxesBlanco(Math.max(0, (Number(boxesBlanco) || 0) - 1))} className="h-10 w-10 shrink-0 rounded-md">
                    <Minus className="h-4 w-4" />
                  </Button>
                  <input 
                    type="number"
                    min="0"
                    value={boxesBlanco}
                    onChange={(e) => setBoxesBlanco(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0))}
                    className="text-2xl font-bold w-16 text-center bg-transparent border-b-2 border-transparent focus:border-rose-300 focus:outline-none hide-arrows" 
                  />
                  <Button variant="outline" size="icon" onClick={() => setBoxesBlanco((Number(boxesBlanco) || 0) + 1)} className="h-10 w-10 shrink-0 rounded-md">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <span className="text-sm text-slate-500 font-medium">Cajas (6 uds.)</span>
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-slate-100" />

          {/* PASO 3: GENERAR */}
          <div className="space-y-4 pt-2">
             <Button 
                onClick={handleGenerate} 
                disabled={loading || (!selectedClient || (boxesRojo === 0 && boxesBlanco === 0))}
                className="w-full h-16 text-xl bg-rose-900 hover:bg-rose-800 text-white font-bold rounded-xl shadow-lg"
              >
                <ShoppingCart className="mr-2 h-6 w-6" />
                {loading ? "GENERANDO..." : "GENERAR FACTURA ↗"}
             </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
