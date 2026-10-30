// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useAnswerStream } from "../app/hooks/useAnswerStream";
import type { MasterAnswer } from "../app/lib/interviewHelpers";

describe("useAnswerStream", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("debe inicializar con answers vacío y isGenerating false", () => {
    const { result } = renderHook(() => useAnswerStream());
    expect(result.current.answers).toEqual([]);
    expect(result.current.isGenerating).toBe(false);
    expect(result.current.generationError).toBeNull();
  });

  it("debe limpiar answers con clearAnswers", () => {
    const { result } = renderHook(() => useAnswerStream());
    // Inyectar uno manualmente via setAnswerFeedback no es viable sin contexto;
    // pero podemos validar que clearAnswers() no rompe con array vacío.
    expect(() => act(() => result.current.clearAnswers())).not.toThrow();
    expect(result.current.answers).toEqual([]);
  });

  it("debe devolver respuesta de saludo instantáneo sin llamar al fetch", async () => {
    const fetchSpy = vi.fn();
    globalThis.fetch = fetchSpy;
    const { result } = renderHook(() => useAnswerStream());

    await act(async () => {
      await result.current.requestAnswer({
        question: "Hola, ¿cómo estás?",
        transcript: "",
        company: "Acme",
        role: "Dev",
        profile: "TS dev",
        provider: "openai",
        model: "gpt-4o-mini",
      });
    });

    await waitFor(() => {
      expect(result.current.answers.length).toBe(1);
    });
    const ans = result.current.answers[0];
    expect(ans.modelName).toContain("Instantáneo");
    expect(ans.fromMemory).toBe(true);
    expect(ans.done).toBe(true);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("debe devolver respuesta de memoria local si hay match", async () => {
    const fetchSpy = vi.fn();
    globalThis.fetch = fetchSpy;
    const memory: MasterAnswer[] = [
      {
        id: "m1",
        question: "Contame sobre tu experiencia con Python",
        enText: "I am a senior Python developer.",
        esText: "Soy un dev Python senior.",
        company: "Acme",
        role: "Dev",
        category: "Tech",
        tags: ["python"],
        createdAt: Date.now(),
        favorite: true,
      },
    ];
    const { result } = renderHook(() => useAnswerStream());

    await act(async () => {
      await result.current.requestAnswer({
        question: "Contame sobre tu experiencia con Python",
        transcript: "",
        company: "Acme",
        role: "Dev",
        profile: "TS dev",
        provider: "openai",
        model: "gpt-4o-mini",
        masterAnswers: memory,
      });
    });

    await waitFor(() => {
      expect(result.current.answers.length).toBe(1);
    });
    const ans = result.current.answers[0];
    expect(ans.modelName).toContain("Memoria Local");
    expect(ans.fromMemory).toBe(true);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("debe marcar el answer con error si la API devuelve 503", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response("Capacidad agotada", { status: 503 })
    );
    const { result } = renderHook(() => useAnswerStream());

    await act(async () => {
      await result.current.requestAnswer({
        question: "Explicame microservicios",
        transcript: "",
        company: "",
        role: "",
        profile: "",
        provider: "openai",
        model: "gpt-4o-mini",
      });
    });

    await waitFor(() => {
      expect(result.current.generationError).toContain("Capacidad");
    });
    expect(result.current.answers[0].text).toContain("⚠️");
    expect(result.current.answers[0].done).toBe(true);
  });

  it("debe abortar con stopGenerating sin lanzar unhandled rejection", () => {
    const { result } = renderHook(() => useAnswerStream());
    expect(() => act(() => result.current.stopGenerating())).not.toThrow();
    expect(result.current.isGenerating).toBe(false);
  });

  it("debe manejar startSpeculativePreFetch y cancelarlo limpiamente sin error", async () => {
    globalThis.fetch = vi.fn().mockImplementation((_url, options) => {
      return new Promise((resolve, reject) => {
        if (options?.signal) {
          options.signal.addEventListener("abort", () => {
            const err = new Error("aborted");
            err.name = "AbortError";
            reject(err);
          });
        }
      });
    });

    const { result } = renderHook(() => useAnswerStream());

    // Disparar prefetch especulativo
    act(() => {
      result.current.startSpeculativePreFetch({
        question: "¿Cómo funciona el GIL y el garbage collector en Python?",
      });
    });

    // Detener de inmediato (debe abortar sin lanzar unhandled rejection)
    expect(() => {
      act(() => {
        result.current.stopGenerating();
      });
    }).not.toThrow();
  });

  it("startSpeculativePreFetch envía el contexto completo (bio, extraInstructions, facts, starStories)", async () => {
    let capturedBody: Record<string, unknown> | null = null;
    globalThis.fetch = vi.fn().mockImplementation((_url, options) => {
      capturedBody = JSON.parse(options?.body as string);
      return Promise.resolve(new Response("ok", { status: 200 }));
    });

    const { result } = renderHook(() => useAnswerStream());

    act(() => {
      result.current.startSpeculativePreFetch({
        question: "Can you explain how you handle database migrations with zero downtime?",
        interviewerBio: "Patricio & Nick",
        extraInstructions: "[MODO RECRUITER SCREENING]",
        simpleEnglish: true,
        dialect: "us",
        bilingualMode: true,
        previousAnswers: ["Answer 1", "Answer 2"],
        facts: [{ id: "fact-1", category: "decision", statement: "+8 años IT total", timestamp: 12345 }],
        starStories: [{ id: "1", title: "Migración Zero Downtime", situation: "S", task: "T", action: "A", result: "R" }],
      });
    });

    expect(capturedBody).not.toBeNull();
    const body = capturedBody as unknown as Record<string, unknown>;
    expect(body.interviewerBio).toBe("Patricio & Nick");
    expect(body.extraInstructions).toBe("[MODO RECRUITER SCREENING]");
    expect(body.simpleEnglish).toBe(true);
    expect(body.dialect).toBe("us");
    expect(body.bilingualMode).toBe(true);
    expect(body.previousAnswers).toContain("Answer 2");
    expect((body.facts as Array<{ statement: string }>)[0].statement).toBe("+8 años IT total");
    expect((body.starStories as Array<{ title: string }>)[0].title).toBe("Migración Zero Downtime");
  });

  it("debe abortar prefetch especulativo sin error cuando la pregunta final es un saludo", async () => {
    globalThis.fetch = vi.fn().mockImplementation((_url, options) => {
      return new Promise((resolve, reject) => {
        if (options?.signal) {
          options.signal.addEventListener("abort", () => {
            const err = new Error("aborted");
            err.name = "AbortError";
            reject(err);
          });
        }
      });
    });

    const { result } = renderHook(() => useAnswerStream());

    // Iniciar prefetch de pregunta larga
    act(() => {
      result.current.startSpeculativePreFetch({
        question: "Hi David, thank you for joining us today, how are you?",
      });
    });

    // Llega saludo instantáneo
    await act(async () => {
      await result.current.requestAnswer({
        question: "Hi David, thank you for joining us today, how are you doing?",
        transcript: "",
        company: "TechCorp",
        role: "Dev",
        profile: "",
        provider: "opencode",
        model: "deepseek-v4-flash",
      });
    });

    expect(result.current.answers[0].modelName).toContain("Instantáneo");
    expect(result.current.answers[0].fromMemory).toBe(true);
  });

  it("el trap detector dispara un segundo fetch de background y tolera su fallo", async () => {
    const encoder = new TextEncoder();
    const streamResponse = {
      ok: true,
      status: 200,
      body: new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode("Una respuesta corta de prueba."));
          controller.close();
        },
      }),
      text: async () => "",
    };
    const fetchSpy = vi.fn().mockImplementation((_url: string, options?: { body?: string }) => {
      if (options?.body && String(options.body).includes("trap_detector")) {
        return Promise.reject(new Error("trap falló (tolerado)"));
      }
      return Promise.resolve(streamResponse);
    });
    globalThis.fetch = fetchSpy;
    const { result } = renderHook(() => useAnswerStream());

    await act(async () => {
      await result.current.requestAnswer({
        question: "How would you design a distributed rate limiter?",
        transcript: "",
        company: "",
        role: "",
        profile: "",
        provider: "openai",
        model: "gpt-4o-mini",
      });
    });

    await waitFor(() => {
      expect(result.current.answers.length).toBe(1);
      expect(result.current.answers[0].done).toBe(true);
    });
    // 1 fetch principal + 1 del trap detector en background (>= por si se agregan
    // otras llamadas de fondo en el futuro)
    expect(fetchSpy.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it("un AbortError limpia sin mostrar error de generación", async () => {
    const abortErr = new Error("The user aborted a request.");
    abortErr.name = "AbortError";
    globalThis.fetch = vi.fn().mockRejectedValue(abortErr);
    const { result } = renderHook(() => useAnswerStream());

    await act(async () => {
      await result.current.requestAnswer({
        question: "abc",
        transcript: "",
        company: "",
        role: "",
        profile: "",
        provider: "openai",
        model: "gpt-4o-mini",
      });
    });

    expect(result.current.generationError).toBeNull();
    expect(result.current.answers.some((a) => a.text.includes("⚠️"))).toBe(false);
    expect(result.current.isGenerating).toBe(false);
  });

  it("el prefetch sin consumir se aborta solo al vencer su TTL de 60s", async () => {
    vi.useFakeTimers();
    const capturedSignals: AbortSignal[] = [];
    globalThis.fetch = vi.fn().mockImplementation((_url: string, options?: { signal?: AbortSignal }) => {
      if (options?.signal) capturedSignals.push(options.signal);
      return new Promise(() => {});
    });
    const { result } = renderHook(() => useAnswerStream());

    act(() => {
      result.current.startSpeculativePreFetch({
        question: "¿Cómo funciona el GIL y el garbage collector en Python?",
      });
    });

    expect(capturedSignals.length).toBe(1);
    expect(capturedSignals[0].aborted).toBe(false);

    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(capturedSignals[0].aborted).toBe(true);
    vi.useRealTimers();
  });

  it("arma la respuesta final desde múltiples chunks de streaming", async () => {
    const encoder = new TextEncoder();
    const chunks = [
      "[KEY] cache | edge | p99 [/KEY]\n",
      "[EN] Cache aggressively at the edge and measure p99 latency. ",
      "Prefer the simplest design that handles current load.[/EN]\n[ES] Resumen corto.[/ES]",
    ];
    globalThis.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        body: new ReadableStream({
          start(controller) {
            for (const c of chunks) controller.enqueue(encoder.encode(c));
            controller.close();
          },
        }),
        text: async () => "",
      })
    );
    const onPunchline = vi.fn();
    const { result } = renderHook(() => useAnswerStream());

    await act(async () => {
      await result.current.requestAnswer({
        question: "How would you reduce API latency?",
        transcript: "",
        company: "",
        role: "",
        profile: "",
        provider: "openai",
        model: "gpt-4o-mini",
        onPunchline,
      });
    });

    await waitFor(() => {
      expect(result.current.answers.length).toBe(1);
      expect(result.current.answers[0].done).toBe(true);
    });
    const ans = result.current.answers[0];
    expect(ans.enText).toContain("Cache aggressively at the edge");
    expect(ans.enText).toContain("current load");
    expect(ans.esText).toContain("Resumen corto");
    expect((ans.keyWords || []).map((k) => k.trim())).toEqual(["cache", "edge", "p99"]);
    expect(onPunchline).toHaveBeenCalledTimes(1);
  });

  it("la alerta del trap llega al HUD y a la card aunque los chunks no la traigan", async () => {
    const encoder = new TextEncoder();
    const fetchSpy = vi.fn().mockImplementation((_url: string, options?: { body?: string }) => {
      if (options?.body && String(options.body).includes("trap_detector")) {
        return Promise.resolve(new Response("[TRAMPA] Ojo con el trade-off [/TRAMPA]", { status: 200 }));
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        body: new ReadableStream({
          start(controller) {
            controller.enqueue(encoder.encode("[KEY] cache | edge | p99 [/KEY]\n"));
            controller.enqueue(encoder.encode("[EN] Texto de respuesta sin alerta. Segunda oración.[/EN]"));
            controller.close();
          },
        }),
        text: async () => "",
      });
    });
    globalThis.fetch = fetchSpy;
    const syncTeleprompter = vi.fn();
    const { result } = renderHook(() => useAnswerStream());

    await act(async () => {
      await result.current.requestAnswer({
        question: "How would you reduce API latency?",
        transcript: "",
        company: "",
        role: "",
        profile: "",
        provider: "openai",
        model: "gpt-4o-mini",
        syncTeleprompter,
      });
    });

    await waitFor(() => {
      expect(result.current.answers[0]?.alert).toContain("Ojo con el trade-off");
    });
    await waitFor(() => {
      const alerts = syncTeleprompter.mock.calls.map((c) => (c[0] as { alert?: string }).alert || "");
      expect(alerts.some((a) => a.includes("Ojo con el trade-off"))).toBe(true);
    });
  });
});
