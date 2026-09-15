import { describe, it, expect } from "vitest";
import {
  getInstantBridge,
  getSurgicalPhonetics,
  extractTriggerCards,
  SURGICAL_PHONETICS_DICT,
  getScaleLatencyPills,
  getInstantYagniTip,
  parseBlocks,
} from "../app/lib/interviewHelpers";
import {
  buildInterviewerSystemPrompt,
  PUSHBACK_CHALLENGE_DIRECTIVE,
} from "../app/lib/simuladorPersonas";
import { countFillers } from "../app/lib/speechCoach";

describe("Pilar 1: Zero-Silence Opening Bridge (<200ms)", () => {
  it("genera un puente inmediato para preguntas de Python Internals en <5ms", () => {
    const start = performance.now();
    const bridge = getInstantBridge("Can you explain how dict keys work in Python and why frozenset is needed?");
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(5);
    expect(bridge.category).toBe("python_internals");
    expect(bridge.bridgeEn).toContain("Python manages mutability and memory hashing");
    expect(bridge.bridgeEs).toContain("Python gestiona la mutabilidad y el hashing en memoria");
  });

  it("genera un puente inmediato para System Design & High Scalability", () => {
    const bridge = getInstantBridge("How would you design a distributed cache for 100k requests per second with Redis?");
    expect(bridge.category).toBe("system_design");
    expect(bridge.bridgeEn).toContain("architectural perspective");
    expect(bridge.bridgeEn).toContain("consistency versus write throughput");
  });

  it("genera un puente inmediato para Database & Data Persistence", () => {
    const bridge = getInstantBridge("How do you optimize slow PostgreSQL queries with composite indexes?");
    expect(bridge.category).toBe("data_persistence");
    expect(bridge.bridgeEn).toContain("query indexing and connection pool contention");
  });

  it("genera un puente inmediato para Concurrency & Asyncio", () => {
    const bridge = getInstantBridge("How do you prevent race conditions when using threading or celery workers?");
    expect(bridge.category).toBe("concurrency_async");
    expect(bridge.bridgeEn).toContain("balancing non-blocking event loops");
  });

  it("genera un puente inmediato para Cloud Infrastructure & DevOps", () => {
    const bridge = getInstantBridge("How do you handle zero-downtime rolling deployment in Kubernetes with Terraform?");
    expect(bridge.category).toBe("cloud_devops");
    expect(bridge.bridgeEn).toContain("blast radius while maintaining automated recovery");
  });

  it("genera un puente inmediato para Behavioral & Leadership (STAR)", () => {
    const bridge = getInstantBridge("Tell me about a time you had a technical disagreement with a teammate");
    expect(bridge.category).toBe("behavioral_star");
    expect(bridge.bridgeEn).toContain("leading technical initiatives");
  });

  it("usa fallback técnico coherente para preguntas generales", () => {
    const bridge = getInstantBridge("What are your salary expectations?");
    expect(bridge.category).toBe("general_technical");
    expect(bridge.bridgeEn).toContain("based on production experience");
  });
});

describe("Pilar 2: Tarjetas Disparadoras (Trigger Cards)", () => {
  it("formatea palabras clave en tarjetas disparadoras numeradas en mayúsculas", () => {
    const cards = extractTriggerCards(["frozenset", "immutable hash", "typeerror"]);
    expect(cards).toEqual([
      "1. FROZENSET",
      "2. IMMUTABLE HASH",
      "3. TYPEERROR",
    ]);
  });

  it("extrae tarjetas por regex técnica si keyWords viene vacío", () => {
    const cards = extractTriggerCards([], "Sets are mutable so you must use frozenset which is hashable and avoids typeerror", "How to use sets as keys?");
    expect(cards.length).toBeGreaterThanOrEqual(2);
    expect(cards[0]).toContain("FROZENSET");
  });

  it("limita a un máximo de 3 tarjetas disparadoras para visión periférica rápida", () => {
    const cards = extractTriggerCards(["one", "two", "three", "four", "five"]);
    expect(cards.length).toBe(3);
  });
});

describe("Pilar 3: Fonética Quirúrgica (Surgical Phonetics)", () => {
  it("detecta términos técnicos engañosos y devuelve su pronunciación fonética", () => {
    const result = getSurgicalPhonetics("We should execute this async query using a tuple and a background daemon");
    const words = result.map((r) => r.word);

    expect(words).toContain("async");
    expect(words).toContain("query");
    expect(words).toContain("tuple");
    expect(words).toContain("daemon");

    const queryEntry = result.find((r) => r.word === "query");
    expect(queryEntry?.phonetic).toBe("KWI-ri");

    const asyncEntry = result.find((r) => r.word === "async");
    expect(asyncEntry?.phonetic).toBe("EI-sink");

    const tupleEntry = result.find((r) => r.word === "tuple");
    expect(tupleEntry?.phonetic).toBe("TOO-pl");
  });

  it("devuelve array vacío si el texto no contiene palabras conflictivas", () => {
    const result = getSurgicalPhonetics("Hello I am a software engineer working from Salta Argentina");
    expect(result).toEqual([]);
  });

  it("deduplica palabras repetidas y respeta el tope de 4 pastillas clave", () => {
    const result = getSurgicalPhonetics("query query query async async tuple daemon frozenset queue cache");
    expect(result.length).toBeLessThanOrEqual(4);
    const words = result.map((r) => r.word);
    const unique = new Set(words);
    expect(unique.size).toBe(words.length);
  });

  it("el diccionario contiene más de 30 términos técnicos críticos", () => {
    const keys = Object.keys(SURGICAL_PHONETICS_DICT);
    expect(keys.length).toBeGreaterThan(30);
    expect(SURGICAL_PHONETICS_DICT["schema"].pho).toBe("SKEE-ma");
    expect(SURGICAL_PHONETICS_DICT["cache"].pho).toBe("KASH");
    expect(SURGICAL_PHONETICS_DICT["hierarchy"].pho).toBe("HAI-er-ar-ki");
  });
});

describe("Pilar 5: Modo Pushback / Have Backbone en Simulador", () => {
  it("genera prompt estándar sin directiva pushback cuando pushbackMode es false", () => {
    const prompt = buildInterviewerSystemPrompt("standard", false);
    expect(prompt).not.toContain("DIRECTIVA PUSHBACK");
    expect(prompt).toContain("Sos el ENTREVISTADOR");
  });

  it("inyecta la directiva PUSHBACK_CHALLENGE_DIRECTIVE cuando pushbackMode es true", () => {
    const prompt = buildInterviewerSystemPrompt("skeptic_architect", true);
    expect(prompt).toContain("DIRECTIVA PUSHBACK (HAVE BACKBONE CHALLENGE ACTIVADA)");
    expect(prompt).toContain("cuestionar, desafiar o mostrar escepticismo");
    expect(prompt).toContain("Have Backbone");
  });
});

describe("Pilar 6: Píldoras de Latencia y Magnitudes de Escala (Jeff Dean)", () => {
  it("extrae magnitudes de memoria y Redis para preguntas de caching", () => {
    const pills = getScaleLatencyPills("How do you design a distributed cache with Redis to prevent database bottlenecks?");
    expect(pills.length).toBeGreaterThanOrEqual(2);
    expect(pills.some((p) => p.label.includes("RAM") && p.val.includes("100 ns"))).toBe(true);
    expect(pills.some((p) => p.label.includes("Redis") && p.val.includes("0.5-1 ms"))).toBe(true);
  });

  it("extrae métricas de NVMe vs HDD y B-Tree seek para preguntas de persistencia y base de datos", () => {
    const pills = getScaleLatencyPills("How do you tune slow queries and storage on PostgreSQL with billions of rows?");
    expect(pills.length).toBeGreaterThanOrEqual(2);
    expect(pills.some((p) => p.label.includes("NVMe") && p.val.includes("µs"))).toBe(true);
    expect(pills.some((p) => p.label.includes("B-Tree") && p.val.includes("O(log N)"))).toBe(true);
  });

  it("extrae latencias de red para preguntas de microservicios y sistemas distribuidos", () => {
    const pills = getScaleLatencyPills("What are the network latency implications across regions in a microservice architecture?");
    expect(pills.length).toBeGreaterThanOrEqual(2);
    expect(pills.some((p) => p.label.includes("Datacenter") && p.val.includes("0.5 ms"))).toBe(true);
    expect(pills.some((p) => p.label.includes("Region") && p.val.includes("150 ms"))).toBe(true);
  });

  it("extrae throughput de streaming para preguntas de Kafka y colas", () => {
    const pills = getScaleLatencyPills("How many messages per second can Kafka handle under heavy write traffic?");
    expect(pills.some((p) => p.label.includes("Kafka") && p.val.includes("100k+"))).toBe(true);
  });

  it("devuelve array vacío para preguntas no técnicas o sin mención de escala", () => {
    const pills = getScaleLatencyPills("What is your favorite remote work setup?");
    expect(pills).toEqual([]);
  });
});

describe("Pilar 7: Pragmatismo Senior YAGNI (Anti-Overengineering)", () => {
  it("proporciona tip de monolito modular para preguntas de microservicios prematuros", () => {
    const tip = getInstantYagniTip("Should we split our startup backend into 20 microservices?");
    expect(tip).toContain("Monolito Modular");
    expect(tip).toContain("múltiples squads");
  });

  it("proporciona advertencia sobre Kafka para volumen moderado", () => {
    const tip = getInstantYagniTip("Do we need Kafka for handling our user signup events?");
    expect(tip).toContain("Redis Streams / Celery / SQS");
    expect(tip).toContain("Kafka");
  });

  it("proporciona recomendación de Cloud Run/ECS antes de montar Kubernetes completo", () => {
    const tip = getInstantYagniTip("Should we deploy our initial two containers on a full Kubernetes cluster?");
    expect(tip).toContain("Cloud Run / ECS Fargate");
    expect(tip).toContain("Kubernetes");
  });

  it("parseBlocks extrae correctamente el bloque [YAGNI]", () => {
    const rawOutput = `[EN] We use PostgreSQL with read replicas. [/EN]
[ES] Usamos PostgreSQL con réplicas de lectura. [/ES]
[YAGNI] Iniciar con un único nodo y réplicas antes de intentar sharding manual. [/YAGNI]`;

    const parsed = parseBlocks(rawOutput);
    expect(parsed.yagni).toBe("Iniciar con un único nodo y réplicas antes de intentar sharding manual.");
    expect(parsed.cleanText).not.toContain("[YAGNI]");
    expect(parsed.cleanText).not.toContain("Iniciar con un único nodo");
  });
});

describe("Pilar 8: Espejo Acústico (Detección de Muletillas)", () => {
  it("detecta y contabiliza muletillas en español con precisión", () => {
    const speech = "Bueno, este, la base de datos se cayó porque, tipo, no teníamos réplica y nada, fue grave.";
    const result = countFillers(speech);

    expect(result.total).toBeGreaterThanOrEqual(4);
    expect(result.breakdown["este"]).toBe(1);
    expect(result.breakdown["tipo"]).toBe(1);
    expect(result.breakdown["nada"]).toBe(1);
    expect(result.breakdown["bueno"]).toBe(1);
  });

  it("detecta muletillas en inglés para el modo bilingüe", () => {
    const speech = "Basically, like, we scaled the service with Redis you know, and um it worked fine.";
    const result = countFillers(speech);

    expect(result.total).toBeGreaterThanOrEqual(4);
    expect(result.breakdown["basically"]).toBe(1);
    expect(result.breakdown["like"]).toBe(1);
    expect(result.breakdown["you know"]).toBe(1);
    expect(result.breakdown["um"]).toBe(1);
  });

  it("reporta 0 muletillas en discursos técnicos concisos y directos", () => {
    const speech = "We deployed PostgreSQL on Google Cloud SQL with automated failover and read replicas.";
    const result = countFillers(speech);

    expect(result.total).toBe(0);
    expect(Object.keys(result.breakdown).length).toBe(0);
  });
});

