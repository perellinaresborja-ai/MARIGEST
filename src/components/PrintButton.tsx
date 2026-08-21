"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function PrintButton() {
  return (
    <Button 
      className="bg-rose-900 hover:bg-rose-800 text-white shadow-lg" 
      onClick={() => window.print()}
    >
      <Download className="w-5 h-5 mr-2"/> DESCARGAR FACTURA
    </Button>
  );
}
