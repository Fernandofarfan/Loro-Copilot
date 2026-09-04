"use client";

import React, { useState, useMemo } from "react";
import { CopyIcon, CheckIcon, ThumbUpIcon, ThumbDownIcon } from "./Icons";
import { MarkdownText } from "./MarkdownText";
import { classifyQuestion, detectTrickQuestion, detectFirmnessChallenge, fmtTime } from "../lib/interviewHelpers";
import { extractAndEvaluateCode } from "../lib/codeEvaluator";
import ArchitectureCanvas from "./ArchitectureCanvas";
import { extractMermaidBlocks } from "../lib/mermaidParser";

export type Feedback = "up" | "down" | null;

export interface AnswerItem {
  id: number;
  question: string;
  text: string;
  esText: string;
  enText: string;
  phoText?: string;
  done: boolean;
  ts: number;
  feedback: Feedback;
  bilingual: boolean;
  cheats: string[];
  alert: string;
  snippet: string;
  cleanText: string;
  latencyMs?: number;
  modelName?: string;
  fromMemory?: boolean;
  edgeCases?: string[];
  whyNot?: string;
  dryRun?: string;
  firmnessTip?: string;
}

interface AnswerCardProps {
  answer: AnswerItem;
  isCurrent?: boolean;
  compactUi?: boolean;
  copiedId: number | null;
  onCopy: (id: number, text: string) => void;
  onFeedback: (id: number, fb: "up" | "down") => void;
  onPlayTTS: (text: string) => void;
  onSaveToMemory?: (answer: AnswerItem) => void;
  isSavedInMemory?: boolean;
}

export const AnswerCard = React.memo(function AnswerCard({
  answer: a,
  isCurrent = false,
  compactUi = false,
  copiedId,
  onCopy,
  onFeedback,
  onPlayTTS,
  onSaveToMemory,
  isSavedInMemory = false,
}: AnswerCardProps) {
  const warning = detectTrickQuestion(a.question);
  const firmness = useMemo(() => detectFirmnessChallenge(a.question), [a.question]);
  const cat = classifyQuestion(a.question);
  const [savedLocal, setSavedLocal] = useState(isSavedInMemory);

  // Fast-Transpiler Multilenguaje State
  const [transpiledCode, setTranspiledCode] = useState<{ [lang: string]: string }>({});
  const [currentLang, setCurrentLang] = useState<string>("original");
  const [isTranspiling, setIsTranspiling] = useState(false);

  // Solo calcular evaluaciones de código y mermaid cuando la respuesta está completa
  // para evitar parseos costosos en cada tick de streaming (50ms)
  const codeEvaluations = useMemo(() => {
    if (!a.done) return [];
    const full = a.text || a.cleanText || "";
    return extractAndEvaluateCode(full);
  }, [a.done, a.text, a.cleanText]);

  const mermaidBlocks = useMemo(() => {
    if (!a.done) return [];
    const full = a.text || a.cleanText || "";
    return extractMermaidBlocks(full);
  }, [a.done, a.text, a.cleanText]);

  const handleTranspile = async (targetLang: string) => {
    if (targetLang === "original") {
      setCurrentLang("original");
      return;
    }
    if (transpiledCode[targetLang]) {
      setCurrentLang(targetLang);
      return;
    }
    const sourceCode = codeEvaluations[0]?.code || a.snippet || "";
    if (!sourceCode) return;
    setIsTranspiling(true);
    setCurrentLang(targetLang);
    try {
      const res = await fetch("/api/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "transpile", code: sourceCode, targetLang }),
      });
      if (res.ok && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let acc = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          setTranspiledCode((prev) => ({ ...prev, [targetLang]: acc }));
        }
      }
    } catch (e) {
      console.warn("Error transpilando código:", e);
    } finally {
      setIsTranspiling(false);
    }
  };

  const handleSaveMemory = () => {
    setSavedLocal(true);
    onSaveToMemory?.(a);
  };

  return (
    <div
      className={`answer-card ${isCurrent ? "answer-card-current" : ""}`}
      style={{ padding: compactUi ? "10px" : undefined }}
    >
      {a.text && (
        <div className="card-actions flex items-center gap-1.5">
          {onSaveToMemory && (
            <button
              className={`card-btn ${savedLocal ? "text-amber-400 border-amber-500/40 bg-amber-500/10" : ""}`}
              onClick={handleSaveMemory}
              aria-label="Guardar en Memoria"
              title={savedLocal ? "Guardada en el Banco de Memoria" : "Guardar en Banco de Memoria para futuras entrevistas"}
            >
              {savedLocal ? "⭐ Guardada" : "⭐ Guardar"}
            </button>
          )}
          <button
            className={`card-btn flex items-center gap-1 ${copiedId === a.id ? "card-btn-done text-emerald-400" : ""}`}
            onClick={() => onCopy(a.id, a.bilingual ? a.enText || a.text : a.text)}
            aria-label="Copiar respuesta"
            title="Copiar respuesta"
          >
            {copiedId === a.id ? (
              <>
                <CheckIcon size={14} />
                <span className="text-[11px] font-bold text-emerald-400">Copiado</span>
              </>
            ) : (
              <CopyIcon size={14} />
            )}
          </button>
        </div>
      )}

      {/* Fila de Pregunta y Categoría */}
      <div className="answer-card-q-row flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="answer-card-label answer-card-label-q">💬 Pregunta</span>
            {a.fromMemory && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-700/50 flex items-center gap-1">
                ⚡ Memoria Instantánea
              </span>
            )}
          </div>
          <span className="answer-card-question block font-medium mt-0.5">{a.question}</span>
        </div>
        <span
          className="mono text-[0.75em] px-2 py-0.5 rounded-full whitespace-nowrap border self-start"
          style={{ background: "rgba(255,255,255,0.06)", borderColor: cat.color, color: cat.color }}
        >
          {cat.label}
        </span>
      </div>

      {/* Alerta de Pregunta Trampa / Delicada */}
      {warning && (
        <div className="bg-amber-500/10 text-amber-500 p-2 rounded-lg text-[0.85em] mt-2 border border-amber-500/30">
          <strong>{warning}</strong>
        </div>
      )}

      {/* Test de Firmeza / Have Backbone Challenge */}
      {(firmness.isChallenge || a.firmnessTip) && (
        <div className="bg-amber-950/40 text-amber-200 p-2.5 rounded-lg text-xs mt-2 border-2 border-amber-500/50 shadow-md">
          <div className="flex items-center gap-1.5 font-bold text-amber-400 mb-1">
            <span>🛡️</span> TEST DE FIRMEZA DETECTADO (Have Backbone)
          </div>
          <p className="leading-relaxed text-[11.5px]">
            {a.firmnessTip || firmness.tip}
          </p>
        </div>
      )}

      {/* Banner de Alerta del Modelo */}
      {a.alert && (
        <div className="alert-banner bg-red-500/10 text-red-500 p-2.5 rounded-lg text-[0.9em] mt-2 border border-red-500/20">
          <strong>⚠️ {a.alert}</strong>
        </div>
      )}

      {/* Cheats / Puntos Clave */}
      {a.cheats && a.cheats.length > 0 && (
        <div className="cheats-container flex flex-wrap gap-2 mt-2">
          {a.cheats.map((c, i) => (
            <button
              key={i}
              className="cheat-btn text-[0.85em] px-2.5 py-1 rounded-full cursor-pointer hover:bg-zinc-800 transition-colors"
              style={{ background: "var(--bg)", border: "1px solid var(--line-strong)", color: "var(--text)" }}
              onClick={() => onCopy(a.id, c)}
            >
              ⚡ {c}
            </button>
          ))}
        </div>
      )}

      {/* Snippet de Código */}
      {a.snippet && (
        <div className="snippet-container bg-zinc-950 text-zinc-300 p-3 rounded-lg mt-2 font-mono text-[0.85em] whitespace-pre-wrap overflow-x-auto relative border border-zinc-800">
          <button
            className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded text-[0.8em] transition-colors"
            onClick={() => onCopy(a.id, a.snippet)}
          >
            Copiar
          </button>
          {a.snippet}
        </div>
      )}

      {/* Fast-Transpiler Multilenguaje Toolbar */}
      {(codeEvaluations.length > 0 || a.snippet) && (
        <div className="flex items-center justify-between flex-wrap gap-1.5 mt-2.5 p-1.5 rounded-lg bg-zinc-900/90 border border-zinc-800">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium pl-1">
            <span>🔀</span> <span className="hidden sm:inline">Transpilar:</span>
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            {[
              { id: "original", label: "Original" },
              { id: "go", label: "Go" },
              { id: "python", label: "Python" },
              { id: "typescript", label: "TS" },
              { id: "java", label: "Java" },
              { id: "cpp", label: "C++" },
            ].map((lang) => (
              <button
                key={lang.id}
                type="button"
                onClick={() => handleTranspile(lang.id)}
                disabled={isTranspiling && currentLang !== lang.id}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                  currentLang === lang.id
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 font-bold"
                    : "bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/50"
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Código Transpilado a Otro Lenguaje */}
      {currentLang !== "original" && (
        <div className="snippet-container bg-zinc-950 text-emerald-200 p-3 rounded-lg mt-2 font-mono text-[0.85em] whitespace-pre-wrap overflow-x-auto relative border border-emerald-700/50">
          <div className="flex justify-between items-center mb-2 pb-1 border-b border-zinc-800 text-[11px] text-zinc-400">
            <span className="font-semibold text-emerald-400 flex items-center gap-1">
              <span>🔀</span> Código en {currentLang.toUpperCase()} {isTranspiling && "(generando...)"}
            </span>
            <button
              type="button"
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-2 py-0.5 rounded text-[10px] transition-colors"
              onClick={() => onCopy(a.id, transpiledCode[currentLang] || "")}
            >
              Copiar {currentLang.toUpperCase()}
            </button>
          </div>
          {transpiledCode[currentLang] ? (
            <code>{transpiledCode[currentLang]}</code>
          ) : (
            <span className="text-zinc-500 italic">Transpilando sintaxis a {currentLang}...</span>
          )}
        </div>
      )}

      {/* Dry-Run Stepper: Trazado Paso a Paso de Estados para Live Coding */}
      {a.dryRun && (
        <div className="my-2.5 p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/40 text-xs">
          <div className="font-bold text-emerald-400 flex items-center justify-between mb-1.5">
            <span className="flex items-center gap-1.5">
              <span>🔍</span> Dry-Run Stepper (Trazado Paso a Paso de Estados):
            </span>
            <button
              type="button"
              onClick={() => onCopy(a.id, a.dryRun || "")}
              className="text-[10px] text-zinc-400 hover:text-emerald-300 bg-zinc-900/60 px-2 py-0.5 rounded border border-zinc-800"
            >
              Copiar Traza
            </button>
          </div>
          <div className="font-mono text-[11px] bg-black/50 p-2 rounded border border-emerald-900/40 whitespace-pre-wrap text-emerald-200/90 leading-relaxed overflow-x-auto">
            {a.dryRun}
          </div>
        </div>
      )}

      {/* Validación de Código y Complejidad en Vivo */}
      {codeEvaluations.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-2">
          {codeEvaluations.map((ev, i) => (
            <div
              key={i}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono flex items-center gap-1.5 border ${
                ev.isValid
                  ? "bg-emerald-950/70 text-emerald-300 border-emerald-600/50"
                  : "bg-red-950/70 text-red-300 border-red-600/50"
              }`}
              title={ev.error || "Sintaxis válida"}
            >
              <span>{ev.isValid ? "✓ Código verificado" : `⚠️ ${ev.error}`}</span>
              <span className="text-zinc-400 font-sans font-medium">({ev.language}, {ev.lineCount} lin)</span>
              {ev.complexity?.time && (
                <span className="text-amber-300 font-bold bg-amber-950/90 border border-amber-600/40 px-1.5 py-0.2 rounded">
                  {ev.complexity.time}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Canvas de Arquitectura System Design (Mermaid) */}
      {mermaidBlocks.map((mCode, idx) => (
        <ArchitectureCanvas key={`arch_${idx}`} mermaidCode={mCode} />
      ))}

      {/* Casos Borde a Clarificar antes de Codear */}
      {a.edgeCases && a.edgeCases.length > 0 && (
        <div className="my-2 p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-xs">
          <div className="font-bold text-amber-400 flex items-center gap-1.5 mb-1">
            <span>🎯</span> Casos Borde a Clarificar antes de Codear:
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-amber-200/90 text-[11px]">
            {a.edgeCases.map((ec, idx) => (
              <li key={idx}>{ec}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Matriz de Trade-offs: Why NOT X? */}
      {a.whyNot && (
        <div className="my-2 p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-xs">
          <div className="font-bold text-indigo-400 flex items-center gap-1.5 mb-0.5">
            <span>⚖️</span> Why NOT X? (Alternativa Descartada):
          </div>
          <p className="text-indigo-200/90 text-[11px] leading-relaxed">
            {a.whyNot}
          </p>
        </div>
      )}

      {/* Contenido Principal (Bilingüe orden EN -> PHO -> ES vs Estándar) */}
      {a.bilingual ? (
        <div className="flex flex-col gap-2.5 mt-2.5">
          {/* 1. Respuesta en Inglés */}
          <div className="bg-emerald-500/5 border-2 border-emerald-500/30 rounded-xl p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase flex items-center gap-1.5">
                ⭐ 1. Lo que decís en la llamada (Inglés)
              </span>
              {a.enText && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onPlayTTS(a.enText)}
                    className="tts-button bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold px-2.5 py-0.5 text-xs rounded-md flex items-center gap-1 hover:bg-emerald-500/25 transition-colors"
                    title="Escuchar cómo suena"
                  >
                    🔊 Escuchar
                  </button>
                  <button
                    onClick={() => onCopy(a.id, a.enText)}
                    className="border border-zinc-700/50 bg-zinc-800/80 text-zinc-200 px-2 py-0.5 text-xs rounded-md hover:bg-zinc-700 transition-colors flex items-center gap-1"
                    title="Copiar texto en inglés"
                  >
                    {copiedId === a.id ? (
                      <>
                        <CheckIcon size={12} />
                        <span className="text-[10px] text-emerald-400 font-bold">Copiado</span>
                      </>
                    ) : (
                      <span>📋</span>
                    )}
                  </button>
                </div>
              )}
            </div>
            <div
              className="answer-card-text font-semibold text-[1.08em] leading-relaxed"
              style={{ color: "var(--ink)" }}
            >
              {a.enText ? (
                a.done ? <MarkdownText text={a.enText} /> : <span className="whitespace-pre-wrap">{a.enText}</span>
              ) : (
                <span className="mono answer-card-loading">generando respuesta en inglés…</span>
              )}
            </div>
          </div>

          {/* Guía fonética si está presente */}
          {a.phoText && (
            <div className="bg-amber-950/20 border border-amber-800/40 rounded-lg p-2.5">
              <div className="text-amber-400 text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                🗣️ Guía Fonética (Pronunciación Rápida)
              </div>
              <div className="text-amber-300 font-mono text-[0.88em]">
                {a.phoText}
              </div>
            </div>
          )}

          {/* 2. Resumen en Español */}
          <div
            className="rounded-lg p-2.5 border"
            style={{ background: "var(--bg)", borderColor: "var(--line-strong)" }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span
                className="text-[11px] font-bold tracking-wider uppercase"
                style={{ color: "var(--loro-green-bright)" }}
              >
                🇦🇷 2. Idea Clave (Español)
              </span>
            </div>
            <div className="answer-card-text text-[0.95em] leading-relaxed" style={{ color: "var(--ink-dim)" }}>
              {a.esText ? (
                a.done ? <MarkdownText text={a.esText} /> : <span className="whitespace-pre-wrap">{a.esText}</span>
              ) : (
                <span className="mono answer-card-loading">generando resumen en español…</span>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="answer-card-a-row mt-2">
          <span className="answer-card-label answer-card-label-a">⭐ Respuesta</span>
          <div className="answer-card-text text-[1.05em] font-medium" style={{ color: "var(--ink)" }}>
            {a.text ? (
              a.done ? <MarkdownText text={a.cleanText || a.text} /> : <span className="whitespace-pre-wrap">{a.cleanText || a.text}</span>
            ) : (
              <span className="mono answer-card-loading">generando…</span>
            )}
          </div>
        </div>
      )}

      {/* Footer de Tarjeta con Latencia y Feedback */}
      {a.text && (
        <div className="answer-footer flex justify-between items-center mt-3 pt-2 border-t border-zinc-800/40">
          <span className="answer-footer-meta mono text-[11px] text-zinc-500">
            Respuesta · {fmtTime(a.ts)} {a.latencyMs ? `· ⚡ ${a.latencyMs}ms (${a.modelName || "IA"})` : ""}
          </span>
          <div className="fb-btns flex gap-1">
            <button
              className={`fb-btn ${a.feedback === "up" ? "fb-up" : ""}`}
              onClick={() => onFeedback(a.id, "up")}
              aria-label="Respuesta útil"
            >
              <ThumbUpIcon size={13} />
            </button>
            <button
              className={`fb-btn ${a.feedback === "down" ? "fb-down" : ""}`}
              onClick={() => onFeedback(a.id, "down")}
              aria-label="Respuesta no útil"
            >
              <ThumbDownIcon size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}, (prev, next) => {
  // Comparador personalizado: evitar re-renders innecesarios de tarjetas antiguas
  // durante streaming. Solo re-renderizar si la respuesta misma cambió o si
  // copiedId afecta a esta tarjeta.
  if (prev.answer !== next.answer) return false;
  if (prev.isCurrent !== next.isCurrent) return false;
  if (
    (prev.copiedId === prev.answer.id || next.copiedId === next.answer.id) &&
    prev.copiedId !== next.copiedId
  ) return false;
  return true;
});

export default AnswerCard;

