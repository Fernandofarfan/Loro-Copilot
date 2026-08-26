"use client";

import { useState, useEffect, useCallback } from "react";

export interface SavedProfile {
  name: string;
  company: string;
  role: string;
  profile: string;
  extraInstructions?: string;
}

const LS_KEY = "copiloto:context:v1";
const LS_PROFILES_KEY = "loro-saved-profiles";

export function useInterviewContext(defaultModelId: string = "mimo-v25-pro", availableModelIds: string[] = []) {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [profile, setProfile] = useState("");
  const [extraInstructions, setExtraInstructions] = useState("");
  const [modelId, setModelId] = useState<string>(defaultModelId);
  const [fontSize, setFontSize] = useState<number>(14);
  const [savedProfiles, setSavedProfiles] = useState<SavedProfile[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Carga inicial de localStorage
  useEffect(() => {
    try {
      const storedProfiles = localStorage.getItem(LS_PROFILES_KEY);
      if (storedProfiles) {
        setSavedProfiles(JSON.parse(storedProfiles));
      }

      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.company) setCompany(saved.company);
        if (saved.role) setRole(saved.role);
        if (saved.profile) setProfile(saved.profile);
        if (saved.extraInstructions) setExtraInstructions(saved.extraInstructions);
        if (saved.modelId && (availableModelIds.length === 0 || availableModelIds.includes(saved.modelId))) {
          setModelId(saved.modelId);
        }
        if (typeof saved.fontSize === "number") setFontSize(saved.fontSize);
      }
    } catch (e) {
      console.warn("Error cargando contexto desde localStorage", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Guardar cambios automáticamente
  const persistContext = useCallback(() => {
    try {
      localStorage.setItem(
        LS_KEY,
        JSON.stringify({ company, role, profile, extraInstructions, modelId, fontSize })
      );
    } catch (e) {
      console.warn("Error persistiendo contexto", e);
    }
  }, [company, role, profile, extraInstructions, modelId, fontSize]);

  const saveProfile = useCallback((name: string) => {
    if (!name.trim()) return;
    setSavedProfiles((prev) => {
      const updated = [...prev.filter((p) => p.name !== name), { name, company, role, profile, extraInstructions }];
      try {
        localStorage.setItem(LS_PROFILES_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, [company, role, profile, extraInstructions]);

  const removeAllProfiles = useCallback(() => {
    setSavedProfiles([]);
    try {
      localStorage.removeItem(LS_PROFILES_KEY);
    } catch {}
  }, []);

  const loadProfile = useCallback((profileName: string) => {
    const p = savedProfiles.find((x) => x.name === profileName);
    if (p) {
      setCompany(p.company);
      setRole(p.role);
      setProfile(p.profile);
      setExtraInstructions(p.extraInstructions || "");
    }
  }, [savedProfiles]);

  const loadPresetEPAM = useCallback(() => {
    setCompany("EPAM Systems");
    setRole(
      "Senior Python Engineer (Backend & Cloud-Native)\n\n• Formato: 80% teórica / arquitectura, 20% live coding / algoritmos.\n• Core Python: Data model, mutability, shallow vs deep copy, iterators/generators (lazy eval), context managers, exceptions design, typing, dataclasses.\n• Concurrency: Asyncio vs threads vs multiprocessing (I/O vs CPU bound), async cancellation/timeouts, avoiding blocking calls with asyncio.to_thread, GIL mechanics.\n• Quality & Testing: Pytest fixtures & parametrization, Clean Architecture, DDD, CI linters/formatters.\n• Debugging: Workflow reproduce -> measure (cProfile/tracemalloc) -> isolate -> optimize -> verify regression. Structured logging & OpenTelemetry."
    );
    setExtraInstructions(
      "EPAM SENIOR RUBRIC: Seguir esquema Context -> Assumptions -> Approach -> Trade-offs -> Validation. En coding/algoritmos: plantear edge cases, complejidad Big-O y código Python 3.11+ limpio y tipado (sin clever one-liners). Anclar a experiencia real en Reforest Latam, FastAPI y PostgreSQL."
    );
  }, []);

  return {
    company,
    setCompany,
    role,
    setRole,
    profile,
    setProfile,
    extraInstructions,
    setExtraInstructions,
    modelId,
    setModelId,
    fontSize,
    setFontSize,
    savedProfiles,
    saveProfile,
    removeAllProfiles,
    loadProfile,
    loadPresetEPAM,
    persistContext,
    isLoaded,
  };
}
