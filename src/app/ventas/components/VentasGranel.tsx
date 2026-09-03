"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getClients } from "@/app/actions/clients";
import { getSeedProducts, getClientPrices, processGranelSale } from "@/app/actions/granelSales";

export function VentasGranel() {
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [clientPrices, setClientPrices] = useState<any[]>([]);
  
  const [lines, setLines] = useState([
    { id: 1, reference: "", name: "", quantity: "", price: "", vat: 21, updatePrice: "SAVE" as "SAVE" | "JUST_ONCE" }
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getClients().then(setClients);
    getSeedProducts().then(setProducts);
  }, []);

  useEffect(() => {
    if (selectedClient) {
      getClientPrices(selectedClient).then(setClientPrices);
    } else {
      setClientPrices([]);
    }
  }, [selectedClient]);

  const addLine = () => {
    setLines([...lines, { id: Date.now(), reference: "", name: "", quantity: "", price: "", vat: 21, updatePrice: "SAVE" }]);
  };

  const removeLine = (id: number) => {
    setLines(lines.filter(l => l.id !== id));
  };

  const updateLine = (id: number, field: string, value: any) => {
    setLines(lines.map(l => {
      if (l.id === id) {
        const newLine = { ...l, [field]: value };
        
        // Autocomplete logic
        if (field === "reference" || field === "name") {
          const match = products.find(p => 
            p.reference.toLowerCase() === String(value).toLowerCase() || 
            (field === "name" && p.name.toLowerCase().includes(String(value).toLowerCase()))
          );
          
          if (match) {
            if (field === "reference") newLine.name = match.name;
            if (field === "name") newLine.reference = match.reference;
            newLine.vat = match.vat;
            
            // Check client price
            const clientPrice = clientPrices.find(cp => cp.seedProductId === match.id);
            if (clientPrice) {
              newLine.price = clientPrice.price;
            }
          }
        }
        
        return newLine;
      }
      return l;
    }));
  };

  const handleGenerate = async () => {
    if (!selectedClient) {
      toast.error("Selecciona un cliente.");
      return;
    }
    const validLines = lines.filter(l => l.reference && l.quantity && l.price);
    if (validLines.length === 0) {
      toast.error("Añade al menos una línea válida.");
      return;
    }

    setLoading(true);
    const res = await processGranelSale({
      clientId: selectedClient,
      lines: validLines.map(l => ({
        reference: l.reference,
        name: l.name || l.reference,
        quantity: Number(l.quantity),
        price: Number(l.price),
        vat: Number(l.vat),
        updatePrice: l.updatePrice
      }))
    });

    if (res.success) {
      toast.success("Factura Granel generada: " + res.invoiceNumber);
      setLines([{ id: Date.now(), reference: "", name: "", quantity: "", price: "", vat: 21, updatePrice: "SAVE" }]);
      setSelectedClient("");
      // Refresh catalogs
      getSeedProducts().then(setProducts);
    } else {
      toast.error("Error: " + res.error);
    }
    setLoading(false);
  };

  let invoiceBase = 0;
  let invoiceVat = 0;
  lines.forEach(l => {
    const q = Number(l.quantity) || 0;
    const p = Number(l.price) || 0;
    const v = Number(l.vat) || 0;
    const lineBase = q * p;
    invoiceBase += lineBase;
    invoiceVat += lineBase * (v / 100);
  });
  const invoiceTotal = invoiceBase + invoiceVat;

  const clientInfo = clients.find(c => c.id === selectedClient);

  return (
    <div className="max-w-4xl mx-auto mt-6 space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <img src="/granel-premium-logo.png" alt="Granel Premium" className="h-16 rounded-md shadow-sm" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-emerald-900">Nueva Factura</h1>
          <p className="text-emerald-700/80 font-medium">Facturación inteligente de semillas</p>
        </div>
      </div>

      <Card className="border-emerald-100 shadow-md">
        <CardContent className="p-6 md:p-8 space-y-8">
          
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-emerald-800 flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-800 w-6 h-6 rounded-full flex justify-center items-center text-xs">1</span>
              Cliente
            </h2>
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger className="w-full text-lg h-12 border-emerald-200 focus:ring-emerald-500">
                <SelectValue placeholder="Selecciona un cliente..." />
              </SelectTrigger>
              <SelectContent>
                {clients.filter(c => c.isGranelPremium).map(c => (
                  <SelectItem key={c.id} value={c.id} className="text-base py-3">
                    {c.commercialName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {clientInfo && (
               <div className="bg-emerald-50 border border-emerald-100 rounded-md p-3 text-sm text-emerald-800">
                 {clientInfo.fiscalAddress || 'Sin dirección fiscal'}
               </div>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-emerald-800 flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-800 w-6 h-6 rounded-full flex justify-center items-center text-xs">2</span>
              Productos
            </h2>
            
            <div className="space-y-3">
              {lines.map((line, index) => (
                <div key={line.id} className="flex flex-col md:flex-row gap-3 bg-slate-50 p-3 rounded-lg border">
                  <input
                    placeholder="Ref (ej: NK-001)"
                    value={line.reference}
                    onChange={(e) => updateLine(line.id, "reference", e.target.value)}
                    className="flex-1 px-3 py-2 border rounded text-sm focus:outline-emerald-500"
                    list="references"
                  />
                  <input
                    placeholder="Nombre"
                    value={line.name}
                    onChange={(e) => updateLine(line.id, "name", e.target.value)}
                    className="flex-[2] px-3 py-2 border rounded text-sm focus:outline-emerald-500"
                  />
                  <input
                    type="number"
                    placeholder="Cant."
                    value={line.quantity}
                    onChange={(e) => updateLine(line.id, "quantity", e.target.value)}
                    className="w-full md:w-24 px-3 py-2 border rounded text-sm focus:outline-emerald-500"
                  />
                  <div className="flex w-full md:w-auto gap-3">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Precio €"
                      value={line.price}
                      onChange={(e) => updateLine(line.id, "price", e.target.value)}
                      className="w-24 px-3 py-2 border rounded text-sm focus:outline-emerald-500"
                    />
                    <select
                      value={line.vat}
                      onChange={(e) => updateLine(line.id, "vat", e.target.value)}
                      className="w-20 px-2 border rounded text-sm bg-white focus:outline-emerald-500"
                    >
                      <option value="21">21%</option>
                      <option value="10">10%</option>
                      <option value="4">4%</option>
                      <option value="0">0%</option>
                    </select>
                    <Button variant="ghost" className="text-red-500 px-2" onClick={() => removeLine(line.id)} disabled={lines.length === 1}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* Price Change Prompt */}
                  {line.price && selectedClient && products.find(p => p.reference === line.reference) && (
                     (() => {
                        const product = products.find(p => p.reference === line.reference);
                        const knownPrice = clientPrices.find(cp => cp.seedProductId === product?.id)?.price;
                        if (knownPrice && knownPrice !== Number(line.price)) {
                           return (
                             <div className="w-full md:col-span-full mt-2 bg-amber-50 text-amber-800 text-xs p-2 rounded flex justify-between items-center border border-amber-200">
                               <span>Precio habitual: {knownPrice}€. ¿Guardar {line.price}€ como nuevo precio?</span>
                               <select 
                                 className="bg-white border rounded px-2 py-1 ml-2 outline-none"
                                 value={line.updatePrice}
                                 onChange={(e) => updateLine(line.id, "updatePrice", e.target.value)}
                               >
                                 <option value="SAVE">Guardar precio</option>
                                 <option value="JUST_ONCE">Solo esta factura</option>
                               </select>
                             </div>
                           );
                        }
                        return null;
                     })()
                  )}
                </div>
              ))}
              
              <datalist id="references">
                {products.map(p => <option key={p.id} value={p.reference}>{p.name}</option>)}
              </datalist>

              <Button variant="outline" onClick={addLine} className="w-full text-emerald-700 border-emerald-200 hover:bg-emerald-50">
                <Plus className="w-4 h-4 mr-2" /> Añadir línea
              </Button>
            </div>
          </div>

          <div className="bg-slate-100 p-4 rounded-lg flex flex-col items-end gap-1 text-sm">
             <div className="w-48 flex justify-between"><span>Base:</span> <span>{invoiceBase.toFixed(2)} €</span></div>
             <div className="w-48 flex justify-between"><span>IVA:</span> <span>{invoiceVat.toFixed(2)} €</span></div>
             <div className="w-48 flex justify-between font-bold text-lg border-t pt-1 mt-1"><span>Total:</span> <span>{invoiceTotal.toFixed(2)} €</span></div>
          </div>

          <Button 
            onClick={handleGenerate} 
            disabled={loading || !selectedClient}
            className="w-full h-14 text-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-lg"
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            {loading ? "GENERANDO..." : "GENERAR FACTURA"}
          </Button>
          
        </CardContent>
      </Card>
    </div>
  );
}
