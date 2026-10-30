import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { POST as simuladorPOST } from "../app/api/simulador/route";
import { POST as ttsPOST } from "../app/api/simulador/tts/route";
import { POST as summaryPOST } from "../app/api/summary/route";

// Guards y happy paths de las rutas restantes de /api (sin LLM real).
const ENV_KEYS = ["CAPACITY_CLOSED", "OPENCODE_API_KEY", "OPENAI_API_KEY", "GEMINI_API_KEY", "LORO_SHARED_TOKEN"];

describe("rutas API: simulador / tts / summary", () => {
  const savedEnv: Record<string, string | undefined> = {};
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    for (const k of ENV_KEYS) savedEnv[k] = process.env[k];
    delete process.env.CAPACITY_CLOSED;
    delete process.env.LORO_SHARED_TOKEN;
    originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    for (const k of ENV_KEYS) {
      if (savedEnv[k] === undefined) delete process.env[k];
      else process.env[k] = savedEnv[k];
    }
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  const jsonReq = (path: string, body: unknown) =>
    new Request(`http://localhost:3000${path}`, {
      method: "POST",
      headers: { origin: "http://localhost:3000", "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

  describe("/api/simulador", () => {
    it("responde 503 con CAPACITY_CLOSED", async () => {
      process.env.CAPACITY_CLOSED = "1";
      const res = await simuladorPOST(jsonReq("/api/simulador", { action: "vulnerability-radar" }));
      expect(res.status).toBe(503);
    });

    it("responde 400 con JSON inválido", async () => {
      const req = new Request("http://localhost:3000/api/simulador", {
        method: "POST",
        headers: { origin: "http://localhost:3000" },
        body: "not-json",
      });
      const res = await simuladorPOST(req);
      expect(res.status).toBe(400);
    });

    it("vulnerability-radar responde JSON sin llamar a ningún LLM", async () => {
      const res = await simuladorPOST(
        jsonReq("/api/simulador", {
          action: "vulnerability-radar",
          profile: "Dev backend con 8 años en Python y Go, migraciones a Kubernetes, ahorro de costos cloud.",
          role: "Senior Backend",
          company: "Acme",
        })
      );
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data.vulnerabilities)).toBe(true);
      expect(globalThis.fetch).not.toHaveBeenCalled();
    });

    it("feedback: 200 con el JSON del LLM mockeado", async () => {
      process.env.OPENCODE_API_KEY = "test-key";
      globalThis.fetch = vi.fn().mockImplementation(() =>
        Promise.resolve(
          new Response(
            JSON.stringify({
              choices: [
                {
                  message: {
                    content:
                      '{"score":80,"level":"Sólido","verdict":"Bien","topPriority":"a","nextStep":"b","summary":"c","indicators":[],"strengths":["x"],"improvements":["y"],"questions":[]}',
                  },
                },
              ],
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          )
        )
      );

      const res = await simuladorPOST(
        jsonReq("/api/simulador", {
          action: "feedback",
          provider: "opencode",
          model: "glm-5.3-flash",
          profile: "Dev",
          company: "Acme",
          role: "Dev",
          history: [{ question: "¿Qué es un deadlock?", answer: "Dos procesos esperando mutuamente." }],
        })
      );
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.score).toBe(80);
      expect(data.level).toBe("Sólido");
    });
  });

  describe("/api/simulador/tts", () => {
    it("responde 503 con CAPACITY_CLOSED", async () => {
      process.env.CAPACITY_CLOSED = "1";
      const res = await ttsPOST(jsonReq("/api/simulador/tts", { text: "Hola", lang: "es" }));
      expect(res.status).toBe(503);
    });

    it("responde 400 con texto vacío", async () => {
      // La ruta valida la API key antes que el texto: setearla para llegar al 400 real
      process.env.OPENAI_API_KEY = "test-key";
      const res = await ttsPOST(jsonReq("/api/simulador/tts", { text: "  ", lang: "es" }));
      expect(res.status).toBe(400);
    });

    it("devuelve audio cuando OpenAI responde ok", async () => {
      process.env.OPENAI_API_KEY = "test-key";
      globalThis.fetch = vi.fn().mockImplementation(() =>
        Promise.resolve(new Response(new ArrayBuffer(16), { status: 200 }))
      );

      const res = await ttsPOST(jsonReq("/api/simulador/tts", { text: "Hola, ¿cómo estás?", lang: "es" }));
      expect(res.status).toBe(200);
      expect(res.headers.get("Content-Type")).toContain("audio/mpeg");
    });
  });

  describe("/api/summary", () => {
    it("responde 503 con CAPACITY_CLOSED", async () => {
      process.env.CAPACITY_CLOSED = "1";
      const res = await summaryPOST(jsonReq("/api/summary", { transcript: "hola" }));
      expect(res.status).toBe(503);
    });

    it("responde 400 con JSON inválido", async () => {
      const req = new Request("http://localhost:3000/api/summary", {
        method: "POST",
        headers: { origin: "http://localhost:3000" },
        body: "{broken",
      });
      const res = await summaryPOST(req);
      expect(res.status).toBe(400);
    });
  });
});
