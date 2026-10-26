import { describe, it, expect } from "vitest";
import { SNAPPY_COMMERCE_MASTER_ANSWERS } from "../app/lib/snappyCommerceMasterAnswers";

describe("SNAPPY_COMMERCE_MASTER_ANSWERS", () => {
  it("contiene al menos 22 respuestas maestras para Snappy Commerce Full Stack Developer", () => {
    expect(SNAPPY_COMMERCE_MASTER_ANSWERS.length).toBeGreaterThanOrEqual(22);
  });

  it("todas las respuestas pertenecen a SnappyCommerce y tienen contenido válido", () => {
    SNAPPY_COMMERCE_MASTER_ANSWERS.forEach((ans) => {
      expect(ans.company).toBe("SnappyCommerce");
      expect(ans.role).toBe("Full Stack Developer (Vue.js / Node.js / AI)");
      expect(ans.question.trim().length).toBeGreaterThan(10);
      expect(ans.enText.trim().length).toBeGreaterThan(20);
      expect(ans.esText?.trim().length).toBeGreaterThan(20);
    });
  });

  it("respeta estrictamente el Zero-Bullet Mandate (sin viñetas •, -, * ni listas 1., 2.)", () => {
    SNAPPY_COMMERCE_MASTER_ANSWERS.forEach((ans) => {
      expect(ans.enText).not.toMatch(/^[•\-\*]\s/m);
      expect(ans.enText).not.toMatch(/^\d+\.\s/m);
      if (ans.esText) {
        expect(ans.esText).not.toMatch(/^[•\-\*]\s/m);
        expect(ans.esText).not.toMatch(/^\d+\.\s/m);
      }
    });
  });

  it("cubre temas clave para Nick: reactividad Vue 3, concurrencia PostgreSQL, idempotencia y búsqueda semántica", () => {
    const ids = SNAPPY_COMMERCE_MASTER_ANSWERS.map((a) => a.id);
    expect(ids).toContain("snappy_vue_reactivity_ref_reactive");
    expect(ids).toContain("snappy_stock_concurrency_race_conditions");
    expect(ids).toContain("snappy_api_idempotency_payments");
    expect(ids).toContain("snappy_payment_webhooks_security");
    expect(ids).toContain("snappy_ai_semantic_search_embeddings");
    expect(ids).toContain("snappy_abandoned_cart_recovery_arch");
  });

  it("la respuesta de ubicación menciona Salta, Luna y casa en Almagro", () => {
    const locAns = SNAPPY_COMMERCE_MASTER_ANSWERS.find((a) => a.id === "snappy_location_and_caba_meetups");
    expect(locAns).toBeDefined();
    expect(locAns?.enText).toContain("Salta");
    expect(locAns?.enText).toContain("Luna");
    expect(locAns?.enText).toContain("Almagro");
    expect(locAns?.esText).toContain("Salta");
    expect(locAns?.esText).toContain("Luna");
    expect(locAns?.esText).toContain("Almagro");
  });

  it("incluye preguntas de cierre orientadas específicamente a Patricio y a Nick", () => {
    const closing = SNAPPY_COMMERCE_MASTER_ANSWERS.find((a) => a.id === "snappy_questions_for_patricio_and_nick");
    expect(closing).toBeDefined();
    expect(closing?.esText).toContain("Nick");
    expect(closing?.esText).toContain("Patricio");
  });
});
