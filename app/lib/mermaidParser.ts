/**
 * app/lib/mermaidParser.ts
 *
 * Parser liviano de diagramas de arquitectura (Mermaid Flowchart).
 * Extrae nodos, formas y conexiones sin dependencias externas pesadas,
 * permitiendo renderizar un Architecture Canvas SVG interactivo en el cliente.
 */

export interface ArchitectureNode {
  id: string;
  label: string;
  type: "client" | "gateway" | "service" | "cache" | "database" | "queue" | "default";
}

export interface ArchitectureEdge {
  from: string;
  to: string;
  label?: string;
}

export interface ArchitectureGraph {
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
  direction: "LR" | "TD";
}

/**
 * Infiere el tipo semántico del nodo según su nombre o etiqueta para asignarle iconos/colores
 */
function inferNodeType(label: string): ArchitectureNode["type"] {
  const lower = label.toLowerCase();
  if (/client|browser|user|usuario|frontend|mobile|app/i.test(lower)) return "client";
  if (/gateway|load balancer|alb|elb|proxy|nginx|traefik|kong/i.test(lower)) return "gateway";
  if (/cache|redis|memcached|varnish/i.test(lower)) return "cache";
  if (/database|db|postgres|mysql|mongo|aurora|dynamo|spanner|storage|cassandra/i.test(lower)) return "database";
  if (/queue|kafka|rabbitmq|sqs|event|pubsub|broker/i.test(lower)) return "queue";
  if (/service|worker|microservicio|auth|api|backend|lambda/i.test(lower)) return "service";
  return "default";
}

/**
 * Extrae bloques de código ```mermaid ... ``` dentro de un texto Markdown
 */
export function extractMermaidBlocks(markdown: string): string[] {
  if (!markdown) return [];
  const regex = /```mermaid\s*([\s\S]*?)```/gi;
  const blocks: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(markdown)) !== null) {
    if (match[1].trim()) {
      blocks.push(match[1].trim());
    }
  }
  return blocks;
}

/**
 * Parsea un diagrama de flujo Mermaid (flowchart LR / graph TD)
 */
export function parseMermaidFlowchart(code: string): ArchitectureGraph {
  const lines = code.split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("%%"));
  const nodesMap = new Map<string, ArchitectureNode>();
  const edges: ArchitectureEdge[] = [];
  let direction: "LR" | "TD" = "LR";

  // Detección de dirección inicial (flowchart LR / graph TD)
  const firstLine = lines[0] || "";
  if (/\b(?:TD|TB)\b/i.test(firstLine)) direction = "TD";

  // Regex para aristas: A --> B, A -- "label" --> B, A -.-> B, A ==> B
  const edgeRegex = /([a-zA-Z0-9_-]+)(?:\[.*?\]|\(.*?\)|\[\(.*?\)\]|\{.*?\}|\>.*?\>)?\s*(?:---|-->|-\.->|==>|--\s*["']?([^"'-]+)["']?\s*-->)\s*([a-zA-Z0-9_-]+)(?:\[.*?\]|\(.*?\)|\[\(.*?\)\]|\{.*?\}|\>.*?\>)?/g;

  // Regex para extracción de definición de nodos individuales:
  // NodeID[(Database Label)]
  // NodeID[Rectangle Label]
  // NodeID(Rounded Label)
  // NodeID{Diamond Label}
  const nodeDefRegex = /([a-zA-Z0-9_-]+)(?:\[\((.*?)\)\]|\[(.*?)\]|\((.*?)\)|\{(.*?)\})/g;

  for (const line of lines) {
    // 1. Extraer definiciones explícitas de nodos en la línea
    let nodeMatch: RegExpExecArray | null;
    const lineDefRegex = new RegExp(nodeDefRegex);
    while ((nodeMatch = lineDefRegex.exec(line)) !== null) {
      const id = nodeMatch[1].trim();
      const label = (nodeMatch[2] || nodeMatch[3] || nodeMatch[4] || nodeMatch[5] || id).trim();
      if (!nodesMap.has(id)) {
        nodesMap.set(id, {
          id,
          label,
          type: inferNodeType(label),
        });
      }
    }

    // 2. Extraer aristas y conexiones
    let edgeMatch: RegExpExecArray | null;
    const lineEdgeRegex = new RegExp(edgeRegex);
    while ((edgeMatch = lineEdgeRegex.exec(line)) !== null) {
      const from = edgeMatch[1].trim();
      const edgeLabel = edgeMatch[2] ? edgeMatch[2].trim() : undefined;
      const to = edgeMatch[3].trim();

      if (!nodesMap.has(from)) {
        nodesMap.set(from, { id: from, label: from, type: inferNodeType(from) });
      }
      if (!nodesMap.has(to)) {
        nodesMap.set(to, { id: to, label: to, type: inferNodeType(to) });
      }

      edges.push({ from, to, label: edgeLabel });
    }
  }

  return {
    nodes: Array.from(nodesMap.values()),
    edges,
    direction,
  };
}
