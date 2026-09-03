// @vitest-environment node
import { describe, it, expect } from "vitest";
import { chunkCv, selectRelevantCvChunks } from "../app/lib/cvChunker";

describe("cvChunker", () => {
  const sampleCv = `
# Fernando Farfán - Senior Cloud & Software Architect

## Resumen Profesional
Más de 10 años diseñando sistemas distribuidos, arquitecturas cloud y pipelines de alta concurrencia.

## Experiencia Laboral

### Tech Lead & Cloud Architect @ Telecom (2022 - Presente)
- Liderazgo de arquitectura de microservicios sobre Google Cloud Platform (GCP) y Kubernetes (GKE).
- Implementación de Apache Kafka para procesamiento de eventos en tiempo real (>50k ev/seg).
- Reducción del 40% en costos de infraestructura cloud mediante autoscaling y Spot VMs.

### Senior Data Engineer @ Globant (2019 - 2022)
- Diseño y optimización de bases de datos PostgreSQL y BigQuery con sharding y particionamiento.
- Pipelines de ETL con Apache Airflow y Spark.

## Habilidades Técnicas
- Lenguajes: Python, Go, TypeScript, SQL.
- Cloud: GCP, AWS, Terraform, Docker, Kubernetes.
- Bases de Datos: PostgreSQL, Redis, BigQuery, ClickHouse.
`;

  it("debe dividir el CV en bloques semánticos discretos", () => {
    const chunks = chunkCv(sampleCv);
    expect(chunks.length).toBeGreaterThanOrEqual(3);

    const titles = chunks.map((c) => c.title);
    expect(titles.some((t) => t.includes("Telecom"))).toBe(true);
    expect(titles.some((t) => t.includes("Globant"))).toBe(true);
    expect(titles.some((t) => t.includes("Habilidades"))).toBe(true);
  });

  it("debe asignar categorías correctas según el encabezado", () => {
    const chunks = chunkCv(sampleCv);
    const skillsChunk = chunks.find((c) => c.category === "skills");
    expect(skillsChunk).toBeDefined();
    expect(skillsChunk?.content).toContain("PostgreSQL");

    const expChunk = chunks.find((c) => c.title.includes("Telecom"));
    expect(expChunk?.category).toBe("experience");
  });

  it("debe seleccionar con prioridad el bloque afín a la pregunta (RAG)", () => {
    const chunks = chunkCv(sampleCv);

    // Pregunta sobre Kafka y streaming
    const kafkaSelection = selectRelevantCvChunks("How did you handle event streams with Kafka and GKE?", chunks);
    expect(kafkaSelection).toContain("Telecom");
    expect(kafkaSelection).toContain("Kafka");

    // Pregunta sobre PostgreSQL y BigQuery
    const dbSelection = selectRelevantCvChunks("Tell me about database optimization with Postgres and Airflow", chunks);
    expect(dbSelection).toContain("Globant");
    expect(dbSelection).toContain("PostgreSQL");
  });

  it("debe manejar texto vacío sin errores", () => {
    expect(chunkCv("")).toEqual([]);
    expect(selectRelevantCvChunks("test", [])).toBe("");
  });
});
