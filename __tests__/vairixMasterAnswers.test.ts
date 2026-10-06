import { describe, it, expect } from "vitest";
import { VAIRIX_MASTER_ANSWERS } from "../app/lib/vairixMasterAnswers";

describe("VAIRIX_MASTER_ANSWERS", () => {
  it("contiene al menos 40 respuestas maestras para VAIRIX Senior Technical Architect", () => {
    expect(VAIRIX_MASTER_ANSWERS.length).toBeGreaterThanOrEqual(40);
  });

  it("todas las respuestas pertenecen a VAIRIX y tienen contenido válido", () => {
    VAIRIX_MASTER_ANSWERS.forEach((ans) => {
      expect(ans.company).toBe("VAIRIX");
      expect(ans.role).toBe("Senior Technical Architect");
      expect(ans.question.trim().length).toBeGreaterThan(10);
      expect(ans.enText.trim().length).toBeGreaterThan(20);
      expect(ans.esText?.trim().length).toBeGreaterThan(20);
    });
  });

  it("respeta estrictamente el Zero-Bullet Mandate (sin viñetas •, -, * ni listas 1., 2.)", () => {
    VAIRIX_MASTER_ANSWERS.forEach((ans) => {
      expect(ans.enText).not.toMatch(/^[•\-\*]\s/m);
      expect(ans.enText).not.toMatch(/^\d+\.\s/m);
      if (ans.esText) {
        expect(ans.esText).not.toMatch(/^[•\-\*]\s/m);
        expect(ans.esText).not.toMatch(/^\d+\.\s/m);
      }
    });
  });

  it("la respuesta de experiencia estricta discrimina +8 IT vs ~4 Cloud", () => {
    const expAns = VAIRIX_MASTER_ANSWERS.find((a) => a.id === "vairix_experience_strict");
    expect(expAns).toBeDefined();
    expect(expAns?.enText).toContain("eight years");
    expect(expAns?.enText).toContain("four years");
    expect(expAns?.esText).toContain("ocho años");
    expect(expAns?.esText).toContain("cuatro años");
  });

  it("la respuesta de salario menciona $4,000 USD y $25-$30/h", () => {
    const salAns = VAIRIX_MASTER_ANSWERS.find((a) => a.id === "vairix_salary_expectation");
    expect(salAns).toBeDefined();
    expect(salAns?.enText).toMatch(/four thousand/i);
    expect(salAns?.enText).toMatch(/twenty-five to thirty/i);
    expect(salAns?.esText).toMatch(/cuatro mil/i);
    expect(salAns?.esText).toMatch(/veinticinco y treinta/i);
  });

  it("la respuesta de mascota menciona a Luna y nunca a gatos", () => {
    const petAns = VAIRIX_MASTER_ANSWERS.find((a) => a.id === "vairix_casual_dog_luna");
    expect(petAns).toBeDefined();
    expect(petAns?.enText).toMatch(/Luna/);
    expect(petAns?.enText).toMatch(/dog/i);
    expect(petAns?.enText).not.toMatch(/\bcats?\b/i);
    expect(petAns?.esText).toMatch(/Luna/);
    expect(petAns?.esText).toMatch(/perrita/i);
    expect(petAns?.esText).not.toMatch(/\bgatos?\b/i);
  });
});
