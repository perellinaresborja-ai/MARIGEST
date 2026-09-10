"use client";

import { useState } from "react";
import { login } from "@/app/actions/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Delete } from "lucide-react";

export default function LoginPage() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submitPin(pinValue: string) {
    if (!pinValue || pinValue.length < 4) {
      setError("Introduce los 4 dígitos");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("pin", pinValue);

    try {
      const result = await login(formData);

      if (result.success) {
        window.location.href = "/";
      } else {
        setError(result.error || "PIN incorrecto");
        setPin("");
        setLoading(false);
      }
    } catch (err: any) {
      console.error(err);
      setError("Error interno del servidor. Reintenta.");
      setLoading(false);
    }
  }

  function handleKeyPress(num: string) {
    if (loading) return;
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      setError("");
      if (nextPin.length === 4) {
        submitPin(nextPin);
      }
    }
  }

  function handleDelete() {
    if (loading) return;
    setPin((prev) => prev.slice(0, -1));
    setError("");
  }

  function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    submitPin(pin);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-[340px] shadow-xl border-0 text-center bg-white rounded-2xl">
        <CardHeader className="space-y-1 flex flex-col items-center pt-6 pb-2">
          <img src="/marigest-logo.png" alt="MariGest Logo" className="h-14 w-auto mb-2 object-contain" />
          <CardTitle className="text-xl font-bold text-slate-800">MariGest</CardTitle>
          <p className="text-xs text-slate-500">Introduce tu PIN de 4 dígitos</p>
        </CardHeader>
        <CardContent className="pb-6 px-6">
          <form onSubmit={handleFormSubmit} className="space-y-5">
            {/* Visualización de los 4 dígitos */}
            <div className="flex justify-center items-center gap-3 my-2">
              {[0, 1, 2, 3].map((index) => {
                const filled = pin.length > index;
                return (
                  <div
                    key={index}
                    className={`w-12 h-14 rounded-xl border-2 flex items-center justify-center text-2xl font-bold transition-all ${
                      filled
                        ? "border-brand-900 bg-brand-50 text-brand-900 shadow-sm"
                        : "border-slate-200 bg-slate-50 text-slate-400"
                    }`}
                  >
                    {filled ? "•" : ""}
                  </div>
                );
              })}
            </div>

            {/* Input oculto/accesible para teclados físicos de PC */}
            <input
              id="pin"
              name="pin"
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={pin}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                setPin(val);
                if (val.length === 4) {
                  submitPin(val);
                }
              }}
              className="opacity-0 absolute -z-10 h-0 w-0"
              autoFocus
            />

            {error && (
              <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 py-2 px-3 rounded-lg font-medium">
                {error}
              </div>
            )}

            {/* Teclado numérico táctil en pantalla */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                <button
                  key={num}
                  type="button"
                  disabled={loading}
                  onClick={() => handleKeyPress(num)}
                  className="h-13 text-xl font-semibold bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-800 rounded-xl border border-slate-200 transition-colors shadow-xs flex items-center justify-center select-none"
                >
                  {num}
                </button>
              ))}

              {/* Botón Borrar */}
              <button
                type="button"
                disabled={loading || pin.length === 0}
                onClick={handleDelete}
                className="h-13 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-600 rounded-xl border border-slate-200 transition-colors shadow-xs flex items-center justify-center select-none disabled:opacity-40"
                title="Borrar dígito"
              >
                <Delete className="h-5 w-5" />
              </button>

              {/* Botón 0 */}
              <button
                type="button"
                disabled={loading}
                onClick={() => handleKeyPress("0")}
                className="h-13 text-xl font-semibold bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-800 rounded-xl border border-slate-200 transition-colors shadow-xs flex items-center justify-center select-none"
              >
                0
              </button>

              {/* Botón Limpiar o Entrar */}
              <button
                type="submit"
                disabled={loading || pin.length === 0}
                className="h-13 font-semibold text-xs uppercase bg-brand-900 hover:bg-brand-800 text-white rounded-xl transition-colors shadow-xs flex items-center justify-center select-none disabled:opacity-40"
              >
                {loading ? "..." : "Entrar"}
              </button>
            </div>

            <p className="text-[11px] text-slate-400">
              {loading ? "Comprobando acceso..." : "También puedes teclear en tu ordenador"}
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

