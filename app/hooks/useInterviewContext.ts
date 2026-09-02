"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MasterAnswer } from "../lib/interviewHelpers";

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

export function useInterviewContext(defaultModelId: string = "deepseek-v4-flash", availableModelIds: string[] = []) {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [profile, setProfile] = useState("");
  const [extraInstructions, setExtraInstructions] = useState("");
  const [modelId, setModelId] = useState<string>(defaultModelId);
  const [fontSize, setFontSize] = useState<number>(14);
  const [savedProfiles, setSavedProfiles] = useState<SavedProfile[]>([]);
  const [masterAnswers, setMasterAnswers] = useState<MasterAnswer[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const initialLoadDone = useRef(false);
  const availableModelIdsRef = useRef(availableModelIds);
  availableModelIdsRef.current = availableModelIds;

  // Carga inicial de localStorage (solo una vez en montaje)
  useEffect(() => {
    try {
      const storedProfiles = localStorage.getItem(LS_PROFILES_KEY);
      if (storedProfiles) {
        setSavedProfiles(JSON.parse(storedProfiles));
      }

      const storedAnswers = localStorage.getItem(LS_ANSWERS_KEY);
      if (storedAnswers) {
        try {
          setMasterAnswers(JSON.parse(storedAnswers));
        } catch {
          setMasterAnswers([]);
        }
      } else {
        setMasterAnswers([]);
      }

      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.company) setCompany(saved.company);
        if (saved.role) setRole(saved.role);
        if (saved.profile) setProfile(saved.profile);
        if (saved.extraInstructions) setExtraInstructions(saved.extraInstructions);
        const validModels = availableModelIdsRef.current;
        if (saved.modelId && (validModels.length === 0 || validModels.includes(saved.modelId))) {
          setModelId(saved.modelId);
        }
        if (typeof saved.fontSize === "number") setFontSize(saved.fontSize);
      }
    } catch (e) {
      console.warn("Error cargando contexto desde localStorage", e);
    } finally {
      setIsLoaded(true);
      initialLoadDone.current = true;
    }
  }, []);

  // Auto-persistir contexto al cambiar
  useEffect(() => {
    if (!initialLoadDone.current) return;
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

  const deleteProfile = useCallback((name: string) => {
    setSavedProfiles((prev) => {
      const updated = prev.filter((p) => p.name !== name);
      try {
        localStorage.setItem(LS_PROFILES_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const removeAllProfiles = useCallback(() => {
    setSavedProfiles([]);
    try {
      localStorage.removeItem(LS_PROFILES_KEY);
    } catch {}
  }, []);

  const loadProfile = useCallback((profileName: string) => {
    const p = savedProfiles.find((x) => x.name === profileName);
    if (p) {
      setCompany(p.company || "");
      setRole(p.role || "");
      setProfile(p.profile || "");
      setExtraInstructions(p.extraInstructions || "");
    }
  }, [savedProfiles]);

  // Gestor del Banco de Respuestas Maestras (Memoria Inteligente)
  const saveMasterAnswer = useCallback((ans: { question: string; enText: string; esText: string; category?: string; tags?: string[] }) => {
    if (!ans.question?.trim() || !ans.enText?.trim()) return;
    setMasterAnswers((prev) => {
      const cleanQ = ans.question.trim().toLowerCase();
      const cleanComp = (company || "").trim().toLowerCase();
      const existingIdx = prev.findIndex(
        (a) => a.question.toLowerCase().trim() === cleanQ && (a.company || "").toLowerCase().trim() === cleanComp
      );
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

  const importMasterAnswers = useCallback((newAnswers: MasterAnswer[]) => {
    if (!newAnswers || newAnswers.length === 0) return;
    setMasterAnswers((prev) => {
      const combined = [...newAnswers, ...prev.filter(p => !newAnswers.some(n => n.id === p.id || (n.question === p.question && n.company === p.company)))];
      try {
        localStorage.setItem(LS_ANSWERS_KEY, JSON.stringify(combined));
      } catch {}
      return combined;
    });
  }, []);

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

  const clearAllMasterAnswers = useCallback(() => {
    setMasterAnswers([]);
    try {
      localStorage.removeItem(LS_ANSWERS_KEY);
    } catch {}
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
    deleteProfile,
    removeAllProfiles,
    loadProfile,
    masterAnswers,
    setMasterAnswers,
    saveMasterAnswer,
    importMasterAnswers,
    deleteMasterAnswer,
    clearAllMasterAnswers,
    toggleFavoriteMasterAnswer,
    isLoaded,
  };
}


