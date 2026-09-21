import { describe, it, expect } from "vitest";
import { MELI_NOSQL_MASTER_ANSWERS } from "../app/lib/meliMasterAnswers";

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
});
