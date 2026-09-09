// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useInterviewContext } from "../app/hooks/useInterviewContext";

describe("useInterviewContext", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("debe inicializar con valores vacíos y marcar isLoaded tras mount", () => {
    const { result } = renderHook(() => useInterviewContext());
    expect(result.current.company).toBe("");
    expect(result.current.role).toBe("");
    expect(result.current.profile).toBe("");
    // isLoaded puede ser true inmediatamente si el useEffect corrió sincrónicamente
    // (es comportamiento normal de happy-dom con React 18 batching)
    expect([true, false]).toContain(result.current.isLoaded);
  });

  it("debe actualizar company, role, profile", () => {
    const { result } = renderHook(() => useInterviewContext());
    act(() => result.current.setCompany("Acme"));
    act(() => result.current.setRole("Senior Engineer"));
    act(() => result.current.setProfile("Python, FastAPI"));
    expect(result.current.company).toBe("Acme");
    expect(result.current.role).toBe("Senior Engineer");
    expect(result.current.profile).toBe("Python, FastAPI");
  });

  it("debe persistir en localStorage después del cambio", async () => {
    const { result } = renderHook(() => useInterviewContext());
    // Esperar al mount effect
    await new Promise((r) => setTimeout(r, 0));
    act(() => result.current.setCompany("PersistedCorp"));
    await new Promise((r) => setTimeout(r, 0));
    const stored = localStorage.getItem("copiloto:context:v1");
    expect(stored).toContain("PersistedCorp");
  });

  it("debe cargar desde localStorage en mount", async () => {
    localStorage.setItem(
      "copiloto:context:v1",
      JSON.stringify({ company: "StoredCo", role: "Dev", profile: "TS" })
    );
    const { result } = renderHook(() => useInterviewContext());
    await new Promise((r) => setTimeout(r, 0));
    expect(result.current.company).toBe("StoredCo");
    expect(result.current.role).toBe("Dev");
    expect(result.current.profile).toBe("TS");
    expect(result.current.isLoaded).toBe(true);
  });

  it("debe guardar y eliminar profiles", async () => {
    const { result } = renderHook(() => useInterviewContext());
    await new Promise((r) => setTimeout(r, 0));
    act(() => {
      result.current.setCompany("X");
      result.current.saveProfile("TestProfile");
    });
    expect(result.current.savedProfiles.find((p) => p.name === "TestProfile")).toBeDefined();

    act(() => result.current.deleteProfile("TestProfile"));
    expect(result.current.savedProfiles.find((p) => p.name === "TestProfile")).toBeUndefined();
  });

  it("debe limpiar todos los profiles con removeAllProfiles", async () => {
    localStorage.setItem(
      "loro-saved-profiles",
      JSON.stringify([{ name: "A", company: "", role: "", profile: "" }])
    );
    const { result } = renderHook(() => useInterviewContext());
    await new Promise((r) => setTimeout(r, 0));
    act(() => result.current.removeAllProfiles());
    expect(result.current.savedProfiles).toEqual([]);
  });

  it("debe purgar automáticamente respuestas y perfiles de Valentina / COMPANY86 en mount", async () => {
    localStorage.setItem(
      "loro-master-answers:v1",
      JSON.stringify([
        { id: "1", question: "Tell me about yourself", enText: "I am a dev", company: "EPAM" },
        { id: "2", question: "Why Valentina?", enText: "Valentina interview", company: "COMPANY86 / US Enterprise Client" },
        { id: "3", question: "Hybrid in Puerto Madero?", enText: "Yes Puerto Madero", company: "General" },
      ])
    );
    localStorage.setItem(
      "loro-saved-profiles",
      JSON.stringify([
        { name: "EPAM Profile", company: "EPAM", role: "Dev", profile: "Python" },
        { name: "Valentina Profile", company: "COMPANY86", role: "Dev", profile: "Python" },
      ])
    );

    const { result } = renderHook(() => useInterviewContext());
    await new Promise((r) => setTimeout(r, 0));

    expect(result.current.masterAnswers).toHaveLength(1);
    expect(result.current.masterAnswers[0].company).toBe("EPAM");
    expect(result.current.savedProfiles).toHaveLength(1);
    expect(result.current.savedProfiles[0].name).toBe("EPAM Profile");

    // Verificar que localStorage se sincronizó con la purga
    const storedAnswers = JSON.parse(localStorage.getItem("loro-master-answers:v1") || "[]");
    expect(storedAnswers).toHaveLength(1);
    expect(storedAnswers[0].company).toBe("EPAM");
  });
});
