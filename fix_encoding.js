const fs = require('fs');

// 1. gestoria/page.tsx
let gestoriaPage = fs.readFileSync('src/app/gestoria/page.tsx', 'utf8');
gestoriaPage = gestoriaPage.replace(
  `export default async function GestoriaPage({ searchParams }: { searchParams: Promise<{ period?: string, start?: string, end?: string }> }) {`,
  `import { GestoriaFilter } from "./GestoriaFilter";\nexport default async function GestoriaPage({ searchParams }: { searchParams: Promise<{ period?: string, start?: string, end?: string, profile?: string }> }) {`
);
gestoriaPage = gestoriaPage.replace(
  `const end = params.end;`,
  `const end = params.end;\n  const profile = params.profile || "GENERAL";`
);
gestoriaPage = gestoriaPage.replace(
  `const data = await getGestoriaData(period, start, end);`,
  `const data = await getGestoriaData(period, start, end, profile);`
);
gestoriaPage = gestoriaPage.replace(
  `<p className="text-rose-800/80 font-medium">Información de gestión interna. No constituye liquidación fiscal oficial (AEAT).</p>`,
  `<p className="text-rose-800/80 font-medium">Información de gestión interna. No constituye liquidación fiscal oficial (AEAT).</p>\n          <GestoriaFilter currentFilter={profile} />`
);
fs.writeFileSync('src/app/gestoria/page.tsx', gestoriaPage);

// 2. negocio/page.tsx
let negocioPage = fs.readFileSync('src/app/negocio/page.tsx', 'utf8');
negocioPage = negocioPage.replace(
  `export default async function NegocioPage({ searchParams }: { searchParams: Promise<{ period?: string, start?: string, end?: string }> }) {`,
  `import { GestoriaFilter } from "../gestoria/GestoriaFilter";\nexport default async function NegocioPage({ searchParams }: { searchParams: Promise<{ period?: string, start?: string, end?: string, profile?: string }> }) {`
);
negocioPage = negocioPage.replace(
  `const end = params.end;`,
  `const end = params.end;\n  const profile = params.profile || "GENERAL";`
);
negocioPage = negocioPage.replace(
  `const data = await getNegocioDashboard(period, start, end);`,
  `const data = await getNegocioDashboard(period, start, end, profile);`
);
negocioPage = negocioPage.replace(
  `<p className="text-slate-500">Rentabilidad, canales y rendimiento comercial.</p>`,
  `<p className="text-slate-500">Rentabilidad, canales y rendimiento comercial.</p>\n          <GestoriaFilter currentFilter={profile} />`
);
fs.writeFileSync('src/app/negocio/page.tsx', negocioPage);

// 3. clientes/[id]/page.tsx
let clientPage = fs.readFileSync('src/app/clientes/[id]/page.tsx', 'utf8');
clientPage = clientPage.replace(
  `agreement: true,`,
  `agreement: true, seedPrices: { include: { seedProduct: true } },`
);
const seedTable = `
      {client.isGranelPremium && (
        <Card className="border-emerald-200 shadow-sm">
          <CardHeader className="bg-emerald-50">
            <CardTitle className="text-emerald-900">TARIFA GRANEL PREMIUM</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {client.seedPrices && client.seedPrices.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead className="bg-emerald-50/50">
                  <tr className="border-b border-emerald-100">
                    <th className="py-3 px-4 font-bold text-emerald-800 text-sm">Referencia</th>
                    <th className="py-3 px-4 font-bold text-emerald-800 text-sm">Producto</th>
                    <th className="py-3 px-4 font-bold text-emerald-800 text-sm text-right">Precio acordado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-50">
                  {client.seedPrices.map((sp: any) => (
                    <tr key={sp.id} className="hover:bg-emerald-50/30">
                      <td className="py-3 px-4 font-medium">{sp.seedProduct.reference}</td>
                      <td className="py-3 px-4 text-slate-600">{sp.seedProduct.name}</td>
                      <td className="py-3 px-4 text-right font-bold">{sp.price.toFixed(2)} €</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-6 text-center text-slate-500">
                <p>Todavía no hay precios guardados para este cliente.</p>
                <p className="text-sm mt-1">Se irán añadiendo automáticamente al facturar.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Últimas Ventas</CardTitle>
`;
clientPage = clientPage.replace(
  `      <Card>
        <CardHeader>
          <CardTitle>Últimas Ventas</CardTitle>`,
  seedTable
);
fs.writeFileSync('src/app/clientes/[id]/page.tsx', clientPage);

// 4. facturas/[id]/page.tsx
let facturaPage = fs.readFileSync('src/app/facturas/[id]/page.tsx', 'utf8');
facturaPage = facturaPage.replace(
  `import { Download, ArrowLeft } from "lucide-react";`,
  `import { ArrowLeft } from "lucide-react";`
);
facturaPage = facturaPage.replace(
  `  if (!client) {
    return <div>Error: No se ha encontrado el cliente asociado a esta factura.</div>;
  }`,
  `  let displayClient = client;
  if (!displayClient) {
    const transaction = await prisma.transaction.findFirst({ where: { referenceId: invoice.id }, include: { client: { include: { paymentTerm: true } } } });
    if (transaction?.client) displayClient = transaction.client;
  }
  if (!displayClient) {
    return <div>Error: No se ha encontrado el cliente asociado a esta factura.</div>;
  }
  const isGranel = invoice.businessProfile === "GRANEL_PREMIUM";
  const logoSrc = isGranel ? "/granel-premium-logo.jpg" : "/logopc.jpg";
  const accentColor = isGranel ? "text-emerald-700" : "text-rose-900";`
);
facturaPage = facturaPage.replace(
  `<img src="/cellernazihalogo.jpg" alt="Celler Naziha Logo" className="h-36 w-auto mb-4 -mt-4 object-contain mix-blend-multiply" />
            <h1 className={\`text-3xl font-black tracking-tighter \${invoice.type === 'RECTIFICATIVA' ? 'text-slate-900' : 'text-rose-900'}\`}>`,
  `<img src={logoSrc} alt="Celler Naziha Logo" className="h-36 w-auto mb-4 -mt-4 object-contain mix-blend-multiply" />
            <h1 className={\`text-3xl font-black tracking-tighter \${invoice.type === 'RECTIFICATIVA' ? 'text-slate-900' : accentColor}\`}>`
);
facturaPage = facturaPage.replace(/client\.legalName/g, 'displayClient.legalName');
facturaPage = facturaPage.replace(/client\.commercialName/g, 'displayClient.commercialName');
facturaPage = facturaPage.replace(/client\.cifNif/g, 'displayClient.cifNif');
facturaPage = facturaPage.replace(/client\.fiscalAddress/g, 'displayClient.fiscalAddress');
facturaPage = facturaPage.replace(/client\.paymentTerm/g, 'displayClient.paymentTerm');
facturaPage = facturaPage.replace(
  `<span className="font-black text-xl text-rose-900">{invoice.total.toFixed(2)} €</span>`,
  `<span className={\`font-black text-xl \${accentColor}\`}>{invoice.total.toFixed(2)} €</span>`
);
fs.writeFileSync('src/app/facturas/[id]/page.tsx', facturaPage);

// 5. page.tsx (HOY)
let hoyPage = fs.readFileSync('src/app/page.tsx', 'utf8');
hoyPage = hoyPage.replace(
  `{data.recentOrders.map(order => (
                <div key={order.id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">Venta generada - {order.client.commercialName}</p>
                    <p className="text-xs text-slate-500">{new Date(order.date).toLocaleString()} • {order.totalBottles} botellas</p>
                  </div>
                  <Link href={\`/clientes/\${order.clientId}\`}>
                    <span className="text-xs font-medium text-rose-900 hover:underline">Ver</span>
                  </Link>
                </div>
              ))}`,
  `{data.recentOrders.map((order: any) => { 
                const isGranel = order.businessProfile === "GRANEL_PREMIUM"; 
                return (
                <div key={order.id} className="py-3 flex justify-between items-center">
                  <div>
                    <div className="flex gap-2 items-center">
                      <p className="text-sm font-medium">Venta generada - {order.client?.commercialName || "Cliente"}</p>
                      <span className={isGranel ? "bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded font-bold" : "bg-rose-100 text-rose-800 text-[10px] px-1.5 py-0.5 rounded font-bold"}>{isGranel ? "GRANEL PREMIUM" : "PUIG CAMPANA"}</span>
                    </div>
                    <p className="text-xs text-slate-500">{new Date(order.date).toLocaleString()} • {isGranel ? "Semillas" : order.invoiceNumber}</p>
                  </div>
                  <Link href={\`/clientes/\${order.client?.id || ''}\`}>
                    <span className="text-xs font-medium text-rose-900 hover:underline">Ver</span>
                  </Link>
                </div>
              )})}`
);
fs.writeFileSync('src/app/page.tsx', hoyPage);

console.log("All fixes applied successfully with perfect encoding.");
