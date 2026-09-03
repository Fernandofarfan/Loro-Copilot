import { describe, it, expect } from "vitest";
import { cleanAiSlop, detectAiSlopScore } from "../app/lib/antiSlopFilter";

describe("antiSlopFilter", () => {
  it("elimina prefijos formuláicos en inglés y capitaliza el inicio", () => {
    const raw = "Certainly! Let's delve into this. We chose PostgreSQL over MongoDB because of ACID requirements.";
    const cleaned = cleanAiSlop(raw);
    expect(cleaned).not.toMatch(/^certainly/i);
    expect(cleaned).not.toMatch(/delve into/i);
    expect(cleaned).toMatch(/^We chose PostgreSQL/);
  });

  it("elimina prefijos formuláicos en español", () => {
    const raw = "¡Excelente pregunta! Es crucial destacar que en producción usamos Redis como cache distribuido.";
    const cleaned = cleanAiSlop(raw);
    expect(cleaned).not.toMatch(/^¡?excelente pregunta/i);
    expect(cleaned).not.toMatch(/^es crucial destacar que/i);
    expect(cleaned).toMatch(/en producción usamos Redis/i);
  });

  it("reemplaza términos blandos/preachy por expresiones directas", () => {
    const raw = "In order to achieve this, it is crucial to examine the query plan.";
    const cleaned = cleanAiSlop(raw);
    expect(cleaned).toContain("to do this");
    expect(cleaned).toContain("we need to");
  });

  it("calcula score de AI slop correctamente", () => {
    const heavySlop = "Certainly, in today's fast-paced world, it is crucial to delve into this.";
    const cleanEng = "We deployed Kafka partitions with key-based hashing to avoid race conditions.";

    const slopReport = detectAiSlopScore(heavySlop);
    const cleanReport = detectAiSlopScore(cleanEng);

    expect(slopReport.score).toBeGreaterThan(0.5);
    expect(slopReport.flaggedPhrases.length).toBeGreaterThanOrEqual(2);
    expect(cleanReport.score).toBe(0);
    expect(cleanReport.flaggedPhrases).toHaveLength(0);
  });
});
