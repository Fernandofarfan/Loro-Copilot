import { describe, it, expect } from "vitest";
import { parseModelJson } from "../app/lib/llm";

describe("llm utilities", () => {
  describe("parseModelJson", () => {
    it("debe parsear JSON plano", () => {
      const input = '{"score": 85, "verdict": "Avanzás a la siguiente ronda"}';
      const result: any = parseModelJson(input);
      expect(result.score).toBe(85);
      expect(result.verdict).toBe("Avanzás a la siguiente ronda");
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
});
