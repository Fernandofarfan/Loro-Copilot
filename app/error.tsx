"use client";

import React, { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error Boundary:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-2xl">
          🦜
        </div>
        <h2 className="text-lg font-bold text-zinc-100">Error inesperado en Loro Copilot</h2>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Ha ocurrido un problema al cargar la aplicación.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      </div>
    </div>
  );
}
