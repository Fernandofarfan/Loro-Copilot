/**
 * excalidrawExport.ts — Generador de diagramas de arquitectura en formato Excalidraw JSON.
 * Permite copiar al portapapeles y pegar con Ctrl+V directamente en Excalidraw.com, Miro o Notion.
 */

import { ArchitectureGraph, ArchitectureNode } from "./mermaidParser";

export interface ExcalidrawElement {
  id: string;
  type: "rectangle" | "text" | "arrow" | "line";
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
  strokeColor: string;
  backgroundColor: string;
  fillStyle: "solid" | "hachure" | "cross-hatch";
  strokeWidth: number;
  strokeStyle: "solid" | "dashed" | "dotted";
  roughness: number;
  opacity: number;
  groupIds: string[];
  roundness?: { type: number };
  seed: number;
  version: number;
  versionNonce: number;
  isDeleted: boolean;
  boundElements?: Array<{ id: string; type: "arrow" | "text" }>;
  // Text specific
  text?: string;
  fontSize?: number;
  fontFamily?: number;
  textAlign?: "left" | "center" | "right";
  verticalAlign?: "top" | "middle" | "bottom";
  // Arrow specific
  points?: [number, number][];
  startBinding?: { elementId: string; focus: number; gap: number };
  endBinding?: { elementId: string; focus: number; gap: number };
}

const COLOR_MAP: Record<ArchitectureNode["type"], { bg: string; stroke: string }> = {
  client: { bg: "#1e3a8a", stroke: "#60a5fa" },      // Blue
  gateway: { bg: "#064e3b", stroke: "#34d399" },     // Emerald
  service: { bg: "#312e81", stroke: "#818cf8" },     // Indigo
  cache: { bg: "#78350f", stroke: "#fbbf24" },       // Amber
  database: { bg: "#164e63", stroke: "#22d3ee" },    // Cyan
  queue: { bg: "#581c87", stroke: "#c084fc" },       // Purple
  default: { bg: "#1e293b", stroke: "#94a3b8" },     // Slate
};

/**
 * Convierte un ArchitectureGraph en un payload de elementos compatibles con Excalidraw.
 */
export function convertGraphToExcalidraw(graph: ArchitectureGraph): {
  type: "excalidraw";
  version: 2;
  source: "loro-copilot";
  elements: ExcalidrawElement[];
} {
  const elements: ExcalidrawElement[] = [];

  const nodeWidth = 150;
  const nodeHeight = 60;
  const colGap = 80;
  const rowGap = 50;

  // Asignar columnas según dependencias (dirección LR)
  const colMap = new Map<string, number>();
  const targets = new Set(graph.edges.map((e) => e.to));
  graph.nodes.forEach((n) => {
    if (!targets.has(n.id)) colMap.set(n.id, 0);
  });

  for (let step = 0; step < 4; step++) {
    graph.edges.forEach((e) => {
      const fromCol = colMap.get(e.from) ?? 0;
      const toCol = colMap.get(e.to) ?? 0;
      if (toCol <= fromCol) {
        colMap.set(e.to, fromCol + 1);
      }
    });
  }

  const colItems = new Map<number, ArchitectureNode[]>();
  graph.nodes.forEach((n) => {
    const c = colMap.get(n.id) ?? 0;
    if (!colItems.has(c)) colItems.set(c, []);
    colItems.get(c)!.push(n);
  });

  const nodePositions = new Map<string, { x: number; y: number }>();
  colItems.forEach((nodes, col) => {
    nodes.forEach((n, idx) => {
      const x = 100 + col * (nodeWidth + colGap);
      const y = 100 + idx * (nodeHeight + rowGap);
      nodePositions.set(n.id, { x, y });
    });
  });

  // Generar cajas rectangulares y textos para cada nodo
  graph.nodes.forEach((node) => {
    const pos = nodePositions.get(node.id) ?? { x: 100, y: 100 };
    const colors = COLOR_MAP[node.type] || COLOR_MAP.default;
    const boxId = `rect_${node.id}`;
    const textId = `text_${node.id}`;

    // Caja
    elements.push({
      id: boxId,
      type: "rectangle",
      x: pos.x,
      y: pos.y,
      width: nodeWidth,
      height: nodeHeight,
      angle: 0,
      strokeColor: colors.stroke,
      backgroundColor: colors.bg,
      fillStyle: "solid",
      strokeWidth: 2,
      strokeStyle: "solid",
      roughness: 1,
      opacity: 100,
      groupIds: [node.id],
      roundness: { type: 3 },
      seed: Math.floor(Math.random() * 100000),
      version: 1,
      versionNonce: 1,
      isDeleted: false,
      boundElements: [{ id: textId, type: "text" }],
    });

    // Texto interior
    elements.push({
      id: textId,
      type: "text",
      x: pos.x + 10,
      y: pos.y + (nodeHeight / 2) - 10,
      width: nodeWidth - 20,
      height: 20,
      angle: 0,
      strokeColor: "#ffffff",
      backgroundColor: "transparent",
      fillStyle: "solid",
      strokeWidth: 1,
      strokeStyle: "solid",
      roughness: 0,
      opacity: 100,
      groupIds: [node.id],
      seed: Math.floor(Math.random() * 100000),
      version: 1,
      versionNonce: 1,
      isDeleted: false,
      text: node.label,
      fontSize: 14,
      fontFamily: 1,
      textAlign: "center",
      verticalAlign: "middle",
    });
  });

  // Generar flechas conectoras para cada arista
  graph.edges.forEach((edge, idx) => {
    const fromPos = nodePositions.get(edge.from);
    const toPos = nodePositions.get(edge.to);
    if (!fromPos || !toPos) return;

    const startX = fromPos.x + nodeWidth;
    const startY = fromPos.y + nodeHeight / 2;
    const endX = toPos.x;
    const endY = toPos.y + nodeHeight / 2;

    const arrowId = `arrow_${edge.from}_${edge.to}_${idx}`;

    elements.push({
      id: arrowId,
      type: "arrow",
      x: startX,
      y: startY,
      width: endX - startX,
      height: endY - startY,
      angle: 0,
      strokeColor: "#38bdf8",
      backgroundColor: "transparent",
      fillStyle: "solid",
      strokeWidth: 2,
      strokeStyle: "solid",
      roughness: 1,
      opacity: 100,
      groupIds: [],
      roundness: { type: 2 },
      seed: Math.floor(Math.random() * 100000),
      version: 1,
      versionNonce: 1,
      isDeleted: false,
      points: [
        [0, 0],
        [endX - startX, endY - startY],
      ],
      startBinding: { elementId: `rect_${edge.from}`, focus: 0, gap: 5 },
      endBinding: { elementId: `rect_${edge.to}`, focus: 0, gap: 5 },
    });
  });

  return {
    type: "excalidraw",
    version: 2,
    source: "loro-copilot",
    elements,
  };
}

/**
 * Copia el diagrama al portapapeles en formato Excalidraw
 */
export async function copyGraphToExcalidraw(graph: ArchitectureGraph): Promise<boolean> {
  const payload = convertGraphToExcalidraw(graph);
  const jsonString = JSON.stringify(payload, null, 2);

  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(jsonString);
      return true;
    }
  } catch (err) {
    console.warn("Error al copiar al portapapeles:", err);
  }
  return false;
}
