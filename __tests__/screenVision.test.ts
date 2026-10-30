// @vitest-environment happy-dom
import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useScreenVision } from "../app/hooks/useScreenVision";

const originalMediaDevices = navigator.mediaDevices;

describe("useScreenVision", () => {
  afterEach(() => {
    vi.useRealTimers();
    Object.defineProperty(navigator, "mediaDevices", {
      value: originalMediaDevices,
      writable: true,
      configurable: true,
    });
  });
  it("inicializa con isCapturing en false y error en null", () => {
    const { result } = renderHook(() => useScreenVision());
    expect(result.current.isCapturing).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("maneja error cuando getDisplayMedia no está disponible", async () => {
    // Simular que getDisplayMedia no existe
    const originalMediaDevices = navigator.mediaDevices;
    Object.defineProperty(navigator, "mediaDevices", {
      value: {},
      writable: true,
      configurable: true,
    });

    const onError = vi.fn();
    const { result } = renderHook(() => useScreenVision({ onError }));

    await act(async () => {
      const res = await result.current.captureScreenFrame();
      expect(res).toBeNull();
    });

    expect(onError).toHaveBeenCalled();
    expect(result.current.error).toMatch(/no está soportada/i);

    // Restaurar
    Object.defineProperty(navigator, "mediaDevices", {
      value: originalMediaDevices,
      writable: true,
      configurable: true,
    });
  });

  it("descarta la captura con timeout si onloadedmetadata nunca llega y libera los tracks", async () => {
    const stop = vi.fn();
    const fakeStream = {
      getVideoTracks: () => [{ stop }],
      getTracks: () => [{ stop }],
    };
    Object.defineProperty(navigator, "mediaDevices", {
      value: { getDisplayMedia: vi.fn().mockResolvedValue(fakeStream) },
      writable: true,
      configurable: true,
    });

    vi.useFakeTimers();
    const onError = vi.fn();
    const { result } = renderHook(() => useScreenVision({ onError }));

    let pending: Promise<string | null> | null = null;
    await act(async () => {
      pending = result.current.captureScreenFrame();
      // El timeout de onloadedmetadata es 5s: sin él, el share quedaría colgado
      await vi.advanceTimersByTimeAsync(5000);
    });
    const res = await pending;

    expect(res).toBeNull();
    expect(stop).toHaveBeenCalled();
    expect(onError).toHaveBeenCalled();
    expect(result.current.isCapturing).toBe(false);
    vi.useRealTimers();
  });

  it("trata la cancelación del diálogo por el usuario (Permission denied) como no-error silencioso", async () => {
    Object.defineProperty(navigator, "mediaDevices", {
      value: { getDisplayMedia: vi.fn().mockRejectedValue(new Error("Permission denied")) },
      writable: true,
      configurable: true,
    });

    const onError = vi.fn();
    const { result } = renderHook(() => useScreenVision({ onError }));

    let res: string | null = "dummy";
    await act(async () => {
      res = await result.current.captureScreenFrame();
    });

    expect(res).toBeNull();
    expect(onError).not.toHaveBeenCalled();
    expect(result.current.error).toBeNull();
    expect(result.current.isCapturing).toBe(false);
  });
});
