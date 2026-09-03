import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Toaster } from "@/components/ui/sonner";
import { SplashScreen } from "@/components/SplashScreen";
import { MobileNav } from "@/components/MobileNav";
import { LogoutButton } from "@/components/LogoutButton";
import { PwaRegister } from "@/components/PwaRegister";
import { ProfileSelector } from "@/components/ProfileSelector";
import { getProfileCookie } from "@/app/actions/profile";
import { getSession } from "@/lib/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MariGest - Gestión Integral",
  description: "Todo el negocio del vermut en un solo sitio.",
  manifest: "/manifest.webmanifest",
};

export const viewport = {
  themeColor: "#ffffff",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  const profile = await getProfileCookie();
  const isGranel = profile === "GRANEL_PREMIUM";
  const accentHover = isGranel ? "hover:text-emerald-700" : "hover:text-brand-900";
  const logoSrc = isGranel ? "/granel-premium-logo.png" : "/logopc.png";

  return (
    <html lang="es" data-brand={isGranel ? "granel" : "puig"}>
      <body className={`${inter.className} bg-slate-50 text-slate-900 min-h-screen flex flex-col overflow-x-hidden`}>
        <PwaRegister />
        <SplashScreen />
        
        {/* Navegación (solo si hay sesión) */}
        {session && (
          <header className="bg-white border-b sticky top-0 z-10 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16 items-center">
                <div className="flex items-center gap-8">
                  <Link href="/" className="flex items-center gap-2">
                    <img src={logoSrc} alt="MariGest Logo" className="h-10 w-auto" />
                  </Link>
                  <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
                    <Link href="/" className={`transition-colors ${accentHover}`}>HOY</Link>
                    <Link href="/clientes" className={`transition-colors ${accentHover}`}>CLIENTES</Link>
                    <Link href="/ventas" className={`transition-colors ${accentHover}`}>VENTAS</Link>
                    <Link href="/producto" className={`transition-colors ${accentHover}`}>PRODUCTO</Link>
                    <Link href="/tesoreria" className={`transition-colors ${accentHover}`}>TESORERÍA</Link>
                    <Link href="/negocio" className={`transition-colors ${accentHover}`}>RESUMEN</Link>
                  </nav>
                </div>
                <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
                  <div className="hidden md:flex items-center gap-4">
                    <ProfileSelector currentProfile={profile} />
                    <Link href="/gestoria" className={`transition-colors ${accentHover}`}>GESTORÍA</Link>
                    <Link href="/configuracion" className={`transition-colors ${accentHover}`}>CONFIGURACIÓN</Link>
                  </div>
                  <MobileNav isGranel={isGranel} currentProfile={profile} />
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

