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
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full my-2">
      {phrases.map((phrase, idx) => {
        const isCopied = copiedIndex === idx;
        return (
          <button
            key={idx}
            type="button"
            onClick={() => handleCopy(phrase, idx)}
            className="flex flex-col text-left p-2.5 rounded-xl border border-zinc-800/80 bg-zinc-900/60 hover:bg-zinc-850 hover:border-zinc-700/80 hover:shadow-md transition-all group relative overflow-hidden"
          >
            <div className="flex items-center justify-between w-full mb-1">
              <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <span>{phrase.icon}</span>
                <span>{phrase.label}</span>
              </span>
              <span className="text-zinc-500 group-hover:text-emerald-400 transition-colors">
                {isCopied ? <CheckIcon size={12} /> : <CopyIcon size={12} />}
              </span>
            </div>
            <p className="text-[11px] text-zinc-100 font-semibold leading-tight line-clamp-2">{phrase.en}</p>
            {phrase.es && (
              <p className="text-[10px] text-zinc-400 mt-1 italic truncate">{phrase.es}</p>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default RescuePhrases;

