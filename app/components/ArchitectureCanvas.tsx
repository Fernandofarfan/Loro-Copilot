"use client";

import React, { useState, useRef } from "react";
import { parseMermaidFlowchart, ArchitectureNode } from "../lib/mermaidParser";
import { copyGraphToExcalidraw } from "../lib/excalidrawExport";

interface ArchitectureCanvasProps {
  mermaidCode: string;
}

const TYPE_CONFIG: Record<
  ArchitectureNode["type"],
  { icon: string; bg: string; border: string; text: string }
> = {
  client: { icon: "💻", bg: "bg-blue-950/70", border: "border-blue-500/50", text: "text-blue-300" },
  gateway: { icon: "🌐", bg: "bg-emerald-950/70", border: "border-emerald-500/50", text: "text-emerald-300" },
  service: { icon: "⚙️", bg: "bg-indigo-950/70", border: "border-indigo-500/50", text: "text-indigo-300" },
  cache: { icon: "⚡", bg: "bg-amber-950/70", border: "border-amber-500/50", text: "text-amber-300" },
  database: { icon: "🗄️", bg: "bg-cyan-950/70", border: "border-cyan-500/50", text: "text-cyan-300" },
  queue: { icon: "📬", bg: "bg-purple-950/70", border: "border-purple-500/50", text: "text-purple-300" },
  default: { icon: "📦", bg: "bg-slate-900/80", border: "border-slate-700/60", text: "text-slate-300" },
};

export default function ArchitectureCanvas({ mermaidCode }: ArchitectureCanvasProps) {
  const [copied, setCopied] = useState(false);
  const [copiedExcalidraw, setCopiedExcalidraw] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const graph = parseMermaidFlowchart(mermaidCode);

  const handleCopy = () => {
    navigator.clipboard.writeText(mermaidCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyExcalidraw = async () => {
    const ok = await copyGraphToExcalidraw(graph);
    if (ok) {
      setCopiedExcalidraw(true);
      setTimeout(() => setCopiedExcalidraw(false), 2000);
    }
  };

  const handleDownloadSvg = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `system-design-${Date.now()}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!graph.nodes.length) {
    return null;
  }

  // Layout simple en columnas para dirección LR
  const nodeWidth = 140;
  const nodeHeight = 56;
  const colGap = 70;
  const rowGap = 30;

  // Asignar columnas simples basadas en relaciones
  const colMap = new Map<string, number>();
  // Primeros nodos sin aristas entrantes en col 0
  const targets = new Set(graph.edges.map((e) => e.to));
  graph.nodes.forEach((n) => {
    if (!targets.has(n.id)) colMap.set(n.id, 0);
  });

  // Iterar para asignar columnas
  let maxCol = 0;
  for (let step = 0; step < 4; step++) {
    graph.edges.forEach((e) => {
      const fromCol = colMap.get(e.from) ?? 0;
      const toCol = colMap.get(e.to) ?? 0;
      if (toCol <= fromCol) {
        colMap.set(e.to, fromCol + 1);
        if (fromCol + 1 > maxCol) maxCol = fromCol + 1;
      }
    });
  }

  // Contar nodos por columna
  const colItems = new Map<number, ArchitectureNode[]>();
  graph.nodes.forEach((n) => {
    const c = colMap.get(n.id) ?? 0;
    if (!colItems.has(c)) colItems.set(c, []);
    colItems.get(c)!.push(n);
  });

  // Calcular posiciones (x, y) de cada nodo
  const nodePositions = new Map<string, { x: number; y: number }>();
  let maxRows = 1;
  colItems.forEach((nodes, col) => {
    if (nodes.length > maxRows) maxRows = nodes.length;
    nodes.forEach((n, idx) => {
      const x = 30 + col * (nodeWidth + colGap);
      const y = 30 + idx * (nodeHeight + rowGap);
      nodePositions.set(n.id, { x, y });
    });
  });

  const totalWidth = Math.max(500, 60 + (maxCol + 1) * (nodeWidth + colGap));
  const totalHeight = Math.max(160, 60 + maxRows * (nodeHeight + rowGap));

  return (
    <div className="my-3 rounded-xl border border-sky-500/20 bg-slate-950/80 p-3 shadow-lg backdrop-blur-sm">
      <div className="mb-2 flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-base">📐</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">
            System Design Architecture Canvas
          </span>
          <span className="rounded bg-sky-950 px-1.5 py-0.5 text-[10px] font-mono text-sky-300">
            {graph.nodes.length} nodos · {graph.edges.length} aristas
          </span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setShowRaw(!showRaw)}
            className="rounded px-2 py-1 text-[11px] font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          >
            {showRaw ? "Ver Canvas" : "Ver Código"}
          </button>
          <button
            onClick={handleCopyExcalidraw}
            className="rounded bg-sky-950/80 border border-sky-600/40 px-2 py-1 text-[11px] font-medium text-sky-300 hover:bg-sky-900 hover:text-white transition-colors"
            title="Copia el diagrama en formato Excalidraw para pegar con Ctrl+V en Excalidraw.com o Miro"
          >
            {copiedExcalidraw ? "✓ Copiado a Excalidraw!" : "📋 Copiar a Excalidraw"}
          </button>
          <button
            onClick={handleDownloadSvg}
            className="rounded bg-slate-800 px-2 py-1 text-[11px] font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            title="Descargar diagrama en archivo SVG vectorial limpio"
          >
            💾 Descargar SVG
          </button>
          <button
            onClick={handleCopy}
            className="rounded bg-slate-800 px-2 py-1 text-[11px] font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
          >
            {copied ? "✓ Copiado" : "📋 Mermaid"}
          </button>
        </div>
      </div>

      {showRaw ? (
        <pre className="overflow-x-auto rounded-lg bg-slate-900/90 p-3 font-mono text-xs text-sky-200">
          {mermaidCode}
        </pre>
      ) : (
        <div className="relative overflow-x-auto">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${totalWidth} ${totalHeight}`}
            className="w-full min-w-[480px] select-none"
            style={{ minHeight: "180px", maxHeight: "320px" }}
          >
            <defs>
              <marker
                id="arrowhead"
                markerWidth="8"
                markerHeight="6"
                refX="7"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="#38bdf8" />
              </marker>
              <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="1" />
              </linearGradient>
            </defs>

            {/* Aristas / Conexiones */}
            {graph.edges.map((edge, i) => {
              const fromPos = nodePositions.get(edge.from);
              const toPos = nodePositions.get(edge.to);
              if (!fromPos || !toPos) return null;

              const startX = fromPos.x + nodeWidth;
              const startY = fromPos.y + nodeHeight / 2;
              const endX = toPos.x;
              const endY = toPos.y + nodeHeight / 2;

              const midX = (startX + endX) / 2;

              return (
                <g key={`edge_${i}`}>
                  <path
                    d={`M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`}
                    fill="none"
                    stroke="url(#edgeGradient)"
                    strokeWidth="1.75"
                    strokeDasharray={edge.label ? "4 3" : undefined}
                    markerEnd="url(#arrowhead)"
                  />
                  {edge.label && (
                    <text
                      x={midX}
                      y={(startY + endY) / 2 - 6}
                      fill="#94a3b8"
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {edge.label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Nodos */}
            {graph.nodes.map((node) => {
              const pos = nodePositions.get(node.id);
              if (!pos) return null;
              const conf = TYPE_CONFIG[node.type] || TYPE_CONFIG.default;

              return (
                <g key={`node_${node.id}`} transform={`translate(${pos.x}, ${pos.y})`}>
                  <rect
                    width={nodeWidth}
                    height={nodeHeight}
                    rx="8"
                    className={`${conf.bg} ${conf.border}`}
                    strokeWidth="1.5"
                    filter="drop-shadow(0 4px 6px rgba(0,0,0,0.3))"
                  />
                  <text
                    x="12"
                    y="24"
                    fontSize="13"
                    className="select-none"
                  >
                    {conf.icon}
                  </text>
                  <text
                    x="32"
                    y="24"
                    fontSize="11"
                    fontWeight="600"
                    fill="#f1f5f9"
                    className="select-none"
                  >
                    {node.id.length > 14 ? node.id.slice(0, 13) + "…" : node.id}
                  </text>
                  <text
                    x="12"
                    y="42"
                    fontSize="9.5"
                    fill="#94a3b8"
                    fontFamily="monospace"
                    className="select-none"
                  >
                    {node.label.length > 18 ? node.label.slice(0, 17) + "…" : node.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      )}
    </div>
  );
}
