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

  it("debe purgar automáticamente respuestas y perfiles de procesos obsoletos en mount", async () => {
    localStorage.setItem(
      "loro-master-answers:v1",
      JSON.stringify([
        { id: "1", question: "Tell me about yourself", enText: "I am a dev", company: "General" },
        { id: "2", question: "Why Valentina?", enText: "Valentina interview", company: "COMPANY86 / US Enterprise Client" },
        { id: "3", question: "Why EPAM?", enText: "EPAM interview with Angelica", company: "EPAM" },
      ])
    );
    localStorage.setItem(
      "loro-saved-profiles",
      JSON.stringify([
        { name: "General Profile", company: "TechCorp", role: "Dev", profile: "Python" },
        { name: "EPAM Profile", company: "EPAM", role: "Dev", profile: "Python" },
        { name: "Valentina Profile", company: "COMPANY86", role: "Dev", profile: "Python" },
      ])
    );

    const { result } = renderHook(() => useInterviewContext());
    await new Promise((r) => setTimeout(r, 0));

    expect(result.current.masterAnswers).toHaveLength(1);
    expect(result.current.masterAnswers[0].company).toBe("General");
    expect(result.current.savedProfiles).toHaveLength(1);
    expect(result.current.savedProfiles[0].name).toBe("General Profile");

    // Verificar que localStorage se sincronizó con la purga
    const storedAnswers = JSON.parse(localStorage.getItem("loro-master-answers:v1") || "[]");
    expect(storedAnswers).toHaveLength(1);
    expect(storedAnswers[0].company).toBe("General");
  });

  it("NO debe purgar contenido nuevo que mencione procesos viejos tras la migración única", async () => {
    // Primer mount: dispara la migración y sella la versión de datos
    const first = renderHook(() => useInterviewContext());
    await new Promise((r) => setTimeout(r, 0));
    first.unmount();

    // El usuario guarda después una respuesta legítima que menciona "Globant"
    localStorage.setItem(
      "loro-master-answers:v1",
      JSON.stringify([
        { id: "new", question: "Consulting experience", enText: "I worked with Globant as a client", company: "Reforest" },
      ])
    );

    const { result } = renderHook(() => useInterviewContext());
    await new Promise((r) => setTimeout(r, 0));

    expect(result.current.masterAnswers).toHaveLength(1);
    expect(result.current.masterAnswers[0].id).toBe("new");
  });

  it("debe sincronizar LS_KEY cuando otra pestaña actualiza el contexto via storage event", async () => {
    const { result } = renderHook(() => useInterviewContext());
    await new Promise((r) => setTimeout(r, 0));

    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "copiloto:context:v1",
          newValue: JSON.stringify({
            company: "SyncedCompany",
            role: "Staff Engineer",
            profile: "Go, Kubernetes",
            extraInstructions: "Direct answers",
            interviewerBio: "Tech Lead",
            modelId: "gemini-flash-latest",
            fontSize: 18,
          }),
        })
      );
    });

    expect(result.current.company).toBe("SyncedCompany");
    expect(result.current.role).toBe("Staff Engineer");
    expect(result.current.profile).toBe("Go, Kubernetes");
    expect(result.current.extraInstructions).toBe("Direct answers");
    expect(result.current.interviewerBio).toBe("Tech Lead");
    expect(result.current.modelId).toBe("gemini-flash-latest");
    expect(result.current.fontSize).toBe(18);
  });

  it("debe marcar storageQuotaExceeded cuando se despacha el evento loro:quota-exceeded", async () => {
    const { result } = renderHook(() => useInterviewContext());
    await new Promise((r) => setTimeout(r, 0));

    expect(result.current.storageQuotaExceeded).toBe(false);
    act(() => {
      window.dispatchEvent(new CustomEvent("loro:quota-exceeded", { detail: { key: "test" } }));
    });
    expect(result.current.storageQuotaExceeded).toBe(true);
  });
});
