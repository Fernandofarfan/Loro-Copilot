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
  keyWords?: string[];
  alert?: string;
}

// Valida que el payload tiene la forma TeleprompterData antes de usarlo
function isValidTeleprompterData(data: unknown): data is TeleprompterData {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.question === "string" ||
    typeof d.enText === "string" ||
    typeof d.esText === "string" ||
    typeof d.cleanText === "string" ||
    typeof d.isGenerating === "boolean" ||
    Array.isArray(d.keyWords) ||
    typeof d.alert === "string"
  );
}

// Formateador de Lectura Biónica (Bionic Reading)
function renderBionicText(text: string): React.ReactNode {
  if (!text) return null;
  const lines = text.split("\n");
  return lines.map((line, lIdx) => {
    const words = line.split(" ");
    return (
      <React.Fragment key={lIdx}>
        {words.map((word, wIdx) => {
          if (!word) return <span key={wIdx}> </span>;
          const mid = Math.ceil(word.length / 2);
          const boldPart = word.slice(0, mid);
          const restPart = word.slice(mid);
          return (
            <span key={wIdx}>
              <strong className="text-white font-black">{boldPart}</strong>
              <span className="text-zinc-300 font-normal">{restPart}</span>{" "}
            </span>
          );
        })}
        {lIdx < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
}

export default function TeleprompterPage() {
  const [data, setData] = useState<TeleprompterData>({
    question: "Esperando pregunta de la entrevista...",
    enText: "Las respuestas sugeridas aparecerán aquí en vivo.",
    esText: "",
    keyWords: [],
  });
  const [fontSize, setFontSize] = useState(15);
  const [autoScroll, setAutoScroll] = useState(true);
  const [bionicReading, setBionicReading] = useState(true);
  const [isPanicHidden, setIsPanicHidden] = useState(false);
  const [opacity, setOpacity] = useState(1);
  const [hasPip, setHasPip] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "documentPictureInPicture" in window) {
      setHasPip(true);
    }
  }, []);

  useEffect(() => {
    // 1. Cargar estado inicial desde localStorage
    try {
      const stored = localStorage.getItem("loro_teleprompter_data");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (isValidTeleprompterData(parsed)) {
          setData(parsed);
        }
      }
    } catch {}

    // 2. Escuchar canal BroadcastChannel
    let bc: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== "undefined") {
      bc = new BroadcastChannel("loro_teleprompter_channel");
      bc.onmessage = (event) => {
        if (isValidTeleprompterData(event.data)) {
          setData(event.data);
          setIsPanicHidden(false); // restaurar ante nueva pregunta
        }
      };
    }

    // 3. Fallback con storage event
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "loro_teleprompter_data" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (isValidTeleprompterData(parsed)) {
            setData(parsed);
            setIsPanicHidden(false);
          }
        } catch {}
      }
    };
    window.addEventListener("storage", handleStorage);

    // Atajo de pánico en teclado: Escape para ocultar / mostrar
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsPanicHidden((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      if (bc) bc.close();
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (autoScroll && !isPanicHidden) {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }
  }, [data, autoScroll, isPanicHidden]);

  const mainText = data.enText || data.cleanText || "";

  const openPip = async () => {
    if (typeof window !== "undefined" && "documentPictureInPicture" in window) {
      try {
        const pipWin = await (window as unknown as {
          documentPictureInPicture: {
            requestWindow: (opts: { width: number; height: number }) => Promise<Window>;
          };
        }).documentPictureInPicture.requestWindow({
          width: 560,
          height: 380,
        });

        Array.from(document.styleSheets).forEach((sheet) => {
          try {
            const rules = Array.from(sheet.cssRules)
              .map((r) => r.cssText)
              .join("");
            const style = document.createElement("style");
            style.textContent = rules;
            pipWin.document.head.appendChild(style);
          } catch {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = sheet.href || "";
            pipWin.document.head.appendChild(link);
          }
        });

        const root = document.getElementById("loro-hud-root");
        if (root) {
          pipWin.document.body.className = "bg-[#09090b] text-[#f4f4f5]";
          pipWin.document.body.appendChild(root.cloneNode(true));
        }
      } catch (err) {
        console.warn("Error al abrir PiP:", err);
      }
    }
  };

  if (isPanicHidden) {
    return (
      <main className="min-h-screen bg-[#09090b] text-zinc-600 flex items-center justify-center p-4 font-mono text-xs select-none">
        <span>Pantalla en pausa. Presioná Escape para reanudar.</span>
      </main>
    );
  }

  return (
    <main
      id="loro-hud-root"
      className="min-h-screen bg-[#09090b] text-[#f4f4f5] p-3 select-text font-sans antialiased transition-opacity duration-150"
      style={{ opacity, fontSize: `${fontSize}px`, lineHeight: 1.45 }}
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

      {/* Alerta de Trampa / Red Flag (Stream 2) */}
      {data.alert && (
        <section className="mb-2.5 animate-fadeIn">
          <div className="flex items-start gap-1.5 bg-amber-950/40 border border-amber-500/50 rounded-lg p-2 text-amber-300 text-[0.88em]">
            <span className="text-amber-400 font-bold shrink-0">⚠️ TIP TÁCTICO:</span>
            <span>{data.alert}</span>
          </div>
        </section>
      )}

      {/* Pregunta detectada */}
      <section className="mb-2.5">
        <div className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mb-0.5">
          💬 Pregunta del Entrevistador
        </div>
        <div className="text-sky-400 font-semibold text-[0.9em] bg-zinc-900/60 p-2 rounded-lg border border-zinc-800/60">
          {data.question || "(Esperando pregunta...)"}
        </div>
      </section>

      {/* Palabras Clave Punchline First */}
      {data.keyWords && data.keyWords.length > 0 && (
        <section className="mb-2.5">
          <div className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mb-1">
            ⚡ Punchline Clave (Decilo de entrada)
          </div>
          <div className="flex flex-wrap gap-1.5">
            {data.keyWords.map((kw, i) => (
              <span
                key={i}
                className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-md font-bold text-[0.85em]"
              >
                {kw}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Respuesta principal en inglés */}
      <section className="mb-2.5">
        <div className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-0.5 flex items-center justify-between">
          <span>⭐ Lo que decís (Inglés)</span>
          {data.modelName && <span className="text-zinc-500 text-[9px] font-mono">{data.modelName}</span>}
        </div>
        <div className="bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-800 whitespace-pre-wrap leading-relaxed">
          {mainText ? (
            bionicReading ? (
              renderBionicText(mainText)
            ) : (
              <span className="text-zinc-100 font-semibold">{mainText}</span>
            )
          ) : (
            <span className="text-zinc-500 italic">(Las sugerencias aparecerán acá...)</span>
          )}
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
          onClick={() => setBionicReading((b) => !b)}
          className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors ${
            bionicReading ? "bg-amber-950 text-amber-300 border border-amber-700/50" : "bg-zinc-800 text-zinc-400"
          }`}
          title="Lectura Biónica para leer de un vistazo sin mover los ojos"
        >
          {bionicReading ? "Biónica ON" : "Biónica OFF"}
        </button>

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
        {hasPip && (
          <button
            type="button"
            onClick={openPip}
            className="px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/40 transition-colors"
            title="Abrir en ventana flotante Always-on-Top nativa sobre Meet/Zoom"
          >
            📌 PiP
          </button>
        )}

        <div className="flex items-center gap-1 pl-1 border-l border-zinc-800" title={`Opacidad: ${Math.round(opacity * 100)}%`}>
          <span className="text-[9px] text-zinc-500 font-mono">Op:</span>
          <input
            type="range"
            min="0.3"
            max="1"
            step="0.05"
            value={opacity}
            onChange={(e) => setOpacity(parseFloat(e.target.value))}
            className="w-12 h-1 bg-zinc-700 rounded accent-emerald-400 cursor-pointer"
          />
        </div>

        <button
          type="button"
          onClick={() => setIsPanicHidden(true)}
          className="px-2 py-0.5 text-[10px] font-bold rounded bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800/40 transition-colors"
          title="Ocultar inmediatamente por si compartís pantalla (Escape)"
        >
          Panic
        </button>
      </footer>
    </main>
  );
}
