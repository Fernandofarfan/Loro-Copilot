import { describe, it, expect } from "vitest";
import { buildInterviewerSystemPrompt, PERSONA_DIRECTIVES } from "../app/lib/simuladorPersonas";

describe("simulador interviewer personas", () => {
  it("contiene todas las directivas de personalidades FAANG esperadas", () => {
    expect(PERSONA_DIRECTIVES.amazon_bar_raiser).toContain("BAR RAISER");
    expect(PERSONA_DIRECTIVES.amazon_bar_raiser).toContain("Leadership Principles");
    expect(PERSONA_DIRECTIVES.skeptic_architect).toContain("SKEPTIC PRINCIPAL ARCHITECT");
    expect(PERSONA_DIRECTIVES.skeptic_architect).toContain("CAP theorem");
    expect(PERSONA_DIRECTIVES.faang_recruiter).toContain("CULTURAL RECRUITER");
    expect(PERSONA_DIRECTIVES.standard).toContain("profesional, realista y directo");
  });

  it("construye el prompt del sistema incorporando la directiva de la personalidad elegida", () => {
    const barRaiserPrompt = buildInterviewerSystemPrompt("amazon_bar_raiser");
    expect(barRaiserPrompt).toContain("AMAZON BAR RAISER");
    expect(barRaiserPrompt).toContain("Tu tarea: Generar la SIGUIENTE PREGUNTA");

    const architectPrompt = buildInterviewerSystemPrompt("skeptic_architect");
    expect(architectPrompt).toContain("SKEPTIC PRINCIPAL ARCHITECT");

    const defaultPrompt = buildInterviewerSystemPrompt("unknown_persona");
    expect(defaultPrompt).toContain("profesional, realista y directo");
  });
});
