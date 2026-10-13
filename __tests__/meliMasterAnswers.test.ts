import { describe, it, expect } from "vitest";
import { MELI_NOSQL_MASTER_ANSWERS } from "../app/lib/meliMasterAnswers";
import { findMatchingAnswer } from "../app/lib/interviewHelpers";

describe("MELI_NOSQL_MASTER_ANSWERS", () => {
  it("contiene al menos 50 respuestas maestras para Mercado Libre NoSQL", () => {
    expect(MELI_NOSQL_MASTER_ANSWERS.length).toBeGreaterThanOrEqual(50);
  });

  it("todas las respuestas pertenecen a MercadoLibre", () => {
    MELI_NOSQL_MASTER_ANSWERS.forEach((ans) => {
      expect(ans.company).toBe("MercadoLibre");
      expect(ans.question.trim().length).toBeGreaterThan(10);
      expect(ans.enText.trim().length).toBeGreaterThan(20);
      expect(ans.esText?.trim().length).toBeGreaterThan(20);
    });
  });

  it("respeta el Zero-Bullet Mandate (sin viñetas •, -, * ni listas 1., 2.)", () => {
    MELI_NOSQL_MASTER_ANSWERS.forEach((ans) => {
      expect(ans.enText).not.toMatch(/^[•\-\*]\s/m);
      expect(ans.enText).not.toMatch(/^\d+\.\s/m);
      if (ans.esText) {
        expect(ans.esText).not.toMatch(/^[•\-\*]\s/m);
        expect(ans.esText).not.toMatch(/^\d+\.\s/m);
      }
    });
  });

  it("la respuesta de experiencia estricta discrimina +8 IT vs ~4 Cloud", () => {
    const expAns = MELI_NOSQL_MASTER_ANSWERS.find((a) => a.id === "meli_experience_strict");
    expect(expAns).toBeDefined();
    expect(expAns?.enText).toContain("eight years");
    expect(expAns?.enText).toContain("four years");
    expect(expAns?.esText).toContain("ocho años");
    expect(expAns?.esText).toContain("cuatro años");
  });

  it("incluye respuestas maestras específicas para la defensa técnica del challenge HackerRank (Go & NPM)", () => {
    const challengeOverview = MELI_NOSQL_MASTER_ANSWERS.find((a) => a.id === "meli_challenge_overview");
    const goStdlib = MELI_NOSQL_MASTER_ANSWERS.find((a) => a.id === "meli_challenge_go_stdlib_vs_frameworks");
    const multitenancy = MELI_NOSQL_MASTER_ANSWERS.find((a) => a.id === "meli_challenge_multitenancy_security");
    const stateMachine = MELI_NOSQL_MASTER_ANSWERS.find((a) => a.id === "meli_challenge_order_state_machine");
    const scale100k = MELI_NOSQL_MASTER_ANSWERS.find((a) => a.id === "meli_challenge_scale_100k_fury");

    expect(challengeOverview).toBeDefined();
    expect(challengeOverview?.enText).toContain("Go 1.22 stdlib");

    expect(goStdlib).toBeDefined();
    expect(goStdlib?.enText).toContain("http.ServeMux");

    expect(multitenancy).toBeDefined();
    expect(multitenancy?.enText).toContain("X-Seller-ID");

    expect(stateMachine).toBeDefined();
    expect(stateMachine?.enText).toContain("transition matrix");

    expect(scale100k).toBeDefined();
    expect(scale100k?.enText).toContain("Fury");
  });

  it("encuentra match instantáneo en memoria para preguntas del challenge Go & NoSQL", () => {
    // 1. Pregunta sobre por qué Go stdlib y no Gin
    const matchGo = findMatchingAnswer(
      "¿Por qué decidiste usar la librería estándar de Go y no frameworks como Gin o Fiber?",
      MELI_NOSQL_MASTER_ANSWERS,
      0.60,
      "MercadoLibre"
    );
    expect(matchGo).not.toBeNull();
    expect(matchGo?.match.id).toBe("meli_challenge_go_stdlib_vs_frameworks");

    // 2. Pregunta sobre multi-tenancy X-Seller-ID
    const matchTenant = findMatchingAnswer(
      "¿Cómo garantizaste el aislamiento multi-tenant entre sellers con el header X-Seller-ID?",
      MELI_NOSQL_MASTER_ANSWERS,
      0.60,
      "MercadoLibre"
    );
    expect(matchTenant).not.toBeNull();
    expect(matchTenant?.match.id).toBe("meli_challenge_multitenancy_security");

    // 3. Pregunta sobre escalabilidad en Fury
    const matchFury = findMatchingAnswer(
      "¿Cómo escalarías este sistema a 100k requests por segundo dentro del ecosistema Fury de Mercado Libre?",
      MELI_NOSQL_MASTER_ANSWERS,
      0.60,
      "MercadoLibre"
    );
    expect(matchFury).not.toBeNull();
    expect(matchFury?.match.id).toBe("meli_challenge_scale_100k_fury");
  });
});


