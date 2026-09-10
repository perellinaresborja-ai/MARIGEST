"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function SplashScreen() {
  const pathname = usePathname();
  const [show, setShow] = useState(true);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    // Si estamos en la página de login, no mostrar nunca el splash
    if (pathname === "/login") {
      setShow(false);
      return;
    }

    // Verificar si ya hemos mostrado el splash en esta sesion
    const hasSeenSplash = sessionStorage.getItem("splash_seen");
    
    if (hasSeenSplash) {
      setShow(false);
      return;
    }

    // A los 1.5 segundos empezamos el fundido
    const fadeTimer = setTimeout(() => {
      setFade(true);
    }, 1500);

    // A los 2 segundos lo quitamos del DOM
    const removeTimer = setTimeout(() => {
      setShow(false);
      sessionStorage.setItem("splash_seen", "true");
    }, 2000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [pathname]);

  if (!show) return null;

  const fadeClass = fade ? "opacity-0 pointer-events-none" : "opacity-100";

  return (
    <div 
      className={"fixed inset-0 z-50 flex items-center justify-center bg-slate-50 transition-opacity duration-500 " + fadeClass}
    >
      <div className="flex flex-col items-center gap-6">
        <img 
          src="/marigest-logo.png" 
          alt="MariGest Logo" 
          className="w-48 h-auto animate-pulse"
        />
        <div className="w-8 h-8 border-4 border-brand-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  );
}

