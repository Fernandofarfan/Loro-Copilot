"use client";

import { useState, useEffect, useCallback } from "react";
import { MasterAnswer, DEFAULT_EPAM_MASTER_ANSWERS } from "../lib/interviewHelpers";

export interface SavedProfile {
  name: string;
  company: string;
  role: string;
  profile: string;
  extraInstructions?: string;
}

const LS_KEY = "copiloto:context:v1";
const LS_PROFILES_KEY = "loro-saved-profiles";
const LS_ANSWERS_KEY = "loro-master-answers:v1";

export function useInterviewContext(defaultModelId: string = "deepseek-flash", availableModelIds: string[] = []) {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [profile, setProfile] = useState("");
  const [extraInstructions, setExtraInstructions] = useState("");
  const [modelId, setModelId] = useState<string>(defaultModelId);
  const [fontSize, setFontSize] = useState<number>(14);
  const [savedProfiles, setSavedProfiles] = useState<SavedProfile[]>([]);
  const [masterAnswers, setMasterAnswers] = useState<MasterAnswer[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Carga inicial de localStorage
  useEffect(() => {
    try {
      const storedProfiles = localStorage.getItem(LS_PROFILES_KEY);
      if (storedProfiles) {
        setSavedProfiles(JSON.parse(storedProfiles));
      }

      const storedAnswers = localStorage.getItem(LS_ANSWERS_KEY);
      if (storedAnswers && JSON.parse(storedAnswers).length > 0) {
        setMasterAnswers(JSON.parse(storedAnswers));
      } else {
        setMasterAnswers(DEFAULT_EPAM_MASTER_ANSWERS);
        localStorage.setItem(LS_ANSWERS_KEY, JSON.stringify(DEFAULT_EPAM_MASTER_ANSWERS));
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

  // Gestor del Banco de Respuestas Maestras (Memoria Inteligente)
  const saveMasterAnswer = useCallback((ans: { question: string; enText: string; esText: string; category?: string; tags?: string[] }) => {
    if (!ans.question?.trim() || !ans.enText?.trim()) return;
    setMasterAnswers((prev) => {
      const existingIdx = prev.findIndex((a) => a.question.toLowerCase().trim() === ans.question.toLowerCase().trim());
      const newEntry: MasterAnswer = {
        id: existingIdx >= 0 ? prev[existingIdx].id : `ans_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        question: ans.question.trim(),
        enText: ans.enText.trim(),
        esText: ans.esText?.trim() || "",
        category: ans.category || "General",
        tags: ans.tags || [],
        role: role.slice(0, 100),
        company: company.slice(0, 100),
        favorite: true,
        createdAt: Date.now(),
      };
      const updated = existingIdx >= 0
        ? prev.map((a, i) => (i === existingIdx ? newEntry : a))
        : [newEntry, ...prev];
      try {
        localStorage.setItem(LS_ANSWERS_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, [role, company]);

  const deleteMasterAnswer = useCallback((id: string) => {
    setMasterAnswers((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      try {
        localStorage.setItem(LS_ANSWERS_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const toggleFavoriteMasterAnswer = useCallback((id: string) => {
    setMasterAnswers((prev) => {
      const updated = prev.map((a) => a.id === id ? { ...a, favorite: !a.favorite } : a);
      try {
        localStorage.setItem(LS_ANSWERS_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const loadPresetEPAM = useCallback(() => {
    setCompany("EPAM Systems");
    setRole(
      "Senior Python Engineer (Backend & Cloud-Native)\n\n• Formato: 80% teórica / arquitectura, 20% live coding / algoritmos.\n• Core Python: Data model, mutability, shallow vs deep copy, iterators/generators (lazy eval), context managers, exceptions design, typing, dataclasses.\n• Concurrency: Asyncio vs threads vs multiprocessing (I/O vs CPU bound), async cancellation/timeouts, avoiding blocking calls with asyncio.to_thread, GIL mechanics.\n• Quality & Testing: Pytest fixtures & parametrization, Clean Architecture, DDD, CI linters/formatters.\n• Debugging: Workflow reproduce -> measure (cProfile/tracemalloc) -> isolate -> optimize -> verify regression. Structured logging & OpenTelemetry."
    );
    setExtraInstructions(
      "EPAM SENIOR RUBRIC: Seguir esquema Context -> Assumptions -> Approach -> Trade-offs -> Validation. En coding/algoritmos: plantear edge cases, complejidad Big-O y código Python 3.11+ limpio y tipado (sin clever one-liners). Anclar a experiencia real en Reforest Latam, FastAPI y PostgreSQL."
    );
    setMasterAnswers((prev) => {
      const merged = [...DEFAULT_EPAM_MASTER_ANSWERS, ...prev.filter(p => !DEFAULT_EPAM_MASTER_ANSWERS.some(d => d.id === p.id))];
      try {
        localStorage.setItem(LS_ANSWERS_KEY, JSON.stringify(merged));
      } catch {}
      return merged;
    });
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
    masterAnswers,
    saveMasterAnswer,
    deleteMasterAnswer,
    toggleFavoriteMasterAnswer,
    loadPresetEPAM,
    persistContext,
    isLoaded,
  };
}

