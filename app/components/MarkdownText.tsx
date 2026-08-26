"use client";

import React, { useState } from "react";
import { CopyIcon, CheckIcon } from "./Icons";

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="my-2 rounded-lg border border-zinc-700/80 bg-zinc-950 overflow-hidden text-xs">
      <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900 border-b border-zinc-800 text-zinc-400 font-mono text-[11px]">
        <span>{lang || "code"}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-zinc-400 hover:text-emerald-400 transition-colors"
          title="Copiar código"
        >
          {copied ? <CheckIcon size={12} /> : <CopyIcon size={12} />}
          <span>{copied ? "Copiado" : "Copiar"}</span>
        </button>
      </div>
      <pre className="p-3 overflow-x-auto text-zinc-200 font-mono leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// Renderiza texto con negritas, código inline y cursivas
function InlineText({ text }: { text: string }) {
  if (!text) return null;

  // Split por code inline (`...`) primero
  const codeParts = text.split(/(`[^`]+`)/g);

  return (
    <>
      {codeParts.map((codePart, ci) => {
        if (codePart.startsWith("`") && codePart.endsWith("`") && codePart.length > 1) {
          return (
            <code
              key={ci}
              className="px-1.5 py-0.5 rounded bg-zinc-800 text-emerald-400 font-mono text-[0.9em] border border-zinc-700/50"
            >
              {codePart.slice(1, -1)}
            </code>
          );
        }

        // Split por negritas (**...**)
        const boldParts = codePart.split(/(\*\*[^*]+\*\*)/g);
        return (
          <React.Fragment key={ci}>
            {boldParts.map((boldPart, bi) => {
              if (boldPart.startsWith("**") && boldPart.endsWith("**") && boldPart.length > 3) {
                return (
                  <strong key={bi} className="text-emerald-400 font-bold">
                    {boldPart.slice(2, -2)}
                  </strong>
                );
              }

              // Split por cursivas (*...*)
              const italicParts = boldPart.split(/(\*[^*]+\*)/g);
              return (
                <React.Fragment key={bi}>
                  {italicParts.map((italicPart, ii) => {
                    if (italicPart.startsWith("*") && italicPart.endsWith("*") && italicPart.length > 2) {
                      return (
                        <em key={ii} className="text-zinc-300 italic">
                          {italicPart.slice(1, -1)}
                        </em>
                      );
                    }
                    return <span key={ii}>{italicPart}</span>;
                  })}
                </React.Fragment>
              );
            })}
          </React.Fragment>
        );
      })}
    </>
  );
}

export function MarkdownText({ text }: { text: string }) {
  if (!text) return null;

  // Parsear bloques de código multilínea (```lang ... ```)
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const textChunk = text.slice(lastIndex, match.index);
      elements.push(<MarkdownParagraphs key={`text-${lastIndex}`} text={textChunk} />);
    }
    const lang = match[1] || "";
    const code = match[2].trim();
    elements.push(<CodeBlock key={`code-${match.index}`} lang={lang} code={code} />);
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    elements.push(<MarkdownParagraphs key={`text-${lastIndex}`} text={text.slice(lastIndex)} />);
  }

  return <div className="space-y-1">{elements}</div>;
}

function MarkdownParagraphs({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1.5" />;

        // Viñetas (- o *)
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          return (
            <div key={idx} className="flex items-start gap-2 my-0.5 ml-1">
              <span className="text-emerald-400 font-bold mt-0.5">•</span>
              <span className="flex-1">
                <InlineText text={trimmed.slice(2)} />
              </span>
            </div>
          );
        }

        // Títulos (###)
        if (trimmed.startsWith("### ")) {
          return (
            <h4 key={idx} className="text-emerald-400 font-bold text-sm mt-3 mb-1">
              <InlineText text={trimmed.slice(4)} />
            </h4>
          );
        }

        return (
          <p key={idx} className="my-0.5 leading-relaxed">
            <InlineText text={line} />
          </p>
        );
      })}
    </>
  );
}

export default MarkdownText;
