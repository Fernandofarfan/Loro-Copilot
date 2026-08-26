import { describe, it, expect } from "vitest";
import { classifyQuestion, detectTrickQuestion, fmtTime } from "../app/lib/interviewHelpers";

describe("interviewHelpers", () => {
  describe("classifyQuestion", () => {
    it("debe clasificar preguntas de pretensión salarial", () => {
      const res = classifyQuestion("¿Cuáles son tus pretensiones salariales para este rol?");
      expect(res.label).toContain("Pretensión Salarial");
    });

    it("debe clasificar preguntas comportamentales / STAR", () => {
      const res = classifyQuestion("Contame una situación donde tuviste un conflicto con un compañero de equipo.");
      expect(res.label).toContain("Comportamental");
    });

    it("debe clasificar preguntas técnicas", () => {
      const res = classifyQuestion("¿Cuál es la diferencia entre asyncio y multiprocessing en Python?");
      expect(res.label).toContain("Pregunta Técnica");
    });

    it("debe clasificar preguntas generales como fallback", () => {
      const res = classifyQuestion("¿Cómo estás hoy?");
      expect(res.label).toContain("General");
    });
  });

  describe("detectTrickQuestion", () => {
    it("debe detectar preguntas trampa sobre debilidades o despidos", () => {
      const warning = detectTrickQuestion("¿Cuál es tu mayor defecto o peor error?");
      expect(warning).not.toBeNull();
      expect(warning).toContain("Pregunta Delicada");
    });

    it("debe devolver null para preguntas normales", () => {
      const warning = detectTrickQuestion("Explicame tu experiencia con React y TypeScript");
      expect(warning).toBeNull();
    });
  });

  describe("fmtTime", () => {
    it("debe formatear timestamps correctamente", () => {
      const str = fmtTime(1700000000000);
      expect(str).toMatch(/\d{2}:\d{2}:\d{2}/);
    });
  });
});
