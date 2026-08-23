import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Toaster } from "@/components/ui/sonner";
import { SplashScreen } from "@/components/SplashScreen";
import { MobileNav } from "@/components/MobileNav";
import { LogoutButton } from "@/components/LogoutButton";
import { getSession } from "@/lib/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MariGest - Gestión Integral",
  description: "Todo el negocio del vermut en un solo sitio.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html lang="es">
      <body className={`${inter.className} bg-slate-50 text-slate-900 min-h-screen flex flex-col overflow-x-hidden`}>
        <SplashScreen />
        {/* Banner Modo Pruebas */}
        <div className="bg-amber-400 text-amber-950 font-bold text-center text-sm py-1">
          MODO PRUEBAS - Facturación sin valor fiscal
        </div>
        
        {/* Navegación (solo si hay sesión) */}
        {session && (
          <header className="bg-white border-b sticky top-0 z-10 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16 items-center">
                <div className="flex items-center gap-8">
                  <Link href="/" className="flex items-center gap-2">
                    <img src="/logo.png" alt="MariGest Logo" className="h-10 w-auto" />
                  </Link>
                  <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
                    <Link href="/" className="hover:text-rose-900 transition-colors">HOY</Link>
                    <Link href="/clientes" className="hover:text-rose-900 transition-colors">CLIENTES</Link>
                    <Link href="/ventas" className="hover:text-rose-900 transition-colors">VENTAS</Link>
                    <Link href="/producto" className="hover:text-rose-900 transition-colors">PRODUCTO</Link>
                    <Link href="/tesoreria" className="hover:text-rose-900 transition-colors">TESORERÍA</Link>
                    <Link href="/negocio" className="hover:text-rose-900 transition-colors">RESUMEN</Link>
                  </nav>
                </div>
                <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
                  <div className="hidden md:flex items-center gap-4">
                    <Link href="/gestoria" className="hover:text-rose-900 transition-colors">GESTORÍA</Link>
                    <Link href="/configuracion" className="hover:text-rose-900 transition-colors">CONFIGURACIÓN</Link>
                  </div>
                  <MobileNav />
                  <LogoutButton />
                </div>
              </div>
            </div>
          </header>
        )}

        {/* Contenido */}
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          {children}
        </main>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
