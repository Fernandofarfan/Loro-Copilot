import { describe, it, expect } from "vitest";
import { chunkCv, selectRelevantCvChunks } from "../app/lib/cvChunker";

describe("timelineRAG (Grafo Temporal del CV)", () => {
  const sampleCv = `
# Resumen Profesional
Ingeniero de Software con más de 8 años de experiencia en sistemas distribuidos.

## Experiencia Laboral

### Tech Lead at Globant (2023 - Presente)
Lideré un equipo de 12 ingenieros migrando arquitectura monolítica a microservicios en Kubernetes.
Optimizamos la latencia p99 en un 40% y redujimos costos en $50k USD anuales.

### Senior Backend Engineer at MercadoLibre (2020 - 2023)
Desarrollo de servicios de pagos de alta concurrencia con Go y Kafka procesando 500k QPS.

### Junior Developer at StartupX (2018 - 2020)
Mantenimiento de APIs en Node.js y bases de datos relacionales PostgreSQL.
`;

  it("infiere correctamente seniority, años, empresa y métricas de cada chunk", () => {
    const chunks = chunkCv(sampleCv);
    expect(chunks.length).toBeGreaterThanOrEqual(3);

    const leadChunk = chunks.find((c) => c.title.includes("Tech Lead"));
    expect(leadChunk).toBeDefined();
    expect(leadChunk?.seniority).toBe("Lead");
    expect(leadChunk?.startYear).toBe(2023);
    expect(leadChunk?.isCurrent).toBe(true);
    expect(leadChunk?.metrics).toContain("40%");
    expect(leadChunk?.metrics).toContain("$50k USD");

    const seniorChunk = chunks.find((c) => c.title.includes("Senior Backend"));
    expect(seniorChunk).toBeDefined();
    expect(seniorChunk?.seniority).toBe("Senior");
    expect(seniorChunk?.startYear).toBe(2020);
    expect(seniorChunk?.endYear).toBe(2023);
    expect(seniorChunk?.metrics).toContain("500k QPS");

    const juniorChunk = chunks.find((c) => c.title.includes("Junior Developer"));
    expect(juniorChunk).toBeDefined();
    expect(juniorChunk?.seniority).toBe("Junior");
    expect(juniorChunk?.startYear).toBe(2018);
    expect(juniorChunk?.endYear).toBe(2020);
  });

  it("prioriza la experiencia más reciente y actual cuando se pregunta por trabajo reciente", () => {
    const chunks = chunkCv(sampleCv);
    const result = selectRelevantCvChunks("Contame sobre tu experiencia más reciente", chunks);
    expect(result).toContain("Tech Lead");
    expect(result).toContain("Globant");
  });

  it("prioriza roles de liderazgo cuando la pregunta indaga sobre liderar equipos", () => {
    const chunks = chunkCv(sampleCv);
    const result = selectRelevantCvChunks("¿Cómo lideraste equipos bajo presión?", chunks);
    expect(result).toContain("Tech Lead");
    expect(result).toContain("12 ingenieros");
  });

  it("incluye métricas e impacto cuantitativo al preguntar por resultados", () => {
    const chunks = chunkCv(sampleCv);
    const result = selectRelevantCvChunks("¿Qué métricas e impacto tuviste en tus proyectos?", chunks);
    expect(result).toMatch(/40%|500k QPS|\$50k/);
  });
});
