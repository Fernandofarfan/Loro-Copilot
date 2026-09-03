// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useGazeTracker } from "../app/hooks/useGazeTracker";

describe("useGazeTracker", () => {
  it("inicializa apagado por defecto y expone funciones de control", () => {
    const { result } = renderHook(() => useGazeTracker());

    expect(result.current.isTracking).toBe(false);
    expect(result.current.isLookingAway).toBe(false);
    expect(result.current.lookawayCount).toBe(0);
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
});
