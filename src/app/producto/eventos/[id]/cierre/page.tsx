import { prisma } from "@/lib/prisma";
import { getProductStock } from "@/lib/stock";
import { ProductType } from "@prisma/client";
import { notFound } from "next/navigation";
import EventCloseForm from "./EventCloseForm";

export default async function CierreEventoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const event = await prisma.event.findUnique({
    where: { id },
    include: { location: true }
  });

  if (!event || !event.location || event.status === "CLOSED") {
    notFound();
  }

  const products = await prisma.product.findMany();
  const rojoProduct = products.find((p) => p.type === ProductType.ROJO)!;
  const blancoProduct = products.find((p) => p.type === ProductType.BLANCO)!;

  // Stock currently at the event
  const stockRojoEvent = await getProductStock(rojoProduct.id, event.locationId!);
  const stockBlancoEvent = await getProductStock(blancoProduct.id, event.locationId!);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Cierre de Evento</h1>
        <p className="text-slate-500">{event.name} — {event.place}</p>
      </div>

      <EventCloseForm 
        event={event} 
        rojoProduct={rojoProduct}
        blancoProduct={blancoProduct}
        stockRojo={stockRojoEvent} 
        stockBlanco={stockBlancoEvent} 
      />
    </div>
  );
}
