// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDeepgram } from "../app/hooks/useDeepgram";

describe("useDeepgram", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Mocks mínimos de APIs del navegador
    (globalThis as any).MediaStream = class {};
    (globalThis as any).MediaStreamTrack = class { stop = vi.fn(); };
    (globalThis as any).navigator = {
      mediaDevices: {
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: () => [{ stop: vi.fn(), kind: "audio" }],
          getAudioTracks: () => [{ stop: vi.fn() }],
        }),
        getDisplayMedia: vi.fn(),
      },
      wakeLock: undefined,
    };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("debe inicializar con estado idle y activeMode 'mic'", () => {
    const { result } = renderHook(() =>
      useDeepgram({ onTranscript: vi.fn() })
    );
    expect(result.current.status).toBe("idle");
    expect(result.current.activeMode).toBe("mic");
    expect(result.current.isPaused).toBe(false);
    expect(result.current.errorMessage).toBeNull();
  });

  it("debe alternar isPaused con togglePause", () => {
    const { result } = renderHook(() =>
      useDeepgram({ onTranscript: vi.fn() })
    );
    expect(result.current.isPaused).toBe(false);
    act(() => result.current.togglePause());
    expect(result.current.isPaused).toBe(true);
    act(() => result.current.togglePause());
    expect(result.current.isPaused).toBe(false);
  });

  it("debe exponer disconnect sin lanzar errores en estado idle", () => {
    const { result } = renderHook(() =>
      useDeepgram({ onTranscript: vi.fn() })
    );
    expect(() => act(() => result.current.disconnect())).not.toThrow();
    expect(result.current.status).toBe("idle");
  });
});
