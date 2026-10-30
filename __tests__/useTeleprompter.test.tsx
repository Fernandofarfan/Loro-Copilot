// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTeleprompter } from "../app/hooks/useTeleprompter";

describe("useTeleprompter", () => {
  beforeEach(() => {
    localStorage.clear();
    // @ts-ignore
    globalThis.BroadcastChannel = class {
      postMessage = vi.fn();
      close = vi.fn();
      addEventListener = vi.fn();
      removeEventListener = vi.fn();
    };
    // Mock window.open para evitar pop-ups reales
    (globalThis as any).window.open = vi.fn().mockReturnValue({
      focus: vi.fn(),
      closed: false,
    });
    (globalThis as any).window.screen = { width: 1920 };
  });

  it("debe inicializar con isOpen en false", () => {
    const { result } = renderHook(() => useTeleprompter());
    expect(result.current.isOpen).toBe(false);
  });

  it("debe sincronizar payload a localStorage", () => {
    const { result } = renderHook(() => useTeleprompter());
    act(() =>
      result.current.syncTeleprompter({
        question: "Q?",
        enText: "Answer",
        cleanText: "Answer",
        isGenerating: false,
        modelName: "Test",
      })
    );
    const stored = JSON.parse(localStorage.getItem("loro_teleprompter_data") || "{}");
    expect(stored.question).toBe("Q?");
    expect(stored.enText).toBe("Answer");
    expect(stored.modelName).toBe("Test");
  });

  it("debe abrir ventana y setear isOpen en true", () => {
    const { result } = renderHook(() => useTeleprompter());
    act(() => result.current.openTeleprompter());
    expect(result.current.isOpen).toBe(true);
  });

  it("no debe crashear si localStorage lanza (quota exceeded)", () => {
    const { result } = renderHook(() => useTeleprompter());
    const setItemSpy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceeded");
    });
    expect(() =>
      act(() =>
        result.current.syncTeleprompter({ question: "X", isGenerating: true })
      )
    ).not.toThrow();
    setItemSpy.mockRestore();
  });

  it("un turno nuevo depura los paneles del turno anterior en lo persistido", () => {
    const { result } = renderHook(() => useTeleprompter());
    act(() =>
      result.current.syncTeleprompter({
        question: "Pregunta A",
        alert: "Ojo con el trade-off",
        matchedStory: { storyIndex: 0, title: "Historia", action: "a", result: "r", score: 8 },
        keyWords: ["uno", "dos"],
      })
    );
    act(() =>
      result.current.syncTeleprompter({
        question: "Pregunta B",
        cleanText: "Texto nuevo",
      })
    );

    const stored = JSON.parse(localStorage.getItem("loro_teleprompter_data") || "{}");
    expect(stored.question).toBe("Pregunta B");
    expect(stored.cleanText).toBe("Texto nuevo");
    // Los paneles/avisos del turno A no deben sobrevivir al turno B
    expect(stored.alert).toBeUndefined();
    expect(stored.matchedStory).toBeUndefined();
    expect(stored.keyWords).toBeUndefined();
  });

  it("la misma pregunta no depura sus paneles", () => {
    const { result } = renderHook(() => useTeleprompter());
    act(() =>
      result.current.syncTeleprompter({ question: "Pregunta A", alert: "Trap A", keyWords: ["x"] })
    );
    act(() =>
      result.current.syncTeleprompter({ question: "Pregunta A", cleanText: "Texto final" })
    );

    const stored = JSON.parse(localStorage.getItem("loro_teleprompter_data") || "{}");
    expect(stored.alert).toBe("Trap A");
    expect(stored.keyWords).toEqual(["x"]);
    expect(stored.cleanText).toBe("Texto final");
  });
});
