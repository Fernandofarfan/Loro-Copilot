"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDownIcon } from "./Icons";

export interface DropdownOption<T = string> {
  id: T;
  label: string;
  tag?: string;
  icon?: React.ReactNode;
  description?: string;
}

interface DropdownProps<T = string> {
  options: DropdownOption<T>[];
  value: T;
  onChange: (value: T) => void;
  title?: string;
  className?: string;
}

export function Dropdown<T extends string = string>({
  options,
  value,
  onChange,
  title,
  className = "",
}: DropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.id === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className={`relative inline-block text-left ${className}`}>
      {title && <label className="block text-[11px] font-semibold text-zinc-400 mb-1">{title}</label>}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/90 hover:bg-zinc-800/80 hover:border-zinc-700 text-zinc-200 text-xs font-medium transition-all shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
      >
        <div className="flex items-center gap-2 truncate">
          {selected?.icon}
          <span className="truncate">{selected?.label || String(value)}</span>
          {selected?.tag && (
            <span className="px-1.5 py-0.2 text-[10px] font-bold rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40">
              {selected.tag}
            </span>
          )}
        </div>
        <ChevronDownIcon size={12} />
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-64 max-h-72 overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-900 shadow-xl z-50 py-1 divide-y divide-zinc-800/50">
          {options.map((opt) => {
            const isSelected = opt.id === value;
            return (
              <button
                key={String(opt.id)}
                type="button"
                onClick={() => {
                  onChange(opt.id);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs transition-colors ${
                  isSelected ? "bg-emerald-950/60 text-emerald-300 font-semibold" : "text-zinc-300 hover:bg-zinc-800"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {opt.icon}
                  <span className="truncate">{opt.label}</span>
                </div>
                {opt.tag && (
                  <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-medium">
                    {opt.tag}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Dropdown;
