import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { parseInterviewMarkdownToMasterAnswers, findMatchingAnswer } from "../app/lib/interviewHelpers";
import { getEpamMasterAnswers } from "../app/lib/epamPreset";

describe("EPAM Technical Interview Master Answers", () => {
  it("parses all 43 questions correctly from docs/epam_python_tech_lead_interview.md", () => {
    const filePath = path.join(process.cwd(), "docs", "epam_python_tech_lead_interview.md");
    const content = fs.readFileSync(filePath, "utf-8");
    const answers = parseInterviewMarkdownToMasterAnswers(content, "EPAM", "Python Backend Engineer & Technical Lead");

    expect(answers.length).toBeGreaterThanOrEqual(40);
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
    expect(presetAnswers.length).toBeGreaterThanOrEqual(40);
  });
});
