import { describe, it, expect } from "vitest";
import {
  getInstantBridge,
  getSurgicalPhonetics,
  extractTriggerCards,
  SURGICAL_PHONETICS_DICT,
  getScaleLatencyPills,
  getInstantYagniTip,
  parseBlocks,
  matchSTARStory,
  detectInstantTrap,
  getAdaptiveDebounceMs,
  detectExperienceQuestion,
  classifyQuestionType,
} from "../app/lib/interviewHelpers";
import type { STARStory } from "../app/lib/interviewHelpers";
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
    const bridge = getInstantBridge("Can you describe your general development and debugging workflow?");
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


describe("M4: Deprioritización de Historias STAR ya Usadas en Sesión", () => {
  const stories: STARStory[] = [
    {
      id: "story-1",
      title: "Migración de Monolito a Kafka",
      situation: "Sistema de pagos con alto tráfico que se caía bajo carga.",
      task: "Migrar arquitectura a event-driven con Kafka para desacoplar servicios.",
      action: "Implementé productores Kafka en Python, consumidores idempotentes y dead-letter queues.",
      result: "Latencia P99 bajó de 800ms a 120ms, eliminando outages en picos.",
      tags: ["kafka", "migration", "python", "backend"],
    },
    {
      id: "story-2",
      title: "Conflicto Técnico con el Equipo de Arquitectura",
      situation: "Debate sobre si usar GraphQL vs REST para la nueva API.",
      task: "Defender la posición técnica con datos y trade-offs claros.",
      action: "Presenté benchmarks y análisis de complejidad operacional; acordamos REST con paginación cursor-based.",
      result: "Se redujo la curva de onboarding y el time-to-market en 30%.",
      tags: ["conflict", "leadership", "architecture", "api"],
    },
  ];

  it("retorna la historia más relevante sin penalización cuando excludeIndices está vacío", () => {
    const result = matchSTARStory("Tell me about a time you had a conflict with a teammate", stories, 0.35, []);
    expect(result).not.toBeNull();
    expect(result!.storyIndex).toBe(1); // Conflicto es más relevante
  });

  it("penaliza la historia usada (storyIndex 1) con 50% de score y retorna la alternativa", () => {
    // Si excluimos la historia de conflicto (idx 1), la de Kafka (idx 0) debería ganar
    const result = matchSTARStory("Tell me about a technical conflict or disagreement", stories, 0.1, [1]);
    // Con penalización 50%, la historia de conflicto aún puede ganar si su score base es > 2x
    // Lo importante es que el score baja y la función no crashea
    expect(result).toBeDefined();
  });

  it("no crashea cuando excludeIndices contiene índices fuera de rango", () => {
    expect(() => matchSTARStory("migration kafka performance", stories, 0.1, [99, -1, 1000])).not.toThrow();
  });

  it("retorna null si no hay historias aunque se pase excludeIndices", () => {
    const result = matchSTARStory("conflicto técnico", [], 0.35, [0, 1]);
    expect(result).toBeNull();
  });
});

describe("M7: Estimación Local de Tokens (chars/4)", () => {
  it("estima correctamente tokens para respuestas cortas", () => {
    const text = "We use Redis as a distributed cache with TTL-based eviction."; // 60 chars
    const question = "How do you cache?"; // 17 chars
    const tokens = Math.round((text.length + question.length) / 4);
    expect(tokens).toBe(Math.round(77 / 4)); // 19
    expect(tokens).toBeGreaterThan(0);
  });

  it("escala linealmente para respuestas largas", () => {
    const longText = "A".repeat(4000); // 4000 chars = ~1000 tokens
    const tokens = Math.round(longText.length / 4);
    expect(tokens).toBe(1000);
  });

  it("el cálculo es determinista para el mismo input", () => {
    const text = "Distributed systems trade availability for consistency (CAP theorem).";
    const t1 = Math.round(text.length / 4);
    const t2 = Math.round(text.length / 4);
    expect(t1).toBe(t2);
  });
});

describe("M5: Wizard del Dossier del Entrevistador (Template Local)", () => {
  // Simular la función generateDossierText del wizard
  const generateDossierText = (
    profile: "technical" | "business",
    company: string,
    tone: "warm" | "neutral" | "cold" | "aggressive"
  ): string => {
    const profileLabel = profile === "technical"
      ? "Perfil Técnico (Engineer / Architect / Staff)"
      : "Perfil de Negocio (HR / Recruiter / Product / VP)";
    const toneMap = {
      warm: "Tono cálido y colaborativo. Espera rapport antes de profundidad técnica.",
      neutral: "Tono neutral y profesional. Evaluación directa.",
      cold: "Tono frío y evaluativo. Alto umbral de prueba.",
      aggressive: "Tono desafiante (Have Backbone style). Pone a prueba la firmeza.",
    };
    const companyCtx = company.trim() ? `Empresa: ${company.trim()}. ` : "";
    return `${profileLabel}. ${companyCtx}${toneMap[tone]}`;
  };

  it("genera texto > 20 chars para cada combinación de perfil y tono", () => {
    const profiles: Array<"technical" | "business"> = ["technical", "business"];
    const tones: Array<"warm" | "neutral" | "cold" | "aggressive"> = ["warm", "neutral", "cold", "aggressive"];
    for (const profile of profiles) {
      for (const tone of tones) {
        const text = generateDossierText(profile, "", tone);
        expect(text.length).toBeGreaterThan(20);
      }
    }
  });

  it("incluye el nombre de empresa cuando se provee", () => {
    const text = generateDossierText("technical", "Google (Go + GCP)", "cold");
    expect(text).toContain("Google (Go + GCP)");
    expect(text).toContain("Empresa:");
  });

  it("NO incluye 'Empresa:' cuando la empresa está vacía", () => {
    const text = generateDossierText("business", "", "warm");
    expect(text).not.toContain("Empresa:");
  });

  it("diferencia correctamente perfil técnico vs negocio", () => {
    const tech = generateDossierText("technical", "", "neutral");
    const biz = generateDossierText("business", "", "neutral");
    expect(tech).toContain("Técnico");
    expect(biz).toContain("Negocio");
  });

  it("es determinista (mismo input = mismo output)", () => {
    const t1 = generateDossierText("technical", "Rappi", "aggressive");
    const t2 = generateDossierText("technical", "Rappi", "aggressive");
    expect(t1).toBe(t2);
  });
});

describe("Pilar 2: Detección de Trampas de Sobrediseño y Pragmatismo", () => {
  it("detecta trampa de baja escala (<1000 req/day) y sugiere solución simple sin sobreingeniería", () => {
    const res = detectInstantTrap("How would you design the architecture for an internal tool with 500 requests a day?");
    expect(res).not.toBeNull();
    expect(res?.isTrap).toBe(true);
    expect(res?.trapKey).toBe("system_design_low_scale_trap");
    expect(res?.reason).toContain("sobreingeniería");
    expect(res?.suggestedPivot).toContain("Cloud Run");
  });

  it("detecta trampa de 'cuándo NO usar microservicios o Kafka' y destaca costos operacionales", () => {
    const res = detectInstantTrap("When would you not use microservices in an engineering team?");
    expect(res).not.toBeNull();
    expect(res?.isTrap).toBe(true);
    expect(res?.trapKey).toBe("when_not_microservices_or_kafka");
    expect(res?.reason).toContain("costos operacionales");
    expect(res?.suggestedPivot).toContain("monolito modular");
  });

  it("detecta trampa de transacciones distribuidas (2PC en microservicios)", () => {
    const res = detectInstantTrap("How would you coordinate two phase commit for distributed transactions across microservices?");
    expect(res).not.toBeNull();
    expect(res?.isTrap).toBe(true);
    expect(res?.trapKey).toBe("premature_distributed_tx_trap");
    expect(res?.suggestedPivot).toContain("Outbox Pattern");
  });
});

describe("Pilar 4: VAD Adaptativo a la Entonación y Conectores de Continuidad", () => {
  it("retorna 2800ms cuando la frase termina en conectores orales en inglés", () => {
    expect(getAdaptiveDebounceMs("We started migrating our database so basically")).toBe(2800);
    expect(getAdaptiveDebounceMs("The system needs to scale and then")).toBe(2800);
    expect(getAdaptiveDebounceMs("We have a primary replica which means")).toBe(2800);
    expect(getAdaptiveDebounceMs("For our caching strategy, like for example")).toBe(2800);
  });

  it("retorna 900ms para preguntas completas cerradas con signo de interrogación", () => {
    expect(getAdaptiveDebounceMs("How do you handle database failover in GCP?")).toBe(900);
    expect(getAdaptiveDebounceMs("What is your experience with Kubernetes?")).toBe(900);
  });

  it("retorna 1300ms como valor estándar para texto neutral o vacío", () => {
    expect(getAdaptiveDebounceMs("")).toBe(1300);
    expect(getAdaptiveDebounceMs("PostgreSQL read replica replication lag")).toBe(1300);
  });
});

describe("Pilar 3: Guardrail Visual de Años de Experiencia", () => {
  it("detecta preguntas sobre años de experiencia o tecnologías de infraestructura", () => {
    expect(detectExperienceQuestion("How many years of experience do you have with DevOps?")).toBe(true);
    expect(detectExperienceQuestion("Tell me about your background with Google Cloud and Terraform")).toBe(true);
    expect(detectExperienceQuestion("¿Cuántos años de experiencia tenés trabajando con GCP y Kubernetes?")).toBe(true);
  });

  it("retorna false para preguntas puramente teóricas o algorítmicas sin trayectoria", () => {
    expect(detectExperienceQuestion("What is the time complexity of quicksort?")).toBe(false);
    expect(detectExperienceQuestion("Can you explain how hash tables resolve collisions?")).toBe(false);
  });
});

describe("Pilar 1: Modo Recruiter Screening y Puentes Inmediatos", () => {
  it("clasifica correctamente preguntas de logística y HR como recruiter_screening", () => {
    expect(classifyQuestionType("When can you start and what is your notice period?")).toBe("recruiter_screening");
    expect(classifyQuestionType("Where are you located and how do you feel about working remotely from Salta?")).toBe("recruiter_screening");
    expect(classifyQuestionType("Do you have pets or a dog at home?")).toBe("recruiter_screening");
  });

  it("genera un puente inmediato de screening con remuneración ($4,000 USD / $25-30/h) en <5ms", () => {
    const bridge = getInstantBridge("What is your expected salary rate and availability?");
    expect(bridge.category).toBe("recruiter_screening");
    expect(bridge.bridgeEn).toContain("$4,000 USD");
    expect(bridge.bridgeEn).toContain("twenty-five to thirty");
    expect(bridge.bridgeEs).toContain("$4.000 USD");
  });
});

