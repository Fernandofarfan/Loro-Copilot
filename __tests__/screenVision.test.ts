// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useScreenVision } from "../app/hooks/useScreenVision";

describe("useScreenVision", () => {
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
});
