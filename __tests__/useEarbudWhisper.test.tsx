// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useEarbudWhisper } from "../app/hooks/useEarbudWhisper";

class FakeUtterance {
  text: string;
  rate = 1;
  volume = 1;
  lang = "";
  voice: unknown = null;
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(text: string) {
    this.text = text;
  }
}

describe("useEarbudWhisper", () => {
  let speak: ReturnType<typeof vi.fn>;
  let cancel: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    speak = vi.fn();
    cancel = vi.fn();
    (window as unknown as Record<string, unknown>).speechSynthesis = {
      speak,
      cancel,
      getVoices: () => [],
    };
    (window as unknown as Record<string, unknown>).SpeechSynthesisUtterance = FakeUtterance;
  });

  it("está deshabilitado por default y whisper() no habla", () => {
    const { result } = renderHook(() => useEarbudWhisper());
    expect(result.current.isEnabled).toBe(false);
    act(() => {
      result.current.whisper("Hello there my friend. Second sentence.");
    });
    expect(speak).not.toHaveBeenCalled();
  });

  it("con defaultEnabled habla la primera frase con rate 1.45", () => {
    const { result } = renderHook(() => useEarbudWhisper({ defaultEnabled: true }));
    act(() => {
      result.current.whisper("Hello there my friend. Second sentence.");
    });
    expect(speak).toHaveBeenCalledTimes(1);
    const utterance = speak.mock.calls[0][0] as FakeUtterance;
    expect(utterance.text).toBe("Hello there my friend");
    expect(utterance.rate).toBeCloseTo(1.45);
  });

  it("limpia los bloques [KEY]/[EN] antes de hablar", () => {
    const { result } = renderHook(() => useEarbudWhisper({ defaultEnabled: true }));
    act(() => {
      result.current.whisper("[KEY] alpha | beta | gamma [/KEY]\n[EN] Texto que no debería sonar.");
    });
    const utterance = speak.mock.calls[0][0] as FakeUtterance;
    expect(utterance.text).not.toContain("[KEY]");
    expect(utterance.text).not.toContain("|");
  });

  it("stop() cancela la síntesis y apaga isSpeaking", () => {
    const { result } = renderHook(() => useEarbudWhisper({ defaultEnabled: true }));
    act(() => {
      result.current.whisper("Hello there my friend.");
    });
    const utterance = speak.mock.calls[0][0] as FakeUtterance;
    act(() => {
      utterance.onstart?.();
    });
    expect(result.current.isSpeaking).toBe(true);

    act(() => {
      result.current.stop();
    });
    expect(cancel).toHaveBeenCalled();
    expect(result.current.isSpeaking).toBe(false);
  });

  it("stopIfActive corta el susurro activo del earbud", () => {
    const { result } = renderHook(() => useEarbudWhisper({ defaultEnabled: true }));
    act(() => {
      result.current.whisper("Hello there my friend.");
    });
    expect(speak).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.stopIfActive();
    });
    expect(cancel).toHaveBeenCalled();
  });

  it("stopIfActive no toca un TTS que no es del earbud", () => {
    const { result } = renderHook(() => useEarbudWhisper({ defaultEnabled: true }));
    // TTS manual (p.ej. el botón "Escuchar"): speechSynthesis habla sin pasar por whisper()
    (speak as unknown as (u: FakeUtterance) => void)(new FakeUtterance("manual playback"));
    cancel.mockClear();

    act(() => {
      result.current.stopIfActive();
    });
    expect(cancel).not.toHaveBeenCalled();
  });

  it("si speak() lanza, activeRef no queda colgado y no se propaga el error", () => {
    const { result } = renderHook(() => useEarbudWhisper({ defaultEnabled: true }));
    speak.mockImplementationOnce(() => {
      throw new Error("speechSynthesis roto");
    });

    expect(() =>
      act(() => {
        result.current.whisper("Hello there my friend.");
      })
    ).not.toThrow();

    // Sin susurro activo: stopIfActive no debe cancelar nada (protege el TTS manual)
    cancel.mockClear();
    act(() => {
      result.current.stopIfActive();
    });
    expect(cancel).not.toHaveBeenCalled();
  });
});
