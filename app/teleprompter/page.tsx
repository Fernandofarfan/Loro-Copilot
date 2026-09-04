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
  edgeCases?: string[];
  whyNot?: string;
  dryRun?: string;
  matchedStory?: {
    storyIndex: number;
    title: string;
    action: string;
    result: string;
    score: number;
  } | null;
  firmnessAlert?: {
    isChallenge: boolean;
    tip?: string;
  } | null;
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
    typeof d.alert === "string" ||
    Array.isArray(d.edgeCases) ||
    typeof d.whyNot === "string" ||
    typeof d.dryRun === "string" ||
    (typeof d.matchedStory === "object" && d.matchedStory !== null) ||
    (typeof d.firmnessAlert === "object" && d.firmnessAlert !== null)
  );
}

// Formateador de Lectura Biónica (Bionic Reading)
// Formateador de Lectura Biónica con Karaoke Speech Pacer
function renderBionicText(text: string, pacerWordIdx: number = -1, pacerEnabled: boolean = false): React.ReactNode {
  if (!text) return null;
  const lines = text.split("\n");
  let globalWordCount = 0;

  return lines.map((line, lIdx) => {
    const words = line.split(" ");
    return (
      <React.Fragment key={lIdx}>
        {words.map((word, wIdx) => {
          if (!word) return <span key={wIdx}> </span>;
          const wordIdx = globalWordCount++;
          const isPaced = pacerEnabled && wordIdx === pacerWordIdx;
          const isPast = pacerEnabled && wordIdx < pacerWordIdx;
          const mid = Math.ceil(word.length / 2);
          const boldPart = word.slice(0, mid);
          const restPart = word.slice(mid);
          return (
            <span
              key={wIdx}
              className={`transition-all duration-150 ${
                isPaced
                  ? "bg-amber-400/30 text-amber-200 font-black rounded px-1 border-b-2 border-amber-400 shadow-sm"
                  : isPast
                  ? "opacity-80"
                  : ""
              }`}
            >
              <strong className={isPaced ? "text-amber-200 font-black" : "text-white font-black"}>{boldPart}</strong>
              <span className={isPaced ? "text-amber-100 font-bold" : "text-zinc-300 font-normal"}>{restPart}</span>{" "}
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
  const [karaokePacer, setKaraokePacer] = useState(false);
  const [pacerWpm] = useState(135);
  const [pacerWordIdx, setPacerWordIdx] = useState(0);
  const [isPanicHidden, setIsPanicHidden] = useState(false);
  const [opacity, setOpacity] = useState(1);
  const [hasPip, setHasPip] = useState(false);
  const [showNumbersSheet, setShowNumbersSheet] = useState(false);
  const [silenceBridgeVisible, setSilenceBridgeVisible] = useState(false);
  const [camouMode, setCamouMode] = useState<"normal" | "ide" | "terminal">("normal");

  useEffect(() => {
    if (typeof window !== "undefined" && "documentPictureInPicture" in window) {
      setHasPip(true);
    }
  }, []);

  // Detector de Silencio Incómodo (>3.5s sin respuesta)
  useEffect(() => {
    setSilenceBridgeVisible(false);
    if (!data.question || data.isGenerating || data.question.startsWith("Esperando")) {
      return;
    }

    const timer = setTimeout(() => {
      setSilenceBridgeVisible(true);
    }, 3500);

    return () => clearTimeout(timer);
  }, [data.question, data.isGenerating]);

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

    // Atajo de pánico en teclado: Escape para ocultar / mostrar y cerrar alertas de silencio
    const handleKeyDown = (e: KeyboardEvent) => {
      setSilenceBridgeVisible(false);
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

  // Efecto de avance automático del Karaoke Speech Pacer
  useEffect(() => {
    if (!karaokePacer || data.isGenerating || !mainText) {
      setPacerWordIdx(0);
      return;
    }
    const totalWords = mainText.trim().split(/\s+/).length;
    const intervalMs = Math.round((60 / pacerWpm) * 1000);
    const timer = setInterval(() => {
      setPacerWordIdx((curr) => {
        if (curr >= totalWords - 1) {
          clearInterval(timer);
          return curr;
        }
        return curr + 1;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [karaokePacer, data.isGenerating, mainText, pacerWpm]);

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
      className={`min-h-screen bg-[#09090b] text-[#f4f4f5] p-3 select-text font-sans antialiased transition-all duration-150 ${
        data.alert ? "ring-2 ring-amber-500/80 shadow-[0_0_25px_rgba(245,158,11,0.35)] animate-pulse" : ""
      }`}
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

      {/* Frase Puente de Rescate ante Silencio Incómodo (>3.5s) */}
      {silenceBridgeVisible && (
        <section
          onClick={() => setSilenceBridgeVisible(false)}
          className="mb-2.5 p-2 rounded-lg bg-emerald-950/90 border border-emerald-400 text-emerald-100 text-[0.88em] shadow-[0_0_20px_rgba(16,185,129,0.35)] animate-pulse cursor-pointer transition-all"
          title="Hacé clic o hablá para descartar"
        >
          <div className="flex justify-between items-center text-[10px] text-emerald-300 font-bold uppercase mb-0.5">
            <span>⏳ Ganá Tiempo con Elegancia (Frase Puente)</span>
            <span className="text-[9px] opacity-75">✕ descartar</span>
          </div>
          <p className="font-semibold text-white">
            &quot;Ese es un punto clave de arquitectura; déjame estructurar cómo atacaría esa decisión...&quot;
          </p>
        </section>
      )}

      {/* Cheat Sheet Flotante de Números de System Design (Jeff Dean) */}
      {showNumbersSheet && (
        <section className="mb-2.5 p-2.5 rounded-lg bg-zinc-950/95 border border-sky-500/50 text-[11px] font-mono shadow-2xl backdrop-blur">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5 mb-1.5">
            <span className="font-bold text-sky-400">🔢 Números Universales de System Design</span>
            <button
              type="button"
              onClick={() => setShowNumbersSheet(false)}
              className="text-zinc-500 hover:text-zinc-300 text-xs px-1"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-zinc-300 text-[10px]">
            <div>RAM read: <strong className="text-amber-300">100 ns</strong></div>
            <div>L1 / L2 cache: <strong className="text-amber-300">0.5 - 7 ns</strong></div>
            <div>SSD NVMe seq: <strong className="text-emerald-300">1-3 GB/s (100µs)</strong></div>
            <div>Datacenter RTT: <strong className="text-emerald-300">0.5 ms</strong></div>
            <div>Ping transatlántico: <strong className="text-red-300">~150 ms</strong></div>
            <div>1M req/día: <strong className="text-sky-300">~12 QPS (50 peak)</strong></div>
            <div>100M req/día: <strong className="text-sky-300">~1,200 QPS</strong></div>
            <div>1M x 1KB/día: <strong className="text-purple-300">1GB/d (365GB/a)</strong></div>
          </div>
        </section>
      )}

      {/* Modos Camuflaje IDE / Terminal vs HUD Normal */}
      {camouMode === "ide" ? (
        <div className="font-mono text-[12px] bg-[#1e1e1e] text-[#d4d4d4] rounded-lg border border-[#333] overflow-hidden shadow-2xl mb-12">
          <div className="bg-[#252526] border-b border-[#333] flex items-center justify-between px-3 py-1.5 select-none">
            <div className="flex items-center gap-2">
              <span className="bg-[#1e1e1e] text-[#e0e0e0] px-3 py-1 rounded-t border-t-2 border-emerald-400 text-[11px] flex items-center gap-1.5 font-medium">
                <span className="text-sky-400">TS</span> solution.ts {data.isGenerating && <span className="text-amber-400 text-[9px]">●</span>}
              </span>
              <span className="text-[#888] px-2 py-1 text-[11px]">test.spec.ts</span>
            </div>
            <div className="text-[10px] text-[#777]">TypeScript · UTF-8 · Prettier</div>
          </div>
          <div className="p-3 flex gap-3 leading-relaxed">
            <div className="text-[#555] select-none text-right font-mono text-[11px] pr-2 border-r border-[#333]">
              {Array.from({ length: 22 }).map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            <div className="flex-1 overflow-x-auto space-y-1">
              <div className="text-[#6a9955]">{"// ----------------------------------------------------"}</div>
              <div className="text-[#6a9955]">{"// TASK: "} {data.question || "Awaiting task..."}</div>
              {data.firmnessAlert?.isChallenge && (
                <div className="text-[#f43f5e] font-bold">{"// [BACKBONE_DEFENSE]: "} {data.firmnessAlert.tip}</div>
              )}
              {data.matchedStory && (
                <div className="text-[#e5c07b]">{"// [STAR_STORY]: "} #{data.matchedStory.storyIndex + 1} {data.matchedStory.title} &gt;&gt; {data.matchedStory.action}</div>
              )}
              <div className="text-[#6a9955]">{"// ----------------------------------------------------"}</div>
              <div className="text-[#569cd6]">export function <span className="text-[#dcdcaa]">executeStrategy</span>(): <span className="text-[#4ec9b0]">Resolution</span> &#123;</div>
              <div className="pl-4 text-[#9cdcfe]">{"/*"}</div>
              <div className="pl-6 text-[#ce9178] font-sans font-medium text-[13px] leading-relaxed text-zinc-100 whitespace-pre-wrap">
                {mainText || "// Waiting for speech input..."}
              </div>
              <div className="pl-4 text-[#9cdcfe]">{"*/"}</div>
              {data.dryRun && (
                <>
                  <div className="pl-4 text-[#6a9955]">{"// [DRY_RUN_TRACE]:"}</div>
                  <div className="pl-6 text-[#9cdcfe] text-[11px] whitespace-pre-wrap">{data.dryRun}</div>
                </>
              )}
              <div className="pl-4 text-[#c586c0]">return &#123; status: <span className="text-[#ce9178]">&quot;OPTIMAL&quot;</span> &#125;;</div>
              <div className="text-[#569cd6]">&#125;</div>
            </div>
          </div>
        </div>
      ) : camouMode === "terminal" ? (
        <div className="font-mono text-[12px] bg-[#0c1017] text-[#58a6ff] rounded-lg border border-zinc-800 overflow-hidden shadow-2xl p-3 mb-12">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2 mb-2 select-none text-[11px] text-zinc-500">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block" />
              <span className="text-zinc-400 pl-2">bash - dev@prod-cluster-01: ~/services/interview-engine</span>
            </div>
            <span>zsh 5.9</span>
          </div>
          <div className="text-emerald-400 text-[11px] mb-2">
            dev@workstation:~$ <span className="text-white">tail -f /var/log/interview_eval.log --follow</span>
          </div>
          <div className="space-y-1.5 text-zinc-300 leading-relaxed">
            <div className="text-zinc-500">[INFO] - Socket connected to Nova-2 pipeline.</div>
            <div className="text-sky-400 font-semibold">
              [INPUT] - RECV_PROMPT: &quot;{data.question}&quot;
            </div>
            {data.firmnessAlert?.isChallenge && (
              <div className="text-rose-400 font-bold bg-rose-950/30 p-1.5 rounded border border-rose-800/50">
                [WARN] [HAVE_BACKBONE_TEST]: {data.firmnessAlert.tip}
              </div>
            )}
            {data.matchedStory && (
              <div className="text-amber-300 bg-amber-950/30 p-1.5 rounded border border-amber-800/50">
                [STAR] [AUTO_MATCH]: Story #{data.matchedStory.storyIndex + 1} - &quot;{data.matchedStory.title}&quot; | {data.matchedStory.action}
              </div>
            )}
            <div className="text-emerald-300 bg-black/40 p-2.5 rounded border border-zinc-800/80 whitespace-pre-wrap font-sans text-[13px] text-zinc-100">
              <span className="text-zinc-500 font-mono text-[11px] block mb-1">[STREAM_OUTPUT_PAYLOAD]:</span>
              {mainText || "(Listening for audio stream...)"}
            </div>
            {data.dryRun && (
              <div className="text-cyan-300 bg-black/60 p-2 rounded border border-cyan-900/40 text-[11px] whitespace-pre-wrap font-mono">
                [DRY_RUN_TRACE]:
                {data.dryRun}
              </div>
            )}
            {data.isGenerating && (
              <div className="text-amber-400 text-[11px] animate-pulse">
                [RUNNING] Streaming next tokens...
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Sugeridor Automático de Historias STAR (Auto-Match Heurístico) */}
          {data.matchedStory && (
            <section className="mb-2.5 p-2.5 rounded-lg bg-amber-950/80 border-2 border-amber-400 text-amber-100 text-xs shadow-lg animate-fadeIn">
              <div className="flex items-center justify-between font-bold text-amber-300 text-[11px] mb-1">
                <span className="flex items-center gap-1.5">
                  <span>🎯</span> USÁ TU HISTORIA #{data.matchedStory.storyIndex + 1}: &quot;{data.matchedStory.title}&quot;
                </span>
                <span className="bg-amber-500 text-black px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase">
                  Auto-Match STAR
                </span>
              </div>
              <div className="text-[11px] text-amber-200/90 leading-relaxed">
                <div><strong className="text-white">Acción Técnica:</strong> {data.matchedStory.action}</div>
                {data.matchedStory.result && (
                  <div className="mt-0.5"><strong className="text-emerald-300">Resultado Cuantitativo:</strong> {data.matchedStory.result}</div>
                )}
              </div>
            </section>
          )}

          {/* Detector de "Pruebas de Seguridad / Desafíos de Firmeza" (Have Backbone) */}
          {data.firmnessAlert && data.firmnessAlert.isChallenge && (
            <section className="mb-2.5 p-2.5 rounded-lg bg-rose-950/90 border-2 border-rose-500 text-rose-100 text-xs shadow-[0_0_20px_rgba(244,63,94,0.3)] animate-fadeIn">
              <div className="flex items-center gap-1.5 font-bold text-rose-300 text-[11px] mb-0.5">
                <span>🛡️</span> TEST DE FIRMEZA DETECTADO (Have Backbone):
              </div>
              <p className="text-[11px] text-rose-200 font-medium leading-relaxed">
                {data.firmnessAlert.tip}
              </p>
            </section>
          )}

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

          {/* Casos Borde a Clarificar antes de Codear */}
          {data.edgeCases && data.edgeCases.length > 0 && (
            <section className="mb-2.5">
              <div className="text-amber-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                🎯 Casos Borde a Mencionar (Clarificar antes de codear)
              </div>
              <div className="bg-amber-950/30 border border-amber-500/40 rounded-lg p-2 text-amber-200 text-[0.85em] flex flex-col gap-1">
                {data.edgeCases.map((ec, idx) => (
                  <div key={idx} className="flex items-start gap-1.5">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{ec}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Matriz de Trade-offs: Why NOT X? */}
          {data.whyNot && (
            <section className="mb-2.5">
              <div className="text-indigo-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                ⚖️ Why NOT X? (Alternativa Descartada)
              </div>
              <div className="bg-indigo-950/30 border border-indigo-500/40 rounded-lg p-2 text-indigo-200 text-[0.85em]">
                {data.whyNot}
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
                  renderBionicText(mainText, pacerWordIdx, karaokePacer)
                ) : (
                  <span className="text-zinc-100 font-semibold">{mainText}</span>
                )
              ) : (
                <span className="text-zinc-500 italic">(Las sugerencias aparecerán acá...)</span>
              )}
            </div>
          </section>

          {/* Dry-Run Stepper para Live Coding (Trazado Paso a Paso de Estados) */}
          {data.dryRun && (
            <section className="mb-2.5">
              <div className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">
                🔍 Dry-Run Stepper (Trazado Paso a Paso de Estados)
              </div>
              <div className="bg-black/60 p-2 rounded-lg border border-emerald-500/40 text-emerald-200 font-mono text-[11px] whitespace-pre-wrap leading-relaxed">
                {data.dryRun}
              </div>
            </section>
          )}

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
        </>
      )}

      {/* Barra de control inferior fija */}
      <footer className="fixed bottom-2 right-2 flex items-center gap-1.5 bg-zinc-900/90 backdrop-blur border border-zinc-800 p-1 rounded-lg shadow-lg">
        <button
          type="button"
          onClick={() =>
            setCamouMode((curr) =>
              curr === "normal" ? "ide" : curr === "ide" ? "terminal" : "normal"
            )
          }
          className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors ${
            camouMode !== "normal"
              ? "bg-purple-950 text-purple-300 border border-purple-500/50"
              : "bg-zinc-800 text-zinc-400"
          }`}
          title="Modo Camuflaje para compartir pantalla o llamadas presenciales"
        >
          🎭 {camouMode === "normal" ? "Camuflaje" : camouMode === "ide" ? "IDE (VS Code)" : "Terminal"}
        </button>

        <button
          type="button"
          onClick={() => setShowNumbersSheet((s) => !s)}
          className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors ${
            showNumbersSheet ? "bg-sky-950 text-sky-300 border border-sky-600/50" : "bg-zinc-800 text-zinc-400"
          }`}
          title="Cheat Sheet de Números Universales de System Design (Jeff Dean)"
        >
          {showNumbersSheet ? "🔢 Ocultar" : "🔢 Números"}
        </button>

        <button
          type="button"
          onClick={() => setKaraokePacer((k) => !k)}
          className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors ${
            karaokePacer ? "bg-emerald-950 text-emerald-300 border border-emerald-700/50" : "bg-zinc-800 text-zinc-400"
          }`}
          title="Karaoke Speech Pacer: Guía tu ritmo de habla humano a ~135 WPM"
        >
          {karaokePacer ? "🎤 Pacer ON" : "🎤 Pacer OFF"}
        </button>

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
