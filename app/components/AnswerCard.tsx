"use client";

import React, { useState, useMemo } from "react";
import { CopyIcon, CheckIcon, ThumbUpIcon, ThumbDownIcon } from "./Icons";
import { MarkdownText } from "./MarkdownText";
import { classifyQuestion, detectTrickQuestion, fmtTime } from "../lib/interviewHelpers";
import { extractAndEvaluateCode } from "../lib/codeEvaluator";

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

export function AnswerCard({
  answer: a,
  isCurrent,
  compactUi,
  copiedId,
  onCopy,
  onFeedback,
  onPlayTTS,
  onSaveToMemory,
  isSavedInMemory = false,
}: AnswerCardProps) {
  const warning = detectTrickQuestion(a.question);
  const cat = classifyQuestion(a.question);
  const [savedLocal, setSavedLocal] = useState(isSavedInMemory);

  const codeEvaluations = useMemo(() => {
    const full = a.text || a.cleanText || "";
    return extractAndEvaluateCode(full);
  }, [a.text, a.cleanText]);

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
                <MarkdownText text={a.enText} />
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
                <MarkdownText text={a.esText} />
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
              <MarkdownText text={a.cleanText || a.text} />
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
}

export default AnswerCard;

