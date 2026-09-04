import { describe, it, expect } from "vitest";
import { convertGraphToExcalidraw } from "../app/lib/excalidrawExport";
import { parseMermaidFlowchart } from "../app/lib/mermaidParser";

describe("excalidrawExport", () => {
  it("convierte un grafo Mermaid a elementos Excalidraw rectangulares, textos y flechas", () => {
    const mermaidCode = `
flowchart LR
    client[Browser App] --> gateway[API Gateway]
    gateway --> auth[Auth Service]
    gateway --> db[(PostgreSQL)]
`;
    const graph = parseMermaidFlowchart(mermaidCode);
    const excalidraw = convertGraphToExcalidraw(graph);

    expect(excalidraw.type).toBe("excalidraw");
    expect(excalidraw.version).toBe(2);
    expect(excalidraw.source).toBe("loro-copilot");

    const rectangles = excalidraw.elements.filter((e) => e.type === "rectangle");
    const texts = excalidraw.elements.filter((e) => e.type === "text");
    const arrows = excalidraw.elements.filter((e) => e.type === "arrow");

    expect(rectangles.length).toBe(4);
    expect(texts.length).toBe(4);
    expect(arrows.length).toBe(3);

    // Verificar vinculaciones y puntos de flechas
    expect(arrows[0].points).toBeDefined();
    expect(arrows[0].points?.length).toBe(2);
    expect(arrows[0].startBinding?.elementId).toBe("rect_client");
    expect(arrows[0].endBinding?.elementId).toBe("rect_gateway");
  });

  it("aplica colores semánticos a las cajas según su tipo", () => {
    const mermaidCode = `
flowchart LR
    c[Client] --> db[(Database)]
`;
    const graph = parseMermaidFlowchart(mermaidCode);
    const excalidraw = convertGraphToExcalidraw(graph);

    const clientRect = excalidraw.elements.find((e) => e.id === "rect_c");
    const dbRect = excalidraw.elements.find((e) => e.id === "rect_db");

    expect(clientRect?.strokeColor).toBe("#60a5fa"); // Blue
    expect(dbRect?.strokeColor).toBe("#22d3ee");    // Cyan
  });
});
