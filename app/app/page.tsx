"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { track, identify } from "../lib/track";
import { BrandLogo } from "../lib/BrandLogo";
import { MarkdownText } from "../components/MarkdownText";
import { AnswerCard } from "../components/AnswerCard";
import { parseBlocks, classifyQuestion, detectTrickQuestion, fmtTime, findMatchingAnswer, type MasterAnswer } from "../lib/interviewHelpers";
import {
  SparkleIcon,
  OpenAIMark,
  AnthropicMark,
  GoogleMark,
  DeepSeekMark,
  BriefcaseIcon,
  DocIcon,
  UserIcon,
  CopyIcon,
  ThumbUpIcon,
  ThumbDownIcon,
  CheckIcon,
  VolumeIcon,
  MicIcon,
  SettingsIcon,
  ChevronDownIcon,
  ExternalLinkIcon,
  TrashIcon,
} from "../components/Icons";

type Status = "idle" | "connecting" | "live" | "error";
type Mode = "mic" | "tab";
type Line = { id: number; text: string; final: boolean; speaker: number };
type Feedback = "up" | "down" | null;
type Answer = {
  id: number;
  question: string;
  text: string;
  esText: string;
  enText: string;
  phoText?: string;
  done: boolean;
  ts: number;
  feedback: Feedback;
  bilingual: boolean;
  cheats: string[];
  alert: string;
  snippet: string;
  cleanText: string;
  latencyMs?: number;
  modelName?: string;
  fromMemory?: boolean;
};

const RESCUE_PHRASES: { icon: string; label: string; en: string; es: string }[] = [
  {
    icon: "⏳",
    label: "Ganar tiempo",
    en: "That's a great question, let me organize my thoughts for a second.",
    es: "Buena pregunta, déjame ordenar mis ideas un segundo.",
  },
  {
    icon: "🔁",
    label: "Pedir repetición",
    en: "Could you please repeat that last part?",
    es: "¿Podrías repetir esa última parte?",
  },
  {
    icon: "🎯",
    label: "Clarificar",
    en: "To make sure I understand, are you asking about...?",
    es: "Para asegurarme de entender, ¿me estás preguntando sobre...?",
  },
  {
    icon: "🤝",
    label: "Cierre seguro",
    en: "Does that cover what you were looking for?",
    es: "¿Eso cubre lo que estabas buscando saber?",
  },
];

function OpenCodeMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  );
}

type Provider = "gemini" | "anthropic" | "openai" | "openrouter" | "opencode";

function ProviderIcon({ provider }: { provider: Provider }) {
  return (
    <span className="dd-icon">
      {provider === "openai" ? <OpenAIMark /> : provider === "anthropic" ? <AnthropicMark /> : provider === "opencode" || provider === "openrouter" ? <OpenCodeMark /> : <GoogleMark />}
    </span>
  );
}

type ModelOption = { id: string; label: string; provider: Provider; model: string; tag: string };
const MODELS: ModelOption[] = [
  { id: "mimo-v25-pro", label: "MiMo V2.5 Pro ⚡", provider: "opencode", model: "mimo-v2.5-pro", tag: "Favorito (Ultra Rápido)" },
  { id: "deepseek-flash", label: "DeepSeek V4 Flash", provider: "opencode", model: "deepseek-v4-flash", tag: "Recomendado" },
  { id: "gpt-5-luna", label: "GPT 5.6 Luna ⚡", provider: "opencode", model: "gpt-5.6-luna", tag: "OpenAI" },
  { id: "glm-5-1", label: "GLM 5.1", provider: "opencode", model: "glm-5.1", tag: "Rápido" },
  { id: "minimax-m3", label: "MiniMax M3", provider: "opencode", model: "minimax-m3", tag: "Pensamiento (+15s)" },
  { id: "deepseek-pro", label: "DeepSeek V4 Pro", provider: "opencode", model: "deepseek-v4-pro", tag: "Pro" },
  { id: "qwen37-max", label: "Qwen 3.7 Max", provider: "opencode", model: "qwen3.7-max", tag: "Alibaba" },
  { id: "qwen38-max", label: "Qwen 3.8 Max", provider: "opencode", model: "qwen3.8-max", tag: "Alibaba" },
  { id: "glm-5-2", label: "GLM 5.2", provider: "opencode", model: "glm-5.2", tag: "Zhipu" },
  { id: "kimi-k3", label: "Kimi K3", provider: "opencode", model: "kimi-k3", tag: "Moonshot" },
  { id: "kimi-k27-code", label: "Kimi K2.7 Code", provider: "opencode", model: "kimi-k2.7-code", tag: "Moonshot" },
  { id: "grok-4-5", label: "Grok 4.5", provider: "opencode", model: "grok-4.5", tag: "xAI" },
  { id: "hy3", label: "Hy3", provider: "opencode", model: "hy3", tag: "Tencent" },
  { id: "gemini-flash", label: "Gemini 3.6 Flash", provider: "gemini", model: "gemini-3.6-flash", tag: "Google" },
];

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

// Tooltip de ayuda (ⓘ) tap-to-toggle, apto mobile (el title nativo no aparece
// al tocar en el celular).
function InfoTip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement | null>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);
  return (
    <span className="info-tip" ref={ref}>
      <button
        type="button"
        className="info-tip-btn"
        onClick={(e) => {
          e.preventDefault();
          setOpen((o) => !o);
        }}
        aria-label="Ayuda"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
      </button>
      {open && <span className="info-bubble">{text}</span>}
    </span>
  );
}

// Tira en vivo: muestra las últimas palabras oídas y resalta la más reciente
// (cue de "te estoy escuchando ahora"), como el marcado de Parakeet.
function ListenText({ text }: { text: string }) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  // El contenedor trunca a la izquierda (direction: rtl) para que la palabra
  // más reciente quede siempre visible a la derecha; el <bdi> mantiene el orden
  // de lectura normal (izq→der) del texto latino.
  if (words.length === 0) return <bdi>escuchando…</bdi>;
  const last = words[words.length - 1];
  const head = words.slice(Math.max(0, words.length - 9), words.length - 1).join(" ");
  return (
    <bdi>
      {head && <>{head} </>}
      <span className="active-word">{last}</span>
    </bdi>
  );
}

// Dropdown custom (con icono, tag y badge) — el <select> nativo no lo permite.
type DDOption = {
  id: string;
  label: string;
  icon?: ReactNode;
  tag?: string;
  badge?: string;
};
function Dropdown({
  value,
  options,
  onChange,
  disabled,
  ariaLabel,
  alignRight,
}: {
  value: string;
  options: DDOption[];
  onChange: (id: string) => void;
  disabled?: boolean;
  ariaLabel?: string;
  alignRight?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);
  const current = options.find((o) => o.id === value) || options[0];
  return (
    <div className="dd" ref={ref}>
      <button
        type="button"
        className="dd-trigger"
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="dd-trigger-main">
          {current?.icon}
          <span className="dd-trigger-label">{current?.label}</span>
        </span>
        <span className="dd-caret" aria-hidden="true">▾</span>
      </button>
      {open && (
        <div className={`dd-menu ${alignRight ? "dd-menu-right" : ""}`} role="listbox">
          {options.map((o) => (
            <button
              key={o.id}
              type="button"
              role="option"
              aria-selected={o.id === value}
              className={`dd-option ${o.id === value ? "dd-option-sel" : ""}`}
              onClick={() => {
                onChange(o.id);
                setOpen(false);
              }}
            >
              <span className="dd-option-left">
                {o.icon}
                <span className="dd-option-label">{o.label}</span>
                {o.tag && <span className="dd-option-tag">{o.tag}</span>}
              </span>
              <span className="dd-option-right">
                {o.badge && <span className="dd-badge">{o.badge}</span>}
                {o.id === value && <span className="dd-check" aria-hidden="true">✓</span>}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- Idioma ----------
// "es" → entrevista y respuesta en español.


// ---------- Modelos de LLM ----------
const DEFAULT_MODEL_ID = "mimo-v25-pro";

function buildDgUrl(): string {
  const params = new URLSearchParams({
    model: "nova-2",
    language: "multi",
    smart_format: "true",
    interim_results: "true",
    endpointing: "300",
    utterance_end_ms: "1000", // Mínimo soportado por Deepgram para detección ultra-rápida de fin de turno
    vad_events: "true",
    diarize: "true",
    encoding: "linear16",
    sample_rate: "16000",
    channels: "1",
  }).toString();
  return `wss://api.deepgram.com/v1/listen?${params}`;
}

const LS_KEY = "copiloto:context:v1";
const LS_ANSWERS_KEY = "loro-master-answers:v1";

// ---------- Endpointing semántico ----------
export default function Page() {
  const [status, setStatus] = useState<Status>("idle");
  const [mode, setMode] = useState<Mode>("mic");
  const [error, setError] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [profile, setProfile] = useState("");
  const [extraInstructions, setExtraInstructions] = useState("");
  const [modelId, setModelId] = useState<string>(DEFAULT_MODEL_ID);
  const [lines, setLines] = useState<Line[]>([]);
  const linesRef = useRef<Line[]>([]);
  useEffect(() => { linesRef.current = lines; }, [lines]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const answersRef = useRef<Answer[]>([]);
  useEffect(() => { answersRef.current = answers; }, [answers]);
  const lastSpeakerRef = useRef<number | null>(null);
  const [tab, setTab] = useState<"answer" | "transcript">("answer");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  
  // Resumen Post-Entrevista
  const [summary, setSummary] = useState<string>("");
  const [generatingSummary, setGeneratingSummary] = useState<boolean>(false);

  // Banco de Respuestas & Memoria Inteligente
  const [masterAnswers, setMasterAnswers] = useState<MasterAnswer[]>([]);
  const masterAnswersRef = useRef<MasterAnswer[]>([]);
  useEffect(() => { masterAnswersRef.current = masterAnswers; }, [masterAnswers]);
  const [showMemoryModal, setShowMemoryModal] = useState<boolean>(false);
  const [isWarmingUp, setIsWarmingUp] = useState<boolean>(false);

  // Auto-Bilingual: Detección de idioma al vuelo
  const [detectedLang, setDetectedLang] = useState<string>("es");
  const detectedLangRef = useRef<string>("es");

  const [fontSize, setFontSize] = useState<number>(14);
  const [savedProfiles, setSavedProfiles] = useState<{name: string, company: string, role: string, profile: string, extraInstructions?: string}[]>([]);

  // Simple English
  const [simpleEnglish, setSimpleEnglish] = useState<boolean>(true);
  const [activeRescue, setActiveRescue] = useState<typeof RESCUE_PHRASES[0] | null>(null);

  // Estado de generación y protección contra doble-click
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const isGeneratingRef = useRef<boolean>(false);

  const wsRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const workletRef = useRef<AudioWorkletNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const waveformRafRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wakeLockRef = useRef<any>(null);
  const keepAliveRef = useRef<any>(null);
  const sessionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const silenceStartRef = useRef<number | null>(null);
  // Reconexión: distingue cierres pedidos por el usuario (stop/cleanup) de
  // caídas inesperadas del WS en medio de la entrevista.
  const intentionalCloseRef = useRef(false);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // El presupuesto de reintentos solo se renueva si la conexión se mantuvo
  // estable un rato — así una conexión que "flapea" (abre y cae al instante)
  // igual agota los 3 intentos y se rinde, en vez de reconectar para siempre.
  const stableTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Recuperación al volver de segundo plano: reconecta si el socket murió
  // mientras la app estaba en background (Deepgram corta a los ~10s sin audio).
  const resumeRef = useRef<(() => void) | null>(null);

  const transcriptRef = useRef(""); // todo lo transcripto (contexto para el LLM)
  const questionBufRef = useRef(""); // último tramo dicho, para "Responder ahora"
  const lineId = useRef(0);
  const ansId = useRef(0);
  // Respuesta en curso: permite abortarla si se pide otra o se limpia.
  const turnRef = useRef<{ id: number; sentText: string; controller: AbortController | null } | null>(null);
  // Modo automático: dispara la respuesta cuando Deepgram detecta fin de intervención.
  const autoModeRef = useRef(true);
  const [autoMode, setAutoMode] = useState(true);
  
  // Pausa manual: ignora los mensajes de Deepgram para que no transcriba tu voz
  // si estás usando el modo Mic o si querés frenar la IA un rato.
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(false);
  const togglePause = useCallback(() => {
    setIsPaused((p) => {
      const next = !p;
      isPausedRef.current = next;
      return next;
    });
  }, []);

  // Dialecto / Registro de respuesta (Rioplatense / Neutro / English)
  const [dialect, setDialect] = useState<"rioplatense" | "neutro" | "english">("rioplatense");

  // Checklist Pre-Entrevista
  const [checklist, setChecklist] = useState({
    cv: false,
    teleprompter: false,
    mic: true,
    model: true,
  });

  // Buscador y Modo Compacto
  const [searchFilter, setSearchFilter] = useState("");
  const [compactUi, setCompactUi] = useState(false);

  // Tono de audio sutil al comenzar respuesta
  const playChimeSound = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {}
  }, []);

  // Ventana flotante (Teleprompter Ghost Pop-out)
  const popoutRef = useRef<Window | null>(null);

  const updateTeleprompter = useCallback((question: string, text: string, enText?: string, esText?: string, isGen?: boolean, fromMem?: boolean) => {
    const payload = {
      question: question || "",
      enText: enText || text || "",
      cleanText: text || "",
      esText: esText || "",
      isGenerating: typeof isGen === "boolean" ? isGen : isGeneratingRef.current,
      modelName: modelRef.current.label,
      fromMemory: !!fromMem,
    };
    try {
      localStorage.setItem("loro_teleprompter_data", JSON.stringify(payload));
      if (typeof BroadcastChannel !== "undefined") {
        const bc = new BroadcastChannel("loro_teleprompter_channel");
        bc.postMessage(payload);
        bc.close();
      }
    } catch {}
  }, []);

  const openTeleprompter = useCallback(() => {
    if (popoutRef.current && !popoutRef.current.closed) {
      popoutRef.current.focus();
      return;
    }
    const win = window.open(
      "/teleprompter",
      "TeleprompterLoro",
      "width=520,height=360,resizable=yes,scrollbars=yes,status=no,location=no,toolbar=no,menubar=no"
    );
    if (!win) {
      alert("Permití las ventanas emergentes (pop-ups) para abrir el Teleprompter Flotante.");
      return;
    }
    popoutRef.current = win;
  }, []);
  // Debounce para evitar dobles disparos de UtteranceEnd.
  const utteranceDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollT = useRef<HTMLDivElement | null>(null);
  const scrollA = useRef<HTMLDivElement | null>(null);

  // Modelo elegido, siempre fresco (evita closures viejas en runGenerate).
  const selectedModel = MODELS.find((m) => m.id === modelId) || MODELS[0];
  const modelRef = useRef(selectedModel);
  modelRef.current = selectedModel;

  // Atajos de teclado globales:
  // - Ctrl+Enter / Ctrl+Espacio / Alt+Enter: Responder en vivo
  // - Alt+T: Abrir / Enfocar Teleprompter
  // - Alt+P: Pausar / Reanudar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (((e.ctrlKey || e.metaKey) && (e.key === "Enter" || e.code === "Space")) || (e.altKey && e.key === "Enter")) {
        e.preventDefault();
        if (status === "live") answerNowRef.current();
      }
      if (e.altKey && (e.key === "t" || e.key === "T")) {
        e.preventDefault();
        openTeleprompter();
      }
      if (e.altKey && (e.key === "p" || e.key === "P")) {
        e.preventDefault();
        togglePause();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [status, togglePause, openTeleprompter]);

  // Exportar sesión como Markdown (.md)
  const exportSessionMarkdown = useCallback(() => {
    if (answersRef.current.length === 0 && !transcriptRef.current) {
      alert("No hay transcripción ni respuestas registradas para exportar.");
      return;
    }
    let md = `# Informe de Entrevista — ${company || "General"} (${role || "Puesto"})\n\n`;
    md += `**Fecha:** ${new Date().toLocaleString("es-AR")}\n\n`;
    if (profile) md += `## Perfil del Candidato\n${profile}\n\n`;
    md += `## Respuestas Sugeridas\n\n`;
    answersRef.current.forEach((a, i) => {
      md += `### ${i + 1}. Pregunta: ${a.question}\n\n${a.cleanText || a.text}\n\n`;
      if (a.latencyMs) md += `*Latencia de generación: ${a.latencyMs} ms | Modelo: ${a.modelName || "IA"}*\n\n`;
    });
    if (transcriptRef.current) {
      md += `## Transcripción de la Conversación\n\n${transcriptRef.current}\n\n`;
    }
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `entrevista-${(company || "session").toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [company, role, profile]);

  // ---------- Detección de mobile / Safari ----------
  const [noTabCapture, setNoTabCapture] = useState(false);
  useEffect(() => {
    const ua = navigator.userAgent || "";
    const iOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const mobile = iOS || /Android|Mobi/.test(ua);
    const isSafari = /^((?!chrome|android|crios|fxios|edg).)*safari/i.test(ua);
    const noTab = mobile || isSafari;
    setNoTabCapture(noTab);
    if (noTab) setMode("mic");
  }, []);

  // iOS suspende el AudioContext al bloquear pantalla o cambiar de app.
  useEffect(() => {
    const onResume = () => {
      if (document.visibilityState !== "visible") return;
      if (audioCtxRef.current?.state === "suspended") {
        audioCtxRef.current.resume().catch(() => {});
      }
      setTimeout(() => resumeRef.current?.(), 300);
    };
    document.addEventListener("visibilitychange", onResume);
    window.addEventListener("pageshow", onResume);
    return () => {
      document.removeEventListener("visibilitychange", onResume);
      window.removeEventListener("pageshow", onResume);
    };
  }, []);

  useEffect(() => {
    track("enter_app");
  }, []);

  // ---------- Contexto persistido y Banco de Memoria ----------
  useEffect(() => {
    try {
      const sp = localStorage.getItem("loro-saved-profiles");
      if (sp) setSavedProfiles(JSON.parse(sp));

      const storedMaster = localStorage.getItem(LS_ANSWERS_KEY);
      if (storedMaster) setMasterAnswers(JSON.parse(storedMaster));
      
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved.company) setCompany(saved.company);
      if (saved.role) setRole(saved.role);
      if (saved.profile) setProfile(saved.profile);
      if (saved.extraInstructions) setExtraInstructions(saved.extraInstructions);
      if (saved.modelId && MODELS.some((m) => m.id === saved.modelId)) setModelId(saved.modelId);
      if (saved.fontSize && typeof saved.fontSize === "number") setFontSize(saved.fontSize);
    } catch {}
  }, []);

  useEffect(() => {
    if (status !== "idle") return;
    localStorage.setItem(LS_KEY, JSON.stringify({ company, role, profile, extraInstructions, modelId, fontSize }));
  }, [company, role, profile, extraInstructions, modelId, fontSize]);

  const saveMasterAnswer = useCallback((ans: { question: string; enText: string; esText: string; category?: string; tags?: string[] }) => {
    if (!ans.question?.trim() || !ans.enText?.trim()) return;
    setMasterAnswers((prev) => {
      const cleanQ = ans.question.trim().toLowerCase();
      const existingIdx = prev.findIndex((a) => a.question.toLowerCase().trim() === cleanQ);
      const newEntry: MasterAnswer = {
        id: existingIdx >= 0 ? prev[existingIdx].id : `ans_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        question: ans.question.trim(),
        enText: ans.enText.trim(),
        esText: ans.esText?.trim() || "",
        category: ans.category || classifyQuestion(ans.question).label,
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

  // Generador de Pre-Calentamiento / Banco de Preguntas Típicas del Puesto
  const generateWarmupAnswers = useCallback(async () => {
    if (!role && !profile) {
      alert("Cargá al menos la descripción del puesto o tu CV para generar preguntas de práctica.");
      return;
    }
    setIsWarmingUp(true);
    try {
      const promptText = `Sos un entrevistador técnico. Generá exactamente 4 preguntas típicas clave para el puesto: "${role || "Senior Software Engineer"}" con sus respectivas respuestas modelo para el candidato.
Devolvé un JSON array con objetos: [{"question": "...", "enText": "...", "esText": "...", "tags": ["tag1", "tag2"]}]`;
      
      const res = await fetch("/api/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile,
          company,
          role,
          provider: modelRef.current.provider,
          model: modelRef.current.model,
          question: promptText,
          type: "answer",
          detectedLang: "en",
        }),
      });

      if (res.ok) {
        const text = await res.text();
        const parsed = parseBlocks(text);
        // Si devolvió respuesta estructurada, guardarla como muestra
        saveMasterAnswer({
          question: "Tell me about yourself and your background for this role",
          enText: parsed.enText || parsed.cleanText || "I'm a senior software engineer with extensive experience in architecting scalable distributed systems and backend infrastructure.",
          esText: parsed.esText || "Soy ingeniero de software senior con amplia experiencia en sistemas distribuidos y arquitectura backend.",
          tags: ["intro", "experience", "background"],
        });
      }
    } catch (e) {
      console.warn("Error en warmup", e);
    } finally {
      setIsWarmingUp(false);
    }
  }, [role, profile, company, saveMasterAnswer]);

  // ---------- Generación ----------
  const runGenerate = useCallback(
    async (id: number, question: string, controller: AbortController, attempt = 0, type: "answer" | "icebreaker" = "answer") => {
      setIsGenerating(true);
      isGeneratingRef.current = true;
      setAnswers((prev) => {
        const card: Answer = { id, question, text: "", esText: "", enText: "", phoText: "", done: false, ts: Date.now(), feedback: null, bilingual: false, cheats: [], alert: "", snippet: "", cleanText: "" };
        return prev.some((a) => a.id === id)
          ? prev.map((a) => (a.id === id ? card : a))
          : [...prev, card].slice(-20);
      });
      setTab("answer");
      const startedAt = Date.now();
      try {
        const res = await fetch("/api/answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            profile,
            company,
            role,
            provider: modelRef.current.provider,
            model: modelRef.current.model,
            transcript: transcriptRef.current.slice(-2500) || linesRef.current.map((l) => l.text).filter(Boolean).join(" ").slice(-2500),
            question,
            type,
            detectedLang: detectedLangRef.current,
            simpleEnglish,
            extraInstructions,
            previousAnswers: answersRef.current
              .filter(a => a.done && a.text)
              .slice(-2)
              .map(a => ({ q: a.question, a: a.bilingual ? a.enText || a.esText : a.text })),
          }),
          signal: controller.signal,
        });
        if (!res.ok || !res.body) {
          let detail = (await res.text().catch(() => "")).slice(0, 300);
          try {
            const j = JSON.parse(detail);
            if (j?.error) detail = j.error;
          } catch {}
          setAnswers((prev) =>
            prev.map((a) =>
              a.id === id
                ? { ...a, text: detail ? `⚠️ ${detail}` : "· Error generando respuesta.", esText: "", enText: "", phoText: "", done: true, cheats: [], alert: "", snippet: "", cleanText: "" }
                : a
            )
          );
          track("answer_failed", { reason: detail || "http_error", duration_ms: Date.now() - startedAt });
          return;
        }
        const reader = res.body.getReader();
        const dec = new TextDecoder();
        let acc = "";
        let firstTokenTs: number | null = null;
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (!firstTokenTs && value && value.length > 0) {
            firstTokenTs = Date.now();
            playChimeSound();
          }
          acc += dec.decode(value, { stream: true });
          const latencyMs = firstTokenTs ? firstTokenTs - startedAt : Date.now() - startedAt;
          const parsed = parseBlocks(acc);
          setAnswers((prev) => prev.map((a) => (a.id === id ? { ...a, text: acc, ...parsed, latencyMs, modelName: modelRef.current.label } : a)));
          updateTeleprompter(question, parsed.cleanText || acc, parsed.enText, parsed.esText, true);
        }
        const finalText = acc.trim();
        const isPlaceholder =
          !finalText || /esperando pregunta|ninguna a[uú]n/i.test(finalText);
        if (isPlaceholder && attempt < 1 && !controller.signal.aborted) {
          return runGenerate(id, question, controller, attempt + 1);
        }
        const finalParsed = parseBlocks(acc);
        setAnswers((prev) => prev.map((a) => (a.id === id ? { ...a, text: acc, ...finalParsed, done: true } : a)));
        updateTeleprompter(question, finalParsed.cleanText || acc, finalParsed.enText, finalParsed.esText, false);
        track("answer_generated", { model: modelRef.current.model, duration_ms: Date.now() - startedAt });
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        setAnswers((prev) =>
          prev.map((a) => (a.id === id ? { ...a, text: "· Error de red.", done: true } : a))
        );
        track("answer_failed", { reason: err?.message || "network_error", duration_ms: Date.now() - startedAt });
      } finally {
        setIsGenerating(false);
        isGeneratingRef.current = false;
      }
    },
    [profile, company, role, autoMode, modelId, extraInstructions, simpleEnglish, updateTeleprompter]
  );

  // Disparo manual (y también llamado desde el auto-mode).
  const answerNow = useCallback(() => {
    if (isGeneratingRef.current) return;

    track("answer_requested");
    const prev = turnRef.current;
    prev?.controller?.abort();
    turnRef.current = null;
    if (prev) {
      setAnswers((list) => list.filter((a) => !(a.id === prev.id && !a.done && !a.text)));
    }
    
    let rawQ = questionBufRef.current.trim();
    if (rawQ) {
      questionBufRef.current = "";
    } else {
      const interviewerLines = linesRef.current
        .filter((l) => l.speaker !== 1 && l.text)
        .slice(-4)
        .map((l) => l.text)
        .join(" ")
        .trim();
      rawQ = interviewerLines || transcriptRef.current.trim().slice(-300);
    }

    let q = rawQ;
    if (q.includes("[Entrevistador]:")) {
      const parts = q.split("[Entrevistador]:").filter(Boolean);
      q = parts[parts.length - 1].trim();
    }
    if (q.includes("[Yo]:")) {
      const parts = q.split("[Yo]:");
      q = parts[0].trim();
    }

    if (q.trim().length < 2) {
      q = "Tell me about yourself and your experience for this role";
    }

    // ⚡ 1. Comprobación de Memoria Inteligente Instantánea (<50ms)
    const matchRes = findMatchingAnswer(q, masterAnswersRef.current, 0.48);
    if (matchRes) {
      const match = matchRes.match;
      const id = ++ansId.current;
      playChimeSound();
      const card: Answer = {
        id,
        question: q,
        text: match.enText,
        enText: match.enText,
        esText: match.esText,
        cleanText: match.enText,
        done: true,
        ts: Date.now(),
        feedback: null,
        bilingual: !!(match.enText && match.esText),
        cheats: match.tags || [],
        alert: "",
        snippet: "",
        latencyMs: 15,
        modelName: "Memoria Inteligente ⚡",
        fromMemory: true,
      };
      setAnswers((prev) => [...prev, card].slice(-20));
      setTab("answer");
      updateTeleprompter(q, match.enText, match.enText, match.esText, false, true);
      track("answer_served_from_memory", { score: matchRes.score });
      return;
    }

    // ⚡ 2. Generación LLM Streaming si no está en memoria
    const id = ++ansId.current;
    const controller = new AbortController();
    turnRef.current = { id, sentText: q, controller };
    runGenerate(id, q, controller, 0, "answer");
  }, [runGenerate, updateTeleprompter]);

  const askIcebreaker = useCallback(() => {
    if (isGeneratingRef.current) return;
    track("icebreaker_requested");
    const prev = turnRef.current;
    prev?.controller?.abort();
    turnRef.current = null;
    if (prev) {
      setAnswers((list) => list.filter((a) => !(a.id === prev.id && !a.done && !a.text)));
    }
    const q = "¿Qué les puedo preguntar?";
    const id = ++ansId.current;
    const controller = new AbortController();
    turnRef.current = { id, sentText: q, controller };
    runGenerate(id, q, controller, 0, "icebreaker");
  }, [runGenerate]);

  // Referencia estable a answerNow para usarla en el callback de Deepgram
  // sin crear closure viejas.
  const answerNowRef = useRef(answerNow);
  answerNowRef.current = answerNow;

  // Feedback 👍/👎 por respuesta. Togglea el estado visual y manda el evento a
  // analytics (única señal de calidad de respuestas que tenemos).
  const setFeedback = useCallback((id: number, fb: "up" | "down") => {
    setAnswers((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        const next = a.feedback === fb ? null : fb;
        if (next) track("answer_feedback", { rating: next, model: modelRef.current.model });
        return { ...a, feedback: next };
      })
    );
  }, []);

  // ---------- Resumen Post-Entrevista ----------
  const generateSummary = async () => {
    if (lines.length === 0) return;
    setGeneratingSummary(true);
    setSummary("");
    try {
      const fullTranscript = lines
        .map((l) => `${l.speaker === 1 ? "[Yo]" : "[Entrevistador]"}: ${l.text}`)
        .join("\n");
      const res = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile,
          company,
          role,
          transcript: fullTranscript,
          model: modelRef.current.model,
          provider: modelRef.current.provider,
        }),
      });
      if (!res.ok || !res.body) throw new Error("Error en request a summary");
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = dec.decode(value, { stream: true });
        setSummary((prev) => prev + text);
      }
    } catch (err) {
      setSummary("Error al generar resumen.");
    } finally {
      setGeneratingSummary(false);
    }
  };

  // ---------- Utils UI ----------
  const copyAnswer = (id: number, text: string) => {
    const clean = text.replace(/\n{3,}/g, "\n\n").trim();
    navigator.clipboard
      ?.writeText(clean)
      .then(() => {
        setCopiedId(id);
        setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 1500);
        track("answer_copied", { model: modelRef.current.model });
      })
      .catch(() => {});
  };

  const playTTS = useCallback((text: string) => {
    track("tts_played" as any);
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/\n{3,}/g, "\n\n").trim());
    const isEn = text.includes(" the ") || text.includes(" and ") || text.includes(" to ");
    u.lang = isEn ? "en-US" : "es-AR";
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
  }, []);

  const exportHistory = useCallback(() => {
    track("export_history");
    const dateStr = new Date().toLocaleDateString("es-AR").replace(/\//g, "-");
    let content = `# Entrevista Loro Copilot - ${dateStr}\n\n`;
    content += `## Transcripción:\n`;
    lines.forEach(l => {
      if (l.final) content += `${l.text}\n`;
    });
    content += `\n## Respuestas:\n`;
    answers.forEach(a => {
      content += `\n### 💬 ${a.question}\n`;
      if (a.bilingual) {
        content += `**🇦🇷 Español:**\n${a.esText}\n\n**🇺🇸 Inglés:**\n${a.enText}\n`;
      } else {
        content += `${a.text}\n`;
      }
    });
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `entrevista-loro-${dateStr}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [lines, answers]);

  // Limpia respuestas y transcripción en pantalla (como el "Clear" de Parakeet),
  // sin cortar la sesión: el Loro sigue escuchando.
  const clearAll = useCallback(() => {
    if (utteranceDebounceRef.current) clearTimeout(utteranceDebounceRef.current);
    turnRef.current?.controller?.abort();
    turnRef.current = null;
    questionBufRef.current = "";
    setAnswers([]);
    setLines([]);
  }, []);


  // ---------- Mensajes Deepgram ----------
  const onDgMessage = useCallback(
    (raw: string) => {
      let msg: any;
      try {
        msg = JSON.parse(raw);
      } catch {
        return;
      }

      if (isPausedRef.current) return;

      // Auto-mode: cuando el entrevistador termina de hablar (UtteranceEnd),
      // disparamos la respuesta si hay suficiente texto acumulado.
      if (msg.type === "UtteranceEnd") {
        if (!autoModeRef.current) return;
        if (lastSpeakerRef.current === 1) return; // Si hablé yo, no disparo respuesta
        const buf = questionBufRef.current.trim();
        if (buf.length < 8) return; // muy corto = ruido
        // Debounce: si llegan dos UtteranceEnd seguidos (raro pero pasa),
        // solo disparamos una vez.
        if (utteranceDebounceRef.current) clearTimeout(utteranceDebounceRef.current);
        utteranceDebounceRef.current = setTimeout(() => {
          utteranceDebounceRef.current = null;
          answerNowRef.current();
        }, 400);
        return;
      }

      if (msg.type !== "Results") return;

      const alt = msg.channel?.alternatives?.[0];
      const text: string = alt?.transcript || "";
      if (!text) return;
      const isFinal = !!msg.is_final;
      // Por defecto 0 si no hay info de diarization
      const speaker = alt?.words?.[0]?.speaker ?? 0;
      
      const langs = alt?.languages;
      if (langs && langs.length > 0) {
        // Deepgram devuelve "es", "en", o a veces "en-US", "es-419"
        const baseLang = langs[0].slice(0, 2).toLowerCase();
        if (baseLang === "es" || baseLang === "en") {
          detectedLangRef.current = baseLang;
          setDetectedLang(baseLang);
        }
      }

      setLines((prev) => {
        const next = [...prev];
        if (next.length && !next[next.length - 1].final && next[next.length - 1].speaker === speaker) {
          next[next.length - 1] = { id: next[next.length - 1].id, text, final: isFinal, speaker };
        } else {
          next.push({ id: ++lineId.current, text, final: isFinal, speaker });
        }
        return next.slice(-60);
      });

      // Solo acumulamos texto (contexto + buffer para "Responder ahora"). La
      // generación ocurre al tocar el botón O al detectar fin de intervención
      // (UtteranceEnd) cuando auto-mode está ON.
      if (isFinal) {
        let prefix = " ";
        if (speaker !== lastSpeakerRef.current) {
          prefix = speaker === 1 ? "\n\n[Yo]: " : "\n\n[Entrevistador]: ";
          lastSpeakerRef.current = speaker;
        }
        transcriptRef.current = (transcriptRef.current + prefix + text).slice(-8000);
        questionBufRef.current = (questionBufRef.current + prefix + text).slice(-1500);
      }
    },
    []
  );

  // Escuchar mensajes de la extensión de Chrome
  useEffect(() => {
    const handleExtMessage = (e: MessageEvent) => {
      if (e.data?.type === "LORO_EXT_DG_MESSAGE") {
        onDgMessage(e.data.data);
      }
    };
    window.addEventListener("message", handleExtMessage);
    return () => window.removeEventListener("message", handleExtMessage);
  }, [onDgMessage]);

  // ---------- Captura ----------
  const acquireStream = useCallback(async (m: Mode): Promise<MediaStream> => {
    if (m === "tab") {
      const s = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      const at = s.getAudioTracks();
      if (at.length === 0) {
        s.getTracks().forEach((t) => t.stop());
        throw new Error('No se compartió audio. Al elegir la pestaña activá "Compartir audio de la pestaña".');
      }
      s.getVideoTracks().forEach((t) => t.stop());
      return new MediaStream(at);
    }
    // mic
    return navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    });
  }, []);

  const start = useCallback(async () => {
    setError("");
    setStatus("connecting");
    questionBufRef.current = "";
    intentionalCloseRef.current = false;
    reconnectAttemptsRef.current = 0;
    turnRef.current?.controller?.abort();
    turnRef.current = null;
    // Idioma del entrevistador (STT) fijado al inicio de la sesión.
    const dgUrl = buildDgUrl();
    try {
      const stream = await acquireStream(mode);
      streamRef.current = stream;

      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;
      if (audioCtx.state === "suspended") await audioCtx.resume();
      await audioCtx.audioWorklet.addModule("/pcm-worklet.js");
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      source.connect(analyser);
      
      const worklet = new AudioWorkletNode(audioCtx, "pcm-worklet");
      workletRef.current = worklet;
      // El handler apunta siempre al socket vigente vía wsRef: tras una
      // reconexión el audio fluye solo al socket nuevo, sin re-cablear nada.
      worklet.port.onmessage = (e) => {
        const w = wsRef.current;
        if (w && w.readyState === WebSocket.OPEN) w.send(e.data);
      };
      source.connect(worklet);

      // Abre (o reabre) el WebSocket contra Deepgram reusando el mismo
      // stream/worklet: en una reconexión NO se vuelve a pedir permiso de
      // micrófono ni de pestaña, solo se reconstruye el socket.
      const connectWs = async () => {
        const tokRes = await fetch("/api/deepgram-token", { method: "POST" });
        if (!tokRes.ok) {
          const e = await tokRes.json().catch(() => ({}));
          // Kill switch global del server: no es un error de conexión, es
          // "no hay más cupo hoy" → lo maneja el catch de start() con paywall.
          if (tokRes.status === 503 && e.closed) {
            const err = new Error(e.error || "Cupos agotados por hoy.");
            err.name = "CapacityClosed";
            throw err;
          }
          throw new Error(e.error || "No se pudo obtener token de Deepgram.");
        }
        const { token, scheme } = await tokRes.json();

        // Token temporal de Deepgram (grant): usa esquema "bearer". Fallback a
        // "token" por compatibilidad si el backend no mandara scheme.
        const ws = new WebSocket(dgUrl, [scheme || "token", token]);
        ws.binaryType = "arraybuffer";
        wsRef.current = ws;

        ws.onopen = () => {
          setError("");
          setStatus("live");
          // Renueva el presupuesto de reintentos solo si la conexión aguanta
          // 10s estable (no apenas abre): evita el loop infinito de flapping.
          if (stableTimerRef.current) clearTimeout(stableTimerRef.current);
          stableTimerRef.current = setTimeout(() => {
            reconnectAttemptsRef.current = 0;
          }, 10000);
          // Keepalive: Deepgram cierra tras ~10s de silencio sin datos.
          if (keepAliveRef.current) clearInterval(keepAliveRef.current);
          keepAliveRef.current = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN)
              ws.send(JSON.stringify({ type: "KeepAlive" }));
          }, 7000);
        };
        ws.onmessage = (e) => onDgMessage(e.data);
        ws.onerror = (err) => {
          console.error("Deepgram WebSocket error:", err);
        };
        ws.onclose = (event) => {
          if (stableTimerRef.current) {
            clearTimeout(stableTimerRef.current);
            stableTimerRef.current = null;
          }
          if (intentionalCloseRef.current) return; // stop()/cleanup() maneja el estado
          if (scheduleReconnect()) return;
          cleanup();
          if (event.code !== 1000 && event.code !== 1001) {
            setError(`Se cortó la conexión (Código: ${event.code}, Razón: ${event.reason || "Sin razón"}). Revisá tu internet y tocá para reanudar.`);
            setStatus("error");
          } else {
            setStatus((s) => (s === "error" ? s : "idle"));
          }
        };
      };

      // Caída inesperada en medio de la sesión: reintenta hasta 3 veces con
      // backoff corto, mientras el audio siga vivo. Devuelve false si ya no
      // corresponde reintentar (el llamador decide el estado final).
      const scheduleReconnect = (): boolean => {
        const trackAlive = stream.getAudioTracks()[0]?.readyState === "live";
        if (intentionalCloseRef.current || !trackAlive || reconnectAttemptsRef.current >= 3) return false;
        reconnectAttemptsRef.current += 1;
        setError(`Se cortó la conexión — reconectando (intento ${reconnectAttemptsRef.current}/3)…`);
        const delay = 600 * 2 ** (reconnectAttemptsRef.current - 1); // 600ms, 1.2s, 2.4s
        reconnectTimerRef.current = setTimeout(() => {
          reconnectTimerRef.current = null;
          connectWs().catch(() => {
            // Falló antes de abrir el socket (p.ej. el fetch del token):
            // reintenta por el mismo camino o rinde el turno con error.
            if (!scheduleReconnect()) {
              cleanup();
              setError("Se perdió la conexión y no se pudo reanudar. Tocá para reintentar.");
              setStatus("error");
            }
          });
        }, delay);
        return true;
      };

      // Al volver de segundo plano: si el socket murió mientras la app estaba
      // en background (Deepgram corta a los ~10s sin audio) pero el micrófono
      // sigue vivo, reconectamos solos en vez de dejar el error en pantalla.
      resumeRef.current = () => {
        if (intentionalCloseRef.current) return;
        const w = wsRef.current;
        const socketDead = !w || w.readyState === WebSocket.CLOSING || w.readyState === WebSocket.CLOSED;
        const trackAlive = stream.getAudioTracks()[0]?.readyState === "live";
        if (!socketDead || !trackAlive) return;
        if (reconnectTimerRef.current) return; // ya hay una reconexión en curso
        reconnectAttemptsRef.current = 0;
        setError("Reconectando…");
        setStatus("connecting");
        connectWs().catch(() => {
          if (!scheduleReconnect()) {
            cleanup();
            setError("Se perdió la conexión y no se pudo reanudar. Tocá para reintentar.");
            setStatus("error");
          }
        });
      };

      await connectWs();

      track("session_start", { mode, model: modelRef.current.model });

      stream.getAudioTracks()[0].onended = () => stop();

      // Wake lock: evita que el celular apague la pantalla en modo mic.
      try {
        // @ts-ignore
        if (navigator.wakeLock) wakeLockRef.current = await navigator.wakeLock.request("screen");
      } catch {}
    } catch (err: any) {
      cleanup();

      track("session_error", { error: err?.name || "unknown" });
      setError(err?.message || "Error al iniciar.");
      setStatus("error");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, acquireStream, onDgMessage]);

  const cleanup = useCallback(() => {
    // Marca el cierre como intencional ANTES de cerrar el WS: su onclose no
    // debe disparar una reconexión.
    intentionalCloseRef.current = true;
    resumeRef.current = null;
    if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    reconnectTimerRef.current = null;
    if (stableTimerRef.current) clearTimeout(stableTimerRef.current);
    stableTimerRef.current = null;
    if (keepAliveRef.current) clearInterval(keepAliveRef.current);
    keepAliveRef.current = null;
    if (sessionTimerRef.current) clearTimeout(sessionTimerRef.current);
    sessionTimerRef.current = null;
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = null;
    turnRef.current?.controller?.abort();
    turnRef.current = null;
    try {
      if (wsRef.current?.readyState === WebSocket.OPEN)
        wsRef.current.send(JSON.stringify({ type: "CloseStream" }));
      wsRef.current?.close();
    } catch {}
    try {
      workletRef.current?.disconnect();
    } catch {}
    try {
      audioCtxRef.current?.close();
    } catch {}
    streamRef.current?.getTracks().forEach((t) => t.stop());
    try {
      wakeLockRef.current?.release?.();
    } catch {}
    wsRef.current = null;
    workletRef.current = null;
    audioCtxRef.current = null;
    streamRef.current = null;
    wakeLockRef.current = null;
  }, []);

  const stop = useCallback(() => {
    track("session_stopped");
    cleanup();
    setStatus("idle");
  }, [cleanup]);

  useEffect(() => () => cleanup(), [cleanup]);

  // Re-adquiere el wake lock al volver a la app: iOS lo libera solo al perder foco.
  useEffect(() => {
    const reacquire = async () => {
      if (document.visibilityState !== "visible" || status !== "live" || wakeLockRef.current) return;
      try {
        // @ts-ignore
        if (navigator.wakeLock) wakeLockRef.current = await navigator.wakeLock.request("screen");
      } catch {}
    };
    document.addEventListener("visibilitychange", reacquire);
    return () => document.removeEventListener("visibilitychange", reacquire);
  }, [status]);

  useEffect(() => {
    scrollT.current?.scrollTo({ top: scrollT.current.scrollHeight });
  }, [lines]);
  // Al aparecer/llenarse una respuesta nueva, bajamos el scroll hasta que su
  // parte de arriba quede al tope del área, dejando la Q&A anterior arriba
  // (como Parakeet). Depende también del texto de la última: cuando la card
  // arranca vacía el contenedor todavía no es scrolleable; al llenarse, se
  // reintenta. NO depende de `feedback`, así tocar 👍/👎 no mueve el scroll.
  const lastAnswerText = answers.length ? answers[answers.length - 1].text : "";
  useEffect(() => {
    const container = scrollA.current;
    if (!container || answers.length === 0) return;
    const last = container.lastElementChild as HTMLElement | null;
    if (!last) return;
    const cRect = container.getBoundingClientRect();
    const lRect = last.getBoundingClientRect();
    const delta = lRect.top - cRect.top;
    if (delta > 1) container.scrollTo({ top: container.scrollTop + delta - 4, behavior: "smooth" });
  }, [answers.length, lastAnswerText]);

  const live = status === "live";
  const connecting = status === "connecting";

  useEffect(() => {
    if (!live) {
      if (waveformRafRef.current) cancelAnimationFrame(waveformRafRef.current);
      return;
    }
    const analyser = analyserRef.current;
    const canvas = canvasRef.current;
    if (!analyser || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const draw = () => {
      waveformRafRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);
      
      let sumSquares = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = (dataArray[i] - 128) / 128.0;
        sumSquares += v * v;
      }
      const rms = Math.sqrt(sumSquares / bufferLength);

      // VAD Híbrido: Si el rms baja mucho por 3s, disparamos respuesta.
      if (rms < 0.02) {
        if (!silenceStartRef.current) silenceStartRef.current = Date.now();
        else if (Date.now() - silenceStartRef.current > 3000) {
          if (autoModeRef.current && lastSpeakerRef.current !== 1 && questionBufRef.current.trim().length >= 8) {
            if (utteranceDebounceRef.current) clearTimeout(utteranceDebounceRef.current);
            silenceStartRef.current = null;
            answerNowRef.current();
          }
        }
      } else {
        silenceStartRef.current = null;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#10b981"; // loro-green
      ctx.beginPath();
      const sliceWidth = canvas.width * 1.0 / bufferLength;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * canvas.height / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };
    draw();
    return () => {
      if (waveformRafRef.current) cancelAnimationFrame(waveformRafRef.current);
    };
  }, [live]);

  return (
    <main className={`app-container ${live ? "app-live" : ""}`}>
      <header className="brand-header">
        <div className="brand">
          <BrandLogo />
        </div>
        <div className="header-right">
          {!live && connecting && <span className="status-chip">conectando…</span>}
          {!live && status === "error" && <span className="status-chip">error</span>}
          {live && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                onClick={openTeleprompter}
                className="btn-action mono"
                style={{ fontSize: 12, padding: "4px 10px", background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", border: "1px solid rgba(56, 189, 248, 0.3)", borderRadius: 6, fontWeight: 600 }}
                title="Abrir ventana flotante para colocar debajo de la webcam"
              >
                🪟 Teleprompter
              </button>
              <div className="status-chip" style={{ display: "flex", gap: 6, alignItems: "center", background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)" }} title="Idioma detectado (Auto-Bilingual)">
                <span style={{ fontSize: "1.2em", lineHeight: 1 }}>{detectedLang === "en" ? "🇺🇸" : "🇪🇸"}</span>
                <span style={{ fontWeight: 600 }}>{detectedLang.toUpperCase()}</span>
              </div>
              <canvas ref={canvasRef} width={60} height={20} style={{ opacity: 0.8 }} title="Nivel de audio" />
              <button className="stop-x" onClick={stop} aria-label="Detener" title="Detener">
                ✕
              </button>
            </div>
          )}
        </div>
      </header>

      {!live && (
        <p className="tagline">
          El asistente escucha tu entrevista en tiempo real y sugiere respuestas alineadas con tu context. 100%
          listo para Google Meet, Teams y Zoom. 🦜
        </p>
      )}

      {/* Selectores de idioma + modelo, en una misma línea (estilo Parakeet) */}
      {!live && (
        <div>
          <div className="selectors-row">
            <div className="field">
              <label className="mono form-label">Asistencia de Inglés</label>
              <button
                type="button"
                onClick={() => setSimpleEnglish((s) => !s)}
                className="mono"
                style={{
                  height: 38,
                  padding: "0 12px",
                  borderRadius: 8,
                  border: simpleEnglish ? "1px solid var(--loro-green)" : "1px solid var(--line-strong)",
                  background: simpleEnglish ? "rgba(16, 185, 129, 0.12)" : "var(--bg)",
                  color: simpleEnglish ? "var(--loro-green)" : "var(--ink-dim)",
                  fontWeight: 600,
                  fontSize: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                  cursor: "pointer",
                  width: "100%",
                }}
                title="Activa oraciones cortas y guía fonética simplificada en español para leer fluido"
              >
                <span>{simpleEnglish ? "🗣️ Guía Fonética & Simple" : "🌐 Inglés Estándar"}</span>
                <span style={{ fontSize: 10, background: simpleEnglish ? "var(--loro-green)" : "var(--line-strong)", color: simpleEnglish ? "#000" : "var(--ink-dim)", padding: "1px 6px", borderRadius: 10, fontWeight: 700 }}>
                  {simpleEnglish ? "ON" : "OFF"}
                </span>
              </button>
            </div>

            <div className="field">
              <label className="mono form-label">Modelo de IA</label>
              <Dropdown
                value={modelId}
                onChange={(id) => { setModelId(id); const m = MODELS.find((m) => m.id === id); if (m) track("model_changed", { model: m.model, provider: m.provider }); }}
                disabled={connecting}
                ariaLabel="Modelo de IA"
                alignRight
                options={MODELS.map((m) => ({
                  id: m.id,
                  label: m.label,
                  icon: <ProviderIcon provider={m.provider} />,
                  tag: m.tag === "Recomendado" ? undefined : m.tag,
                  badge: m.tag === "Recomendado" ? "Recomendado" : undefined,
                }))}
              />
            </div>
          </div>
        </div>
      )}

      {/* Selector de modo: se oculta en mobile (iOS/Android) y en Safari
          —incluso de escritorio—, donde "Pestaña" no tiene sentido o no
          funciona; en esos casos se usa directamente el micrófono. */}
      {!live && !noTabCapture && (
        <div className={`grid-responsive`}>
          <button
            className={`btn-select ${mode === "mic" ? "btn-select-active" : ""}`}
            onClick={() => { setMode("mic"); track("mode_changed", { mode: "mic" }); }}
            disabled={connecting}
          >
            🎙️ Micrófono
            <span className="btn-select-sub">Escuchar la sala por mic</span>
          </button>
          <button
            className={`btn-select ${mode === "tab" ? "btn-select-active" : ""}`}
            onClick={() => { setMode("tab"); track("mode_changed", { mode: "tab" }); }}
            disabled={connecting}
          >
            🖥️ Pestaña
            <span className="btn-select-sub">Audio digital de Meet/Zoom</span>
          </button>
        </div>
      )}
      {error && (
        <div className="mono error-box" style={{
          fontSize: 13,
          color: "var(--loro-red-deep)",
          background: "rgba(239, 68, 68, 0.07)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          borderRadius: 12,
          padding: "12px 16px",
          lineHeight: 1.5
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Resumen Post-Entrevista */}
      {!live && (lines.length > 0 || answers.length > 0) && (
        <div className="panel" style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <span className="mono" style={{ fontWeight: 600, fontSize: "1.1em" }}>📊 Análisis de Entrevista</span>
            <div style={{ display: "flex", gap: 8 }}>
              <button 
                onClick={exportSessionMarkdown}
                className="btn-action mono" 
                style={{ background: "var(--bg)", color: "var(--ink)", border: "1px solid var(--line-strong)", padding: "6px 14px", borderRadius: 8, fontWeight: 600 }}
              >
                📥 Exportar (.md)
              </button>
              {!summary && (
                <button 
                  onClick={generateSummary}
                  disabled={generatingSummary}
                  className="btn-action mono" 
                  style={{ background: "var(--loro-green)", color: "#fff", border: "none", padding: "6px 16px", borderRadius: 8, fontWeight: 600 }}
                >
                  {generatingSummary ? "Analizando..." : "Generar Feedback"}
                </button>
              )}
            </div>
          </div>
          {summary && (
            <div className="answer-card-text" style={{ marginTop: 12, padding: 12, background: "var(--bg)", borderRadius: 8, border: "1px solid var(--line-strong)", fontSize: "0.95em", whiteSpace: "pre-wrap" }}>
              <MarkdownText text={summary} />
            </div>
          )}
        </div>
      )}

      {/* Contexto de la entrevista (solo antes de arrancar) */}
      {!live && (
        <div className="panel">
          {/* Score de Preparación + Checklist Pre-Entrevista */}
          {(() => {
            let score = 0;
            if (company.trim()) score += 20;
            if (role.trim().length > 20) score += 30;
            if (profile.trim().length > 50) score += 30;
            if (extraInstructions.trim()) score += 10;
            if (answers.length > 0) score += 10;
            const level = score >= 80 ? "Sólido 🔥" : score >= 50 ? "Aceptable 🟡" : "Inicial ⚪";
            return (
              <div style={{ marginBottom: 16, padding: "12px 14px", background: "rgba(255,255,255,0.03)", border: "1px solid var(--line-strong)", borderRadius: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 6 }}>
                  <span className="mono" style={{ fontSize: "0.9em", fontWeight: 600 }}>📊 Score de Preparación: <strong style={{ color: score >= 80 ? "var(--loro-green)" : "var(--ink)" }}>{score}% ({level})</strong></span>
                </div>
                <div style={{ height: 6, width: "100%", background: "rgba(255,255,255,0.1)", borderRadius: 3, overflow: "hidden", marginBottom: 10 }}>
                  <div style={{ height: "100%", width: `${score}%`, background: score >= 80 ? "var(--loro-green)" : score >= 50 ? "#f59e0b" : "var(--ink-dim)", transition: "width 0.3s ease" }} />
                </div>
                {/* Checklist Pre-Entrevista */}
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: "0.8em", color: "var(--ink-dim)", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 8 }}>
                  <label style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                    <input type="checkbox" checked={profile.length > 30} readOnly /> CV Cargado
                  </label>
                  <label style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                    <input type="checkbox" checked={role.length > 20} readOnly /> Puesto Cargado
                  </label>
                  <label style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                    <input type="checkbox" checked={checklist.teleprompter} onChange={e => setChecklist(c => ({ ...c, teleprompter: e.target.checked }))} /> Teleprompter Listo
                  </label>
                  <label style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                    <input type="checkbox" checked={checklist.mic} onChange={e => setChecklist(c => ({ ...c, mic: e.target.checked }))} /> Audio / Mic OK
                  </label>
                </div>
              </div>
            );
          })()}

          {/* Selector de Dialecto / Registro */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <label className="mono form-label" style={{ marginBottom: 0 }}>
              Contexto de la entrevista
            </label>
            <div style={{ display: "flex", gap: 4 }}>
              {(["rioplatense", "neutro", "english"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDialect(d)}
                  className={`btn-action mono ${dialect === d ? "btn-primary" : ""}`}
                  style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, border: "1px solid var(--line-strong)" }}
                >
                  {d === "rioplatense" ? "🇦🇷 Rioplatense" : d === "neutro" ? "🇲🇽 Neutro" : "🇺🇸 English"}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            <button
              type="button"
              className="btn-action mono"
              style={{
                padding: "0 14px",
                height: 36,
                background: "rgba(16, 185, 129, 0.15)",
                border: "1px solid var(--loro-green)",
                color: "var(--loro-green)",
                fontWeight: 700,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                gap: 6,
                cursor: "pointer",
              }}
              title="Cargar configuración completa para entrevista técnica de EPAM (Senior Python)"
              onClick={() => {
                setCompany("EPAM Systems");
                setRole(
                  "Senior Python Engineer (Backend & Cloud-Native)\n\n• Formato: 80% teórica / arquitectura, 20% live coding / algoritmos.\n• Core Python: Data model, mutability, shallow vs deep copy, iterators/generators (lazy eval), context managers, exceptions design, typing, dataclasses.\n• Concurrency: Asyncio vs threads vs multiprocessing (I/O vs CPU bound), async cancellation/timeouts, avoiding blocking calls with asyncio.to_thread, GIL mechanics.\n• Quality & Testing: Pytest fixtures & parametrization, Clean Architecture, DDD, CI linters/formatters.\n• Debugging: Workflow reproduce -> measure (cProfile/tracemalloc) -> isolate -> optimize -> verify regression. Structured logging & OpenTelemetry."
                );
                setExtraInstructions(
                  "EPAM SENIOR RUBRIC: Seguir esquema Context -> Assumptions -> Approach -> Trade-offs -> Validation. En coding/algoritmos: plantear edge cases, complejidad Big-O y código Python 3.11+ limpio y tipado (sin clever one-liners). Anclar a experiencia real en Reforest Latam, FastAPI y PostgreSQL."
                );
                setSimpleEnglish(true);
              }}
            >
              ⚡ Preset EPAM (Senior Python)
            </button>
            <button
              type="button"
              className="btn-action mono"
              style={{
                padding: "0 14px",
                height: 36,
                background: "rgba(245, 158, 11, 0.15)",
                border: "1px solid rgba(245, 158, 11, 0.4)",
                color: "#fbbf24",
                fontWeight: 700,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                gap: 6,
                cursor: "pointer",
              }}
              title="Abrir Banco de Respuestas y Memoria Instantánea"
              onClick={() => setShowMemoryModal(true)}
            >
              🧠 Memoria ({masterAnswers.length})
            </button>
            <select
              className="form-input mono"
              style={{ flex: 1, minWidth: 180, height: 36, padding: "0 12px" }}
              onChange={(e) => {
                const p = savedProfiles.find((x) => x.name === e.target.value);
                if (p) {
                  setCompany(p.company);
                  setRole(p.role);
                  setProfile(p.profile);
                  setExtraInstructions(p.extraInstructions || "");
                }
              }}
            >
              <option value="">📁 Cargar perfil guardado...</option>
              {savedProfiles.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
            <button
              className="btn-action mono"
              style={{ padding: "0 16px", height: 36, background: "var(--bg)", border: "1px solid var(--line-strong)", color: "var(--ink)", fontWeight: 600, borderRadius: 8 }}
              onClick={() => {
                const name = prompt("Nombre para este perfil (ej: Frontend SSR):");
                if (!name) return;
                const newProfiles = [...savedProfiles.filter((p) => p.name !== name), { name, company, role, profile, extraInstructions }];
                setSavedProfiles(newProfiles);
                localStorage.setItem("loro-saved-profiles", JSON.stringify(newProfiles));
              }}
            >
              Guardar actual
            </button>
            {savedProfiles.length > 0 && (
              <button
                className="btn-action mono"
                style={{ padding: "0 10px", height: 36, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", fontWeight: 600, borderRadius: 8 }}
                title="Borrar perfiles guardados"
                onClick={() => {
                  if (confirm("¿Borrar todos los perfiles guardados?")) {
                    setSavedProfiles([]);
                    localStorage.removeItem("loro-saved-profiles");
                  }
                }}
              >
                🗑️
              </button>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label className="mono form-mini-label">
              <BriefcaseIcon /> Empresa
              <InfoTip text="La empresa donde estás entrevistando. Ayuda a que las respuestas suenen específicas de ese lugar." />
            </label>
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Ej: Mercado Libre"
              className="form-input"
              disabled={connecting}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 4 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <label className="mono form-mini-label" style={{ marginTop: 0 }}>
                <DocIcon /> Descripción del puesto
                <InfoTip text="Pegá el aviso o subí un PDF con los requisitos del puesto." />
              </label>
              <label className="btn-action mono" style={{ cursor: "pointer", fontSize: 11, padding: "2px 8px", background: "var(--bg)", border: "1px solid var(--line-strong)", borderRadius: 4, display: "flex", alignItems: "center", gap: 4 }}>
                📄 Subir PDF
                <input type="file" accept="application/pdf" style={{ display: "none" }} onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const { extractTextFromPdf } = await import("../lib/pdf");
                    const text = await extractTextFromPdf(file);
                    setRole((prev) => prev ? prev + "\n\n" + text.trim() : text.trim());
                  } catch (err) {
                    alert("Error al leer el PDF del puesto.");
                  }
                  e.target.value = "";
                }} disabled={connecting} />
              </label>
            </div>
            <textarea
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Pegá la descripción del puesto o subí un PDF con la vacante."
              className="form-textarea form-textarea-sm"
              disabled={connecting}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 4 }}>
            <label className="mono form-mini-label" style={{ marginTop: 0 }}>
              <UserIcon /> Perfil y Base de Conocimiento (RAG)
              <InfoTip text="Subí tu CV o PDFs con proyectos, notas o info de la empresa. El asistente usará TODO este contexto como su cerebro para responder sin inventar." />
            </label>
            <label className="btn-action mono" style={{ cursor: "pointer", fontSize: 11, padding: "2px 8px", background: "var(--bg)", border: "1px solid var(--line-strong)", borderRadius: 4, display: "flex", alignItems: "center", gap: 4 }}>
              📄 Subir PDF
              <input type="file" accept="application/pdf" style={{ display: "none" }} onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  const { extractTextFromPdf } = await import("../lib/pdf");
                  const text = await extractTextFromPdf(file);
                  setProfile((prev) => prev ? prev + "\n\n--- NUEVO DOCUMENTO ---\n" + text.trim() : text.trim());
                } catch (err) {
                  alert("Error al leer el PDF. Asegurate de que sea un PDF con texto seleccionable.");
                }
                e.target.value = "";
              }} disabled={connecting} />
            </label>
          </div>
          <textarea
            value={profile}
            onChange={(e) => setProfile(e.target.value)}
            placeholder="Pegá tu CV, notas o subí múltiples PDFs. El Loro usará esto como su base de datos personal."
            className="form-textarea"
            disabled={connecting}
          />
          <label className="mono form-mini-label" style={{ marginTop: 4 }}>
            <SparkleIcon /> Instrucciones Extra
            <InfoTip text="Instrucciones opcionales. Ej: 'Hablame como a un Sr Engineer', 'Enfocate en mi experiencia en AWS'." />
          </label>
          <input
            value={extraInstructions}
            onChange={(e) => setExtraInstructions(e.target.value)}
            placeholder="Ej: Solo respuestas cortas y directas, enfocate en liderazgo."
            className="form-input"
            disabled={connecting}
          />
        </div>
      )}

      {/* Tira de escucha en vivo: muestra lo último que se oye y da acceso
          secundario a la transcripción. La respuesta es la protagonista. */}
      {live && (
        <div className="listen-bar mono" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
            {tab === "answer" ? (
              <>
                <span className="eq" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                  <span />
                </span>
                <span className="listen-text listen-text-live" style={{ flex: 1 }}>
                  <ListenText text={lines.length ? lines[lines.length - 1].text : ""} />
                </span>
                <button className="listen-toggle" onClick={() => setTab("transcript")}>
                  Transcripción
                </button>
              </>
            ) : (
              <>
                <span className="listen-text" style={{ color: "var(--ink)", fontWeight: 600 }}>
                  Transcripción completa
                </span>
                <button className="listen-toggle" onClick={() => setTab("answer")}>
                  ← Respuestas
                </button>
              </>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 11, color: "var(--ink-dim)" }}>Texto:</span>
            <button className="listen-toggle" style={{ minWidth: 32, padding: "2px 8px" }} onClick={() => setFontSize(f => Math.max(10, f - 2))}>A-</button>
            <button className="listen-toggle" style={{ minWidth: 32, padding: "2px 8px" }} onClick={() => setFontSize(f => Math.min(24, f + 2))}>A+</button>
          </div>
        </div>
      )}

      {/* Contenido */}
      <section style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", marginTop: 4 }}>
        {live && tab === "answer" && (
          <div className="panel" style={{ flex: 1, minHeight: 0, padding: compactUi ? "8px" : undefined }}>
            
            {/* Barra de Frases de Emergencia / Rescate en Vivo */}
            <div style={{ marginBottom: 10, background: "rgba(245, 158, 11, 0.05)", border: "1px solid rgba(245, 158, 11, 0.2)", borderRadius: 10, padding: "8px 12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: "#f59e0b", letterSpacing: "0.5px" }}>
                  ⚡ FRASES DE RESCATE (GANAR TIEMPO & CLARIFICAR)
                </span>
                <button
                  onClick={() => setSimpleEnglish((s) => !s)}
                  className="mono"
                  style={{
                    fontSize: 10.5,
                    padding: "2px 8px",
                    borderRadius: 6,
                    border: simpleEnglish ? "1px solid rgba(16, 185, 129, 0.4)" : "1px solid var(--line-strong)",
                    background: simpleEnglish ? "rgba(16, 185, 129, 0.15)" : "transparent",
                    color: simpleEnglish ? "var(--loro-green)" : "var(--ink-dim)",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                  title="Forzar respuestas cortas y guía fonética simplificada"
                >
                  {simpleEnglish ? "✓ Inglés Simple & Fonética ON" : "Inglés Simple OFF"}
                </button>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {RESCUE_PHRASES.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveRescue(activeRescue?.label === r.label ? null : r)}
                    className="mono"
                    style={{
                      fontSize: 11.5,
                      padding: "4px 8px",
                      borderRadius: 6,
                      border: activeRescue?.label === r.label ? "1px solid #f59e0b" : "1px solid var(--line-strong)",
                      background: activeRescue?.label === r.label ? "rgba(245, 158, 11, 0.2)" : "var(--bg)",
                      color: activeRescue?.label === r.label ? "#fbbf24" : "var(--ink)",
                      cursor: "pointer",
                      fontWeight: 500,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <span>{r.icon}</span>
                    <span>{r.label}</span>
                  </button>
                ))}
              </div>
              {activeRescue && (
                <div style={{ marginTop: 8, padding: "10px 12px", background: "var(--panel)", borderRadius: 8, border: "1px solid #f59e0b", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>🇺🇸 {activeRescue.en}</span>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => playTTS(activeRescue.en)}
                        style={{ background: "rgba(56, 189, 248, 0.15)", color: "#0284c7", border: "1px solid rgba(56, 189, 248, 0.3)", borderRadius: 6, padding: "3px 8px", cursor: "pointer", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}
                        title="Escuchar pronunciación"
                      >
                        🔊 Escuchar
                      </button>
                      <button
                        onClick={() => copyAnswer(99999, activeRescue.en)}
                        style={{ background: "var(--bg)", color: "var(--ink)", border: "1px solid var(--line-strong)", borderRadius: 6, padding: "3px 8px", cursor: "pointer", fontSize: 12 }}
                        title="Copiar"
                      >
                        📋
                      </button>
                    </div>
                  </div>
                  {activeRescue.es && (
                    <div style={{ padding: "6px 10px", background: "rgba(245, 158, 11, 0.08)", borderRadius: 6, border: "1px solid rgba(245, 158, 11, 0.2)", fontSize: 12, color: "var(--ink-dim)", fontStyle: "italic" }}>
                      🇦🇷 {activeRescue.es}
                    </div>
                  )}
                </div>
              )}
            </div>

            {answers.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <input
                  type="text"
                  placeholder="🔍 Buscar en respuestas pasadas..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="form-input mono"
                  style={{ height: 32, fontSize: 12, padding: "0 10px" }}
                />
              </div>
            )}
            <div ref={scrollA} className="answers-container" style={{ fontSize: `${fontSize}px` }}>
              {answers.length === 0 ? (
                <p className="placeholder" style={{ fontSize: 13.5, color: "var(--ink-dim)", lineHeight: 1.6, textAlign: "center", fontStyle: "italic", padding: "8px" }}>
                  {autoMode
                    ? "El Loro va a responder solo cuando termine la pregunta. También podés tocar \"Responder\"."
                    : "Tocá \u201cResponder\u201d cuando termine la pregunta y tu respuesta aparece acá."}
                </p>
              ) : (
                answers
                  .filter((a) => !searchFilter || a.question.toLowerCase().includes(searchFilter.toLowerCase()) || a.text.toLowerCase().includes(searchFilter.toLowerCase()))
                  .map((a, index) => (
                    <AnswerCard
                      key={a.id}
                      answer={a}
                      isCurrent={index === answers.length - 1}
                      compactUi={compactUi}
                      copiedId={copiedId}
                      onCopy={copyAnswer}
                      onFeedback={setFeedback}
                      onPlayTTS={playTTS}
                      onSaveToMemory={(card) => saveMasterAnswer({ question: card.question, enText: card.enText || card.text, esText: card.esText || "", tags: card.cheats })}
                      isSavedInMemory={masterAnswers.some((m) => m.question.toLowerCase().trim() === a.question.toLowerCase().trim())}
                    />
                  ))
              )}
            </div>
          </div>
        )}

        {live && tab === "transcript" && (
          <div className="panel" style={{ flex: 1, minHeight: 0 }}>
            {lines.length > 0 && (
              <div style={{ padding: "6px 12px", background: "rgba(16,185,129,0.08)", borderBottom: "1px solid var(--line-strong)", fontSize: "0.85em", display: "flex", justifyContent: "space-between", alignItems: "center", borderRadius: "8px 8px 0 0" }}>
                <span className="mono">🎙️ Muletillas detectadas: <strong>{(lines.map(l => l.text).join(" ").toLowerCase().match(/\b(eh|este|o sea|bueno|digamos|nada|tipo|viste)\b/g) || []).length}</strong></span>
                <span className="mono" style={{ color: "var(--ink-dim)" }}>⌨️ Ctrl+Enter: Responder | Alt+P: Pausar</span>
              </div>
            )}
            <div ref={scrollT} className="transcript-container">
              {lines.length === 0 ? (
                <p className="placeholder" style={{ fontSize: 13.5, color: "var(--ink-dim)", lineHeight: 1.6, textAlign: "center", fontStyle: "italic", padding: "8px" }}>
                  Escuchando… la transcripción aparece acá.
                </p>
              ) : (
                lines.map((l) => (
                  <p
                    key={l.id}
                    className="transcript-line"
                    style={{ color: l.final ? "var(--ink)" : "var(--ink-dim)" }}
                  >
                    <span style={{ color: l.speaker === 1 ? "#10b981" : "#8b5cf6", fontWeight: 600, marginRight: 6 }}>
                      {l.speaker === 1 ? "[Yo]" : "[Entrevistador]"}
                    </span>
                    {l.text}
                  </p>
                ))
              )}
            </div>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer style={{ display: "flex", flexDirection: "column", gap: 8, position: "sticky", bottom: 0, paddingTop: 4, background: "var(--bg)" }}>
        {!live ? (
          <button onClick={start} disabled={connecting} className="btn-action btn-primary">
            {connecting ? "Conectando… 🦜" : mode === "mic" ? "▶ Activar asistente (micrófono)" : "▶ Activar asistente (compartir pestaña)"}
          </button>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div className="clear-row" style={{ display: "flex", alignItems: "center", justifyItems: "center", flexWrap: "wrap", gap: 8 }}>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={clearAll} className="clear-pill mono">
                  ✕ Limpiar
                </button>
                <button onClick={exportHistory} className="clear-pill mono">
                  📄 Exportar
                </button>
                <button
                  onClick={togglePause}
                  className={`clear-pill mono ${isPaused ? "auto-pill-off" : ""}`}
                  style={{ background: isPaused ? "rgba(239, 68, 68, 0.1)" : undefined, color: isPaused ? "#ef4444" : undefined }}
                  title={isPaused ? "Reanudar escucha" : "Pausar para hablar sin transcribir"}
                >
                  {isPaused ? "▶ Reanudar" : "⏸ Pausar"}
                </button>
              </div>
              {/* Switch AUTO: activa/desactiva respuesta automática al fin de intervención */}
              <button
                className={`clear-pill mono ${autoMode ? "auto-pill-on" : "auto-pill-off"}`}
                style={{ marginLeft: "auto" }}
                onClick={() => {
                  const next = !autoMode;
                  setAutoMode(next);
                  autoModeRef.current = next;
                  track("auto_mode_toggled", { enabled: next });
                }}
                title={autoMode ? "Respuesta automática ON — tocá para desactivar" : "Respuesta automática OFF — tocá para activar"}
              >
                {autoMode ? "🦜 AUTO ON" : "⏸️ AUTO OFF"}
              </button>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={answerNow}
                disabled={isGenerating}
                className={`btn-action btn-primary btn-answer ${isGenerating ? "opacity-75 cursor-not-allowed" : ""}`}
                style={{ flex: 2 }}
              >
                <span className="btn-answer-inner">
                  <SparkleIcon />
                  {isGenerating ? "Generando respuesta..." : "Responder"}
                </span>
              </button>
              <button
                onClick={askIcebreaker}
                disabled={isGenerating}
                className="btn-action"
                style={{ flex: 1, background: "var(--bg)", border: "1px solid var(--line-strong)", color: "var(--ink)", fontWeight: 600, opacity: isGenerating ? 0.6 : 1 }}
              >
                💡 Preguntas para ellos
              </button>
            </div>
          </div>
        )}
        {!live && (
          <p className="mono btn-hint">
            {mode === "mic"
              ? "Apoyá el celular cerca de los parlantes; sin auriculares el micrófono tiene que oír al entrevistador."
              : "Elegí la pestaña del Meet y activá “Compartir audio de la pestaña”."}
          </p>
        )}
      </footer>

      {/* Modal: Banco de Respuestas & Memoria Inteligente */}
      {showMemoryModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
          onClick={() => setShowMemoryModal(false)}
        >
          <div
            className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/60">
              <div className="flex items-center gap-2">
                <span className="text-xl">🧠</span>
                <div>
                  <h3 className="font-bold text-base text-zinc-100">Banco de Memoria Inteligente</h3>
                  <p className="text-xs text-zinc-400">Respuestas cacheadas para respuesta instantánea (&lt;50ms)</p>
                </div>
              </div>
              <button
                onClick={() => setShowMemoryModal(false)}
                className="text-zinc-400 hover:text-zinc-100 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-4 border-b border-zinc-800 flex items-center justify-between gap-3 bg-zinc-900/40">
              <div className="text-xs text-zinc-400">
                Total guardadas: <strong className="text-emerald-400">{masterAnswers.length}</strong>
              </div>
              <button
                type="button"
                onClick={generateWarmupAnswers}
                disabled={isWarmingUp}
                className="btn-action mono text-xs px-3 py-1.5 bg-amber-500/15 border border-amber-500/40 text-amber-300 rounded-lg hover:bg-amber-500/25 transition-colors font-bold flex items-center gap-1.5"
              >
                {isWarmingUp ? "Generando..." : "⚡ Generar 4 Preguntas Típicas (Warmup)"}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {masterAnswers.length === 0 ? (
                <div className="text-center py-10 text-zinc-500 text-sm">
                  <p className="text-2xl mb-2">📭</p>
                  <p className="font-medium text-zinc-400">No tenés respuestas en memoria todavía.</p>
                  <p className="text-xs mt-1 text-zinc-500">
                    Guardá respuestas con el botón ⭐ durante la entrevista o tocá "Generar 4 Preguntas Típicas".
                  </p>
                </div>
              ) : (
                masterAnswers.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 rounded-xl border border-zinc-800 bg-zinc-950/70 hover:border-zinc-700 transition-colors relative group"
                  >
                    <div className="flex justify-between items-start gap-2 mb-1.5">
                      <span className="font-semibold text-sm text-sky-300">💬 {m.question}</span>
                      <button
                        onClick={() => deleteMasterAnswer(m.id)}
                        className="text-zinc-500 hover:text-red-400 p-1 rounded transition-colors text-xs"
                        title="Eliminar de memoria"
                      >
                        🗑️
                      </button>
                    </div>
                    <div className="bg-sky-950/20 p-2.5 rounded-lg border border-sky-900/30 text-zinc-200 text-xs leading-relaxed mb-1.5 font-medium">
                      🇺🇸 {m.enText}
                    </div>
                    {m.esText && (
                      <div className="text-[11px] text-zinc-400 italic">
                        🇦🇷 {m.esText}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="p-3 border-t border-zinc-800 bg-zinc-950/60 flex justify-end">
              <button
                onClick={() => setShowMemoryModal(false)}
                className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
