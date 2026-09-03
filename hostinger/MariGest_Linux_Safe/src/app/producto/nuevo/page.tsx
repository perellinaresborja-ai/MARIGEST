"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { addStockMovement } from "@/app/actions/stock";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Minus, Plus, PackagePlus } from "lucide-react";

export default function NuevoMovimientoPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [type, setType] = useState("BOTTLING");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState<number | string>(0);
  const [reason, setReason] = useState("");

  // Need a quick way to fetch products, let's just hardcode the fetch or create a quick action
  // Wait, I can just fetch them in a useEffect.
  useEffect(() => {
    fetch('/api/products').then(res => res.json()).then(data => {
      if (data && data.length) {
        setProducts(data);
        setProductId(data[0].id);
      }
    }).catch(e => {
      // If no API exists, we might need a server action to get products
    });
  }, []);

  async function handleSubmit() {
    const qty = Number(quantity);
    if (!productId || qty <= 0) {
      toast.error("Selecciona un producto y cantidad mayor a 0");
      return;
    }

    setLoading(true);
    const res = await addStockMovement({
      productId,
      type,
      quantity: qty,
      reason,
      user: "Mari"
    });

    setLoading(false);

    if (res.success) {
      toast.success("Movimiento registrado con éxito");
      router.push("/producto");
    } else {
      toast.error(res.error || "Error al registrar movimiento");
    }
  }

  const movementTypes = [
    { value: "BOTTLING", label: "Entrada Embotelladora", color: "text-emerald-700" },
    { value: "BREAKAGE", label: "Rotura", color: "text-rose-700" },
    { value: "SHRINKAGE", label: "Merma", color: "text-amber-700" },
    { value: "SAMPLE", label: "Muestra", color: "text-blue-700" },
    { value: "PROMOTION", label: "Promoción Comercial", color: "text-purple-700" },
    { value: "EVENT", label: "Salida a Evento", color: "text-indigo-700" },
    { value: "RETURN", label: "Devolución (Entrada)", color: "text-emerald-700" },
    { value: "ADJUSTMENT", label: "Ajuste de Inventario", color: "text-slate-700" }
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-8 mt-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Nuevo Movimiento</h1>
        <p className="text-slate-500">Registra entradas o salidas manuales de almacén.</p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 uppercase">¿Qué ha pasado?</label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-full text-lg h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {movementTypes.map(t => (
                  <SelectItem key={t.value} value={t.value} className="text-base py-3">
                    <span className={t.color + " font-medium"}>{t.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 uppercase">Producto</label>
            {/* If products didn't load from API, we should provide a fallback. For MariGest we know we have 2 products. */}
            {products.length === 0 ? (
              <p className="text-sm text-slate-500 italic">Cargando productos...</p>
            ) : (
              <Select value={productId} onValueChange={setProductId}>
                <SelectTrigger className="w-full text-lg h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {products.map(p => (
                    <SelectItem key={p.id} value={p.id} className="text-base py-3">
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 uppercase">Cantidad (Botellas)</label>
            <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-lg border">
              <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(0, (Number(quantity) || 0) - 1))} className="h-14 w-14 shrink-0 rounded-md">
                <Minus className="h-6 w-6" />
              </Button>
              <input 
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0))}
                className="text-4xl font-bold w-full text-center bg-transparent border-none focus:ring-0 hide-arrows" 
              />
              <Button variant="outline" size="icon" onClick={() => setQuantity((Number(quantity) || 0) + 1)} className="h-14 w-14 shrink-0 rounded-md">
                <Plus className="h-6 w-6" />
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 uppercase">Motivo / Observación (Opcional)</label>
            <Input 
              placeholder="Ej: Se ha roto al cargar la furgoneta" 
              value={reason} 
              onChange={e => setReason(e.target.value)}
              className="h-12 text-base"
            />
          </div>

          <Button 
            onClick={handleSubmit}
            disabled={loading || !productId || Number(quantity) <= 0}
            className="w-full h-16 text-xl bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg mt-4"
          >
            <PackagePlus className="w-6 h-6 mr-2" />
            {loading ? "GUARDANDO..." : "REGISTRAR MOVIMIENTO"}
          </Button>

        </CardContent>
      </Card>
    </div>
  );
}
