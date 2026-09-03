"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/app/actions/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    try {
      const result = await login(formData);

      if (result.success) {
        router.push("/");
        router.refresh();
      } else {
        setError(result.error || "PIN incorrecto");
        setLoading(false);
      }
    } catch (err: any) {
      console.error(err);
      setError("Error interno del servidor. Reintenta.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-[320px] shadow-lg border-0 text-center">
        <CardHeader className="space-y-2 flex flex-col items-center pt-8">
          <img src="/marigest-logo.png" alt="MariGest Logo" className="h-16 w-auto mb-4" />
          <CardTitle className="text-xl font-bold text-slate-800">Desbloquear</CardTitle>
          <p className="text-sm text-slate-500">Introduce tu PIN de acceso</p>
        </CardHeader>
        <CardContent className="pb-8 px-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <input
                id="pin"
                name="pin"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                required
                className="w-full px-4 py-4 text-center tracking-[1em] text-3xl font-bold border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-900 bg-slate-100"
                placeholder="••••"
              />
            </div>
            
            {error && (
              <div className="text-sm text-rose-600 bg-rose-50 p-3 rounded-md font-medium">
                {error}
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full bg-rose-900 hover:bg-rose-800 text-white py-6 text-lg rounded-lg"
              disabled={loading}
            >
              {loading ? "Comprobando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

