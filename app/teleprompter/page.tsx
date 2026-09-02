"use client";

import React, { useEffect, useState } from "react";

interface TeleprompterData {
  question?: string;
  enText?: string;
  phoText?: string;
  esText?: string;
  cleanText?: string;
  isGenerating?: boolean;
  modelName?: string;
  fromMemory?: boolean;
}

export default function TeleprompterPage() {
  const [data, setData] = useState<TeleprompterData>({
    question: "Esperando pregunta de la entrevista...",
    enText: "Las respuestas sugeridas aparecerán aquí en vivo.",
    esText: "",
  });
  const [fontSize, setFontSize] = useState(15);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    // 1. Cargar estado inicial desde localStorage
    try {
      const stored = localStorage.getItem("loro_teleprompter_data");
      if (stored) {
        setData(JSON.parse(stored));
      }
    } catch {}

    // 2. Escuchar canal BroadcastChannel
    let bc: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== "undefined") {
      bc = new BroadcastChannel("loro_teleprompter_channel");
      bc.onmessage = (event) => {
        if (event.data) {
          setData(event.data);
        }
      };
    }

    // 3. Fallback con storage event
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "loro_teleprompter_data" && e.newValue) {
        try {
          setData(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      if (bc) bc.close();
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  useEffect(() => {
    if (autoScroll) {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }
  }, [data, autoScroll]);

  const mainText = data.enText || data.cleanText || "";

  return (
    <main
      className="min-h-screen bg-[#09090b] text-[#f4f4f5] p-3 select-text font-sans antialiased"
      style={{ fontSize: `${fontSize}px`, lineHeight: 1.45 }}
    >
      {/* Header flotante */}
      <header className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-xs text-emerald-400">🦜 HUD Stealth</span>
          {data.fromMemory && (
            <span className="text-[10px] text-amber-400 font-bold bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-800/40">
              ⚡ MEMORIA
            </span>
          )}
          <span className="text-[10px] text-zinc-500 hidden sm:inline">(Ubicá esta ventana bajo tu webcam)</span>
        </div>
        <div className="flex items-center gap-2">
          {data.isGenerating && (
            <span className="flex items-center gap-1 text-[10px] text-amber-400 font-bold bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-800/40 animate-pulse">
              ● GENERANDO
            </span>
          )}
          <span className="bg-emerald-500 text-black text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
            EN VIVO
          </span>
        </div>
      </header>

      {/* Pregunta detectada */}
      <section className="mb-2.5">
        <div className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mb-0.5">
          💬 Pregunta del Entrevistador
        </div>
        <div className="text-sky-400 font-semibold text-[0.9em] bg-zinc-900/60 p-2 rounded-lg border border-zinc-800/60">
          {data.question || "(Esperando pregunta...)"}
        </div>
      </section>

      {/* Respuesta principal en inglés */}
      <section className="mb-2.5">
        <div className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-0.5 flex items-center justify-between">
          <span>⭐ Lo que decís (Inglés)</span>
          {data.modelName && <span className="text-zinc-500 text-[9px] font-mono">{data.modelName}</span>}
        </div>
        <div className="text-zinc-100 font-semibold bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-800 whitespace-pre-wrap">
          {mainText || "(Las sugerencias aparecerán acá...)"}
        </div>
      </section>

      {/* Guía fonética si está presente */}
      {data.phoText && (
        <section className="mb-2.5">
          <div className="text-amber-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">
            🗣️ Guía Fonética (Lectura Fluida)
          </div>
          <div className="text-amber-300 font-mono text-[0.88em] bg-amber-950/20 p-2 rounded border border-amber-800/40">
            {data.phoText}
          </div>
        </section>
      )}

      {/* Resumen conceptual en español si está presente */}
      {data.esText && (
        <section className="mb-8">
          <div className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mb-0.5">
            🇦🇷 Sentido en Español
          </div>
          <div className="text-zinc-400 text-[0.88em] bg-zinc-900/20 p-2 rounded border border-zinc-850">
            {data.esText}
          </div>
        </section>
      )}

      {/* Barra de control inferior fija */}
      <footer className="fixed bottom-2 right-2 flex items-center gap-1.5 bg-zinc-900/90 backdrop-blur border border-zinc-800 p-1 rounded-lg shadow-lg">
        <button
          type="button"
          onClick={() => setFontSize((s) => Math.max(11, s - 1))}
          className="px-2 py-0.5 text-[11px] font-bold rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
          title="Reducir tamaño de letra"
        >
          A-
        </button>
        <span className="text-[10px] font-mono text-zinc-500">{fontSize}px</span>
        <button
          type="button"
          onClick={() => setFontSize((s) => Math.min(26, s + 1))}
          className="px-2 py-0.5 text-[11px] font-bold rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
          title="Aumentar tamaño de letra"
        >
          A+
        </button>
        <button
          type="button"
          onClick={() => setAutoScroll((v) => !v)}
          className={`px-2 py-0.5 text-[10px] font-semibold rounded transition-colors ${
            autoScroll ? "bg-emerald-950 text-emerald-400 border border-emerald-800/40" : "bg-zinc-800 text-zinc-400"
          }`}
          title="Alternar auto-scroll"
        >
          {autoScroll ? "Scroll ON" : "Scroll OFF"}
        </button>
      </footer>
    </main>
  );
}
