"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MasterAnswer } from "../lib/interviewHelpers";

export interface SavedProfile {
  name: string;
  company: string;
  role: string;
  profile: string;
  extraInstructions?: string;
  interviewerBio?: string;
}

export interface STARStory {
  id: string;
  title: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  tags?: string[];
  createdAt?: number;
}

const LS_KEY = "copiloto:context:v1";
const LS_PROFILES_KEY = "loro-saved-profiles";
const LS_ANSWERS_KEY = "loro-master-answers:v1";
const LS_STAR_STORIES_KEY = "loro-star-stories:v1";

export function useInterviewContext(defaultModelId: string = "deepseek-v4-flash", availableModelIds: string[] = []) {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [profile, setProfile] = useState("");
  const [extraInstructions, setExtraInstructions] = useState("");
  const [interviewerBio, setInterviewerBio] = useState("");
  const [modelId, setModelId] = useState<string>(defaultModelId);
  const [fontSize, setFontSize] = useState<number>(14);
  const [savedProfiles, setSavedProfiles] = useState<SavedProfile[]>([]);
  const [masterAnswers, setMasterAnswers] = useState<MasterAnswer[]>([]);
  const [starStories, setStarStories] = useState<STARStory[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const initialLoadDone = useRef(false);
  const availableModelIdsRef = useRef(availableModelIds);
  availableModelIdsRef.current = availableModelIds;

  // Carga inicial de localStorage (solo una vez en montaje)
  useEffect(() => {
    try {
      const storedProfiles = localStorage.getItem(LS_PROFILES_KEY);
      if (storedProfiles) {
        const parsed = JSON.parse(storedProfiles);
        if (Array.isArray(parsed)) {
          const validProfiles: SavedProfile[] = parsed
            .filter((p): p is SavedProfile => Boolean(p && typeof p === "object" && typeof p.name === "string" && p.name.trim()))
            .map((p) => ({
              name: String(p.name).trim(),
              company: typeof p.company === "string" ? p.company : "",
              role: typeof p.role === "string" ? p.role : "",
              profile: typeof p.profile === "string" ? p.profile : "",
              extraInstructions: typeof p.extraInstructions === "string" ? p.extraInstructions : "",
              interviewerBio: typeof p.interviewerBio === "string" ? p.interviewerBio : "",
            }));
          setSavedProfiles(validProfiles);
        }
      }

      const storedAnswers = localStorage.getItem(LS_ANSWERS_KEY);
      if (storedAnswers) {
        try {
          const parsed = JSON.parse(storedAnswers);
          if (Array.isArray(parsed)) {
            const validAnswers: MasterAnswer[] = parsed
              .filter((a): a is MasterAnswer => Boolean(a && typeof a === "object" && typeof a.question === "string" && typeof a.enText === "string"))
              .map((a) => ({
                id: String(a.id || `ans_${Date.now()}`),
                question: String(a.question || ""),
                enText: String(a.enText || ""),
                esText: typeof a.esText === "string" ? a.esText : "",
                category: typeof a.category === "string" ? a.category : "General",
                tags: Array.isArray(a.tags) ? a.tags.map(String) : [],
                role: typeof a.role === "string" ? a.role : "",
                company: typeof a.company === "string" ? a.company : "",
                favorite: Boolean(a.favorite),
                createdAt: typeof a.createdAt === "number" ? a.createdAt : Date.now(),
              }));
            setMasterAnswers(validAnswers);
          } else {
            setMasterAnswers([]);
          }
        } catch {
          setMasterAnswers([]);
        }
      } else {
        setMasterAnswers([]);
      }

      const storedStories = localStorage.getItem(LS_STAR_STORIES_KEY);
      if (storedStories) {
        try {
          const parsed = JSON.parse(storedStories);
          if (Array.isArray(parsed)) {
            const valid: STARStory[] = parsed
              .filter((s): s is STARStory => Boolean(s && typeof s === "object" && typeof s.title === "string"))
              .map((s) => ({
                id: String(s.id || `star_${Date.now()}`),
                title: String(s.title || ""),
                situation: String(s.situation || ""),
                task: String(s.task || ""),
                action: String(s.action || ""),
                result: String(s.result || ""),
                tags: Array.isArray(s.tags) ? s.tags.map(String) : [],
                createdAt: typeof s.createdAt === "number" ? s.createdAt : Date.now(),
              }));
            setStarStories(valid);
          } else {
            setStarStories([]);
          }
        } catch {
          setStarStories([]);
        }
      } else {
        setStarStories([]);
      }

      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved && typeof saved === "object") {
          if (typeof saved.company === "string") setCompany(saved.company);
          if (typeof saved.role === "string") setRole(saved.role);
          if (typeof saved.profile === "string") setProfile(saved.profile);
          if (typeof saved.extraInstructions === "string") setExtraInstructions(saved.extraInstructions);
          if (typeof saved.interviewerBio === "string") setInterviewerBio(saved.interviewerBio);
          const validModels = availableModelIdsRef.current;
          if (typeof saved.modelId === "string" && (validModels.length === 0 || validModels.includes(saved.modelId))) {
            setModelId(saved.modelId);
          }
          if (typeof saved.fontSize === "number" && !isNaN(saved.fontSize)) setFontSize(saved.fontSize);
        }
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
        JSON.stringify({ company, role, profile, extraInstructions, interviewerBio, modelId, fontSize })
      );
    } catch (e) {
      console.warn("Error persistiendo contexto", e);
    }
  }, [company, role, profile, extraInstructions, interviewerBio, modelId, fontSize]);

  const saveProfile = useCallback((name: string) => {
    if (!name.trim()) return;
    setSavedProfiles((prev) => {
      const updated = [...prev.filter((p) => p.name !== name), { name, company, role, profile, extraInstructions, interviewerBio }];
      try {
        localStorage.setItem(LS_PROFILES_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, [company, role, profile, extraInstructions, interviewerBio]);

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
      setInterviewerBio(p.interviewerBio || "");
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

  const saveSTARStory = useCallback((story: Omit<STARStory, "id"> & { id?: string }) => {
    setStarStories((prev) => {
      const id = story.id || `star_${Date.now()}`;
      const newStory: STARStory = {
        ...story,
        id,
        createdAt: story.createdAt || Date.now(),
      };
      const existingIdx = prev.findIndex((s) => s.id === id);
      const updated = existingIdx >= 0
        ? prev.map((s, idx) => (idx === existingIdx ? newStory : s))
        : [newStory, ...prev];
      try {
        localStorage.setItem(LS_STAR_STORIES_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const deleteSTARStory = useCallback((id: string) => {
    setStarStories((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      try {
        localStorage.setItem(LS_STAR_STORIES_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
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
    interviewerBio,
    setInterviewerBio,
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
    starStories,
    saveSTARStory,
    deleteSTARStory,
    isLoaded,
  };
}


