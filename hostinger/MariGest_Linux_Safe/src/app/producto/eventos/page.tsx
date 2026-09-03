import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default async function EventosPage() {
  const events = await prisma.event.findMany({
    orderBy: { date: 'desc' },
    include: { location: true }
  });

  const openEvents = events.filter(e => e.status === "OPEN");
  const closedEvents = events.filter(e => e.status === "CLOSED");

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Eventos</h1>
          <p className="text-slate-500">Mueve producto temporalmente a una ubicación.</p>
        </div>
        <Link href="/producto/eventos/nuevo">
          <Button className="bg-rose-900 hover:bg-rose-800 text-white">Nuevo Evento</Button>
        </Link>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-4">Eventos en curso</h2>
        {openEvents.length === 0 ? (
          <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-500">
            No hay ningún evento activo en este momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {openEvents.map(e => (
              <Card key={e.id} className="border-rose-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-rose-900">{e.name}</CardTitle>
                  <p className="text-sm text-slate-500">{e.place}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-xs font-medium text-slate-500 mb-4">{new Date(e.date).toLocaleDateString()}</p>
                  <Link href={`/producto/eventos/${e.id}/cierre`}>
                    <Button variant="outline" className="w-full text-rose-900 border-rose-200 hover:bg-rose-50">Gestionar Cierre</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-4">Historial de Eventos</h2>
        {closedEvents.length === 0 ? (
          <p className="text-slate-500 text-sm">No hay eventos cerrados.</p>
        ) : (
          <div className="space-y-2">
            {closedEvents.map(e => (
              <div key={e.id} className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100">
                <div>
                  <p className="font-medium text-slate-800">{e.name} <span className="text-xs text-slate-400 font-normal ml-2">{e.place}</span></p>
                  <p className="text-xs text-slate-500">{new Date(e.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">Cerrado</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
