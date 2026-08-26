"use client";

import React, { useState } from "react";

interface InfoTipProps {
  content: string | React.ReactNode;
  children?: React.ReactNode;
}

export function InfoTip({ content, children }: InfoTipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <span className="relative inline-flex items-center ml-1 group">
      <button
        type="button"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onClick={() => setVisible((prev) => !prev)}
        className="w-3.5 h-3.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 text-[10px] font-bold inline-flex items-center justify-center cursor-help transition-colors"
        aria-label="Más información"
      >
        {children || "?"}
      </button>

      {visible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-48 p-2 rounded-md bg-zinc-950 text-zinc-300 text-[11px] leading-snug border border-zinc-800 shadow-xl z-50 pointer-events-none transition-all">
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-zinc-950" />
        </div>
      )}
    </span>
  );
}

export default InfoTip;
