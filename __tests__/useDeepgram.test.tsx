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

  describe("conexión, reconnect y eventos del WS", () => {
    class FakeWebSocket {
      static instances: FakeWebSocket[] = [];
      readyState = 0;
      onopen: (() => void) | null = null;
      onmessage: ((e: { data: string }) => void) | null = null;
      onclose: (() => void) | null = null;
      onerror: ((e: unknown) => void) | null = null;
      sent: string[] = [];
      constructor(public url: string, public protocols?: string[]) {
        FakeWebSocket.instances.push(this);
      }
      send(d: string) {
        this.sent.push(d);
      }
      close() {
        this.readyState = 3;
      }
    }

    class FakeAudioContext {
      state = "running";
      sampleRate = 16000;
      destination = {};
      audioWorklet = { addModule: vi.fn().mockResolvedValue(undefined) };
      createMediaStreamSource = vi.fn(() => ({ connect: vi.fn(), disconnect: vi.fn() }));
      createChannelMerger = vi.fn(() => ({ connect: vi.fn(), disconnect: vi.fn() }));
      createGain = vi.fn(() => ({ gain: { value: 0 }, connect: vi.fn(), disconnect: vi.fn() }));
      resume = vi.fn().mockResolvedValue(undefined);
      close = vi.fn().mockResolvedValue(undefined);
    }

    class FakeWorkletNode {
      port = { onmessage: null, postMessage: vi.fn(), disconnect: vi.fn() };
      connect = vi.fn();
      disconnect = vi.fn();
    }

    const originalGlobals: Record<string, unknown> = {};

    beforeEach(() => {
      originalGlobals.WebSocket = (globalThis as any).WebSocket;
      originalGlobals.AudioContext = (globalThis as any).AudioContext;
      originalGlobals.AudioWorkletNode = (globalThis as any).AudioWorkletNode;
      originalGlobals.fetch = globalThis.fetch;

      FakeWebSocket.instances = [];
      (globalThis as any).WebSocket = FakeWebSocket;
      (globalThis as any).AudioContext = FakeAudioContext;
      (globalThis as any).AudioWorkletNode = FakeWorkletNode;
      // Response fresca por llamada: una instancia compartida tiene el body ya consumido
      globalThis.fetch = vi.fn().mockImplementation(() =>
        Promise.resolve(
          new Response(JSON.stringify({ token: "test-token", scheme: "bearer", expires_in: 120 }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          })
        )
      );
    });

    afterEach(() => {
      // Restaurar globals: si algún test futuro se reordena, los fakes no deben filtrarse
      (globalThis as any).WebSocket = originalGlobals.WebSocket;
      (globalThis as any).AudioContext = originalGlobals.AudioContext;
      (globalThis as any).AudioWorkletNode = originalGlobals.AudioWorkletNode;
      globalThis.fetch = originalGlobals.fetch as typeof globalThis.fetch;
    });

    it("conecta y pasa a live cuando el WS se abre", async () => {
      const { result } = renderHook(() => useDeepgram({ onTranscript: vi.fn() }));
      await act(async () => {
        await result.current.connect("mic");
      });

      expect(FakeWebSocket.instances.length).toBe(1);
      expect(FakeWebSocket.instances[0].url).toContain("wss://api.deepgram.com/v1/listen");

      act(() => {
        FakeWebSocket.instances[0].readyState = 1;
        FakeWebSocket.instances[0].onopen?.();
      });
      expect(result.current.status).toBe("live");
    });

    it("reintenta ante cierre inesperado y se rinde tras 3 intentos", async () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useDeepgram({ onTranscript: vi.fn() }));
      await act(async () => {
        await result.current.connect("mic");
      });
      act(() => {
        FakeWebSocket.instances[0].readyState = 1;
        FakeWebSocket.instances[0].onopen?.();
      });
      expect(result.current.status).toBe("live");

      // Cierre inesperado → schedule de reconnect con backoff 600ms
      act(() => {
        FakeWebSocket.instances[0].onclose?.();
      });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(700);
      });
      expect(FakeWebSocket.instances.length).toBe(2);

      // Segundo cierre → backoff 1200ms
      act(() => {
        FakeWebSocket.instances[1].onclose?.();
      });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1300);
      });
      expect(FakeWebSocket.instances.length).toBe(3);

      // Tercer cierre → backoff 2400ms
      act(() => {
        FakeWebSocket.instances[2].onclose?.();
      });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(2500);
      });
      expect(FakeWebSocket.instances.length).toBe(4);

      // Cuarto cierre: sin intentos disponibles → estado de error
      act(() => {
        FakeWebSocket.instances[3].onclose?.();
      });
      expect(FakeWebSocket.instances.length).toBe(4);
      expect(result.current.status).toBe("error");
    });

    it("dispara barge-in y prefetch ante intervención sustancial del entrevistador", async () => {
      const onTranscript = vi.fn();
      const onBargeIn = vi.fn();
      const onSpeculativeTurn = vi.fn();
      const onUtteranceEnd = vi.fn();
      const { result } = renderHook(() =>
        useDeepgram({ onTranscript, onBargeIn, onSpeculativeTurn, onUtteranceEnd })
      );
      await act(async () => {
        await result.current.connect("mic");
      });
      act(() => {
        FakeWebSocket.instances[0].readyState = 1;
        FakeWebSocket.instances[0].onopen?.();
      });
      const ws = FakeWebSocket.instances[0];

      // Transcript corto del entrevistador: sin barge-in
      act(() => {
        ws.onmessage?.({
          data: JSON.stringify({
            channel: { alternatives: [{ transcript: "hola", words: [{ speaker: 0 }] }] },
            is_final: false,
          }),
        });
      });
      expect(onBargeIn).not.toHaveBeenCalled();

      // Intervención sustancial (>=15 chars) y larga (>=35) → barge-in + prefetch
      act(() => {
        ws.onmessage?.({
          data: JSON.stringify({
            channel: {
              alternatives: [
                {
                  transcript: "How would you design a distributed rate limiter for our API?",
                  words: [{ speaker: 0 }],
                },
              ],
            },
            is_final: false,
          }),
        });
      });
      expect(onBargeIn).toHaveBeenCalledTimes(1);
      expect(onSpeculativeTurn).toHaveBeenCalledTimes(1);
      expect(onTranscript).toHaveBeenCalled();

      // Final de utterance
      act(() => {
        ws.onmessage?.({ data: JSON.stringify({ type: "UtteranceEnd" }) });
      });
      expect(onUtteranceEnd).toHaveBeenCalledTimes(1);
    });
  });
});
