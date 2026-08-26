"use client";

import React, { useEffect } from "react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App Error Boundary:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-2xl">
          🦜
        </div>
        <h2 className="text-lg font-bold text-zinc-100">Algo no salió como esperábamos</h2>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Ocurrió un error inesperado durante la sesión. Tus datos de empresa, puesto y perfil siguen guardados en tu navegador.
        </p>

        {process.env.NODE_ENV === "development" && (
          <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-left overflow-x-auto text-[11px] font-mono text-red-400">
            {error.message || "Unknown error"}
          </div>
        )}

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            Reintentar
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition-all cursor-pointer"
          >
            Recargar Página
          </button>
        </div>
      </div>
    </div>
  );
}
