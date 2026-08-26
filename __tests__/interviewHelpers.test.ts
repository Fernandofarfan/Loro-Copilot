import { describe, it, expect } from "vitest";
import { classifyQuestion, detectTrickQuestion, fmtTime, findMatchingAnswer, checkInstantGreeting } from "../app/lib/interviewHelpers";

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

  describe("checkInstantGreeting", () => {
    it("debe reconocer saludos en español y devolver respuesta inmediata", () => {
      const res = checkInstantGreeting("Hola buenas, cómo estás?", "EPAM Systems");
      expect(res).not.toBeNull();
      expect(res?.esText).toContain("EPAM Systems");
      expect(res?.enText).toContain("EPAM Systems");
    });

    it("debe reconocer saludos en inglés", () => {
      const res = checkInstantGreeting("Hi, how is it going?", "Google");
      expect(res).not.toBeNull();
      expect(res?.enText).toContain("Google");
    });

    it("debe devolver null para preguntas técnicas o no-saludos", () => {
      const res = checkInstantGreeting("Explicame el GIL en Python", "EPAM");
      expect(res).toBeNull();
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

  describe("findMatchingAnswer", () => {
    const memory = [
      {
        id: "1",
        question: "Tell me about yourself and your experience with Python and FastAPI",
        enText: "I'm a senior backend engineer specializing in FastAPI, asyncio, and PostgreSQL.",
        esText: "Soy un ingeniero backend senior especializado en FastAPI, asyncio y PostgreSQL.",
        favorite: true,
        createdAt: Date.now(),
      },
      {
        id: "2",
        question: "How do you handle database migrations with Alembic and PostgreSQL?",
        enText: "I use Alembic with autogenerate, inspecting revisions and applying zero-downtime migrations.",
        esText: "Uso Alembic con migraciones controladas y chequeo de bloqueos en PostgreSQL.",
        favorite: false,
        createdAt: Date.now(),
      },
    ];

    it("debe encontrar coincidencia casi exacta con alta confianza", () => {
      const res = findMatchingAnswer("Tell me about yourself and your background in Python", memory, 0.4);
      expect(res).not.toBeNull();
      expect(res?.match.id).toBe("1");
      expect(res?.score).toBeGreaterThanOrEqual(0.4);
    });

    it("debe encontrar coincidencia con variación de palabras clave", () => {
      const res = findMatchingAnswer("How do you manage db migrations in alembic?", memory, 0.35);
      expect(res).not.toBeNull();
      expect(res?.match.id).toBe("2");
    });

    it("debe devolver null si la pregunta no tiene relación", () => {
      const res = findMatchingAnswer("What is your expected salary range for this position?", memory, 0.5);
      expect(res).toBeNull();
    });
  });

  describe("fmtTime", () => {
    it("debe formatear timestamps correctamente", () => {
      const str = fmtTime(1700000000000);
      expect(str).toMatch(/\d{2}:\d{2}:\d{2}/);
    });
  });
});

