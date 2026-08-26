"use client";

import React, { useState } from "react";
import { CopyIcon, CheckIcon } from "./Icons";

export interface RescuePhrase {
  icon: string;
  label: string;
  en: string;
  pho: string;
}

export const DEFAULT_RESCUE_PHRASES: RescuePhrase[] = [
  {
    icon: "⏳",
    label: "Ganar tiempo",
    en: "That's a great question, let me organize my thoughts for a second.",
    pho: "Dats a greit KUES-chon, let mi OR-ga-nais mai zots for a SE-kond.",
  },
  {
    icon: "🔁",
    label: "Pedir repetición",
    en: "Could you please repeat that last part?",
    pho: "Kud yu plis ri-PIT dat last part?",
  },
  {
    icon: "🎯",
    label: "Clarificar",
    en: "To make sure I understand, are you asking about...?",
    pho: "Tu meik shur ai an-der-STAND, ar yu AS-king a-BAUT...?",
  },
  {
    icon: "🤝",
    label: "Cierre seguro",
    en: "Does that cover what you were looking for?",
    pho: "Das dat KO-ver wat yu wer LUK-ing for?",
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
            <p className="text-[11px] text-zinc-200 font-medium leading-tight line-clamp-2">{phrase.en}</p>
            <p className="text-[10px] text-amber-400/90 font-mono mt-1 tracking-tight truncate">{phrase.pho}</p>
          </button>
        );
      })}
    </div>
  );
}

export default RescuePhrases;
