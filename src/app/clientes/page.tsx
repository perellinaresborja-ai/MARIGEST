import { getClients } from "@/app/actions/clients";
import { getProfileCookie } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";

export default async function ClientesPage() {
  const currentProfile = await getProfileCookie();
  
  let clients = await getClients();
  
  if (currentProfile === "GRANEL_PREMIUM") {
    clients = clients.filter((c: any) => c.isGranelPremium);
  } else {
    clients = clients.filter((c: any) => c.isVermut !== false);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Clientes</h1>
          <p className="text-slate-500 mb-4">Inteligencia comercial y gestiÃ³n de cartera.</p>
        </div>
        <Link href="/clientes/nuevo">
          <Button className="bg-brand-900 hover:bg-brand-800 text-white">Nuevo Cliente</Button>
        </Link>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Nombre Comercial</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                    No hay clientes para este filtro.
                  </TableCell>
                </TableRow>
              ) : (
                clients.map((c: any) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.commercialName}</TableCell>
                    <TableCell>{c.type === 'HOSTELERIA' ? 'HostelerÃ­a' : c.type === 'DISTRIBUIDOR' ? 'Distribuidor' : 'Particular'}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {c.isVermut && <span className="bg-brand-100 text-brand-800 text-[10px] px-1.5 py-0.5 rounded font-bold">PC</span>}
                        {c.isGranelPremium && <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded font-bold">GP</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {c.contactPerson && <div className="text-sm">{c.contactPerson}</div>}
                      {c.phone && <div className="text-xs text-slate-500">{c.phone}</div>}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/clientes/${c.id}`}>
                        <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">Ver Ficha</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

