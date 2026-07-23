"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { track, identify } from "../lib/track";
import { BrandLogo } from "../lib/BrandLogo";

const MarkdownText = ({ text }: { text: string }) => {
  if (!text) return null;
  // Limpiamos los saltos de línea extra y partimos por las negritas (**texto**)
  const parts = text.replace(/\n{3,}/g, "\n\n").trim().split(/\*\*(.*?)\*\*/g);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i} style={{ color: "var(--loro-green)", fontWeight: 700 }}>
            {part}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
};

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
  done: boolean;
  ts: number;
  feedback: Feedback;
  bilingual: boolean;
  cheats: string[];
  alert: string;
  snippet: string;
  cleanText: string;
};

function fmtTime(ts: number): string {
  try {
    return new Date(ts).toLocaleTimeString("es-AR", { hour: "numeric", minute: "2-digit" });
  } catch {
    return "";
  }
}

// Ícono "mágico" (sparkle / auto-awesome) del botón de respuesta, como Parakeet.
function SparkleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.5l1.9 4.9 4.9 1.9-4.9 1.9L12 16l-1.9-4.8L5.2 9.3l4.9-1.9L12 2.5z" />
      <path d="M18.5 14.5l.9 2.3 2.3.9-2.3.9-.9 2.3-.9-2.3-2.3-.9 2.3-.9.9-2.3z" />
    </svg>
  );
}

// Logos de proveedor para el selector de modelo (como Parakeet).
function OpenAIMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#000" aria-hidden="true">
      <path d="M22.28 9.82a5.98 5.98 0 0 0-.52-4.91 6.05 6.05 0 0 0-6.51-2.9A6.07 6.07 0 0 0 4.98 4.18a5.98 5.98 0 0 0-3.99 2.9 6.05 6.05 0 0 0 .74 7.1 5.98 5.98 0 0 0 .51 4.91 6.05 6.05 0 0 0 6.52 2.9A5.98 5.98 0 0 0 13.26 22a6.05 6.05 0 0 0 5.77-4.21 5.99 5.99 0 0 0 3.99-2.9 6.05 6.05 0 0 0-.75-7.07zm-9.02 12.6a4.48 4.48 0 0 1-2.88-1.04l.14-.08 4.78-2.76a.79.79 0 0 0 .39-.68v-6.74l2.02 1.17a.07.07 0 0 1 .04.05v5.58a4.5 4.5 0 0 1-4.49 4.5zM3.6 18.3a4.47 4.47 0 0 1-.54-3.01l.14.09 4.78 2.76a.77.77 0 0 0 .78 0l5.84-3.37v2.33a.08.08 0 0 1-.03.06L9.74 21a4.5 4.5 0 0 1-6.14-1.65zM2.34 7.9a4.48 4.48 0 0 1 2.34-1.97V11.6a.77.77 0 0 0 .39.68l5.82 3.36-2.02 1.17a.08.08 0 0 1-.07 0l-4.83-2.79A4.5 4.5 0 0 1 2.34 7.9zm16.6 3.86-5.84-3.39L15.11 7.2a.08.08 0 0 1 .07 0l4.83 2.78a4.49 4.49 0 0 1-.68 8.1v-5.68a.79.79 0 0 0-.39-.68zm2.01-3.02-.14-.09-4.77-2.78a.78.78 0 0 0-.79 0L9.42 7.24V4.91a.07.07 0 0 1 .03-.06l4.83-2.79a4.5 4.5 0 0 1 6.68 4.66zM8.32 12.9 6.3 11.73a.08.08 0 0 1-.04-.06V6.1a4.5 4.5 0 0 1 7.38-3.45l-.14.08L8.72 5.49a.79.79 0 0 0-.39.68zm1.1-2.36L12 9.06l2.6 1.5v3l-2.6 1.5-2.6-1.5z" />
    </svg>
  );
}
function AnthropicMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" stroke="#CC785C" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
      <line x1="12" y1="3" x2="12" y2="21" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="5.6" y1="5.6" x2="18.4" y2="18.4" />
      <line x1="18.4" y1="5.6" x2="5.6" y2="18.4" />
    </svg>
  );
}
function GeminiMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  );
}
function ProviderIcon({ provider }: { provider: Provider }) {
  return (
    <span className="dd-icon">
      {provider === "openai" ? <OpenAIMark /> : provider === "anthropic" ? <AnthropicMark /> : <GeminiMark />}
    </span>
  );
}

// Iconos de los campos de contexto (estilo Parakeet: outline al lado del label).
const fieldIconProps = {
  width: 13,
  height: 13,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};
function BriefcaseIcon() {
  return (
    <svg {...fieldIconProps}>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}
function DocIcon() {
  return (
    <svg {...fieldIconProps}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h8M8 17h8" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg {...fieldIconProps}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function CopyIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}
function ThumbUpIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 10v12" />
      <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a2.5 2.5 0 0 1 3 3z" />
    </svg>
  );
}
function ThumbDownIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 14V2" />
      <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a2.5 2.5 0 0 1-3-3z" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
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
// El usuario elige el modelo (como el idioma). El default es Gemini 2.5 Flash
// (rápido y ya probado). Claude y GPT se activan cuando el token está cargado
// en Vercel; si falta, el backend devuelve un error claro. Los IDs de modelo se
// pueden pisar por env var en el backend (ANTHROPIC_MODEL / OPENAI_MODEL).
type Provider = "gemini" | "anthropic" | "openai";
type ModelOption = { id: string; label: string; provider: Provider; model: string; tag: string };
// Misma lista que Parakeet (mismo orden y tags). Los `model` son los IDs reales
// de API: para Claude va el ID canónico (claude-haiku-4-5) y para Gemini los IDs
// que funcionan con la key actual; el resto usa el ID que matchea el nombre.
// Cualquiera se puede pisar por env en el backend (OPENAI_MODEL/ANTHROPIC_MODEL/GEMINI_MODEL).
// IDs reales de la API de Gemini (los que responden con la key actual). El
// backend igual cae a un modelo estable si alguno fallara, así nunca queda sin
// respuesta. Por ahora solo Gemini (OpenAI/Claude ocultos); el backend soporta
// los tres proveedores: para reactivarlos, descomentar sus líneas y cargar la key.
const MODELS: ModelOption[] = [
  { id: "gemini-flash", label: "Gemini 2.5 Flash", provider: "gemini", model: "gemini-2.5-flash", tag: "Recomendado" },
];
const DEFAULT_MODEL_ID = "gemini-flash";

function buildDgUrl(): string {
  const params = new URLSearchParams({
    model: "nova-2",
    language: "multi",
    smart_format: "true",
    interim_results: "true",
    endpointing: "500",
    utterance_end_ms: "3000", // Aumentado a 3s para evitar cortes por pausas largas
    vad_events: "true",
    diarize: "true",
    encoding: "linear16",
    sample_rate: "16000",
    channels: "1",
  }).toString();
  return `wss://api.deepgram.com/v1/listen?${params}`;
}

const LS_KEY = "copiloto:context:v1";


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
  const [answers, setAnswers] = useState<Answer[]>([]);
  const answersRef = useRef<Answer[]>([]);
  useEffect(() => { answersRef.current = answers; }, [answers]);
  const lastSpeakerRef = useRef<number | null>(null);
  const [tab, setTab] = useState<"answer" | "transcript">("answer");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  
  // Resumen Post-Entrevista
  const [summary, setSummary] = useState<string>("");
  const [generatingSummary, setGeneratingSummary] = useState<boolean>(false);

  const [fontSize, setFontSize] = useState<number>(14);
  const [savedProfiles, setSavedProfiles] = useState<{name: string, company: string, role: string, profile: string, extraInstructions?: string}[]>([]);

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
  // Debounce para evitar dobles disparos de UtteranceEnd.
  const utteranceDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollT = useRef<HTMLDivElement | null>(null);
  const scrollA = useRef<HTMLDivElement | null>(null);

  // Modelo elegido, siempre fresco (evita closures viejas en runGenerate).
  const selectedModel = MODELS.find((m) => m.id === modelId) || MODELS[0];
  const modelRef = useRef(selectedModel);
  modelRef.current = selectedModel;

  // ---------- Detección de mobile / Safari ----------
  // "Pestaña" (captura de audio vía getDisplayMedia) no tiene sentido en dos
  // casos: en mobile (iOS y Android) no hay pestañas de Meet/Zoom que
  // compartir desde el propio celular; y en Safari —incluso de escritorio,
  // en Mac— getDisplayMedia no soporta capturar audio (solo video), así que
  // ahí "Pestaña" siempre termina en el error de "no se compartió audio". En
  // ambos casos se usa directo micrófono.
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
  // Al volver, lo reactivamos y reintentamos el wake lock.
  useEffect(() => {
    const onResume = () => {
      if (document.visibilityState !== "visible") return;
      if (audioCtxRef.current?.state === "suspended") {
        audioCtxRef.current.resume().catch(() => {});
      }
      // Da un instante a que el AudioContext y el micrófono se reactiven antes
      // de chequear si hay que reconectar el socket.
      setTimeout(() => resumeRef.current?.(), 300);
    };
    document.addEventListener("visibilitychange", onResume);
    window.addEventListener("pageshow", onResume);
    return () => {
      document.removeEventListener("visibilitychange", onResume);
      window.removeEventListener("pageshow", onResume);
    };
  }, []);

  // Funnel: el usuario llegó a la app.
  useEffect(() => {
    track("enter_app");
  }, []);



  // ---------- Contexto persistido (empresa / puesto / perfil) ----------
  useEffect(() => {
    try {
      const sp = localStorage.getItem("loro-saved-profiles");
      if (sp) setSavedProfiles(JSON.parse(sp));
      
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved.company) setCompany(saved.company);
      if (saved.role) setRole(saved.role);
      if (saved.profile) setProfile(saved.profile);
      if (saved.extraInstructions) setExtraInstructions(saved.extraInstructions);
      // El modelo sí se restaura (preferencia persistente del usuario).
      if (saved.modelId && MODELS.some((m) => m.id === saved.modelId)) setModelId(saved.modelId);
      if (saved.fontSize && typeof saved.fontSize === "number") setFontSize(saved.fontSize);
    } catch {}
  }, []);
  useEffect(() => {
    if (status !== "idle") return; // solo guardar mientras configurás
    localStorage.setItem(LS_KEY, JSON.stringify({ company, role, profile, extraInstructions, modelId, fontSize }));
  }, [company, role, profile, extraInstructions, modelId, fontSize]);

  // ---------- Generación ----------
  // Ejecuta el fetch/stream para una tarjeta ya asignada (id + controller ya
  // decididos por fireIfNew). Si un fireIfNew posterior cancela este
  // controller, el AbortError se ignora en silencio: ya hay una versión
  // mejor en camino para la misma tarjeta.
  const runGenerate = useCallback(
    async (id: number, question: string, controller: AbortController, attempt = 0, type: "answer" | "icebreaker" = "answer") => {
      // Crea/resetea la tarjeta (en un reintento la vaciamos para re-streamear).
      setAnswers((prev) => {
        const card: Answer = { id, question, text: "", esText: "", enText: "", done: false, ts: Date.now(), feedback: null, bilingual: false, cheats: [], alert: "", snippet: "", cleanText: "" };
        return prev.some((a) => a.id === id)
          ? prev.map((a) => (a.id === id ? card : a))
          : [...prev, card].slice(-20); // cronológico: nuevas abajo
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
            transcript: transcriptRef.current.slice(-4000),
            question,
            type,
            extraInstructions,
            previousAnswers: answersRef.current
              .filter(a => a.done && a.text)
              .slice(-3)
              .map(a => ({ q: a.question, a: a.bilingual ? a.enText || a.esText : a.text })),
          }),
          signal: controller.signal,
        });
        if (!res.ok || !res.body) {
          let detail = (await res.text().catch(() => "")).slice(0, 300);
          // El kill switch (y otros errores JSON) devuelven { error }: mostramos
          // el mensaje limpio en vez del JSON crudo.
          try {
            const j = JSON.parse(detail);
            if (j?.error) detail = j.error;
          } catch {}
          setAnswers((prev) =>
            prev.map((a) =>
              a.id === id
                ? { ...a, text: detail ? `⚠️ ${detail}` : "· Error generando respuesta.", esText: "", enText: "", done: true, cheats: [], alert: "", snippet: "", cleanText: "" }
                : a
            )
          );
          track("answer_failed", { reason: detail || "http_error", duration_ms: Date.now() - startedAt });
          return;
        }
        const reader = res.body.getReader();
        const dec = new TextDecoder();
        let acc = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          acc += dec.decode(value, { stream: true });
          const parsed = parseBlocks(acc);
          setAnswers((prev) => prev.map((a) => (a.id === id ? { ...a, text: acc, ...parsed } : a)));
        }
        // El modelo a veces devuelve el placeholder "(esperando pregunta)" (o
        // texto vacío) en la primera respuesta, aunque la pregunta sea real.
        // Reintentamos UNA vez automáticamente en vez de dejar la tarjeta así.
        const finalText = acc.trim();
        const isPlaceholder =
          !finalText || /esperando pregunta|ninguna a[uú]n/i.test(finalText);
        if (isPlaceholder && attempt < 1 && !controller.signal.aborted) {
          return runGenerate(id, question, controller, attempt + 1);
        }
        const finalParsed = parseBlocks(acc);
        setAnswers((prev) => prev.map((a) => (a.id === id ? { ...a, text: acc, ...finalParsed, done: true } : a)));
        track("answer_generated", { model: modelRef.current.model, duration_ms: Date.now() - startedAt });
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        setAnswers((prev) =>
          prev.map((a) => (a.id === id ? { ...a, text: "· Error de red.", done: true } : a))
        );
        track("answer_failed", { reason: err?.message || "network_error", duration_ms: Date.now() - startedAt });
      }
    },
    [profile, company, role, autoMode, modelId, extraInstructions]
  );

  // Parsea todos los bloques especiales (Bilingüe, Cheats, Alert, Snippet)
  // Funciona con el stream a medias.
  function parseBlocks(raw: string) {
    const esMatch = raw.match(/\[ES\]([\s\S]*?)(?:\[EN\]|$)/);
    const enMatch = raw.match(/\[EN\]([\s\S]*)$/);
    
    // Remover las etiquetas para que no se muestren en el texto principal
    let cleanText = raw;
    
    const alertMatch = cleanText.match(/\[ALERT\]([\s\S]*?)(?:\[\/ALERT\]|$)/);
    const alert = alertMatch ? alertMatch[1].trim() : "";
    if (alertMatch) cleanText = cleanText.replace(alertMatch[0], "");

    const cheatsMatch = cleanText.match(/\[CHEATS\]([\s\S]*?)(?:\[\/CHEATS\]|$)/);
    const cheats = cheatsMatch ? cheatsMatch[1].trim().split("|").map(s => s.trim()).filter(Boolean) : [];
    if (cheatsMatch) cleanText = cleanText.replace(cheatsMatch[0], "");

    const snippetMatch = cleanText.match(/\[SNIPPET\]([\s\S]*?)(?:\[\/SNIPPET\]|$)/);
    let snippet = snippetMatch ? snippetMatch[1].trim() : "";
    if (snippet.startsWith("```") && snippet.endsWith("```")) {
      // Limpiar backticks si el LLM los mete adentro del SNIPPET
      snippet = snippet.replace(/^```[\w]*\n/, "").replace(/```$/, "").trim();
    }
    if (snippetMatch) cleanText = cleanText.replace(snippetMatch[0], "");

    return {
      esText: esMatch ? esMatch[1].replace(/\[(ALERT|CHEATS|SNIPPET)\][\s\S]*?(\[\/\1\]|$)/g, "").trim() : "",
      enText: enMatch ? enMatch[1].replace(/\[(ALERT|CHEATS|SNIPPET)\][\s\S]*?(\[\/\1\]|$)/g, "").trim() : "",
      cleanText: cleanText.trim(),
      alert,
      cheats,
      snippet
    };
  }

  // Disparo manual (y también llamado desde el auto-mode).
  // La app NO responde sola mientras la persona habla; solo al fin de intervención
  // (UtteranceEnd) cuando auto-mode está ON, o al tocar el botón.
  const answerNow = useCallback(() => {
    track("answer_requested");
    // Aborta una respuesta en curso para no encimar dos generaciones. Si esa
    // respuesta todavía estaba vacía (no llegó ni el primer token), sacamos su
    // tarjeta para que no quede colgada en pantalla al reintentar.
    const prev = turnRef.current;
    prev?.controller?.abort();
    turnRef.current = null;
    if (prev) {
      setAnswers((list) => list.filter((a) => !(a.id === prev.id && !a.done && !a.text)));
    }
    const q = questionBufRef.current.trim() || transcriptRef.current.trim().slice(-500);
    questionBufRef.current = "";
    if (q.trim().length < 2) return;
    const id = ++ansId.current;
    const controller = new AbortController();
    // Registrar el turno en curso: así el próximo toque a "Responder" (o
    // clearAll/cleanup) puede abortar este stream de verdad.
    turnRef.current = { id, sentText: q, controller };
    runGenerate(id, q, controller, 0, "answer");
  }, [runGenerate]);

  const askIcebreaker = useCallback(() => {
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
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
      {!live && lines.length > 0 && (
        <div className="panel" style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="mono" style={{ fontWeight: 600, fontSize: "1.1em" }}>📊 Análisis de Entrevista</span>
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
          <label className="mono form-label">
            Contexto de la entrevista
          </label>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <select
              className="form-input mono"
              style={{ flex: 1, height: 36, padding: "0 12px" }}
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
            <label className="mono form-mini-label">
              <DocIcon /> Descripción del puesto
              <InfoTip text="Pegá el aviso o el rol al que aplicás: responsabilidades, requisitos, seniority. Cuanto más completo, mejores las respuestas." />
            </label>
            <textarea
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Pegá la descripción del puesto: responsabilidades, requisitos, seniority."
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
          <div className="panel" style={{ flex: 1, minHeight: 0 }}>
            <div ref={scrollA} className="answers-container" style={{ fontSize: `${fontSize}px` }}>
              {answers.length === 0 ? (
                <p className="placeholder" style={{ fontSize: 13.5, color: "var(--ink-dim)", lineHeight: 1.6, textAlign: "center", fontStyle: "italic", padding: "8px" }}>
                  {autoMode
                    ? "El Loro va a responder solo cuando termine la pregunta. También podés tocar \"Responder\"."
                    : "Tocá \u201cResponder\u201d cuando termine la pregunta y tu respuesta aparece acá."}
                </p>
              ) : (
                answers.map((a, index) => (
                  <div key={a.id} className={`answer-card ${index === answers.length - 1 ? "answer-card-current" : ""}`}>
                    {a.text && (
                      <div className="card-actions">
                        <button
                          className={`card-btn ${copiedId === a.id ? "card-btn-done" : ""}`}
                          onClick={() => copyAnswer(a.id, a.bilingual ? (a.enText || a.text) : a.text)}
                          aria-label="Copiar respuesta"
                          title="Copiar respuesta en inglés"
                        >
                          {copiedId === a.id ? <CheckIcon /> : <CopyIcon />}
                        </button>
                      </div>
                    )}
                    <div className="answer-card-q-row">
                      <span className="answer-card-label answer-card-label-q">💬 Pregunta</span>
                      <span className="answer-card-question">{a.question}</span>
                    </div>

                    {a.alert && (
                      <div className="alert-banner" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", padding: "8px 12px", borderRadius: 8, fontSize: "0.9em", marginTop: 8, border: "1px solid rgba(239,68,68,0.2)" }}>
                        <strong>⚠️ {a.alert}</strong>
                      </div>
                    )}
                    {a.cheats && a.cheats.length > 0 && (
                      <div className="cheats-container" style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                        {a.cheats.map((c, i) => (
                          <button key={i} className="cheat-btn" style={{ background: "var(--bg)", border: "1px solid var(--line-strong)", padding: "4px 10px", borderRadius: 16, fontSize: "0.85em", color: "var(--text)", cursor: "pointer" }} onClick={() => copyAnswer(a.id, c)}>
                            ⚡ {c}
                          </button>
                        ))}
                      </div>
                    )}
                    {a.snippet && (
                      <div className="snippet-container" style={{ background: "#1e1e1e", color: "#d4d4d4", padding: "12px", borderRadius: 8, marginTop: 8, fontFamily: "monospace", fontSize: "0.85em", whiteSpace: "pre-wrap", overflowX: "auto", position: "relative" }}>
                        <button style={{ position: "absolute", top: 8, right: 8, background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", padding: "4px 8px", borderRadius: 4, cursor: "pointer", fontSize: "0.8em" }} onClick={() => copyAnswer(a.id, a.snippet)}>Copiar</button>
                        {a.snippet}
                      </div>
                    )}

                    {a.bilingual ? (
                      // Modo bilingüe: dos bloques
                      <>
                        <div className="answer-card-a-row" style={{ marginTop: 8 }}>
                          <span className="answer-card-label answer-card-label-a">🇦🇷 Entendé</span>
                          <div className="answer-card-text" style={{ color: "var(--ink-dim)", fontSize: "0.95em" }}>
                            {a.esText ? (
                              <MarkdownText text={a.esText} />
                            ) : (
                              <span className="mono answer-card-loading">generando…</span>
                            )}
                          </div>
                        </div>
                        <div className="answer-card-a-row" style={{ marginTop: 8, background: "rgba(59,130,246,0.06)", borderRadius: 8, padding: "8px 0" }}>
                          <span className="answer-card-label answer-card-label-a" style={{ color: "#3b82f6", display: "flex", alignItems: "center", gap: 8 }}>
                            🇺🇸 Decí esto
                            {a.enText && (
                              <button
                                onClick={() => playTTS(a.enText)}
                                className="tts-button"
                                style={{ background: "rgba(59,130,246,0.1)", border: "none", cursor: "pointer", padding: "2px 6px", fontSize: 16, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}
                                title="Escuchar pronunciación"
                              >
                                🔊
                              </button>
                            )}
                          </span>
                          <div className="answer-card-text" style={{ fontWeight: 500, whiteSpace: "pre-wrap", fontSize: "1.05em" }}>
                            {a.enText ? (
                              <MarkdownText text={a.enText} />
                            ) : a.esText ? (
                              <span className="mono answer-card-loading">esperando al traductor…</span>
                            ) : (
                              <span className="mono answer-card-loading">generando…</span>
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      // Modo normal: un solo bloque
                      <div className="answer-card-a-row" style={{ marginTop: 8 }}>
                        <span className="answer-card-label answer-card-label-a">⭐ Respuesta</span>
                        <div className="answer-card-text" style={{ fontSize: "1.05em", fontWeight: 500 }}>
                          {a.text ? (
                            <MarkdownText text={a.cleanText || a.text} />
                          ) : (
                            <span className="mono answer-card-loading">
                              generando…
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    {a.text && (
                      <div className="answer-footer">
                        <span className="answer-footer-meta mono">Respuesta · {fmtTime(a.ts)}</span>
                        <div className="fb-btns">
                          <button
                            className={`fb-btn ${a.feedback === "up" ? "fb-up" : ""}`}
                            onClick={() => setFeedback(a.id, "up")}
                            aria-label="Respuesta útil"
                          >
                            <ThumbUpIcon />
                          </button>
                          <button
                            className={`fb-btn ${a.feedback === "down" ? "fb-down" : ""}`}
                            onClick={() => setFeedback(a.id, "down")}
                            aria-label="Respuesta no útil"
                          >
                            <ThumbDownIcon />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {live && tab === "transcript" && (
          <div className="panel" style={{ flex: 1, minHeight: 0 }}>
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
              <button onClick={answerNow} className="btn-action btn-primary btn-answer" style={{ flex: 2 }}>
                <span className="btn-answer-inner">
                  <SparkleIcon />
                  Responder
                </span>
              </button>
              <button onClick={askIcebreaker} className="btn-action" style={{ flex: 1, background: "var(--bg)", border: "1px solid var(--line-strong)", color: "var(--ink)", fontWeight: 600 }}>
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


    </main>
  );
}
