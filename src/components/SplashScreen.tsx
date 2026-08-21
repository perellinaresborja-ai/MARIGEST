"use client";

import { useEffect, useState } from "react";

export function SplashScreen() {
  const [show, setShow] = useState(true);
  const [fade, setFade] = useState(false);

  useEffect(() => {
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
  }, []);

  if (!show) return null;

  return (
    <div 
      className={ixed inset-0 z-50 flex items-center justify-center bg-slate-50 transition-opacity duration-500  + (fade ? "opacity-0" : "opacity-100")}
    >
      <div className="flex flex-col items-center gap-6">
        <img 
          src="/logo.png" 
          alt="MariGest Logo" 
          className="w-48 h-auto animate-pulse"
        />
        <div className="w-8 h-8 border-4 border-rose-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  );
}
