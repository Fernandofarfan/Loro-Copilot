// @vitest-environment node
import { describe, it, expect, vi } from "vitest";
import { parseModelJson, resolveProvider, resolveModel, FALLBACK_MODELS } from "../app/lib/llm";

describe("llm utilities", () => {
  describe("parseModelJson", () => {
    it("debe parsear JSON plano de objeto", () => {
      const input = '{"score": 85, "verdict": "Avanzás a la siguiente ronda"}';
      const result: any = parseModelJson(input);
      expect(result.score).toBe(85);
      expect(result.verdict).toBe("Avanzás a la siguiente ronda");
    });

    it("debe parsear JSON array de preguntas de warmup", () => {
      const input = '[{"question": "Q1", "enText": "A1"}, {"question": "Q2", "enText": "A2"}]';
      const result: any = parseModelJson(input);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
      expect(result[0].question).toBe("Q1");
    });

    it("debe parsear JSON envuelto en bloques markdown ```json", () => {
      const input = "```json\n{\n  \"score\": 90,\n  \"strengths\": [\"Python\", \"FastAPI\"]\n}\n```";
      const result: any = parseModelJson(input);
      expect(result.score).toBe(90);
      expect(result.strengths).toEqual(["Python", "FastAPI"]);
    });

    it("debe parsear JSON embebido dentro de texto explicativo", () => {
      const input = "Aquí está tu análisis:\n\n{\"score\": 75, \"summary\": \"Buen perfil\"}\n\nEspero te sirva.";
      const result: any = parseModelJson(input);
      expect(result.score).toBe(75);
      expect(result.summary).toBe("Buen perfil");
    });

    it("debe lanzar error si el texto no contiene JSON válido", () => {
      expect(() => parseModelJson("Esto no es un JSON")).toThrow();
    });
  });

  describe("resolveProvider y resolveModel", () => {
    it("debe resolver proveedor solicitado si es válido", () => {
      expect(resolveProvider("gemini")).toBe("gemini");
      expect(resolveProvider("anthropic")).toBe("anthropic");
      expect(resolveProvider("openai")).toBe("openai");
      expect(resolveProvider("opencode")).toBe("opencode");
    });

    it("debe resolver modelo por defecto para cada proveedor", () => {
      expect(resolveModel("gemini")).toContain("gemini");
      expect(resolveModel("openai")).toContain("gpt");
      expect(resolveModel("anthropic")).toContain("claude");
    });

    it("debe respetar modelo solicitado explícitamente", () => {
      expect(resolveModel("gemini", "custom-model-id")).toBe("custom-model-id");
    });

    it("debe mantener fallbacks acotados a máximo 3 modelos por proveedor", () => {
      expect(FALLBACK_MODELS.opencode.length).toBeLessThanOrEqual(3);
      expect(FALLBACK_MODELS.gemini.length).toBeLessThanOrEqual(3);
      expect(FALLBACK_MODELS.openai.length).toBeLessThanOrEqual(3);
      expect(FALLBACK_MODELS.anthropic.length).toBeLessThanOrEqual(3);
      expect(FALLBACK_MODELS.openrouter.length).toBeLessThanOrEqual(3);
    });

    it("debe mantener fallbacks ≤3 incluso con OPENCODE_MODEL custom seteado", async () => {
      process.env.OPENCODE_MODEL = "test-custom-model-opencode";
      vi.resetModules();
      const mod = await import("../app/lib/llm");
      expect(mod.FALLBACK_MODELS.opencode.length).toBeLessThanOrEqual(3);
      delete process.env.OPENCODE_MODEL;
    });

    it("debe mantener fallbacks ≤3 incluso con GEMINI_MODEL custom seteado", async () => {
      process.env.GEMINI_MODEL = "test-custom-model-gemini";
      vi.resetModules();
      const mod = await import("../app/lib/llm");
      expect(mod.FALLBACK_MODELS.gemini.length).toBeLessThanOrEqual(3);
      delete process.env.GEMINI_MODEL;
    });
  });
});
