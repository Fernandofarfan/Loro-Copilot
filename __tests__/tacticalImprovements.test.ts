import { describe, it, expect } from "vitest";
import {
  getInstantBridge,
  getSurgicalPhonetics,
  extractTriggerCards,
  SURGICAL_PHONETICS_DICT,
} from "../app/lib/interviewHelpers";
import {
  buildInterviewerSystemPrompt,
  PUSHBACK_CHALLENGE_DIRECTIVE,
} from "../app/lib/simuladorPersonas";

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
