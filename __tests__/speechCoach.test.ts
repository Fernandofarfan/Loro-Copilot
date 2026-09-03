// @vitest-environment node
import { describe, it, expect } from "vitest";
import { analyzeSpeech } from "../app/lib/speechCoach";

describe("speechCoach", () => {
  it("debe calcular correctamente el balance de palabras y el ratio", () => {
    const lines = [
      { text: "Could you explain your architectural experience with AWS?", speaker: 0 },
      { text: "Sure! In my last role, I led the migration from EC2 to Kubernetes, basically reducing infrastructure costs.", speaker: 1 },
    ];

    const metrics = analyzeSpeech(lines, 1);
    expect(metrics.totalWordsInterviewer).toBe(8);
    expect(metrics.totalWordsCandidate).toBe(17);
    expect(metrics.talkToListenRatio).toBe(68);
    expect(metrics.wpm).toBe(17);
  });

  it("debe detectar y contabilizar muletillas (fillers)", () => {
    const lines = [
      { text: "Bueno, este, o sea, implementamos un cluster y, nada, tipo funcionó muy bien.", speaker: 1 },
      { text: "Basically, like, we had um some latency issues you know.", speaker: 1 },
    ];

    const metrics = analyzeSpeech(lines, 1);
    expect(metrics.fillerWordsCount).toBeGreaterThan(4);
    expect(metrics.fillerWordsBreakdown["este"]).toBe(1);
    expect(metrics.fillerWordsBreakdown["o sea"]).toBe(1);
    expect(metrics.fillerWordsBreakdown["basically"]).toBe(1);
    expect(metrics.fillerWordsBreakdown["like"]).toBe(1);
  });

  it("debe proveer feedback si el candidato habla demasiado rápido", () => {
    const longText = Array(200).fill("palabra").join(" ");
    const lines = [{ text: longText, speaker: 1 }];

    const metrics = analyzeSpeech(lines, 1);
    expect(metrics.wpm).toBe(200);
    expect(metrics.pacingFeedback).toContain("muy rápido");
  });
});
