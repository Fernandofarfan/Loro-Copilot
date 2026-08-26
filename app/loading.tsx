import React from "react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6 font-sans">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-3xl shadow-xl shadow-emerald-500/5 animate-pulse">
            🦜
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-zinc-950 animate-ping" />
        </div>
        <div className="text-center space-y-1">
          <div className="text-sm font-bold text-zinc-200">Cargando...</div>
        </div>
      </div>
    </div>
  );
}
