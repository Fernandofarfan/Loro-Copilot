// @vitest-environment happy-dom
import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useGazeTracker } from "../app/hooks/useGazeTracker";

describe("useGazeTracker", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("inicializa apagado por defecto y expone funciones de control", () => {
    const { result } = renderHook(() => useGazeTracker());

    expect(result.current.isTracking).toBe(false);
    expect(result.current.isLookingAway).toBe(false);
    expect(result.current.lookawayCount).toBe(0);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.startTracking).toBe("function");
    expect(typeof result.current.stopTracking).toBe("function");
    expect(typeof result.current.toggleTracking).toBe("function");
  });

  it("detiene el tracking y limpia el estado correctamente", () => {
    const { result } = renderHook(() => useGazeTracker());

    act(() => {
      result.current.stopTracking();
    });

    expect(result.current.isTracking).toBe(false);
    expect(result.current.isLookingAway).toBe(false);
  });

  it("maneja error cuando getUserMedia no está disponible o rechaza el permiso", async () => {
    const originalMediaDevices = navigator.mediaDevices;
    Object.defineProperty(navigator, "mediaDevices", {
      value: {
        getUserMedia: vi.fn().mockRejectedValue(new Error("Permission denied")),
      },
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useGazeTracker());

    await act(async () => {
      await result.current.startTracking();
    });

    expect(result.current.isTracking).toBe(false);
    expect(result.current.error).toBe("Permission denied");

    Object.defineProperty(navigator, "mediaDevices", {
      value: originalMediaDevices,
      writable: true,
      configurable: true,
    });
  });

  it("inicia tracking exitosamente y detiene tracks al desmontar", async () => {
    const stopMock = vi.fn();
    const mockTrack = { stop: stopMock } as unknown as MediaStreamTrack;
    let mockStream: MediaStream;
    if (typeof MediaStream !== "undefined") {
      try {
        mockStream = new MediaStream();
        mockStream.getTracks = () => [mockTrack];
      } catch {
        mockStream = Object.create(MediaStream.prototype);
        mockStream.getTracks = () => [mockTrack];
      }
    } else {
      mockStream = { getTracks: () => [mockTrack] } as unknown as MediaStream;
    }

    if (typeof HTMLMediaElement !== "undefined" && HTMLMediaElement.prototype) {
      vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(() => Promise.resolve());
    }

    const originalMediaDevices = navigator.mediaDevices;
    Object.defineProperty(navigator, "mediaDevices", {
      value: {
        getUserMedia: vi.fn().mockResolvedValue(mockStream),
      },
      writable: true,
      configurable: true,
    });

    const { result, unmount } = renderHook(() => useGazeTracker());

    await act(async () => {
      await result.current.startTracking();
    });

    expect(result.current.isTracking).toBe(true);
    expect(result.current.error).toBeNull();

    act(() => {
      result.current.stopTracking();
    });
    expect(result.current.isTracking).toBe(false);
    expect(stopMock).toHaveBeenCalled();

    unmount();

    Object.defineProperty(navigator, "mediaDevices", {
      value: originalMediaDevices,
      writable: true,
      configurable: true,
    });
  });
});
