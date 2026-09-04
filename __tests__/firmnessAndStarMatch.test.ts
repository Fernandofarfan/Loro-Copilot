import { describe, it, expect } from "vitest";
import {
  detectFirmnessChallenge,
  matchSTARStory,
  parseBlocks,
  STARStory,
} from "../app/lib/interviewHelpers";

describe("detectFirmnessChallenge", () => {
  it("detecta retos de firmeza en inglés", () => {
    const q1 = "Are you sure about that? Wouldn't MongoDB be better for this use case?";
    const res1 = detectFirmnessChallenge(q1);
    expect(res1.isChallenge).toBe(true);
    expect(res1.tip).toContain("Have Backbone");

    const q2 = "Why not just use Redis for everything?";
    const res2 = detectFirmnessChallenge(q2);
    expect(res2.isChallenge).toBe(true);

    const q3 = "Is that really going to scale to 50k QPS?";
    const res3 = detectFirmnessChallenge(q3);
    expect(res3.isChallenge).toBe(true);
  });

  it("detecta retos de firmeza en español", () => {
    const q1 = "¿Estás seguro de eso? ¿No sería mejor usar DynamoDB?";
    const res1 = detectFirmnessChallenge(q1);
    expect(res1.isChallenge).toBe(true);
    expect(res1.tip).toContain("Have Backbone");

    const q2 = "¿Por qué no hacer simplemente un monolito modular?";
    const res2 = detectFirmnessChallenge(q2);
    expect(res2.isChallenge).toBe(true);
  });

  it("no dispara falsos positivos en preguntas técnicas estándar", () => {
    const q = "Can you explain how the Raft consensus algorithm handles leader election?";
    const res = detectFirmnessChallenge(q);
    expect(res.isChallenge).toBe(false);
  });
});

describe("matchSTARStory", () => {
  const sampleStories: STARStory[] = [
    {
      id: "s1",
      title: "Migración Zero-Downtime a PostgreSQL",
      situation: "La base de datos MySQL colapsaba en Black Friday con 15k QPS.",
      task: "Migrar a PostgreSQL con réplicas de lectura sin interrumpir el servicio.",
      action: "Implementé dual-writing y CDC con Debezium y Kafka para sincronizar datos.",
      result: "-60% de latencia p99 y cero pérdida de transacciones.",
      tags: ["postgres", "migration", "kafka", "scale"],
    },
    {
      id: "s2",
      title: "Resolución de Conflicto con Tech Lead sobre Event Sourcing",
      situation: "Había desacuerdo fuerte en el equipo sobre adoptar Event Sourcing para el catálogo.",
      task: "Alinear al equipo antes del inicio del trimestre sin generar resentimiento.",
      action: "Diseñé un spike de 3 días con métricas objetivas de complejidad operativa.",
      result: "Acuerdo unánime de usar CRUD con outbox pattern, ahorrando 2 meses de desarrollo.",
      tags: ["conflict", "leadership", "disagreement"],
    },
  ];

  it("empareja preguntas sobre conflictos con la historia correspondiente", () => {
    const q = "Tell me about a time you had a strong disagreement with a colleague on architecture";
    const match = matchSTARStory(q, sampleStories);
    expect(match).not.toBeNull();
    expect(match?.story.id).toBe("s2");
    expect(match?.score).toBeGreaterThan(0.4);
  });

  it("empareja preguntas sobre migraciones y escala con la historia de base de datos", () => {
    const q = "¿Alguna vez tuviste que liderar una migración compleja con alta latencia y tráfico?";
    const match = matchSTARStory(q, sampleStories);
    expect(match).not.toBeNull();
    expect(match?.story.id).toBe("s1");
    expect(match?.score).toBeGreaterThan(0.4);
  });

  it("devuelve null si no hay historias o no hay coincidencia relevante", () => {
    const q = "¿Qué opinás del clima hoy?";
    const match = matchSTARStory(q, sampleStories);
    expect(match).toBeNull();
  });
});

describe("parseBlocks con [DRY_RUN]", () => {
  it("extrae el bloque [DRY_RUN] y limpia el texto", () => {
    const raw = `[KEY] Two Pointers | O(N) | O(1)
[DRY_RUN]
| Paso | i | j | sum | Acción |
| 1 | 0 | 3 | 17 | j-- |
| 2 | 0 | 2 | 9 | MATCH |
[/DRY_RUN]
[EN]
Use two pointers from left and right.
[ES]
Usá dos punteros desde extremos.`;

    const parsed = parseBlocks(raw);
    expect(parsed.dryRun).toContain("| Paso | i | j | sum | Acción |");
    expect(parsed.dryRun).toContain("| 2 | 0 | 2 | 9 | MATCH |");
    expect(parsed.enText).toBe("Use two pointers from left and right.");
    expect(parsed.esText).toBe("Usá dos punteros desde extremos.");
    expect(parsed.cleanText).not.toContain("[DRY_RUN]");
  });
});
