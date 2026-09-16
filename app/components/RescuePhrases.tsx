"use client";

import React, { useState } from "react";
import { CopyIcon, CheckIcon } from "./Icons";

export interface RescuePhrase {
  icon: string;
  label: string;
  en: string;
  pho?: string;
  es?: string;
}

export const DEFAULT_RESCUE_PHRASES: RescuePhrase[] = [
  {
    icon: "⏳",
    label: "Ganar tiempo",
    en: "That's a great question, let me organize my thoughts for a second.",
    es: "Buena pregunta, déjame ordenar mis ideas un segundo.",
  },
  {
    icon: "🔁",
    label: "Pedir repetición",
    en: "Could you please repeat that last part?",
    es: "¿Podrías repetir esa última parte?",
  },
  {
    icon: "🎯",
    label: "Clarificar",
    en: "To make sure I understand, are you asking about...?",
    es: "Para asegurarme de entender, ¿me estás preguntando sobre...?",
  },
  {
    icon: "🤝",
    label: "Cierre seguro",
    en: "Does that cover what you were looking for?",
    es: "¿Eso cubre lo que estabas buscando saber?",
  },
];

interface RescuePhrasesProps {
  phrases?: RescuePhrase[];
  onSelect?: (phrase: RescuePhrase) => void;
}

export function RescuePhrases({ phrases = DEFAULT_RESCUE_PHRASES, onSelect }: RescuePhrasesProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (phrase: RescuePhrase, index: number) => {
    navigator.clipboard.writeText(phrase.en);
    setCopiedIndex(index);
    onSelect?.(phrase);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div className="flex flex-col gap-1.5 w-full my-1">
      <div className="flex items-center justify-between px-1 text-[11px]">
        <span className="flex items-center gap-1.5 tracking-wider uppercase text-[10px] text-zinc-400 font-mono">
          <span className="text-amber-400">⚡</span>
          <span className="font-semibold text-zinc-300">Frases de Rescate Inmediatas</span>
          <span className="text-zinc-600 hidden sm:inline">•</span>
          <span className="text-zinc-500 lowercase hidden sm:inline">clic para copiar en inglés</span>
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
        {phrases.map((phrase, idx) => {
          const isCopied = copiedIndex === idx;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleCopy(phrase, idx)}
              className={`flex flex-col text-left p-3 rounded-xl border transition-all duration-200 group relative overflow-hidden backdrop-blur-md ${
                isCopied
                  ? "bg-emerald-500/15 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)] scale-[1.01]"
                  : "border-white/[0.07] bg-[#0e121e]/60 hover:bg-[#131929]/80 hover:border-emerald-500/30 hover:shadow-[0_8px_20px_-6px_rgba(16,185,129,0.15)] hover:-translate-y-0.5"
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1.5">
                <span className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                  <span className="text-sm">{phrase.icon}</span>
                  <span className="tracking-tight">{phrase.label}</span>
                </span>
                <span
                  className={`transition-colors duration-150 p-1 rounded-md ${
                    isCopied ? "text-emerald-400 bg-emerald-500/10" : "text-zinc-500 group-hover:text-emerald-400"
                  }`}
                >
                  {isCopied ? <CheckIcon size={12} /> : <CopyIcon size={12} />}
                </span>
              </div>
              <p className="text-[11.5px] text-zinc-100 font-medium leading-snug line-clamp-2">
                "{phrase.en}"
              </p>
              {phrase.es && (
                <p className="text-[10.5px] text-zinc-400 mt-1 italic truncate">{phrase.es}</p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default RescuePhrases;

