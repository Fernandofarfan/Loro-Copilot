"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { track, identify } from "../lib/track";
import Avatar, { type AvatarState } from "./Avatar";
import { TtsQueue, extractSentences } from "./tts";
import { BrandLogo } from "../lib/BrandLogo";
import {
  OpenAIMark,
  AnthropicMark,
  GoogleMark,
  BriefcaseIcon,
  DocIcon,
  UserIcon,
  CopyIcon,
  CheckIcon,
  SparkleIcon,
} from "../components/Icons";
import {
  FeedbackReportView,
  type FeedbackReport,
  type FeedbackQuestion,
  type FeedbackIndicator,
  scoreColor,
  scoreInk,
} from "./FeedbackReportView";

type Line = { id: number; text: string; final: boolean };
type Lang = "es" | "en";
type Provider = "gemini" | "anthropic" | "openai";
type ModelOption = { id: string; label: string; provider: Provider; model: string; tag: string };

type InterviewType = "general" | "technical" | "behavioral" | "hr";

// Fases del turno de entrevista. El flujo es automático: el entrevistador
// habla (speaking), escucha (listening) y cierra la respuesta por silencio
// (confirming) sin que el usuario tenga que tocar nada.
type Phase =
  | "setup"
  | "connecting"
  | "asking"
  | "speaking"
  | "listening"
  | "confirming"
  | "feedback";

type HistoryItem = {
  question: string;
  answer: string;
};

// El modelo puede devolver un JSON válido pero incompleto; normalizamos para
// que el render nunca reviente por un campo faltante (mapear sobre undefined).
function normalizeReport(raw: any): FeedbackReport {
  const arr = (v: any) => (Array.isArray(v) ? v : []);
  const n = Number(raw?.score);
  return {
    score: Number.isFinite(n) ? Math.max(0, Math.min(100, Math.round(n))) : 0,
    level: typeof raw?.level === "string" ? raw.level : undefined,
    verdict: typeof raw?.verdict === "string" ? raw.verdict : undefined,
    topPriority: typeof raw?.topPriority === "string" ? raw.topPriority : undefined,
    nextStep: typeof raw?.nextStep === "string" ? raw.nextStep : undefined,
    summary: typeof raw?.summary === "string" ? raw.summary : "",
    indicators: arr(raw?.indicators).filter((i: any) => i && typeof i.name === "string"),
    strengths: arr(raw?.strengths).filter((s: any) => typeof s === "string"),
    improvements: arr(raw?.improvements).filter((s: any) => typeof s === "string"),
    questions: arr(raw?.questions).filter((q: any) => q && typeof q.question === "string"),
  };
}

const STT_LANG: Record<Lang, string> = { es: "es", en: "en" };

const MODELS: ModelOption[] = [
  { id: "gemini-flash", label: "Gemini 3.6 Flash", provider: "gemini", model: "gemini-3.6-flash", tag: "Recomendado" },
];
const DEFAULT_MODEL_ID = "gemini-flash";

function ProviderIcon({ provider }: { provider: Provider }) {
  return (
    <span className="dd-icon">
      {provider === "openai" ? <OpenAIMark /> : provider === "anthropic" ? <AnthropicMark /> : <GoogleMark />}
    </span>
  );
}

// Íconos de la sala (header de videollamada)
const ctlIconProps = {
  width: 17,
  height: 17,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};
function BackIcon() {
  return (
    <svg {...ctlIconProps}>
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}
function CamIcon({ off }: { off?: boolean }) {
  return (
    <svg {...ctlIconProps}>
      <path d="M23 7l-7 5 7 5V7z" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      {off && <line x1="2" y1="2" x2="22" y2="22" />}
    </svg>
  );
}
function MicIcon({ off }: { off?: boolean }) {
  return (
    <svg {...ctlIconProps}>
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4" />
      {off && <line x1="2" y1="2" x2="22" y2="22" />}
    </svg>
  );
}
function SpeakerIcon({ off }: { off?: boolean }) {
  return (
    <svg {...ctlIconProps}>
      <path d="M11 5 6 9H2v6h4l5 4V5z" />
      {off ? <line x1="16" y1="9" x2="22" y2="15" /> : <path d="M15.5 8.5a5 5 0 0 1 0 7" />}
      {off && <line x1="22" y1="9" x2="16" y2="15" />}
    </svg>
  );
}
function PhoneIcon() {
  return (
    <svg {...ctlIconProps} width={15} height={15}>
      <path d="M10.7 13.3a15 15 0 0 1-2.8-4l2-2a1 1 0 0 0 .2-1L9.4 2.6a1 1 0 0 0-1-.6H4.6a1 1 0 0 0-1 1.1A19 19 0 0 0 20.9 20.4a1 1 0 0 0 1.1-1v-3.8a1 1 0 0 0-.6-1l-3.7-1.7a1 1 0 0 0-1 .2l-2 2a15 15 0 0 1-4-1.8z" transform="rotate(135 12 12)" />
    </svg>
  );
}

// Info tip
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

// Dropdown component
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

function buildDgUrl(sttLang: string): string {
  const params = new URLSearchParams({
    model: "nova-2",
    language: sttLang,
    smart_format: "true",
    interim_results: "true",
    endpointing: "500",
    utterance_end_ms: "1500",
    vad_events: "true",
    encoding: "linear16",
    sample_rate: "16000",
    channels: "1",
  }).toString();
  return `wss://api.deepgram.com/v1/listen?${params}`;
}

function fmtElapsed(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const LS_KEY_CONTEXT = "simulador:context:v1";
const LS_KEY_REPORT = "simulador:lastReport:v1";
const LS_KEY_EMAIL = "simulador:email:v1";

// Umbral mínimo para considerar que hubo una respuesta real (evita cerrar el
// turno por un carraspeo transcripto).
const MIN_ANSWER_CHARS = 10;
// Endpointing adaptativo: esperamos poco si la respuesta SONÓ completa y mucho
// si quedó a media frase o en muletilla. Total percibido = umbral + gracia.
const COMPLETE_MS = 1700; // frase terminada con puntuación → responder ágil sin cortar pausas naturales
const INCOMPLETE_MS = 2600; // a media frase / muletilla → esperar (pausa para pensar)
// Ventana de gracia cancelable si el candidato retoma la palabra.
const CONFIRM_MS = 600;

// Muletillas y conjunciones: si la respuesta termina así, casi seguro sigue.
const TRAILING_INCOMPLETE = new Set([
  "y", "o", "u", "e", "pero", "porque", "que", "entonces", "asi", "así",
  "tipo", "eh", "este", "esto", "mmm", "em", "digamos", "bueno", "aver",
  "a", "de", "en", "con", "para", "como", "cuando", "si", "más", "mas",
  "o", "sea", "osea", "ta", "nada",
]);

// ¿La respuesta suena terminada? Requiere puntuación terminal (la da
// smart_format en los finales) y que la última palabra no sea muletilla.
// Mientras hay interinos sin puntuar cuenta como incompleta → paciente.
function looksComplete(text: string): boolean {
  const t = text.trim();
  if (t.length < MIN_ANSWER_CHARS) return false;
  if (!/[.!?…]$/.test(t)) return false;
  const lastWord = t
    .toLowerCase()
    .replace(/[.,!?…"”'’)\]]+$/g, "")
    .split(/\s+/)
    .pop();
  return !!lastWord && !TRAILING_INCOMPLETE.has(lastWord);
}
// Sin respuesta real: a los 12s ofrecemos pasar de pregunta; a los 25s la
// sala avanza sola, para que un candidato que se queda mudo no quede colgado.
const STUCK_MS = 12000;
const NO_ANSWER_MS = 25000;

export default function SimuladorPage() {
  const [phase, setPhase] = useState<Phase>("setup");
  const phaseRef = useRef<Phase>("setup");
  const setPhaseBoth = useCallback((p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  }, []);

  const [error, setError] = useState("");

  // Setup form states
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [profile, setProfile] = useState("");
  const [lang, setLang] = useState<Lang>("es");
  const [modelId, setModelId] = useState<string>(DEFAULT_MODEL_ID);
  const [interviewType, setInterviewType] = useState<InterviewType>("general");
  // Largo fijo de la entrevista (el selector se quitó del setup a pedido).
  const questionsCount = 5;

  // Voz del entrevistador
  const [isVoiceMuted, setIsVoiceMuted] = useState(false);
  const mutedRef = useRef(false);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  // Interview state
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const historyRef = useRef<HistoryItem[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const questionRef = useRef("");
  // Texto de la pregunta ya "dicho" en voz alta: se revela palabra por palabra
  // al ritmo del audio, como subtítulos.
  const [spokenQuestion, setSpokenQuestion] = useState("");
  const spokenBaseRef = useRef("");
  const revealTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const currentAnswerRef = useRef("");
  const [elapsed, setElapsed] = useState(0);
  const [cameraOn, setCameraOn] = useState(false);
  const [camAvailable, setCamAvailable] = useState(false);
  const [micOn, setMicOn] = useState(true);
  // "Te trabaste" (sin respuesta): ofrece pasar de pregunta.
  const [stuck, setStuck] = useState(false);
  const stuckRef = useRef(false);
  const listeningStartedAtRef = useRef(0);
  // Conexión de audio perdida sin recuperación: ofrece finalizar y ver feedback.
  const [connLost, setConnLost] = useState(false);
  // Pasos reales de conexión para el panel de chat: 0=media, 1=WS, 2=primera
  // pregunta en camino, 3=todo listo.
  const [connectStep, setConnectStep] = useState(0);

  // Feedback state
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [feedbackReport, setFeedbackReport] = useState<FeedbackReport | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  // Último informe guardado (sobrevive al refresh): acceso desde el setup.
  const [savedReport, setSavedReport] = useState<FeedbackReport | null>(null);

  // Gate de email: pedimos el email para "desbloquear" el informe. Se persiste
  // en localStorage; los que ya lo dejaron no vuelven a ver el modal.
  const [emailGatePassed, setEmailGatePassed] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [emailError, setEmailError] = useState("");



  // Refs de audio / red
  const wsRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const workletRef = useRef<AudioWorkletNode | null>(null);
  const ttsRef = useRef<TtsQueue | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lineId = useRef(0);
  const sessionLangRef = useRef<Lang>("es");

  const intentionalCloseRef = useRef(false);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stabilityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const keepAliveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const confirmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Watchdog de silencio: regla de tiempo dura que no depende de que Deepgram
  // emita UtteranceEnd/is_final — chequea actividad de voz cada 400ms.
  const watchdogRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastSpeechAtRef = useRef(0);
  // Tope duro de la fase "hablando": si algo se cuelga (stream, TTS), la sala
  // pasa igual a escuchar en vez de quedar trabada.
  const speakFailsafeRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const postTtsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef(0);
  const wakeLockRef = useRef<any>(null);

  const selectedModel = MODELS.find((m) => m.id === modelId) || MODELS[0];

  // Los handlers del WebSocket viven entre renders: llaman a la versión fresca
  // de cada función de flujo a través de estos refs.
  const beginTurnRef = useRef<(h: HistoryItem[], closing?: boolean) => void>(() => {});
  const closeAnswerRef = useRef<(auto: boolean) => void>(() => {});
  // Señal para el entrevistador: la última respuesta pudo cortarse (silencio
  // cerró a media frase). `recoveryOfferedRef` evita encadenar repreguntas de
  // "¿algo más?" (si ya se ofreció, no se vuelve a ofrecer al toque).
  const lastCutRef = useRef(false);
  const recoveryOfferedRef = useRef(false);
  const dgMessageRef = useRef<(raw: string) => void>(() => {});
  const connectWsRef = useRef<(first: boolean) => Promise<void>>(async () => {});
  const scheduleReconnectRef = useRef<() => void>(() => {});

  // Load and save context
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY_CONTEXT);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved.company) setCompany(saved.company);
      if (saved.role) setRole(saved.role);
      if (saved.profile) setProfile(saved.profile);
      if (saved.modelId && MODELS.some((m) => m.id === saved.modelId)) setModelId(saved.modelId);
      if (saved.lang === "es" || saved.lang === "en") setLang(saved.lang);
      if (saved.interviewType) setInterviewType(saved.interviewType);
    } catch {}
  }, []);

  // Recuperar el último informe (sobrevive al refresh). No auto-saltamos al
  // feedback: se ofrece un acceso discreto en el setup.
  useEffect(() => {
    try {
      if (localStorage.getItem(LS_KEY_EMAIL)) setEmailGatePassed(true);
    } catch {}
    try {
      const raw = localStorage.getItem(LS_KEY_REPORT);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved?.report) setSavedReport(normalizeReport(saved.report));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        LS_KEY_CONTEXT,
        JSON.stringify({ company, role, profile, modelId, lang, interviewType })
      );
    } catch {}
  }, [company, role, profile, modelId, lang, interviewType]);

  // ---------- Timers del turno ----------

  const clearRevealTimer = () => {
    if (revealTimerRef.current) {
      clearInterval(revealTimerRef.current);
      revealTimerRef.current = null;
    }
  };

  // Revela las palabras de una oración repartidas en su duración real de audio.
  const startReveal = (text: string, durationSec: number) => {
    clearRevealTimer();
    const base = spokenBaseRef.current;
    spokenBaseRef.current = base ? `${base} ${text}` : text;
    const words = text.split(/\s+/).filter(Boolean);
    if (!words.length) return;
    setSpokenQuestion(base);
    const stepMs = Math.max(40, (durationSec * 1000) / (words.length + 1));
    let i = 0;
    revealTimerRef.current = setInterval(() => {
      i += 1;
      const partial = words.slice(0, i).join(" ");
      setSpokenQuestion(base ? `${base} ${partial}` : partial);
      if (i >= words.length) clearRevealTimer();
    }, stepMs);
  };

  const clearTurnTimers = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (confirmTimerRef.current) {
      clearTimeout(confirmTimerRef.current);
      confirmTimerRef.current = null;
    }
    if (watchdogRef.current) {
      clearInterval(watchdogRef.current);
      watchdogRef.current = null;
    }
    if (speakFailsafeRef.current) {
      clearTimeout(speakFailsafeRef.current);
      speakFailsafeRef.current = null;
    }
    if (postTtsTimerRef.current) {
      clearTimeout(postTtsTimerRef.current);
      postTtsTimerRef.current = null;
    }
  };

  const startWatchdog = () => {
    if (watchdogRef.current) clearInterval(watchdogRef.current);
    lastSpeechAtRef.current = Date.now();
    listeningStartedAtRef.current = Date.now();
    watchdogRef.current = setInterval(() => {
      if (phaseRef.current !== "listening") return;
      // Corte de red: mientras el socket no está OPEN no oímos al candidato, así
      // que no cerramos ni saltamos por "silencio" (sería un falso corte). Al
      // reconectar, el reloj de silencio arranca fresco.
      if (wsRef.current?.readyState !== WebSocket.OPEN) {
        lastSpeechAtRef.current = Date.now();
        listeningStartedAtRef.current = Date.now();
        return;
      }
      const answer = currentAnswerRef.current.trim();
      const hasAnswer = answer.length >= MIN_ANSWER_CHARS;
      if (hasAnswer) {
        // Ya hay respuesta real: cerrar por silencio, adaptando el tiempo a si
        // la frase sonó completa o quedó a media.
        if (stuckRef.current) {
          stuckRef.current = false;
          setStuck(false);
        }
        const needed = looksComplete(answer) ? COMPLETE_MS : INCOMPLETE_MS;
        if (Date.now() - lastSpeechAtRef.current >= needed) enterConfirming();
        return;
      }
      // Sin respuesta real: red de seguridad para no colgar la sala.
      const waited = Date.now() - listeningStartedAtRef.current;
      if (waited >= NO_ANSWER_MS) {
        skipQuestion();
      } else if (waited >= STUCK_MS && !stuckRef.current) {
        stuckRef.current = true;
        setStuck(true);
      }
    }, 400);
  };

  const enterListening = () => {
    clearTurnTimers();
    currentAnswerRef.current = "";
    setCurrentAnswer("");
    setLines([]);
    stuckRef.current = false;
    setStuck(false);
    setPhaseBoth("listening");
    startWatchdog();
  };

  // Avanza sin exigir respuesta mínima (candidato trabado o mudo). Registra lo
  // que haya dicho, o una marca de "no respondí" para que el feedback lo note.
  const skipQuestion = () => {
    const ph = phaseRef.current;
    if (ph !== "listening" && ph !== "confirming") return;
    clearTurnTimers();
    stuckRef.current = false;
    setStuck(false);
    const answer = currentAnswerRef.current.trim() || "(No respondí a esta pregunta)";
    const updated = [...historyRef.current, { question: questionRef.current, answer }];
    historyRef.current = updated;
    setHistory(updated);
    currentAnswerRef.current = "";
    setCurrentAnswer("");
    setLines([]);
    track("sim_answer_closed", { auto: true, skipped: true, question_index: updated.length });
    if (updated.length >= questionsCount) finishToFeedback(updated);
    else beginTurnRef.current(updated);
  };

  // Espera silenciosa antes de cerrar la respuesta: sin countdown visible
  // (decisión de producto), pero hablar de nuevo la cancela igual.
  const enterConfirming = () => {
    clearTurnTimers();
    setPhaseBoth("confirming");
    confirmTimerRef.current = setTimeout(() => {
      confirmTimerRef.current = null;
      closeAnswerRef.current(true);
    }, CONFIRM_MS);
  };

  // ---------- Deepgram ----------

  const onDgMessage = (raw: string) => {
    let msg: any;
    try {
      msg = JSON.parse(raw);
    } catch {
      return;
    }

    if (msg.type === "UtteranceEnd") {
      // Deepgram marca 1s de silencio. Solo cerramos ya si la frase sonó
      // completa; si quedó a media, el watchdog espera su umbral largo.
      if (
        phaseRef.current === "listening" &&
        looksComplete(currentAnswerRef.current.trim())
      ) {
        enterConfirming();
      }
      return;
    }
    if (msg.type !== "Results") return;

    // Gating anti-eco: fuera de listening/confirming (avatar hablando o
    // pensando) cualquier transcript se descarta.
    const ph = phaseRef.current;
    if (ph !== "listening" && ph !== "confirming") return;

    const alt = msg.channel?.alternatives?.[0];
    const text: string = alt?.transcript || "";
    if (!text) return;
    const isFinal = !!msg.is_final;

    lastSpeechAtRef.current = Date.now();

    // Habla nueva durante la espera de cierre → todavía no terminó: volver a
    // escuchar (sin resetear la respuesta acumulada).
    if (ph === "confirming") {
      clearTurnTimers();
      setPhaseBoth("listening");
      startWatchdog();
    }

    setLines((prev) => {
      const next = [...prev];
      if (next.length && !next[next.length - 1].final) {
        next[next.length - 1] = { id: next[next.length - 1].id, text, final: isFinal };
      } else {
        next.push({ id: ++lineId.current, text, final: isFinal });
      }
      return next.slice(-40);
    });

    if (isFinal) {
      const acc = `${currentAnswerRef.current} ${text}`.trim();
      currentAnswerRef.current = acc;
      setCurrentAnswer(acc);
      // El cierre lo decide el watchdog con el umbral adaptativo (según si la
      // frase sonó completa) — no hace falta un timer de respaldo fijo.
    }
  };
  dgMessageRef.current = onDgMessage;

  const scheduleReconnect = () => {
    if (intentionalCloseRef.current) return;
    const ph = phaseRef.current;
    if (ph === "setup" || ph === "feedback") return;
    if (reconnectAttemptsRef.current >= 3) {
      setError("Se perdió la conexión de audio.");
      setConnLost(true);
      return;
    }
    const delay = 600 * 2 ** reconnectAttemptsRef.current;
    reconnectAttemptsRef.current += 1;
    reconnectTimerRef.current = setTimeout(() => {
      connectWsRef.current(false).catch(() => scheduleReconnectRef.current());
    }, delay);
  };
  scheduleReconnectRef.current = scheduleReconnect;

  const connectWs = async (first: boolean) => {
    const dgUrl = buildDgUrl(STT_LANG[sessionLangRef.current]);
    const tokRes = await fetch("/api/deepgram-token", { method: "POST" });
    if (!tokRes.ok) throw new Error("Error al obtener token de Deepgram.");
    const { token, scheme } = await tokRes.json();
    const ws = new WebSocket(dgUrl, [scheme || "token", token]);
    ws.binaryType = "arraybuffer";
    wsRef.current = ws;

    ws.onopen = () => {
      setConnLost(false);
      // Mientras el avatar habla no fluye PCM: sin KeepAlive Deepgram corta
      // el socket a ~10s de silencio.
      if (keepAliveRef.current) clearInterval(keepAliveRef.current);
      keepAliveRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: "KeepAlive" }));
      }, 7000);
      // Conexión estable 10s → renueva el presupuesto de reintentos.
      if (stabilityTimerRef.current) clearTimeout(stabilityTimerRef.current);
      stabilityTimerRef.current = setTimeout(() => {
        reconnectAttemptsRef.current = 0;
      }, 10_000);
      if (first) beginTurnRef.current([]);
    };
    ws.onmessage = (e) => {
      if (typeof e.data === "string") dgMessageRef.current(e.data);
    };
    ws.onerror = () => {};
    ws.onclose = () => {
      if (keepAliveRef.current) {
        clearInterval(keepAliveRef.current);
        keepAliveRef.current = null;
      }
      if (wsRef.current === ws) scheduleReconnectRef.current();
    };
  };
  connectWsRef.current = connectWs;

  // ---------- Turno: pregunta → voz → escucha ----------

  // Frame chico de la cámara (JPEG ~30KB) para que el entrevistador "vea" al
  // candidato en algunas preguntas. Avisado en el setup; si la cámara está
  // apagada devuelve null y no se manda nada.
  const captureFrame = (): string | null => {
    try {
      const v = videoRef.current;
      if (!cameraOn || !v || v.readyState < 2 || !v.videoWidth) return null;
      const canvas = document.createElement("canvas");
      const w = 320;
      canvas.width = w;
      canvas.height = Math.round((v.videoHeight / v.videoWidth) * w);
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL("image/jpeg", 0.7);
    } catch {
      return null;
    }
  };

  const beginTurn = async (currentHistory: HistoryItem[], closing = false) => {
    setPhaseBoth("asking");
    setCurrentQuestion("");
    questionRef.current = "";
    clearRevealTimer();
    setSpokenQuestion("");
    spokenBaseRef.current = "";

    const ctx = audioCtxRef.current;
    if (!ctx) return;

    // En el turno de cierre (despedida del entrevistador), al terminar de hablar
    // vamos al informe en vez de reabrir el mic.
    const onDone = closing ? () => finishToFeedback(currentHistory) : enterListening;

    ttsRef.current?.stop();
    const queue = new TtsQueue(ctx, sessionLangRef.current);
    queue.setMuted(mutedRef.current);
    ttsRef.current = queue;
    setAnalyser(queue.analyser);

    let ttsFailed = false;
    queue.onStart = () => {
      if (phaseRef.current === "asking") setPhaseBoth("speaking");
    };
    queue.onChunkStart = (text, durationSec) => startReveal(text, durationSec);
    queue.onError = () => {
      ttsFailed = true;
      track("sim_tts_error");
      // Sin voz no hay ritmo que seguir: mostrar el texto completo.
      clearRevealTimer();
      setSpokenQuestion(questionRef.current);
      spokenBaseRef.current = questionRef.current;
    };
    const armSpeakFailsafe = (ms: number) => {
      if (speakFailsafeRef.current) clearTimeout(speakFailsafeRef.current);
      speakFailsafeRef.current = setTimeout(() => {
        speakFailsafeRef.current = null;
        if (phaseRef.current === "asking" || phaseRef.current === "speaking") {
          queue.stop();
          clearRevealTimer();
          setSpokenQuestion(questionRef.current);
          track("session_error", { where: "sim_speak_failsafe" });
          onDone();
        }
      }, ms);
    };
    // Tope inicial generoso por si el stream del LLM nunca termina.
    armSpeakFailsafe(45_000);

    queue.onAllEnded = () => {
      // Terminó el audio: asegurar el texto completo en pantalla.
      clearRevealTimer();
      setSpokenQuestion(questionRef.current);
      spokenBaseRef.current = questionRef.current;
      // Si el TTS falló, dar tiempo a leer la pregunta en pantalla en vez de
      // pasar a escuchar de inmediato. El margen de 300ms deja drenar el
      // parlante antes de reabrir el mic (anti-eco).
      const delay = ttsFailed ? Math.max(1800, questionRef.current.length * 45) : 300;
      if (postTtsTimerRef.current) clearTimeout(postTtsTimerRef.current);
      postTtsTimerRef.current = setTimeout(() => {
        postTtsTimerRef.current = null;
        if (phaseRef.current === "asking" || phaseRef.current === "speaking") onDone();
      }, delay);
    };

    try {
      const questionIndex = currentHistory.length + 1;
      // Frame en las preguntas 1 y 2: garantiza el comentario "te estoy
      // viendo" temprano (en la 1 la cámara puede no tener frames todavía).
      // En el cierre no se manda imagen ni señal de corte.
      const withVision = !closing && questionIndex <= 2;
      const image = withVision ? captureFrame() : null;
      const res = await fetch("/api/simulador", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: closing ? "closing" : "next-question",
          profile,
          company,
          role,
          interviewType,
          answerLang: sessionLangRef.current,
          provider: selectedModel.provider,
          model: selectedModel.model,
          history: currentHistory,
          questionIndex,
          questionsCount,
          lastAnswerLikelyCut: closing ? false : lastCutRef.current,
          ...(image ? { image } : {}),
        }),
      });
      if (!res.ok || !res.body) throw new Error("Error al obtener la pregunta.");
      track("sim_question_asked", { question_index: questionIndex, model: selectedModel.model, with_image: !!image });

      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let questionText = "";
      // Troceo incremental: cada oración completa entra a la cola TTS mientras
      // el LLM sigue streameando, para que la voz arranque con la primera.
      let pending = "";
      let firstChunk = true;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (firstChunk) {
          firstChunk = false;
          setConnectStep(3);
        }
        const chunk = dec.decode(value, { stream: true });
        questionText += chunk;
        questionRef.current = questionText;
        setCurrentQuestion(questionText);

        pending += chunk;
        const { complete, rest } = extractSentences(pending);
        // Oraciones muy cortas ("Bien.") se fusionan con la siguiente para no
        // pagar un round-trip de TTS por dos palabras.
        let hold = "";
        for (const sentence of complete) {
          hold = hold ? `${hold} ${sentence}` : sentence;
          if (hold.length >= 25) {
            queue.enqueue(hold);
            hold = "";
          }
        }
        pending = hold ? `${hold} ${rest}` : rest;
      }
      if (pending.trim()) queue.enqueue(pending.trim());
      queue.finishInput();
      // Con el texto completo, ajustar el tope a la duración esperada del habla.
      armSpeakFailsafe(Math.max(15_000, questionText.length * 120));

      if (!questionText.trim()) throw new Error("El entrevistador no devolvió pregunta.");
    } catch (err: any) {
      queue.stop();
      // Si falla el turno de cierre, igual entregamos el informe (el candidato
      // ya respondió todo); no lo mandamos de vuelta al setup.
      if (closing) {
        finishToFeedback(currentHistory);
      } else {
        endSession();
        setError(err?.message || "Error al conectar con la IA.");
      }
    }
  };
  beginTurnRef.current = (h, closing) => {
    void beginTurn(h, closing);
  };

  const closeAnswer = (auto: boolean) => {
    const ph = phaseRef.current;
    if (ph !== "listening" && ph !== "confirming") return;
    clearTurnTimers();

    const answer = currentAnswerRef.current.trim();
    if (!answer) {
      setPhaseBoth("listening");
      return;
    }

    // ¿La respuesta quedó cortada? Solo si la cerró el silencio (auto) y terminó
    // en palabra colgada (conjunción/preposición/muletilla) → casi seguro seguía.
    // Anti-loop: si el turno anterior ya ofreció completar, no volvemos a ofrecer.
    const lastWord = answer
      .toLowerCase()
      .replace(/[.,!?…"”'’)\]]+$/g, "")
      .split(/\s+/)
      .pop();
    const seemsCut = auto && !!lastWord && TRAILING_INCOMPLETE.has(lastWord);
    const offerRecovery = seemsCut && !recoveryOfferedRef.current;
    lastCutRef.current = offerRecovery;
    recoveryOfferedRef.current = offerRecovery;

    const updated = [...historyRef.current, { question: questionRef.current, answer }];
    historyRef.current = updated;
    setHistory(updated);
    currentAnswerRef.current = "";
    setCurrentAnswer("");
    setLines([]);
    track("sim_answer_closed", { auto, question_index: updated.length, cut: offerRecovery });

    if (updated.length >= questionsCount) {
      // Terminación natural: el entrevistador cierra (agradece) y recién ahí
      // se procesa el informe.
      beginTurnRef.current(updated, true);
    } else {
      beginTurnRef.current(updated);
    }
  };
  closeAnswerRef.current = closeAnswer;

  // ---------- Fin de entrevista / feedback ----------

  const cleanupMedia = () => {
    intentionalCloseRef.current = true;
    clearTurnTimers();
    clearRevealTimer();
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (stabilityTimerRef.current) {
      clearTimeout(stabilityTimerRef.current);
      stabilityTimerRef.current = null;
    }
    if (keepAliveRef.current) {
      clearInterval(keepAliveRef.current);
      keepAliveRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    ttsRef.current?.stop();
    ttsRef.current = null;
    setAnalyser(null);
    try {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "CloseStream" }));
      }
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
      wakeLockRef.current?.release();
    } catch {}
    wakeLockRef.current = null;
    wsRef.current = null;
    workletRef.current = null;
    audioCtxRef.current = null;
    streamRef.current = null;
    setCameraOn(false);
    setCamAvailable(false);
  };

  const finishToFeedback = (finalHistory: HistoryItem[]) => {
    cleanupMedia();
    track("sim_session_finished", { questions: finalHistory.length, duration_s: elapsedNow() });
    void fetchFeedback(finalHistory);
  };

  const elapsedNow = () =>
    startedAtRef.current ? Math.floor((Date.now() - startedAtRef.current) / 1000) : 0;

  // Botón "Finalizar": corta donde esté. Si hay al menos una respuesta (o una
  // en curso con contenido), va al feedback; si no, vuelve al setup.
  const endInterview = () => {
    const ph = phaseRef.current;
    if (ph === "listening" || ph === "confirming") {
      const a = currentAnswerRef.current.trim();
      if (a.length >= MIN_ANSWER_CHARS) {
        const updated = [...historyRef.current, { question: questionRef.current, answer: a }];
        historyRef.current = updated;
        setHistory(updated);
      }
    }
    if (historyRef.current.length > 0) {
      finishToFeedback(historyRef.current);
    } else {
      endSession();
      track("session_stopped");
    }
  };

  const endSession = () => {
    cleanupMedia();
    setPhaseBoth("setup");
  };

  // Los botones del header confirman si hay progreso, para no cortar la
  // entrevista por un toque accidental.
  const confirmEndInterview = () => {
    if (
      historyRef.current.length > 0 &&
      typeof window !== "undefined" &&
      !window.confirm("¿Terminar la entrevista? Vas a ver el feedback de lo que respondiste.")
    ) {
      return;
    }
    endInterview();
  };

  const fetchFeedback = async (finalHistory: HistoryItem[]) => {
    setIsGeneratingFeedback(true);
    setError("");
    setPhaseBoth("feedback");
    // Un reintento automático: la generación es larga y en mobile la red es
    // menos estable.
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await fetch("/api/simulador", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "feedback",
            profile,
            company,
            role,
            interviewType,
            answerLang: sessionLangRef.current,
            provider: selectedModel.provider,
            model: selectedModel.model,
            history: finalHistory,
          }),
        });
        if (!res.ok) throw new Error("No se pudo obtener el reporte de feedback.");
        const report = normalizeReport(await res.json());
        setFeedbackReport(report);
        setSavedReport(report);
        try {
          localStorage.setItem(LS_KEY_REPORT, JSON.stringify({ report, company, role, ts: Date.now() }));
        } catch {}
        setIsGeneratingFeedback(false);
        track("sim_feedback_shown", { score: report.score });
        return;
      } catch (err: any) {
        if (attempt === 0) continue;
        setIsGeneratingFeedback(false);
        setError(err?.message || "Error al procesar el feedback.");
        track("session_error", { where: "sim_feedback" });
      }
    }
  };

  // ---------- Inicio de sesión ----------

  // El simulador es gratis e ilimitado a propósito (motor de adquisición):
  // acá no se consume la cuota de sesiones de /app.
  const startSimulation = async () => {
    setError("");
    setHistory([]);
    historyRef.current = [];
    setLines([]);
    setCurrentAnswer("");
    currentAnswerRef.current = "";
    setCurrentQuestion("");
    questionRef.current = "";
    lastCutRef.current = false;
    recoveryOfferedRef.current = false;
    setFeedbackReport(null);
    setElapsed(0);
    setMicOn(true);
    setConnectStep(0);
    setStuck(false);
    stuckRef.current = false;
    setConnLost(false);
    sessionLangRef.current = lang;
    intentionalCloseRef.current = false;
    reconnectAttemptsRef.current = 0;
    setPhaseBoth("connecting");

    try {
      // Un solo prompt de permisos con mic + cámara; si la cámara falla se
      // reintenta solo audio (la cámara es local y opcional, nunca se sube).
      const audioConstraints = { echoCancellation: true, noiseSuppression: true, autoGainControl: true };
      let stream: MediaStream;
      let camDenied = false;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: audioConstraints,
          video: { facingMode: "user", width: { ideal: 640 } },
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints });
        camDenied = true;
        track("sim_camera_denied");
      }
      streamRef.current = stream;
      const hasCam = !camDenied && stream.getVideoTracks().length > 0;
      setCamAvailable(hasCam);
      setCameraOn(hasCam);
      setConnectStep(1);

      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;
      if (audioCtx.state === "suspended") await audioCtx.resume();
      await audioCtx.audioWorklet.addModule("/pcm-worklet.js");

      const source = audioCtx.createMediaStreamSource(stream);
      const worklet = new AudioWorkletNode(audioCtx, "pcm-worklet");
      workletRef.current = worklet;

      worklet.port.onmessage = (e) => {
        // Gating anti-eco: solo fluye PCM cuando es el turno del usuario.
        const ph = phaseRef.current;
        if (ph !== "listening" && ph !== "confirming") return;
        const w = wsRef.current;
        if (w && w.readyState === WebSocket.OPEN) w.send(e.data);
      };
      source.connect(worklet);

      await connectWs(true);
      setConnectStep(2);

      track("sim_session_start", { model: selectedModel.model, questions: questionsCount, lang });

      // Wake lock: que no se apague la pantalla en el celular a mitad de entrevista.
      try {
        wakeLockRef.current = await (navigator as any).wakeLock?.request("screen");
      } catch {}

      startedAtRef.current = Date.now();
      timerIntervalRef.current = setInterval(() => setElapsed(elapsedNow()), 1000);
    } catch (err: any) {
      cleanupMedia();
      const denied = err?.name === "NotAllowedError" || err?.name === "SecurityError";
      setError(
        denied
          ? "Necesitamos el micrófono para la entrevista. Activá el permiso desde el candado 🔒 en la barra del navegador y volvé a intentar."
          : err?.message || "No se pudo iniciar el simulador. Revisá los permisos de micrófono."
      );
      setPhaseBoth("setup");
    }
  };

  // Re-adquirir wake lock al volver de background durante la entrevista.
  useEffect(() => {
    const onVis = () => {
      const ph = phaseRef.current;
      if (document.visibilityState === "visible" && ph !== "setup" && ph !== "feedback") {
        (navigator as any).wakeLock
          ?.request("screen")
          .then((wl: any) => {
            wakeLockRef.current = wl;
          })
          .catch(() => {});
        // En mobile el AudioContext queda suspended al bloquear/cambiar de app;
        // sin resume, al volver el Loro no habla ni escucha (mismo ctx para TTS y STT).
        if (audioCtxRef.current?.state === "suspended") {
          audioCtxRef.current.resume().catch(() => {});
        }
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // Conectar el stream de la cámara al <video> cuando el PiP está montado.
  useEffect(() => {
    if (cameraOn && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraOn, phase]);

  // Cleanup al desmontar la página.
  useEffect(() => {
    return () => {
      intentionalCloseRef.current = true;
      cleanupMedia();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleMute = () => {
    const m = !isVoiceMuted;
    setIsVoiceMuted(m);
    mutedRef.current = m;
    ttsRef.current?.setMuted(m);
  };

  const toggleCamera = () => {
    const t = streamRef.current?.getVideoTracks()[0];
    if (!t) return;
    t.enabled = !t.enabled;
    setCameraOn(t.enabled);
    track("sim_camera_toggled", { on: t.enabled });
  };

  const toggleMic = () => {
    const t = streamRef.current?.getAudioTracks()[0];
    if (!t) return;
    t.enabled = !t.enabled;
    setMicOn(t.enabled);
    track("sim_mic_toggled", { on: t.enabled });
  };

  const copyOptimalAnswer = useCallback(
    (index: number, text: string) => {
      navigator.clipboard?.writeText(text).then(() => {
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex((c) => (c === index ? null : c)), 1500);
        track("answer_copied", { model: selectedModel.model });
      });
    },
    [selectedModel]
  );

  // Cross-sell: del simulador (gratis) al copiloto en vivo (producto estrella).
  // ?ref=simulador para medir la conversión en analytics.
  const goToCopilot = () => {
    track("sim_cross_sell_click", { score: feedbackReport?.score ?? 0 });
    window.location.href = "/app?ref=simulador";
  };

  // Loop viral top-of-funnel: comparte el SIMULADOR gratis por WhatsApp.
  const shareSimulator = () => {
    const msg =
      `Mira esto… me voló la cabeza.\n` +
      `Simulé una entrevista con una IA por video en tiempo real, luego te da un informe con tips muy piola. Es gratis:\n` +
      `https://loreado.vercel.app/simulador`;
    track("sim_share_whatsapp");
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  // Gate de email: valida, guarda y desbloquea el informe. Reusa /api/waitlist.
  const submitEmail = useCallback(async () => {
    const em = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
      setEmailError("Poné un email válido.");
      return;
    }
    setEmailSending(true);
    setEmailError("");
    try {
      const r = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: em }),
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.ok) {
        try {
          localStorage.setItem(LS_KEY_EMAIL, em);
        } catch {}
        track("sim_email_submit");
        identify(em, { email: em });
        setEmailGatePassed(true);
      } else {
        setEmailError(j.error || "No se pudo enviar. Probá de nuevo.");
      }
    } catch {
      setEmailError("Error de red. Probá de nuevo.");
    } finally {
      setEmailSending(false);
    }
  }, [email]);

  const inInterview = phase !== "setup" && phase !== "feedback";
  const connecting = phase === "connecting";

  const avatarState: AvatarState =
    phase === "asking"
      ? "thinking"
      : phase === "speaking"
        ? "speaking"
        : phase === "listening" || phase === "confirming"
          ? "listening"
          : "idle";

  const interim = lines.length > 0 && !lines[lines.length - 1].final ? lines[lines.length - 1].text : "";
  const isListening = phase === "listening" || phase === "confirming";

  // Anuncio para lectores de pantalla (aria-live): la fase no es visible a SR.
  const liveMsg =
    phase === "connecting"
      ? "Preparando la sala de entrevista"
      : phase === "asking" || phase === "speaking"
        ? "El entrevistador está hablando"
        : phase === "listening"
          ? "Es tu turno, hablá"
          : phase === "feedback"
            ? isGeneratingFeedback
              ? "Generando tu informe"
              : "Informe listo"
            : "";

  // Autoscroll del chat: el volumen de mensajes es bajo, forzarlo siempre es
  // más simple que detectar scroll manual.
  const chatBodyRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = chatBodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [history, currentQuestion, spokenQuestion, currentAnswer, lines, phase, connectStep]);

  const CONNECT_STEPS = ["Preparando tu sala de entrevista", "Cargando tu contexto y CV", "Generando la primera pregunta"];
  const showSteps = phase === "connecting" || (phase === "asking" && history.length === 0 && !currentQuestion);

  const interviewTypeLabel =
    interviewType === "technical"
      ? "Técnica / Hard Skills"
      : interviewType === "behavioral"
        ? "De Comportamiento (STAR)"
        : interviewType === "hr"
          ? "Inicial / RRHH"
          : "General / Fit Cultural";

  return (
    <main className={`app-container ${inInterview ? "sim-wide" : ""}`}>
      {!inInterview && (
        <header className="brand-header">
          <div className="brand">
            <BrandLogo />
          </div>

        </header>
      )}

      {phase === "setup" && (
        <>
          <p className="tagline">
            Destruí los nervios antes de tu entrevista. Simulá llamadas reales gratis, recibí
            feedback al instante y descubrí en qué estás fallando.
          </p>

          <div className="selectors-row" style={{ marginTop: 8 }}>
            <div className="field">
              <label className="mono form-label">Idioma</label>
              <Dropdown
                value={lang}
                onChange={(id) => setLang(id as Lang)}
                ariaLabel="Idioma de la simulación"
                options={[
                  { id: "es", label: "Español", icon: <span className="dd-flag">🇪🇸</span> },
                  { id: "en", label: "English", icon: <span className="dd-flag">🇺🇸</span> },
                ]}
              />
            </div>
            <div className="field">
              <label className="mono form-label">Modelo de IA</label>
              <Dropdown
                value={modelId}
                onChange={(id) => setModelId(id)}
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

          <div className="selectors-row" style={{ marginTop: 8 }}>
            <div className="field">
              <label className="mono form-label">Tipo de Entrevista</label>
              <Dropdown
                value={interviewType}
                onChange={(id) => setInterviewType(id as InterviewType)}
                ariaLabel="Tipo de Entrevista"
                options={[
                  { id: "general", label: "General / Fit Cultural" },
                  { id: "technical", label: "Técnica / Hard Skills" },
                  { id: "behavioral", label: "De Comportamiento (STAR)" },
                  { id: "hr", label: "Inicial / Recursos Humanos" },
                ]}
              />
            </div>
          </div>

          {error && <div className="mono sim-error-box" style={{ marginTop: 10 }}>⚠️ {error}</div>}

          <div className="panel" style={{ marginTop: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 6 }}>
              <label className="mono form-label" style={{ marginBottom: 0 }}>Contexto del Puesto</label>
              <button
                type="button"
                className="btn-action mono"
                style={{
                  padding: "2px 10px",
                  fontSize: 11,
                  background: "rgba(16, 185, 129, 0.15)",
                  border: "1px solid var(--loro-green)",
                  color: "var(--loro-green)",
                  fontWeight: 700,
                  borderRadius: 6,
                  cursor: "pointer",
                }}
                onClick={() => {
                  setCompany("EPAM Systems");
                  setRole(
                    "Senior Python Engineer (EPAM Technical Interview - 100% English).\nFocus: Python Core (LEGB scope, iterators/generators, context managers, mutability, copy vs deepcopy), Concurrency & Async (Asyncio vs multiprocessing vs threading, GIL), Debugging/Profiling (cProfile, tracemalloc), Testing (pytest fixtures), Live Coding & Algorithms."
                  );
                  setLang("en");
                  setInterviewType("technical");
                }}
              >
                ⚡ Preset EPAM (Inglés / Técnico)
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label className="mono form-mini-label">
                <BriefcaseIcon /> Empresa
                <InfoTip text="La empresa que simulará la entrevista. Ayuda a personalizar las preguntas y el fit." />
              </label>
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Ej: Mercado Libre"
                className="form-input"
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 4 }}>
              <label className="mono form-mini-label">
                <DocIcon /> Descripción del puesto
                <InfoTip text="Descripción del rol para el que te simularás. Ayuda a definir las preguntas técnicas o de comportamiento." />
              </label>
              <textarea
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Pegá la descripción del puesto, seniority, requisitos o tecnologías."
                className="form-textarea form-textarea-sm"
              />
            </div>

            <label className="mono form-mini-label" style={{ marginTop: 4 }}>
              <UserIcon /> Tu perfil / CV
              <InfoTip text="Tu experiencia y habilidades. La IA las usará para hacer preguntas más específicas a tu caso o evaluar si aprovechás tu background." />
            </label>
            <textarea
              value={profile}
              onChange={(e) => setProfile(e.target.value)}
              placeholder="Pegá tu CV, experiencia previa o notas de tu perfil laboral."
              className="form-textarea"
            />
          </div>

          <footer className="sim-setup-footer">
            <button onClick={() => void startSimulation()} className="btn-action btn-primary">
              ▶ Iniciar simulación (generar sala)
            </button>
            {savedReport && (
              <button
                className="sim-last-report-link"
                onClick={() => {
                  setError("");
                  setFeedbackReport(savedReport);
                  setPhaseBoth("feedback");
                }}
              >
                Ver tu último informe →
              </button>
            )}
          </footer>
        </>
      )}

      {inInterview && (
        <div className="sim-room">
          <div className="sr-only" role="status" aria-live="polite">{liveMsg}</div>
          <header className="sim-room-header">
            <div className="sim-room-header-left">
              <button className="sim-back-btn" onClick={confirmEndInterview} aria-label="Volver">
                <BackIcon />
              </button>
              <h1 className="sim-room-title">Sala de Entrevista</h1>
              <span className="sim-room-meta mono">
                {fmtElapsed(elapsed)} · Pregunta {Math.min(history.length + 1, questionsCount)} de {questionsCount}
              </span>
            </div>
            <div className="sim-room-header-right">
              <button
                className={`sim-ctl-btn ${cameraOn ? "sim-ctl-on" : ""}`}
                onClick={toggleCamera}
                disabled={!camAvailable}
                aria-label={cameraOn ? "Apagar cámara" : "Prender cámara"}
                title={!camAvailable ? "Cámara no autorizada" : cameraOn ? "Apagar cámara" : "Prender cámara"}
              >
                <CamIcon off={!cameraOn} />
              </button>
              <button
                className={`sim-ctl-btn ${micOn ? "sim-ctl-on" : ""}`}
                onClick={toggleMic}
                aria-label={micOn ? "Silenciar micrófono" : "Activar micrófono"}
                title={micOn ? "Silenciar micrófono" : "Activar micrófono"}
              >
                <MicIcon off={!micOn} />
              </button>
              <button
                className="sim-ctl-btn"
                onClick={toggleMute}
                aria-label={isVoiceMuted ? "Activar voz del entrevistador" : "Silenciar voz del entrevistador"}
                title={isVoiceMuted ? "Activar voz del entrevistador" : "Silenciar voz del entrevistador"}
              >
                <SpeakerIcon off={isVoiceMuted} />
              </button>
              <button className="sim-finish-btn" onClick={confirmEndInterview}>
                <PhoneIcon /> Finalizar
              </button>
            </div>
          </header>

          {error && (
            <div className="mono sim-error-box">
              ⚠️ {error}
              {connLost && (
                <button className="sim-error-cta" onClick={endInterview}>
                  Finalizar y ver feedback →
                </button>
              )}
            </div>
          )}

          <div className="sim-room-grid">
            <section className="sim-room-left">
              <div className="sim-stage">
                <Avatar state={avatarState} analyser={analyser} />

                <span className={`sim-stage-badge ${connecting ? "sim-stage-badge-connecting" : ""}`}>
                  <span className="sim-stage-badge-dot" aria-hidden="true" />
                  {connecting ? "Conectando…" : "Entrevistador IA conectado"}
                </span>

                <div className="sim-pip">
                  {cameraOn ? (
                    <video ref={videoRef} muted playsInline autoPlay />
                  ) : (
                    <div className="sim-pip-off">
                      <span className="sim-pip-off-emoji">📷</span>
                      <span>Cámara desactivada</span>
                    </div>
                  )}
                </div>
              </div>

              <details className="sim-context-panel">
                <summary>Contexto de la entrevista</summary>
                <div className="sim-context-rows">
                  <div className="sim-context-row">
                    <span>Empresa</span>
                    <b>{company || "—"}</b>
                  </div>
                  <div className="sim-context-row">
                    <span>Puesto</span>
                    <b>{role ? `${role.slice(0, 80)}${role.length > 80 ? "…" : ""}` : "—"}</b>
                  </div>
                  <div className="sim-context-row">
                    <span>Tipo</span>
                    <b>{interviewTypeLabel}</b>
                  </div>
                  <div className="sim-context-row">
                    <span>Idioma</span>
                    <b>{sessionLangRef.current === "en" ? "English" : "Español"}</b>
                  </div>
                  <div className="sim-context-row">
                    <span>Modelo</span>
                    <b>{selectedModel.label}</b>
                  </div>
                  <div className="sim-context-row">
                    <span>Preguntas</span>
                    <b>{questionsCount}</b>
                  </div>
                </div>
              </details>
            </section>

            <aside className="sim-chat">
              <div className="sim-chat-header">
                <span className="sim-chat-title">Entrevista</span>
                <span className={`sim-chat-chip ${connecting ? "sim-chat-chip-prep" : ""}`}>
                  <span className="sim-chat-chip-dot" aria-hidden="true" />
                  {connecting ? "Preparando" : "En vivo"}
                </span>
              </div>

              <div className="sim-chat-body" ref={chatBodyRef}>
                {showSteps && (
                  <ol className="sim-steps">
                    {CONNECT_STEPS.map((label, i) => (
                      <li
                        key={i}
                        className={i < connectStep ? "sim-step-done" : i === connectStep ? "sim-step-active" : ""}
                      >
                        <span className="sim-step-mark" aria-hidden="true">
                          {i < connectStep ? "✓" : i === connectStep ? <span className="sim-step-spinner" /> : "·"}
                        </span>
                        {label}
                      </li>
                    ))}
                  </ol>
                )}

                {history.map((h, i) => (
                  <div key={i} className="sim-turn">
                    <div className="sim-bubble sim-bubble-q">{h.question}</div>
                    <div className="sim-bubble sim-bubble-a">{h.answer}</div>
                  </div>
                ))}

                {(phase === "asking" || phase === "speaking") && !spokenQuestion && !showSteps && (
                  <div className="sim-bubble sim-bubble-q sim-bubble-typing" aria-label="El entrevistador está por hablar">
                    <span />
                    <span />
                    <span />
                  </div>
                )}

                {/* Mientras habla, el texto se revela al ritmo de la voz; después queda completo. */}
                {(phase === "asking" || phase === "speaking" ? spokenQuestion : currentQuestion) && (
                  <div className="sim-bubble sim-bubble-q">
                    {phase === "asking" || phase === "speaking" ? spokenQuestion : currentQuestion}
                  </div>
                )}

                {isListening && (currentAnswer || interim) && (
                  <div className="sim-bubble sim-bubble-a">
                    {currentAnswer}
                    {interim && <em className="sim-bubble-interim"> {interim}</em>}
                  </div>
                )}

                {phase === "listening" && micOn && !currentAnswer && !interim && !stuck && (
                  <div className="sim-chat-hint sim-turn-hint">🎙 Tu turno — hablá</div>
                )}

                {phase === "listening" && !micOn && (
                  <div className="sim-chat-hint">Micrófono silenciado — activalo para responder</div>
                )}

                {phase === "listening" && stuck && micOn && (
                  <div className="sim-chat-hint">
                    ¿Te trabaste? No pasa nada.{" "}
                    <button className="sim-skip-inline" onClick={skipQuestion}>
                      Pasar de pregunta →
                    </button>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      )}

      {phase === "feedback" && (
        <div className="sim-feedback-container">
          {isGeneratingFeedback ? (
            <div className="sim-loading-feedback">
              <div className="sim-loading-spinner" />
              <h2 className="mono" style={{ fontSize: 16, fontWeight: 700 }}>Generando reporte de feedback…</h2>
              <p className="tagline" style={{ maxWidth: 360 }}>
                El asistente está evaluando tus respuestas en base a la señal, fit cultural y claridad de
                comunicación. Esto demora unos segundos.
              </p>
            </div>
          ) : error && !feedbackReport ? (
            <div className="sim-loading-feedback">
              <div className="mono sim-error-box">⚠️ {error}</div>
              <button
                onClick={() => void fetchFeedback(historyRef.current)}
                className="btn-action btn-primary"
              >
                🔄 Reintentar reporte
              </button>
              <button onClick={() => setPhaseBoth("setup")} className="clear-pill mono">
                Volver al inicio
              </button>
            </div>
          ) : (
            <FeedbackReportView
              feedbackReport={feedbackReport}
              emailGatePassed={emailGatePassed}
              email={email}
              setEmail={setEmail}
              emailError={emailError}
              setEmailError={setEmailError}
              emailSending={emailSending}
              submitEmail={submitEmail}
              copiedIndex={copiedIndex}
              copyOptimalAnswer={copyOptimalAnswer}
              goToCopilot={goToCopilot}
              shareSimulator={shareSimulator}
              onRestart={() => setPhaseBoth("setup")}
            />
          )}
        </div>
      )}
    </main>
  );
}
