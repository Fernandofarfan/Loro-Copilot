// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDeepgram } from "../app/hooks/useDeepgram";

describe("useDeepgram", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Mocks mínimos de APIs del navegador
    (globalThis as any).MediaStream = class {
      tracks: any[];
      constructor(tracks: any[] = []) {
        this.tracks = tracks;
      }
      getTracks() {
        return this.tracks.length > 0 ? this.tracks : [{ stop: vi.fn(), kind: "audio" }];
      }
      getAudioTracks() {
        return this.tracks.length > 0 ? this.tracks : [{ stop: vi.fn(), onended: null }];
      }
      getVideoTracks() {
        return [];
      }
    };
    (globalThis as any).MediaStreamTrack = class { stop = vi.fn(); onended = null; };
    (globalThis as any).navigator = {
      mediaDevices: {
        getUserMedia: vi.fn().mockResolvedValue(new (globalThis as any).MediaStream([
          { stop: vi.fn(), kind: "audio", onended: null }
        ])),
        getDisplayMedia: vi.fn().mockResolvedValue(new (globalThis as any).MediaStream([
          { stop: vi.fn(), kind: "audio", onended: null }
        ])),
      },
      wakeLock: undefined,
    };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("debe inicializar con estado idle, activeMode 'mic' y energía en cero", () => {
    const { result } = renderHook(() =>
      useDeepgram({ onTranscript: vi.fn() })
    );
    expect(result.current.status).toBe("idle");
    expect(result.current.activeMode).toBe("mic");
    expect(result.current.isPaused).toBe(false);
    expect(result.current.errorMessage).toBeNull();
    expect(result.current.energy).toEqual({ micRms: 0, tabRms: 0 });
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

  it("debe aceptar callbacks opcionales onBargeIn y onEnergy sin fallar", () => {
    const onBargeIn = vi.fn();
    const onEnergy = vi.fn();
    const { result } = renderHook(() =>
      useDeepgram({
        onTranscript: vi.fn(),
        onBargeIn,
        onEnergy,
      })
    );
    expect(result.current.status).toBe("idle");
  });
});
