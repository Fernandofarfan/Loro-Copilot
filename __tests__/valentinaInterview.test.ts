import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { parseInterviewMarkdownToMasterAnswers, findMatchingAnswer } from "../app/lib/interviewHelpers";
import { getValentinaMasterAnswers } from "../app/lib/valentinaPreset";

describe("Valentina Lopez Salinas (COMPANY86 / US Enterprise) Master Answers", () => {
  it("parses all 23 questions correctly from docs/valentina_backend_interview_memory.md", () => {
    const filePath = path.join(process.cwd(), "docs", "valentina_backend_interview_memory.md");
    const content = fs.readFileSync(filePath, "utf-8");
    const answers = parseInterviewMarkdownToMasterAnswers(
      content,
      "COMPANY86 / US Enterprise Client",
      "Senior Python Backend Engineer & Technical Lead"
    );

    expect(answers.length).toBe(23);
    expect(answers[0].company).toBe("COMPANY86 / US Enterprise Client");
    expect(answers[0].role).toBe("Senior Python Backend Engineer & Technical Lead");

    // Match pets / animales
    const matchPets = findMatchingAnswer(
      "Do you have any pets or dogs at home?",
      answers,
      0.45,
      "COMPANY86 / US Enterprise Client",
      "Senior Python Backend Engineer & Technical Lead"
    );
    expect(matchPets).not.toBeNull();
    expect(matchPets?.match.enText).toContain("pets at home");

    // Match hobbies / pasatiempos
    const matchHobbies = findMatchingAnswer(
      "What are your hobbies and free time activities?",
      answers,
      0.45,
      "COMPANY86 / US Enterprise Client",
      "Senior Python Backend Engineer & Technical Lead"
    );
    expect(matchHobbies).not.toBeNull();
    expect(matchHobbies?.match.enText).toContain("cycling");

    // Match location / favorite place
    const matchLocation = findMatchingAnswer(
      "Where do you live and what is your favorite place?",
      answers,
      0.45,
      "COMPANY86 / US Enterprise Client",
      "Senior Python Backend Engineer & Technical Lead"
    );
    expect(matchLocation).not.toBeNull();
    expect(matchLocation?.match.enText).toContain("Salta");

    // Match intro question
    const matchIntro = findMatchingAnswer(
      "Tell me about yourself and your background",
      answers,
      0.55,
      "COMPANY86 / US Enterprise Client",
      "Senior Python Backend Engineer & Technical Lead"
    );
    expect(matchIntro).not.toBeNull();
    expect(matchIntro?.match.enText).toContain("Senior Python Backend Engineer");

    // Match Python & FastAPI question
    const matchPython = findMatchingAnswer(
      "What is your experience with Python and FastAPI?",
      answers,
      0.50,
      "COMPANY86 / US Enterprise Client",
      "Senior Python Backend Engineer & Technical Lead"
    );
    expect(matchPython).not.toBeNull();
    expect(matchPython?.match.enText).toContain("FastAPI");

    // Match GenAI / RAG / Vertex AI question
    const matchGenAi = findMatchingAnswer(
      "How have you built Generative AI solutions with Vertex AI and RAG?",
      answers,
      0.45,
      "COMPANY86 / US Enterprise Client",
      "Senior Python Backend Engineer & Technical Lead"
    );
    expect(matchGenAi).not.toBeNull();
    expect(matchGenAi?.match.enText).toContain("Vertex AI");

    // Match Hybrid Puerto Madero question
    const matchHybrid = findMatchingAnswer(
      "Are you willing to work in Puerto Madero two days a week?",
      answers,
      0.45,
      "COMPANY86 / US Enterprise Client",
      "Senior Python Backend Engineer & Technical Lead"
    );
    expect(matchHybrid).not.toBeNull();
    expect(matchHybrid?.match.enText).toContain("Puerto Madero");
  });

  it("loads all 23 preset answers via getValentinaMasterAnswers()", () => {
    const presetAnswers = getValentinaMasterAnswers();
    expect(presetAnswers.length).toBe(23);
  });
});
