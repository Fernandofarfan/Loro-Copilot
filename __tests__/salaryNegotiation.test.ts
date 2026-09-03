import { describe, it, expect } from "vitest";
import { classifyQuestionType } from "../app/lib/interviewHelpers";

describe("salaryNegotiation classification", () => {
  it("clasifica preguntas de pretensión salarial directas como salary_negotiation", () => {
    expect(classifyQuestionType("¿Cuáles son tus pretensiones salariales para este rol?")).toBe("salary_negotiation");
    expect(classifyQuestionType("What are your salary expectations for this senior role?")).toBe("salary_negotiation");
    expect(classifyQuestionType("¿Cuál es tu sueldo pretendido en mano o bruto?")).toBe("salary_negotiation");
    expect(classifyQuestionType("What is your current compensation and target salary range?")).toBe("salary_negotiation");
  });

  it("clasifica preguntas sobre otras ofertas o contraofertas como salary_negotiation", () => {
    expect(classifyQuestionType("¿Tenés alguna otra oferta sobre la mesa o contraoferta?")).toBe("salary_negotiation");
    expect(classifyQuestionType("Do you have another counteroffer currently?")).toBe("salary_negotiation");
  });

  it("mantiene preguntas compuestas de fit cultural como fit", () => {
    expect(classifyQuestionType("¿Por qué querés trabajar en nuestra empresa y cuáles son tus expectativas salariales?")).toBe("fit");
    expect(classifyQuestionType("Tell me about yourself and your background")).toBe("fit");
  });
});
