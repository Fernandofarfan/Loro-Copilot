import { describe, it, expect } from "vitest";
import { extractMermaidBlocks, parseMermaidFlowchart } from "../app/lib/mermaidParser";

describe("mermaidParser", () => {
  it("extrae bloques mermaid de markdown", () => {
    const md = `
Aquí está el diseño del sistema:
\`\`\`mermaid
flowchart LR
    Client --> ALB[Load Balancer]
    ALB --> API[API Gateway]
\`\`\`
Fin de la explicación.
`;
    const blocks = extractMermaidBlocks(md);
    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toContain("Client --> ALB");
  });

  it("parsea nodos, tipos semánticos y aristas correctamente", () => {
    const code = `
flowchart LR
    User[Web Client] --> Gateway[API Gateway]
    Gateway --> Cache[(Redis Cache)]
    Gateway --> DB[(PostgreSQL Primary)]
    Gateway --> Broker[Kafka Queue]
    Broker --> Worker[Background Worker]
`;

    const graph = parseMermaidFlowchart(code);
    expect(graph.direction).toBe("LR");
    expect(graph.nodes.length).toBeGreaterThanOrEqual(5);

    const userNode = graph.nodes.find((n) => n.id === "User");
    expect(userNode?.type).toBe("client");
    expect(userNode?.label).toBe("Web Client");

    const cacheNode = graph.nodes.find((n) => n.id === "Cache");
    expect(cacheNode?.type).toBe("cache");
    expect(cacheNode?.label).toBe("Redis Cache");

    const dbNode = graph.nodes.find((n) => n.id === "DB");
    expect(dbNode?.type).toBe("database");

    const queueNode = graph.nodes.find((n) => n.id === "Broker");
    expect(queueNode?.type).toBe("queue");

    expect(graph.edges.length).toBeGreaterThanOrEqual(4);
    expect(graph.edges.some((e) => e.from === "Gateway" && e.to === "DB")).toBe(true);
  });
});
