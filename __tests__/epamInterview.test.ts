import { describe, it, expect } from "vitest";
import { findMatchingAnswer } from "../app/lib/interviewHelpers";
import { getEpamMasterAnswers } from "../app/lib/epamPreset";

describe("EPAM Technical Interview Master Answers", () => {
  it("matches key questions accurately via getEpamMasterAnswers()", () => {
    const answers = getEpamMasterAnswers();

    expect(answers.length).toBe(85);
    expect(answers[0].company).toBe("EPAM");
    expect(answers[0].role).toBe("Python Backend Engineer & Technical Lead");

    // Validar preguntas clave
    const matchIntro = findMatchingAnswer("Tell me about yourself and your background", answers, 0.60, "EPAM", "Python Backend Engineer & Technical Lead");
    expect(matchIntro).not.toBeNull();
    expect(matchIntro?.match.enText).toContain("Senior Python Backend Engineer");

    const matchGil = findMatchingAnswer("What is the Python GIL and how do you handle CPU-bound tasks?", answers, 0.50, "EPAM", "Python Backend Engineer & Technical Lead");
    expect(matchGil).not.toBeNull();
    expect(matchGil?.match.enText).toContain("GIL");

    const matchRag = findMatchingAnswer("How do you design a production RAG pipeline?", answers, 0.50, "EPAM", "Python Backend Engineer & Technical Lead");
    expect(matchRag).not.toBeNull();
    expect(matchRag?.match.enText).toContain("RAG");

    const matchAiDev = findMatchingAnswer("How have you applied AI to software development and PR reviews?", answers, 0.45, "EPAM", "Python Backend Engineer & Technical Lead");
    expect(matchAiDev).not.toBeNull();
    expect(matchAiDev?.match.enText).toContain("PR review agent");
  });

  it("loads all preset answers via getEpamMasterAnswers()", () => {
    const presetAnswers = getEpamMasterAnswers();
    expect(presetAnswers.length).toBe(85);
  });
});
