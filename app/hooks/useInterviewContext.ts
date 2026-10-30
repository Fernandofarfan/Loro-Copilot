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
// Versionado de datos de localStorage: la purga de procesos finalizados corre UNA sola vez
// (migración), nunca por contenido en cada carga — así no se borra data futura del usuario.
const LS_DATA_VERSION_KEY = "loro-context-data-version";
const DATA_VERSION = 2;

function isObsoleteProfileText(text: string): boolean {
  return /company86|valentina|epam|evocs|vairix|globant/i.test(text);
}

export function safeSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    console.warn(`[context] localStorage no persistió ${key} (¿cuota llena?)`, e);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("loro:quota-exceeded", { detail: { key } }));
    }
    return false;
  }
}

// Normalización compartida entre la carga inicial y el sync multi-pestaña: lo que
// escriba otra pestaña debe quedar igual de saneado que lo que carga esta.
function normalizeStoredAnswer(a: Record<string, unknown>): MasterAnswer {
  return {
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
  };
}

function normalizeStoredStory(s: Record<string, unknown>): STARStory {
  return {
    id: String(s.id || `star_${Date.now()}`),
    title: String(s.title || ""),
    situation: String(s.situation || ""),
    task: String(s.task || ""),
    action: String(s.action || ""),
    result: String(s.result || ""),
    tags: Array.isArray(s.tags) ? s.tags.map(String) : [],
    createdAt: typeof s.createdAt === "number" ? s.createdAt : Date.now(),
  };
}

export function useInterviewContext(defaultModelId: string = "glm-5-3-flash", availableModelIds: string[] = []) {
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
      // Migración única: solo purga procesos obsoletos si esta versión de datos aún no se aplicó
      const shouldPurge = (() => {
        try {
          return Number(localStorage.getItem(LS_DATA_VERSION_KEY) || "0") < DATA_VERSION;
        } catch {
          return true;
        }
      })();

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
            }))
            // Purgar perfiles de procesos finalizados (solo en la migración única)
            .filter((p) => !shouldPurge || !isObsoleteProfileText(p.company + " " + p.name + " " + (p.interviewerBio || "")));

          if (validProfiles.length !== parsed.length) {
            safeSetItem(LS_PROFILES_KEY, JSON.stringify(validProfiles));
          }
          setSavedProfiles(validProfiles);
        }
      }

      const storedAnswers = localStorage.getItem(LS_ANSWERS_KEY);
      if (storedAnswers) {
        try {
          const parsed = JSON.parse(storedAnswers);
          if (Array.isArray(parsed)) {
            const validAnswers: MasterAnswer[] = parsed
              .filter((a): a is Record<string, unknown> => Boolean(a && typeof a === "object" && typeof a.question === "string" && typeof a.enText === "string"))
              .map((a) => normalizeStoredAnswer(a))
              // Purgar respuestas maestras de procesos finalizados (solo en la migración única)
              .filter((a) => {
                if (!shouldPurge) return true;
                const comp = (a.company || "").toLowerCase();
                const q = (a.question || "").toLowerCase();
                const tags = (a.tags || []).join(" ").toLowerCase();
                const en = (a.enText || "").toLowerCase();
                return !(
                  comp.includes("company86") ||
                  comp.includes("valentina") ||
                  comp.includes("epam") ||
                  comp.includes("evocs") ||
                  comp.includes("vairix") ||
                  comp.includes("globant") ||
                  q.includes("valentina") ||
                  q.includes("puerto madero") ||
                  q.includes("epam") ||
                  q.includes("vairix") ||
                  tags.includes("valentina") ||
                  tags.includes("company86") ||
                  tags.includes("epam") ||
                  tags.includes("vairix") ||
                  tags.includes("globant") ||
                  en.includes("angelica rodriguez") ||
                  en.includes("vairix")
                );
              });

            if (validAnswers.length !== parsed.length) {
              safeSetItem(LS_ANSWERS_KEY, JSON.stringify(validAnswers));
            }
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
              .filter((s): s is Record<string, unknown> => Boolean(s && typeof s === "object" && typeof s.title === "string"))
              .map((s) => normalizeStoredStory(s))
              // Purgar historias de procesos finalizados (solo en la migración única)
              .filter((s) => {
                if (!shouldPurge) return true;
                const text = (s.title + " " + s.situation + " " + s.task + " " + s.action + " " + s.result).toLowerCase();
                return !(text.includes("epam") || text.includes("valentina") || text.includes("company86"));
              });

            if (valid.length !== parsed.length) {
              safeSetItem(LS_STAR_STORIES_KEY, JSON.stringify(valid));
            }
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
          const isObsoleteCompany = shouldPurge && typeof saved.company === "string" && /company86|valentina|epam|evocs/i.test(saved.company);
          const isObsoleteBio = shouldPurge && typeof saved.interviewerBio === "string" && /valentina|epam|angelica|company86|evocs/i.test(saved.interviewerBio);
          const isObsoleteRole = shouldPurge && typeof saved.role === "string" && /epam|valentina/i.test(saved.role);
          const isObsoleteExtra = shouldPurge && typeof saved.extraInstructions === "string" && /epam|valentina|puerto madero/i.test(saved.extraInstructions);

          if (!isObsoleteCompany && typeof saved.company === "string") setCompany(saved.company);
          if (!isObsoleteRole && typeof saved.role === "string") setRole(saved.role);
          if (typeof saved.profile === "string") setProfile(saved.profile);
          if (!isObsoleteExtra && typeof saved.extraInstructions === "string") setExtraInstructions(saved.extraInstructions);
          if (!isObsoleteBio && typeof saved.interviewerBio === "string") setInterviewerBio(saved.interviewerBio);

          if (isObsoleteCompany || isObsoleteBio || isObsoleteRole || isObsoleteExtra) {
            safeSetItem(
              LS_KEY,
              JSON.stringify({
                ...saved,
                company: isObsoleteCompany ? "" : saved.company,
                role: isObsoleteRole ? "" : saved.role,
                interviewerBio: isObsoleteBio ? "" : saved.interviewerBio,
                extraInstructions: isObsoleteExtra ? "" : saved.extraInstructions,
              })
            );
          }

          const validModels = availableModelIdsRef.current;
          if (typeof saved.modelId === "string" && (validModels.length === 0 || validModels.includes(saved.modelId))) {
            setModelId(saved.modelId);
          }
          if (typeof saved.fontSize === "number" && !isNaN(saved.fontSize)) setFontSize(saved.fontSize);
        }
      }

      if (shouldPurge) {
        try {
          localStorage.setItem(LS_DATA_VERSION_KEY, String(DATA_VERSION));
        } catch (e) {
          // Cuota llena o storage no disponible: avisar pero no romper la UI
          console.warn("[context] localStorage no persistió (¿cuota llena?)", e);
        }
      }
    } catch (e) {
      console.warn("Error cargando contexto desde localStorage", e);
    } finally {
      setIsLoaded(true);
      initialLoadDone.current = true;
    }
  }, []);

  const [storageQuotaExceeded, setStorageQuotaExceeded] = useState(false);

  useEffect(() => {
    const onQuota = () => setStorageQuotaExceeded(true);
    window.addEventListener("loro:quota-exceeded", onQuota);
    return () => window.removeEventListener("loro:quota-exceeded", onQuota);
  }, []);

  // Auto-persistir contexto al cambiar
  useEffect(() => {
    if (!initialLoadDone.current) return;
    safeSetItem(
      LS_KEY,
      JSON.stringify({ company, role, profile, extraInstructions, interviewerBio, modelId, fontSize })
    );
  }, [company, role, profile, extraInstructions, interviewerBio, modelId, fontSize]);

  // Multi-pestaña: otra pestaña puede escribir las mismas claves. Sin este listener la
  // primera pestaña que escriba pisa los cambios de la otra (last-write-wins = pérdida).
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.newValue == null) return;
      try {
        const parsed = JSON.parse(e.newValue);
        if (e.key === LS_KEY) {
          if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
            if (typeof parsed.company === "string") setCompany(parsed.company);
            if (typeof parsed.role === "string") setRole(parsed.role);
            if (typeof parsed.profile === "string") setProfile(parsed.profile);
            if (typeof parsed.extraInstructions === "string") setExtraInstructions(parsed.extraInstructions);
            if (typeof parsed.interviewerBio === "string") setInterviewerBio(parsed.interviewerBio);
            if (typeof parsed.modelId === "string") setModelId(parsed.modelId);
            if (typeof parsed.fontSize === "number") setFontSize(parsed.fontSize);
          }
          return;
        }
        if (!Array.isArray(parsed)) return;
        if (e.key === LS_PROFILES_KEY) {
          setSavedProfiles(
            parsed.filter(
              (p): p is SavedProfile =>
                Boolean(p && typeof p === "object" && typeof p.name === "string" && p.name.trim())
            )
          );
        } else if (e.key === LS_ANSWERS_KEY) {
          setMasterAnswers(
            parsed
              .filter((a) => Boolean(a && typeof a === "object" && typeof a.question === "string" && typeof a.enText === "string"))
              .map((a) => normalizeStoredAnswer(a))
          );
        } else if (e.key === LS_STAR_STORIES_KEY) {
          setStarStories(
            parsed
              .filter((s) => Boolean(s && typeof s === "object" && typeof s.title === "string"))
              .map((s) => normalizeStoredStory(s))
          );
        }
      } catch {
        // Valor corrupto proveniente de otra pestaña: ignorar
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const saveProfile = useCallback((name: string) => {
    if (!name.trim()) return;
    setSavedProfiles((prev) => {
      const updated = [...prev.filter((p) => p.name !== name), { name, company, role, profile, extraInstructions, interviewerBio }];
      safeSetItem(LS_PROFILES_KEY, JSON.stringify(updated));
      return updated;
    });
  }, [company, role, profile, extraInstructions, interviewerBio]);

  const deleteProfile = useCallback((name: string) => {
    setSavedProfiles((prev) => {
      const updated = prev.filter((p) => p.name !== name);
      safeSetItem(LS_PROFILES_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeAllProfiles = useCallback(() => {
    setSavedProfiles([]);
    try {
      localStorage.removeItem(LS_PROFILES_KEY);
    } catch (e) {
      console.warn("[context] Error removiendo perfiles de localStorage", e);
    }
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
      safeSetItem(LS_ANSWERS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, [role, company]);

  const importMasterAnswers = useCallback((newAnswers: MasterAnswer[]) => {
    if (!newAnswers || newAnswers.length === 0) return;
    setMasterAnswers((prev) => {
      const combined = [...newAnswers, ...prev.filter(p => !newAnswers.some(n => n.id === p.id || (n.question === p.question && n.company === p.company)))];
      safeSetItem(LS_ANSWERS_KEY, JSON.stringify(combined));
      return combined;
    });
  }, []);

  const replaceMasterAnswers = useCallback((newAnswers: MasterAnswer[]) => {
    if (!newAnswers || newAnswers.length === 0) return;
    setMasterAnswers(newAnswers);
    safeSetItem(LS_ANSWERS_KEY, JSON.stringify(newAnswers));
  }, []);

  const deleteMasterAnswer = useCallback((id: string) => {
    setMasterAnswers((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      safeSetItem(LS_ANSWERS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const toggleFavoriteMasterAnswer = useCallback((id: string) => {
    setMasterAnswers((prev) => {
      const updated = prev.map((a) => a.id === id ? { ...a, favorite: !a.favorite } : a);
      safeSetItem(LS_ANSWERS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearAllMasterAnswers = useCallback(() => {
    setMasterAnswers([]);
    try {
      localStorage.removeItem(LS_ANSWERS_KEY);
    } catch (e) {
      console.warn("[context] Error limpiando respuestas maestras", e);
    }
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
      safeSetItem(LS_STAR_STORIES_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteSTARStory = useCallback((id: string) => {
    setStarStories((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      safeSetItem(LS_STAR_STORIES_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const importSTARStories = useCallback((newStories: STARStory[]) => {
    if (!newStories || newStories.length === 0) return;
    setStarStories((prev) => {
      const combined = [
        ...newStories,
        ...prev.filter((p) => !newStories.some((n) => n.id === p.id || n.title === p.title)),
      ];
      safeSetItem(LS_STAR_STORIES_KEY, JSON.stringify(combined));
      return combined;
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
    replaceMasterAnswers,
    deleteMasterAnswer,
    clearAllMasterAnswers,
    toggleFavoriteMasterAnswer,
    starStories,
    saveSTARStory,
    deleteSTARStory,
    importSTARStories,
    isLoaded,
    storageQuotaExceeded,
  };
}


