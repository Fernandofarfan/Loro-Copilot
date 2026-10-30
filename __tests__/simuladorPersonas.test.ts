import { describe, it, expect } from "vitest";
import { buildInterviewerSystemPrompt, PERSONA_DIRECTIVES } from "../app/lib/simuladorPersonas";
import { normalizeFeedbackReport } from "../app/simulador/types";

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

  it("normalizeFeedbackReport normaliza reports completos y tolera inputs nulos o incompletos", () => {
    const emptyReport = normalizeFeedbackReport(null);
    expect(emptyReport.score).toBe(0);
    expect(emptyReport.strengths).toEqual([]);
    expect(emptyReport.improvements).toEqual([]);
    expect(emptyReport.questions).toEqual([]);

    const fullReport = normalizeFeedbackReport({
      score: 88,
      level: "Staff",
      verdict: "Strong Hire",
      summary: "Excelente comunicación y trade-offs claros.",
      indicators: [{ name: "Arquitectura", score: 90 }],
      strengths: ["Concurrencia", "Zero-Bullet format"],
      improvements: ["Profundizar en Raft"],
      questions: [{ question: "¿Cómo mitigás split-brain?", answer: "Quórum impar", score: 95 }],
    });
    expect(fullReport.score).toBe(88);
    expect(fullReport.level).toBe("Staff");
    expect(fullReport.indicators?.[0].score).toBe(90);
    expect(fullReport.strengths).toContain("Concurrencia");
    expect(fullReport.questions[0].score).toBe(95);
  });
});
