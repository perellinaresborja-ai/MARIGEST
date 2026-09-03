"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MovementType } from "@prisma/client";
import { toast } from "sonner";
import { closeEvent } from "@/app/actions/events";

export default function EventCloseForm({ event, rojoProduct, blancoProduct, stockRojo, stockBlanco }: any) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Return state (in boxes, though could be bottles, but requested boxes/bottles logic)
  const [returnRojoBoxes, setReturnRojoBoxes] = useState(0);
  const [returnBlancoBoxes, setReturnBlancoBoxes] = useState(0);
  
  // Actually, let's just do bottles to be precise, or boxes. Let's do boxes for simplicity as requested: "Mari solo introducirá lo que ha devuelto (cajas/botellas)". Let's use bottles for maximum precision, but show boxes.
  const [returnRojo, setReturnRojo] = useState(0);
  const [returnBlanco, setReturnBlanco] = useState(0);

  const faltanRojo = stockRojo - returnRojo;
  const faltanBlanco = stockBlanco - returnBlanco;
  const totalFaltan = faltanRojo + faltanBlanco;

  // Classifications state (store quantities for each type)
  const [classifications, setClassifications] = useState<Record<string, number>>({
    [MovementType.SALE]: 0,
    [MovementType.TASTING]: 0,
    [MovementType.PROMOTION]: 0,
    [MovementType.COURTESY]: 0,
    [MovementType.BREAKAGE]: 0,
    [MovementType.OTHER]: 0,
  });

  const totalClassified = Object.values(classifications).reduce((a, b) => a + b, 0);
  const remainingToClassify = totalFaltan - totalClassified;

  // Finances
  const [incomes, setIncomes] = useState([{ amount: 0, description: "Venta de vermut" }]);
  const [expenses, setExpenses] = useState([
    { category: "Personal", amount: 0 },
    { category: "Transporte", amount: 0 },
    { category: "Dietas", amount: 0 },
    { category: "Vasos / Material", amount: 0 },
    { category: "Hielo", amount: 0 },
    { category: "Publicidad", amount: 0 },
    { category: "Otros", amount: 0 },
  ]);

  const totalIncome = incomes.reduce((a, b) => a + (b.amount || 0), 0);
  const totalExpenses = expenses.reduce((a, b) => a + (b.amount || 0), 0);
  // Estimation of product cost (6.40€ per bottle baseline)
  const estimatedProductCost = totalFaltan * 6.40; 
  const result = totalIncome - totalExpenses - estimatedProductCost;

  async function handleSubmit() {
    if (returnRojo < 0 || returnRojo > stockRojo) {
      return toast.error("Devolución de Rojo inválida.");
    }
    if (returnBlanco < 0 || returnBlanco > stockBlanco) {
      return toast.error("Devolución de Blanco inválida.");
    }
    if (remainingToClassify !== 0) {
      return toast.error(`Falta clasificar ${remainingToClassify} botellas.`);
    }

    setLoading(true);

    // We must distribute the classifications between Rojo and Blanco.
    // For simplicity, we just send them as generic deductions from the event location, 
    // we'll proportionally subtract from Rojo/Blanco based on what's missing.
    const classList = [];
    let rMiss = faltanRojo;
    let bMiss = faltanBlanco;

    for (const [type, qty] of Object.entries(classifications)) {
      if (qty > 0) {
        let assigned = 0;
        let q = qty;
        
        // Take from Rojo first
        if (rMiss > 0) {
          const take = Math.min(q, rMiss);
          classList.push({ productId: rojoProduct.id, quantity: take, type: type as MovementType });
          rMiss -= take;
          q -= take;
        }
        // Then Blanco
        if (q > 0 && bMiss > 0) {
          const take = Math.min(q, bMiss);
          classList.push({ productId: blancoProduct.id, quantity: take, type: type as MovementType });
          bMiss -= take;
          q -= take;
        }
      }
    }

    try {
      await closeEvent(event.id, {
        returnBoxesRojo: returnRojo / 6, // We pass it to backend, but backend expects boxes or bottles? Backend expects returnBoxesRojo * 6. Let's send boxes.
        returnBoxesBlanco: returnBlanco / 6,
        classifications: classList,
        incomes,
        expenses
      });
      toast.success("Evento cerrado con éxito.");
      router.push("/producto");
    } catch (error: any) {
      toast.error(error.message);
      setLoading(false);
    }
  }

  // To fix backend expecting boxes, I'll pass returnBoxesRojo = returnRojo / 6
  
  return (
    <div className="space-y-8 pb-12">
      {/* 1. DEVOLUCIÓN */}
      <Card>
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle>1. Producto Devuelto</CardTitle>
          <CardDescription>Indica exactamente cuántas BOTELLAS han vuelto al almacén físico.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 grid grid-cols-2 gap-8">
          <div>
            <h3 className="font-bold text-brand-900 mb-2">Vermut Rojo</h3>
            <p className="text-sm text-slate-500 mb-4">Salieron: {stockRojo} botellas (~{stockRojo/6} cajas)</p>
            <div className="flex items-center gap-4">
              <Label>Vuelven:</Label>
              <Input 
                type="number" min="0" max={stockRojo} 
                value={returnRojo} onChange={e => setReturnRojo(parseInt(e.target.value)||0)}
                className="text-xl w-32"
              />
            </div>
            <p className="text-sm font-bold text-brand-700 mt-4">Faltan: {faltanRojo} botellas</p>
          </div>
          
          <div>
            <h3 className="font-bold text-amber-700 mb-2">Vermut Blanco</h3>
            <p className="text-sm text-slate-500 mb-4">Salieron: {stockBlanco} botellas (~{stockBlanco/6} cajas)</p>
            <div className="flex items-center gap-4">
              <Label>Vuelven:</Label>
              <Input 
                type="number" min="0" max={stockBlanco} 
                value={returnBlanco} onChange={e => setReturnBlanco(parseInt(e.target.value)||0)}
                className="text-xl w-32"
              />
            </div>
            <p className="text-sm font-bold text-amber-700 mt-4">Faltan: {faltanBlanco} botellas</p>
          </div>
        </CardContent>
      </Card>

      {/* 2. CLASIFICACIÓN */}
      <Card className={remainingToClassify !== 0 ? "border-amber-200" : "border-emerald-200"}>
        <CardHeader className={remainingToClassify !== 0 ? "bg-amber-50/50 border-b" : "bg-emerald-50/50 border-b"}>
          <CardTitle>2. Destino del Producto Faltante</CardTitle>
          <CardDescription>
            Hay un total de <strong>{totalFaltan} botellas</strong> que no han vuelto. ¿Qué ha pasado con ellas?
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {[
              { id: MovementType.SALE, label: "Venta en evento" },
              { id: MovementType.TASTING, label: "Degustación" },
              { id: MovementType.PROMOTION, label: "Promoción" },
              { id: MovementType.COURTESY, label: "Cortesía" },
              { id: MovementType.BREAKAGE, label: "Rotura / Merma" },
              { id: MovementType.OTHER, label: "Otros" },
            ].map(cat => (
              <div key={cat.id} className="space-y-2">
                <Label>{cat.label}</Label>
                <Input 
                  type="number" min="0" 
                  value={classifications[cat.id] || ''}
                  onChange={e => setClassifications({...classifications, [cat.id]: parseInt(e.target.value)||0})}
                />
              </div>
            ))}
          </div>

          <div className={`mt-6 p-4 rounded-xl text-center font-bold ${remainingToClassify === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
            {remainingToClassify === 0 
              ? "✓ Todas las botellas clasificadas correctamente" 
              : `Faltan por clasificar: ${remainingToClassify} botellas`
            }
          </div>
        </CardContent>
      </Card>

      {/* 3. FINANZAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle>3. Ingresos del Evento</CardTitle>
            <CardDescription>Dinero generado</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {incomes.map((inc, i) => (
              <div key={i} className="flex gap-4">
                <Input 
                  value={inc.description} 
                  onChange={e => {
                    const newInc = [...incomes];
                    newInc[i].description = e.target.value;
                    setIncomes(newInc);
                  }}
                />
                <Input 
                  type="number" min="0" step="0.01" className="w-32"
                  value={inc.amount || ''} 
                  onChange={e => {
                    const newInc = [...incomes];
                    newInc[i].amount = parseFloat(e.target.value)||0;
                    setIncomes(newInc);
                  }}
                />
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => setIncomes([...incomes, { amount: 0, description: "Otros ingresos" }])}>
              + Añadir ingreso
            </Button>
            <div className="text-right font-bold text-lg pt-4 border-t">
              Total Ingresos: {totalIncome.toFixed(2)} €
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle>4. Otros Gastos</CardTitle>
            <CardDescription>Costes asociados al evento</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {expenses.map((exp, i) => (
              <div key={i} className="flex items-center gap-4">
                <Label className="w-1/2">{exp.category}</Label>
                <Input 
                  type="number" min="0" step="0.01"
                  value={exp.amount || ''} 
                  onChange={e => {
                    const newExp = [...expenses];
                    newExp[i].amount = parseFloat(e.target.value)||0;
                    setExpenses(newExp);
                  }}
                />
              </div>
            ))}
            <div className="text-right font-bold text-lg pt-4 border-t">
              Total Gastos: {totalExpenses.toFixed(2)} €
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RESULTADO */}
      <Card className="border-slate-800 border-2">
        <CardHeader className="bg-slate-900 text-white">
          <CardTitle>Resumen Económico</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-sm text-slate-500 mb-1">Coste Producto (Est.)</p>
            <p className="text-xl font-medium text-brand-900">-{estimatedProductCost.toFixed(2)} €</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 mb-1">Otros Gastos</p>
            <p className="text-xl font-medium text-brand-900">-{totalExpenses.toFixed(2)} €</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 mb-1">Ingresos</p>
            <p className="text-xl font-medium text-emerald-700">+{totalIncome.toFixed(2)} €</p>
          </div>
          <div className="bg-slate-100 rounded-lg p-2">
            <p className="text-sm text-slate-800 font-bold mb-1">RESULTADO</p>
            <p className={`text-2xl font-black ${result >= 0 ? 'text-emerald-700' : 'text-brand-900'}`}>
              {result > 0 ? '+' : ''}{result.toFixed(2)} €
            </p>
          </div>
        </CardContent>
      </Card>

      <Button 
        onClick={handleSubmit} 
        disabled={loading || remainingToClassify !== 0} 
        className="w-full h-16 text-xl bg-slate-900 hover:bg-slate-800"
      >
        {loading ? "CERRANDO EVENTO..." : "CERRAR EVENTO DEFINITIVAMENTE"}
      </Button>

    </div>
  );
}
