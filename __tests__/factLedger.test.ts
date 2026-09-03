import { describe, it, expect } from "vitest";
import {
  extractFactsFromAnswer,
  mergeSessionFacts,
  formatFactsForPrompt,
  SessionFact,
} from "../app/lib/factLedger";

describe("factLedger (Session Memory Graph)", () => {
  it("extrae tecnologías, patrones de arquitectura y métricas", () => {
    const text = `
En nuestro equipo migramos a una arquitectura de microservicios usando Go y Kafka.
Almacenamos los datos transaccionales en PostgreSQL y cacheamos con Redis.
Alcanzamos una escala de 50k QPS con una reducción de latencia del 35%.
`;

    const facts = extractFactsFromAnswer(text);
    expect(facts.length).toBeGreaterThanOrEqual(4);

    const techStatements = facts.filter((f) => f.category === "technology").map((f) => f.statement);
    expect(techStatements.some((s) => s.includes("Go"))).toBe(true);
    expect(techStatements.some((s) => s.includes("Kafka"))).toBe(true);
    expect(techStatements.some((s) => s.includes("PostgreSQL"))).toBe(true);
    expect(techStatements.some((s) => s.includes("Redis"))).toBe(true);

    const archStatements = facts.filter((f) => f.category === "architecture").map((f) => f.statement);
    expect(archStatements.some((s) => s.includes("microservicios"))).toBe(true);

    const metricStatements = facts.filter((f) => f.category === "metric").map((f) => f.statement);
    expect(metricStatements.some((s) => s.includes("50k QPS"))).toBe(true);
    expect(metricStatements.some((s) => s.includes("35%"))).toBe(true);
  });

  it("mergeSessionFacts deduplica correctamente sin sobreescribir", () => {
    const initial: SessionFact[] = [
      { id: "1", category: "technology", statement: "Stack / Tecnología: Kafka", timestamp: 100 },
    ];
    const incoming: SessionFact[] = [
      { id: "2", category: "technology", statement: "Stack / Tecnología: Kafka", timestamp: 200 },
      { id: "3", category: "technology", statement: "Stack / Tecnología: Redis", timestamp: 200 },
    ];

    const merged = mergeSessionFacts(initial, incoming);
    expect(merged).toHaveLength(2);
    expect(merged.map((f) => f.statement)).toContain("Stack / Tecnología: Kafka");
    expect(merged.map((f) => f.statement)).toContain("Stack / Tecnología: Redis");
  });

  it("formatFactsForPrompt formatea el bloque para inyección en el prompt", () => {
    const facts: SessionFact[] = [
      { id: "1", category: "technology", statement: "Stack / Tecnología: PostgreSQL", timestamp: 100 },
      { id: "2", category: "metric", statement: "Métrica / Escala cuantitativa: 100k QPS", timestamp: 110 },
    ];

    const formatted = formatFactsForPrompt(facts);
    expect(formatted).toContain("PROHIBIDO CONTRADECIR");
    expect(formatted).toContain("[technology] Stack / Tecnología: PostgreSQL");
    expect(formatted).toContain("[metric] Métrica / Escala cuantitativa: 100k QPS");
  });
});
