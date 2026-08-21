import { getClients } from "@/app/actions/clients";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";

export default async function ClientesPage() {
  const clients = await getClients();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Clientes</h1>
          <p className="text-slate-500">Inteligencia comercial y gestión de cartera.</p>
        </div>
        <Link href="/clientes/nuevo">
          <Button className="bg-rose-900 hover:bg-rose-800 text-white">Nuevo Cliente</Button>
        </Link>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Nombre Comercial</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Acuerdo</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                    No hay clientes registrados. Empieza creando uno.
                  </TableCell>
                </TableRow>
              ) : (
                clients.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.commercialName}</TableCell>
                    <TableCell>{c.type === 'HOSTELERIA' ? 'Hostelería' : c.type === 'DISTRIBUIDOR' ? 'Distribuidor' : 'Particular'}</TableCell>
                    <TableCell>
                      {c.contactPerson && <div className="text-sm">{c.contactPerson}</div>}
                      {c.phone && <div className="text-xs text-slate-500">{c.phone}</div>}
                    </TableCell>
                    <TableCell>
                      {c.agreement ? (
                        <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                          {c.agreement.name}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">Sin acuerdo</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/clientes/${c.id}`}>
                        <Button variant="ghost" size="sm" className="text-rose-900">Ver Ficha</Button>
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
