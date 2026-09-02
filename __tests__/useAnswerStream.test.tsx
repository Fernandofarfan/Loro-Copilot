// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useAnswerStream } from "../app/hooks/useAnswerStream";
import type { MasterAnswer } from "../app/lib/interviewHelpers";

describe("useAnswerStream", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    globalThis.fetch = vi.fn();
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

  it("debe abortar con stopGenerating", () => {
    const { result } = renderHook(() => useAnswerStream());
    expect(() => act(() => result.current.stopGenerating())).not.toThrow();
    expect(result.current.isGenerating).toBe(false);
  });
});
