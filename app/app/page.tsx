"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { track } from "../lib/track";
import { BrandLogo } from "../lib/BrandLogo";
import { AnswerCard } from "../components/AnswerCard";
import { RescuePhrases, type RescuePhrase } from "../components/RescuePhrases";
import { ListenText } from "../components/ListenText";
import { Dropdown } from "../components/Dropdown";
import { extractTextFromPdf } from "../lib/pdf";
import {
  parseInterviewMarkdownToMasterAnswers,
  detectQuestionLanguage,
  extractCurrentTurnQuestion,
  isIncompleteQuestion,
  isActionableQuestion,
  getAdaptiveDebounceMs,
  detectExperienceQuestion,
  matchSTARStory,
  detectFirmnessChallenge,
  type MasterAnswer,
} from "../lib/interviewHelpers";
import { chunkCv, selectRelevantCvChunks } from "../lib/cvChunker";
import { analyzeCvVulnerabilities, type VulnerabilityItem } from "../lib/vulnerabilityRadar";
import { GLOBANT_AND_GCP_MASTER_ANSWERS } from "../lib/globantMasterAnswers";
import { MELI_NOSQL_MASTER_ANSWERS } from "../lib/meliMasterAnswers";
import { MarkdownText } from "../components/MarkdownText";
import { useInterviewContext, type STARStory } from "../hooks/useInterviewContext";
import { useDeepgram, type TranscriptLine, type AudioMode } from "../hooks/useDeepgram";
import { useAnswerStream, type Answer } from "../hooks/useAnswerStream";
import { useTeleprompter } from "../hooks/useTeleprompter";
import { useScreenVision } from "../hooks/useScreenVision";
import { useEarbudWhisper } from "../hooks/useEarbudWhisper";
import { useGazeTracker } from "../hooks/useGazeTracker";
import {
  SparkleIcon,
  OpenAIMark,
  AnthropicMark,
  GoogleMark,
  BriefcaseIcon,
  DocIcon,
  UserIcon,
  CopyIcon,
  MicIcon,
  SettingsIcon,
  ExternalLinkIcon,
  TrashIcon,
} from "../components/Icons";

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
  // ⚡ Nivel Ultra Rápido (< 8s) — Óptimo en Vivo
  { id: "gemini-flash-latest", label: "Gemini Flash Latest ⚡ (1.0s)", provider: "gemini", model: "gemini-flash-latest", tag: "Ultra Rápido" },
  { id: "gemini-flash-lite-latest", label: "Gemini Flash Lite ⚡", provider: "gemini", model: "gemini-flash-lite-latest", tag: "Ultra Rápido" },
  { id: "deepseek-v4-flash", label: "DeepSeek V4 Flash ⚡ (1.5s)", provider: "opencode", model: "deepseek-v4-flash", tag: "Ultra Rápido" },
  { id: "mimo-v2-5", label: "MiMo V2.5 ⚡ (1.5s)", provider: "opencode", model: "mimo-v2.5", tag: "Ultra Rápido" },
  { id: "glm-5-3-flash", label: "GLM 5.3 Flash ⚡ (1.6s)", provider: "opencode", model: "glm-5.3-flash", tag: "Ultra Rápido" },
  { id: "deepseek-v4-pro", label: "DeepSeek V4 Pro 🧠 (1.6s)", provider: "opencode", model: "deepseek-v4-pro", tag: "Senior / Pro" },
  { id: "glm-5-2", label: "GLM 5.2 ⚡ (1.0s)", provider: "opencode", model: "glm-5.2", tag: "Ultra Rápido" },
  { id: "qwen-3-8-flash", label: "Qwen 3.8 Flash ⚡", provider: "opencode", model: "qwen3.8-flash", tag: "Ultra Rápido" },
  { id: "mimo-v2-5-pro", label: "MiMo V2.5 Pro 🎯", provider: "opencode", model: "mimo-v2.5-pro", tag: "Ultra Rápido" },

  // 🚀 Nivel Rápido / Balanceado
  { id: "glm-5-3", label: "GLM 5.3", provider: "opencode", model: "glm-5.3", tag: "Balanceado" },
  { id: "glm-5-1", label: "GLM 5.1", provider: "opencode", model: "glm-5.1", tag: "Balanceado" },
  { id: "kimi-k2-7-code", label: "Kimi K2.7 Code 💻", provider: "opencode", model: "kimi-k2.7-code", tag: "Coding" },
  { id: "kimi-k3", label: "Kimi K3 🧠", provider: "opencode", model: "kimi-k3", tag: "Balanceado" },
  { id: "gemini-3-6-flash", label: "Gemini 3.6 Flash", provider: "gemini", model: "gemini-3.6-flash", tag: "Google" },

  // 🧠 Nivel Razonamiento / Deep Think
  { id: "hy4-preview", label: "Hy4 Preview 🔮", provider: "opencode", model: "hy4-preview", tag: "Deep Think" },
  { id: "qwen-3-8-max", label: "Qwen 3.8 Max 🧠", provider: "opencode", model: "qwen3.8-max", tag: "Deep Think" },
  { id: "minimax-m3", label: "MiniMax M3", provider: "opencode", model: "minimax-m3", tag: "Deep Think" },
  { id: "hy3", label: "Hy3", provider: "opencode", model: "hy3", tag: "Deep Think" },
  { id: "longcat-2-0", label: "LongCat 2.0 🐱", provider: "opencode", model: "longcat-2.0", tag: "Deep Think" },
  { id: "qwen-3-7-max", label: "Qwen 3.7 Max", provider: "opencode", model: "qwen3.7-max", tag: "Deep Think" },
  { id: "qwen-3-7-plus", label: "Qwen 3.7 Plus", provider: "opencode", model: "qwen3.7-plus", tag: "Deep Think" },
  { id: "qwen-3-6-plus", label: "Qwen 3.6 Plus", provider: "opencode", model: "qwen3.6-plus", tag: "Deep Think" },

  // Direct Providers
  { id: "gpt-4o-mini", label: "GPT-4o Mini 🚀", provider: "openai", model: "gpt-4o-mini", tag: "OpenAI" },
  { id: "claude-haiku", label: "Claude 3.5 Haiku 🧠", provider: "anthropic", model: "claude-3-5-haiku-20241022", tag: "Anthropic" },
];

export default function CopilotPage() {
  const [activeTab, setActiveTab] = useState<"live" | "context" | "memory">("live");
  const [sttLang, setSttLang] = useState<"es" | "en">("es");
  const [simpleEnglish, setSimpleEnglish] = useState(false);
  const [dialect, setDialect] = useState<"rioplatense" | "neutro" | "english">("rioplatense");
  const [bilingualMode, setBilingualMode] = useState(true);
  const [autoRespond, setAutoRespond] = useState(true);
  const [transcriptLines, setTranscriptLines] = useState<TranscriptLine[]>([]);
  const [manualQuestion, setManualQuestion] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [warmupLoading, setWarmupLoading] = useState(false);
  const [warmupMessage, setWarmupMessage] = useState<string | null>(null);
  const [profileNameInput, setProfileNameInput] = useState("");

  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  // Hook de Contexto y Memoria Maestra
  const {
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
    savedProfiles,
    saveProfile,
    deleteProfile,
    loadProfile,
    masterAnswers,
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
    isLoaded: isContextLoaded,
  } = useInterviewContext("deepseek-v4-flash", MODELS.map((m) => m.id));

  const starStoriesRef = useRef(starStories);
  starStoriesRef.current = starStories;

  // Radar de Vulnerabilidades del CV (Red Team)
  const [vulnModalOpen, setVulnModalOpen] = useState(false);
  const [vulnerabilities, setVulnerabilities] = useState<VulnerabilityItem[] | null>(null);

  // Scorecard Predictor FAANG & Thank-You Note
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [summaryText, setSummaryText] = useState("");
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [summaryCopied, setSummaryCopied] = useState(false);

  // Formulario para nueva Historia STAR
  const [newStarTitle, setNewStarTitle] = useState("");
  const [newStarSituation, setNewStarSituation] = useState("");
  const [newStarTask, setNewStarTask] = useState("");
  const [newStarAction, setNewStarAction] = useState("");
  const [newStarResult, setNewStarResult] = useState("");
  const [showStarForm, setShowStarForm] = useState(false);

  // Dispositivos de Audio (Micrófono y Cable Virtual para Zoom Desktop/Teams)
  const [audioInputDevices, setAudioInputDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedMicId, setSelectedMicId] = useState<string>("");
  const [selectedInterviewerId, setSelectedInterviewerId] = useState<string>("");
  const [showDeviceSettings, setShowDeviceSettings] = useState(false);

  // Inyector de preguntas Glassdoor / Blind / Reddit
  const [glassdoorModalOpen, setGlassdoorModalOpen] = useState(false);
  const [glassdoorText, setGlassdoorText] = useState("");

  useEffect(() => {
    async function loadAudioDevices() {
      try {
        if (typeof navigator !== "undefined" && navigator.mediaDevices?.enumerateDevices) {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const inputs = devices.filter((d) => d.kind === "audioinput");
          setAudioInputDevices(inputs);
          if (inputs.length > 0 && !selectedMicId) {
            setSelectedMicId(inputs[0].deviceId);
          }
        }
      } catch (e) {
        console.warn("No se pudieron listar dispositivos de audio", e);
      }
    }
    loadAudioDevices();
  }, [selectedMicId]);

  const [interviewMode, setInterviewMode] = useState<"technical" | "screening">("technical");
  const [screenSafeMode, setScreenSafeMode] = useState(false);
  const interviewModeRef = useRef<"technical" | "screening">("technical");
  interviewModeRef.current = interviewMode;

  // Hook de Teleprompter HUD Pop-out con soporte de mensajes bidireccionales
  const { isOpen: isTeleprompterOpen, openTeleprompter, syncTeleprompter } = useTeleprompter({
    onMessage: (msg: { type?: string }) => {
      if (msg?.type === "TRIGGER_REVERSE_QUESTIONS") {
        keyboardHandlersRef.current?.handleReverseQuestions?.();
      }
    },
  });

  // Hook de Screen Vision (Live Coding & Diagramas en Pantalla)
  const { isCapturing: isVisionCapturing, captureScreenFrame } = useScreenVision();

  // Hook de Susurro Privado en Auricular
  const earbudWhisper = useEarbudWhisper({ defaultEnabled: false });

  // Hook de Gaze Tracker (Asistente de Contacto Visual con la Cámara)
  const gazeTracker = useGazeTracker({ defaultEnabled: false } as any);

  // Hook de Respuestas LLM & Streaming
  const {
    answers,
    isGenerating,
    generationStartTimeRef,
    generationError,
    sessionFacts,
    clearSessionFacts,
    sessionTokens,
    resetSessionTokens,
    usedStoryIndicesRef,
    resetUsedStories,
    requestAnswer,
    startSpeculativePreFetch,
    stopGenerating,
    clearAnswers,
    setAnswerFeedback,
    generateWarmupAnswers,
  } = useAnswerStream();

  const isGeneratingRef = useRef(isGenerating);
  isGeneratingRef.current = isGenerating;

  const masterAnswersRef = useRef(masterAnswers);
  masterAnswersRef.current = masterAnswers;

  const answersRef = useRef(answers);
  answersRef.current = answers;

  const lastProcessedLineIdRef = useRef<number | string | null>(null);

  const selectedModel = MODELS.find((m) => m.id === modelId) || MODELS[0];

  // Callback para recibir transcripciones del STT
  const handleTranscript = useCallback((line: TranscriptLine) => {
    // Si entran nuevas palabras del entrevistador mientras un temporizador de fin de turno estaba corriendo,
    // cancelarlo de inmediato porque el entrevistador sigue hablando (evita partir la pregunta)
    if (line.speaker === 0 && utteranceTimerRef.current) {
      clearTimeout(utteranceTimerRef.current);
      utteranceTimerRef.current = null;
    }

    // Cancelación Inmediata por Interrupción del Entrevistador (Barge-in Inverso <50ms)
    // Si el entrevistador empieza a repreguntar mientras aún se estaba generando la respuesta anterior,
    // abortar de inmediato para no saturar al candidato con texto viejo ni mezclar contextos
    if (line.speaker === 0 && line.text.trim().length >= 12 && isGeneratingRef.current) {
      stopGenerating();
      syncTeleprompter?.({
        question: `(Repregunta): "${line.text.trim()}"`,
        cleanText: "(El entrevistador repreguntó. Escuchando...)",
        isGenerating: false,
      });
    }

    setTranscriptLines((prev) => {
      const idx = prev.findIndex((l) => l.id === line.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = line;
        return next;
      }
      return [...prev.slice(-250), line];
    });
  }, [stopGenerating, syncTeleprompter]);

  const transcriptLinesRef = useRef<TranscriptLine[]>(transcriptLines);
  transcriptLinesRef.current = transcriptLines;

  const utteranceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (utteranceTimerRef.current) {
        clearTimeout(utteranceTimerRef.current);
      }
    };
  }, []);

  const audioModeRef = useRef<AudioMode>("mic");

  // Trigger automático de respuesta al detectar fin de habla (UtteranceEnd)
  const handleUtteranceEnd = useCallback(() => {
    if (!autoRespond || isGeneratingRef.current) return;

    if (utteranceTimerRef.current) {
      clearTimeout(utteranceTimerRef.current);
    }

    // Determinar el debounce adaptativo según el texto pendiente del entrevistador
    const currentLines = transcriptLinesRef.current;
    const interviewerLines = currentLines.filter((l) => l.speaker === 0);
    const pendingText = interviewerLines.slice(-3).map((l) => l.text).join(" ");
    const debounceMs = getAdaptiveDebounceMs(pendingText);

    utteranceTimerRef.current = setTimeout(() => {
      if (isGeneratingRef.current) return;
      const currentLines = transcriptLinesRef.current;

      // Solo en modo Dual ignorar si el último que habló fue el candidato por su propio micrófono (speaker === 1)
      const lastLine = currentLines[currentLines.length - 1];
      if (audioModeRef.current === "dual" && lastLine && lastLine.speaker === 1) {
        return;
      }

      // Extraer limpiamente solo el turno actual del entrevistador evitando mezclar preguntas anteriores
      const { text: recentText, newLastId, isIncomplete } = extractCurrentTurnQuestion(
        currentLines,
        lastProcessedLineIdRef.current
      );

      // Si la frase parece incompleta (respiración, conector final, etc.), esperar al siguiente fragmento,
      // salvo que ya tenga suficiente extensión (>= 8 palabras) o intención clara de entrevista
      const words = recentText.split(/\s+/).filter(Boolean);
      const hasClearIntent = /[?¿]|\b(contame|cu[eé]ntame|h[aá]blame|[aá]brame|explicame|explica|describ[ií]|describe|platicame|comentame|tell me|walk me through|sobre ti|sobre vos|tu experiencia)\b/i.test(recentText);
      if (isIncomplete && words.length < 8 && !hasClearIntent) {
        return;
      }

      // Descartar confirmaciones, muletillas o frases de cierre que NO son preguntas ("es la práctica", "okay thank you")
      if (!isActionableQuestion(recentText)) {
        if (newLastId !== null) {
          lastProcessedLineIdRef.current = newLastId;
        }
        return;
      }

      if (recentText && recentText.length >= 6) {
        lastProcessedLineIdRef.current = newLastId;
        const lang = detectQuestionLanguage(recentText);
        const focusedProfile =
          profile && profile.length > 800
            ? selectRelevantCvChunks(recentText, chunkCv(profile))
            : profile;

        // Auto-match STAR y Detector de test de firmeza
        // M4: pasar historias ya usadas en la sesión para deprioritizarlas
        const excludedStories = Array.from(usedStoryIndicesRef.current);
        const matchedStory = matchSTARStory(recentText, starStoriesRef.current, 0.35, excludedStories);
        const firmnessAlert = detectFirmnessChallenge(recentText);
        const experienceAlert = detectExperienceQuestion(recentText);

        // M4: registrar la historia usada
        if (matchedStory) {
          usedStoryIndicesRef.current.add(matchedStory.storyIndex);
        }

        syncTeleprompter({
          question: recentText,
          interviewMode: interviewModeRef.current,
          experienceAlert,
          ...(matchedStory
            ? {
                matchedStory: {
                  storyIndex: matchedStory.storyIndex,
                  title: matchedStory.story.title,
                  action: matchedStory.story.action,
                  result: matchedStory.story.result || "",
                  score: matchedStory.score,
                },
              }
            : {}),
          firmnessAlert: firmnessAlert.isChallenge ? firmnessAlert : null,
        });

        // Directivas especializadas según modo (Pilar 1)
        let effectiveInstructions = extraInstructions;
        if (interviewModeRef.current === "screening") {
          effectiveInstructions =
            (effectiveInstructions ? effectiveInstructions + "\n" : "") +
            "[MODO RECRUITER SCREENING]: Respuestas directas, cordiales y concisas (máximo 2 oraciones). Enfocar en pretensión de $4,000 USD/mes o ~$25-$30/h contractor, disponibilidad inmediata, inglés B2 fluido, residencia remota en Salta (UTC-3), estabilidad laboral y fit cultural con Luna.";
        }

        requestAnswer({
          question: recentText,
          transcript: currentLines
            .map((l) => `[${l.speaker === 0 ? "Entrevistador" : "Yo"}]: ${l.text}`)
            .join("\n"),
          company,
          role,
          profile: focusedProfile,
          interviewerBio,
          extraInstructions: effectiveInstructions,
          provider: selectedModel.provider,
          model: selectedModel.model,
          modelLabel: selectedModel.label,
          detectedLang: lang,
          simpleEnglish,
          dialect,
          bilingualMode,
          type: "answer",
          masterAnswers: masterAnswersRef.current,
          starStories: starStoriesRef.current,
          syncTeleprompter,
          onPunchline: (punchline, pLang) => earbudWhisper.whisper(punchline, pLang),
        });
      }
    }, debounceMs); // Debounce adaptativo: 900ms para preguntas cerradas, 2800ms tras conectores en inglés, 1300ms estándar
  }, [
    autoRespond,
    requestAnswer,
    company,
    role,
    profile,
    interviewerBio,
    extraInstructions,
    selectedModel,
    simpleEnglish,
    dialect,
    bilingualMode,
    syncTeleprompter,
    earbudWhisper,
  ]);

  // Hook de Audio y Conexión Deepgram (con soporte de Audio Dual y Barge-in)
  const {
    status: sttStatus,
    errorMessage: sttError,
    isPaused: isSttPaused,
    activeMode: audioMode,
    energy: audioEnergy,
    connect: connectDeepgram,
    disconnect: disconnectDeepgram,
    togglePause: togglePauseStt,
  } = useDeepgram({
    onTranscript: handleTranscript,
    onUtteranceEnd: handleUtteranceEnd,
    onBargeIn: () => {
      // M2: umbral de barge-in reducido a 1500ms cuando el audio viene de pestaña o dual
      // (el VAD de audio de tab es más lento, la señal llega tarde con el umbral estándar de 3000ms)
      const bargeInThresholdMs = (audioMode === "tab" || audioMode === "dual") ? 1500 : 3000;
      // Auto-cancelación por Barge-in: si el candidato arranca a hablar tras recibir la sugerencia
      if (isGeneratingRef.current && Date.now() - generationStartTimeRef.current > bargeInThresholdMs) {
        stopGenerating();
        syncTeleprompter?.({ isGenerating: false });
      }
    },
    onSpeculativeTurn: (interimText) => {
      if (!autoRespond || isGeneratingRef.current) return;
      if (!isActionableQuestion(interimText)) return;
      startSpeculativePreFetch({
        question: interimText,
        transcript: transcriptLinesRef.current
          .map((l) => `[${l.speaker === 0 ? "Entrevistador" : "Yo"}]: ${l.text}`)
          .join("\n"),
        company,
        role,
        profile,
        provider: selectedModel.provider,
        model: selectedModel.model,
        detectedLang: detectQuestionLanguage(interimText),
      });
    },
    onLanguageDetected: (detected) => {
      const normalized = detected.toLowerCase().startsWith("en") ? "en" : "es";
      setSttLang(normalized);
    },
    lang: sttLang,
  });

  audioModeRef.current = audioMode;

  // Handler para Screen Vision (Live Coding & Diagramas en Pantalla)
  const handleCaptureScreen = useCallback(async () => {
    if (isGeneratingRef.current) return;
    const base64 = await captureScreenFrame();
    if (!base64) return;

    requestAnswer({
      question: "Analizá el ejercicio en pantalla (código, LeetCode/HackerRank o diagrama) y proveé la solución óptima con complejidad Big-O y código tipado.",
      transcript: transcriptLinesRef.current
        .map((l) => `[${l.speaker === 0 ? "Entrevistador" : "Yo"}]: ${l.text}`)
        .join("\n"),
      company,
      role,
      profile,
      interviewerBio,
      extraInstructions,
      provider: selectedModel.provider,
      model: selectedModel.model,
      modelLabel: "Screen Vision 👁️",
      detectedLang: "en",
      mode: "vision_coding",
      image: { mimeType: "image/jpeg", data: base64 },
      type: "answer",
      starStories: starStoriesRef.current,
      syncTeleprompter,
      onPunchline: (punchline, pLang) => earbudWhisper.whisper(punchline, pLang),
    });
  }, [captureScreenFrame, company, role, profile, interviewerBio, extraInstructions, selectedModel, syncTeleprompter, requestAnswer, earbudWhisper]);

  // Handler para Modo Cierre de Oro (Reverse Interviewer)
  const handleReverseQuestions = useCallback(() => {
    if (isGeneratingRef.current) return;
    requestAnswer({
      question: "Generar 3 preguntas estratégicas y de alto filo técnico para hacerle al entrevistador basadas en los desafíos y dolores charlados.",
      transcript: transcriptLinesRef.current
        .map((l) => `[${l.speaker === 0 ? "Entrevistador" : "Yo"}]: ${l.text}`)
        .join("\n"),
      company,
      role,
      profile,
      interviewerBio,
      extraInstructions,
      provider: selectedModel.provider,
      model: selectedModel.model,
      modelLabel: "Cierre de Oro 🎯 (F4)",
      detectedLang: sttLang,
      type: "reverse_questions",
      starStories: starStoriesRef.current,
      syncTeleprompter,
      onPunchline: (punchline, pLang) => earbudWhisper.whisper(punchline, pLang),
    });
  }, [company, role, profile, interviewerBio, extraInstructions, selectedModel, sttLang, syncTeleprompter, requestAnswer, earbudWhisper]);

  // Refinamientos rápidos tácticos (Hotkeys F2 y F3)
  const handleConciseRefine = useCallback(() => {
    if (isGeneratingRef.current) return;
    const lastAns = answersRef.current[0];
    const q = lastAns?.question || "Resumí la respuesta anterior";
    requestAnswer({
      question: `[MÁS CONCISO - MÁXIMO 2 ORACIONES]: ${q}`,
      transcript: transcriptLinesRef.current
        .map((l) => `[${l.speaker === 0 ? "Entrevistador" : "Yo"}]: ${l.text}`)
        .join("\n"),
      company,
      role,
      profile,
      interviewerBio,
      extraInstructions: (extraInstructions ? extraInstructions + "\n" : "") + "SÉ ULTRA CONCISO. Máximo 2 oraciones directas sin preámbulos.",
      provider: selectedModel.provider,
      model: selectedModel.model,
      modelLabel: "Ultra Conciso ⚡ (F2)",
      detectedLang: sttLang,
      type: "answer",
      starStories: starStoriesRef.current,
      syncTeleprompter,
      onPunchline: (punchline, pLang) => earbudWhisper.whisper(punchline, pLang),
    });
  }, [company, role, profile, interviewerBio, extraInstructions, selectedModel, sttLang, syncTeleprompter, requestAnswer, earbudWhisper]);

  const handleTradeOffsRefine = useCallback(() => {
    if (isGeneratingRef.current) return;
    const lastAns = answersRef.current[0];
    const q = lastAns?.question || "Explicá los trade-offs de la solución";
    requestAnswer({
      question: `[TRADE-OFFS & WHY NOT]: ¿Cuáles son los trade-offs críticos de esta solución y por qué NO usar otras alternativas comunes? Pregunta base: ${q}`,
      transcript: transcriptLinesRef.current
        .map((l) => `[${l.speaker === 0 ? "Entrevistador" : "Yo"}]: ${l.text}`)
        .join("\n"),
      company,
      role,
      profile,
      interviewerBio,
      extraInstructions: (extraInstructions ? extraInstructions + "\n" : "") + "Enfocate fuertemente en [WHY_NOT] y matrices de decisión de trade-offs de producción.",
      provider: selectedModel.provider,
      model: selectedModel.model,
      modelLabel: "Trade-offs Matrix ⚖️ (F3)",
      detectedLang: sttLang,
      type: "answer",
      starStories: starStoriesRef.current,
      syncTeleprompter,
      onPunchline: (punchline, pLang) => earbudWhisper.whisper(punchline, pLang),
    });
  }, [company, role, profile, interviewerBio, extraInstructions, selectedModel, sttLang, syncTeleprompter, requestAnswer, earbudWhisper]);

  // Atajos de teclado sigilosos sin mover las manos (F2, F3, F4, `, Ctrl+1, Ctrl+2)
  const keyboardHandlersRef = useRef({
    handleConciseRefine,
    handleTradeOffsRefine,
    handleReverseQuestions,
    handleCaptureScreen,
    syncTeleprompter,
    openTeleprompter,
  });
  keyboardHandlersRef.current = {
    handleConciseRefine,
    handleTradeOffsRefine,
    handleReverseQuestions,
    handleCaptureScreen,
    syncTeleprompter,
    openTeleprompter,
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea") return;

      // F2: Respuesta ultra concisa en 2 oraciones
      if (e.key === "F2") {
        e.preventDefault();
        keyboardHandlersRef.current.handleConciseRefine();
        return;
      }

      // F3: Matriz de Trade-offs y "Why NOT X?"
      if (e.key === "F3") {
        e.preventDefault();
        keyboardHandlersRef.current.handleTradeOffsRefine();
        return;
      }

      // F4: Preguntas estratégicas de Cierre de Oro
      if (e.key === "F4") {
        e.preventDefault();
        keyboardHandlersRef.current.handleReverseQuestions();
        return;
      }

      // `: Captura instantánea de pantalla (Screen Vision)
      if (e.key === "`") {
        e.preventDefault();
        keyboardHandlersRef.current.handleCaptureScreen();
        return;
      }

      // F8: Alternar Modo Pantalla Segura / Camuflaje IDE en Teleprompter (Pilar 6)
      if (e.key === "F8") {
        e.preventDefault();
        setScreenSafeMode((prev) => {
          const next = !prev;
          keyboardHandlersRef.current.syncTeleprompter({ camouMode: next ? "ide" : "normal" });
          return next;
        });
        return;
      }

      if (e.ctrlKey && e.key === "1") {
        e.preventDefault();
        const rescue = {
          icon: "⏳",
          label: "Ganar tiempo",
          en: "That's a great question, let me organize my thoughts for a second.",
        };
        navigator.clipboard.writeText(rescue.en);
        window.focus();
        return;
      }

      if (e.ctrlKey && e.key === "2") {
        e.preventDefault();
        keyboardHandlersRef.current.openTeleprompter();
        return;
      }

      // Atajo Ctrl + número para frases de rescate
      const num = parseInt(e.key, 10);
      if (e.ctrlKey && num >= 1 && num <= 3) {
        e.preventDefault();
        const rescue = {
          1: { en: "Could you clarify what you mean by that?", es: "¿Podrías aclarar a qué te referís?" },
          2: { en: "Give me a second to think through this architecture.", es: "Dame un segundo para pensar esta arquitectura." },
          3: { en: "That is a great question, let me break it down.", es: "Buena pregunta, permitime desglosarla." },
        }[num as 1 | 2 | 3];
        navigator.clipboard.writeText(rescue.en);
        keyboardHandlersRef.current.syncTeleprompter({ enText: rescue.en, question: "Frase de rescate (Clarificar)" });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const triggerCurrentInterviewerQuestion = useCallback(() => {
    if (isGeneratingRef.current) return;
    const currentLines = transcriptLinesRef.current;
    if (!currentLines || currentLines.length === 0) return;

    // Buscar la última línea del entrevistador o la última línea registrada
    const interviewerLines = currentLines.filter((l) => l.speaker === 0);
    const targetLine = interviewerLines[interviewerLines.length - 1] || currentLines[currentLines.length - 1];
    if (!targetLine || !targetLine.text.trim()) return;

    lastProcessedLineIdRef.current = targetLine.id;
    const q = targetLine.text.trim();
    const lang = detectQuestionLanguage(q);
    const focusedProfile =
      profile && profile.length > 800
        ? selectRelevantCvChunks(q, chunkCv(profile))
        : profile;

    const excludedStories = Array.from(usedStoryIndicesRef.current);
    const matchedStory = matchSTARStory(q, starStoriesRef.current, 0.35, excludedStories);
    const firmnessAlert = detectFirmnessChallenge(q);
    const experienceAlert = detectExperienceQuestion(q);

    if (matchedStory) {
      usedStoryIndicesRef.current.add(matchedStory.storyIndex);
    }

    syncTeleprompter({
      question: q,
      interviewMode: interviewModeRef.current,
      experienceAlert,
      ...(matchedStory
        ? {
            matchedStory: {
              storyIndex: matchedStory.storyIndex,
              title: matchedStory.story.title,
              action: matchedStory.story.action,
              result: matchedStory.story.result || "",
              score: matchedStory.score,
            },
          }
        : {}),
      firmnessAlert: firmnessAlert.isChallenge ? firmnessAlert : null,
    });

    let effectiveInstructions = extraInstructions;
    if (interviewModeRef.current === "screening") {
      effectiveInstructions =
        (effectiveInstructions ? effectiveInstructions + "\n" : "") +
        "[MODO RECRUITER SCREENING]: Respuestas directas, cordiales y concisas (máximo 2 oraciones). Enfocar en pretensión de $4,000 USD/mes o ~$25-$30/h contractor, disponibilidad inmediata, inglés B2 fluido, residencia remota en Salta (UTC-3), estabilidad laboral y fit cultural con Luna.";
    }

    requestAnswer({
      question: q,
      transcript: currentLines
        .map((l) => `[${l.speaker === 0 ? "Entrevistador" : "Yo"}]: ${l.text}`)
        .join("\n"),
      company,
      role,
      profile: focusedProfile,
      interviewerBio,
      extraInstructions: effectiveInstructions,
      provider: selectedModel.provider,
      model: selectedModel.model,
      modelLabel: selectedModel.label,
      detectedLang: lang,
      simpleEnglish,
      dialect,
      bilingualMode,
      type: "answer",
      masterAnswers: masterAnswersRef.current,
      starStories: starStoriesRef.current,
      syncTeleprompter,
      onPunchline: (punchline, pLang) => earbudWhisper.whisper(punchline, pLang),
    });
  }, [
    requestAnswer,
    company,
    role,
    profile,
    interviewerBio,
    extraInstructions,
    selectedModel,
    simpleEnglish,
    dialect,
    bilingualMode,
    syncTeleprompter,
    earbudWhisper,
  ]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = manualQuestion.trim();
    if (!q) {
      triggerCurrentInterviewerQuestion();
      return;
    }
    setManualQuestion("");
    const currentLines = transcriptLinesRef.current;
    if (currentLines.length > 0) {
      lastProcessedLineIdRef.current = currentLines[currentLines.length - 1]?.id || null;
    }
    const lang = detectQuestionLanguage(q);

    // Auto-match STAR y Detector de test de firmeza en submit manual
    // M4: pasar historias ya usadas en la sesión para deprioritizarlas
    const excludedStories = Array.from(usedStoryIndicesRef.current);
    const matchedStory = matchSTARStory(q, starStoriesRef.current, 0.35, excludedStories);
    const firmnessAlert = detectFirmnessChallenge(q);

    // M4: registrar la historia usada
    if (matchedStory) {
      usedStoryIndicesRef.current.add(matchedStory.storyIndex);
    }

    if (matchedStory || firmnessAlert.isChallenge) {
      syncTeleprompter({
        question: q,
        matchedStory: matchedStory
          ? {
              storyIndex: matchedStory.storyIndex,
              title: matchedStory.story.title,
              action: matchedStory.story.action,
              result: matchedStory.story.result || "",
              score: matchedStory.score,
            }
          : null,
        firmnessAlert: firmnessAlert.isChallenge ? firmnessAlert : null,
      });
    }

    requestAnswer({
      question: q,
      transcript: currentLines
        .map((l) => `[${l.speaker === 0 ? "Entrevistador" : "Yo"}]: ${l.text}`)
        .join("\n"),
      company,
      role,
      profile,
      interviewerBio,
      extraInstructions,
      provider: selectedModel.provider,
      model: selectedModel.model,
      modelLabel: selectedModel.label,
      detectedLang: lang,
      simpleEnglish,
      dialect,
      bilingualMode,
      type: "answer",
      masterAnswers: masterAnswersRef.current,
      starStories: starStoriesRef.current,
      syncTeleprompter,
      onPunchline: (punchline, pLang) => earbudWhisper.whisper(punchline, pLang),
    });
  };

  const handleIcebreaker = () => {
    requestAnswer({
      question: "Qué preguntas estratégicas puedo hacerle al entrevistador en este momento?",
      transcript: transcriptLines
        .map((l) => `[${l.speaker === 0 ? "Entrevistador" : "Yo"}]: ${l.text}`)
        .join("\n"),
      company,
      role,
      profile,
      interviewerBio,
      extraInstructions,
      provider: selectedModel.provider,
      model: selectedModel.model,
      modelLabel: selectedModel.label,
      detectedLang: sttLang,
      simpleEnglish,
      dialect,
      bilingualMode,
      type: "icebreaker",
      masterAnswers,
      starStories: starStoriesRef.current,
      syncTeleprompter,
    });
  };

  // Handler para generación del Scorecard Predictor FAANG & Thank-You Note
  const handleGenerateSummary = async () => {
    setSummaryModalOpen(true);
    setSummaryText("");
    setIsSummaryLoading(true);

    const fullTranscript = transcriptLinesRef.current
      .map((l) => `[${l.speaker === 0 ? "Entrevistador" : "Yo"}]: ${l.text}`)
      .join("\n");

    const answersDigest = answers
      .map((a) => `[Pregunta Entrevistador]: ${a.question}\n[Respuesta Candidato]: ${a.cleanText || a.esText || a.enText}`)
      .reverse()
      .join("\n\n");

    const completeRecord = answersDigest
      ? `### INTERACCIONES Y RESPUESTAS TÉCNICAS:\n${answersDigest}\n\n### TRANSCRIPCIÓN CONTINUA DE AUDIO:\n${fullTranscript}`
      : fullTranscript || "(Sin transcripción grabada en esta sesión)";

    const formattedFacts = sessionFacts.map((f: any) =>
      typeof f === "object"
        ? `${f.category || "Técnico"}: ${f.fact || f.statement || f.key || JSON.stringify(f)}`
        : String(f)
    );

    try {
      const res = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company,
          role,
          profile,
          transcript: completeRecord,
          facts: formattedFacts,
          provider: selectedModel.provider,
          model: selectedModel.model,
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error("No se pudo obtener el Scorecard de la entrevista.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        acc += chunk;
        setSummaryText(acc);
      }
    } catch (err) {
      setSummaryText(`⚠️ Error al generar el Scorecard: ${(err as Error)?.message || "desconocido"}`);
    } finally {
      setIsSummaryLoading(false);
    }
  };

  // Handler para guardar nueva historia STAR en la Bóveda
  const handleSaveNewStarStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStarTitle.trim() || !newStarAction.trim()) return;
    saveSTARStory({
      title: newStarTitle.trim(),
      situation: newStarSituation.trim(),
      task: newStarTask.trim(),
      action: newStarAction.trim(),
      result: newStarResult.trim(),
    });
    setNewStarTitle("");
    setNewStarSituation("");
    setNewStarTask("");
    setNewStarAction("");
    setNewStarResult("");
    setShowStarForm(false);
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsPdfLoading(true);
    try {
      const extracted = await extractTextFromPdf(file);
      if (extracted) {
        setProfile((prev) => (prev ? `${prev}\n\n${extracted}` : extracted));
      }
    } catch (err) {
      console.error("Error al extraer texto del PDF:", err);
    } finally {
      setIsPdfLoading(false);
    }
  };

  const warmupAbortRef = useRef<AbortController | null>(null);

  const handleGenerateWarmup = async () => {
    // Cancelar warmup previo si aún está en curso
    if (warmupAbortRef.current) warmupAbortRef.current.abort();
    warmupAbortRef.current = new AbortController();
    setWarmupLoading(true);
    setWarmupMessage(null);
    try {
      const generated = await generateWarmupAnswers({
        company,
        role,
        profile,
        provider: selectedModel.provider,
        model: selectedModel.model,
        signal: warmupAbortRef.current.signal,
      });
      importMasterAnswers(generated);
      setWarmupMessage(`¡Se generaron y guardaron ${generated.length} preguntas clave en tu banco de memoria!`);
    } catch (err: unknown) {
      // Ignorar cancelaciones intencionales
      if (err instanceof Error && err.name === "AbortError") return;
      setWarmupMessage(`Error: ${(err as Error)?.message || "No se pudieron generar las preguntas."}`);
    } finally {
      setWarmupLoading(false);
    }
  };

  const handleMarkdownImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = String(event.target?.result || "");
      const parsed = parseInterviewMarkdownToMasterAnswers(content, company, role);
      if (parsed.length > 0) {
        importMasterAnswers(parsed);
        setWarmupMessage(`✅ Se importaron ${parsed.length} respuestas al Banco de Memoria.`);
      } else {
        setWarmupMessage("⚠️ No se encontraron preguntas estructuradas en el archivo Markdown.");
      }
    };
    reader.readAsText(file);
  };


  const handleImportGlassdoor = useCallback(() => {
    if (!glassdoorText.trim()) return;
    const rawLines = glassdoorText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 5);

    const newItems: MasterAnswer[] = [];
    for (const line of rawLines) {
      const cleanQ = line.replace(/^(\d+[\.\)]|\-|\*)\s*/, "").trim();
      if (cleanQ.length > 5) {
        newItems.push({
          id: `gd_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          question: cleanQ,
          enText: `[KEY]: Direct punchline addressing "${cleanQ}".\n[EN]: Production-grade answer for "${cleanQ}" tailored to ${company || "tech standards"}.`,
          esText: `[ES]: Respuesta directa para "${cleanQ}".`,
          category: "Glassdoor / Blind",
          tags: ["glassdoor", (company || "general").toLowerCase()],
          role: role || "Software Engineer",
          company: company || "General",
          favorite: true,
          createdAt: Date.now(),
        });
      }
    }

    if (newItems.length > 0) {
      importMasterAnswers(newItems);
      setWarmupMessage(`✅ Se precargaron ${newItems.length} preguntas de Glassdoor/Blind en el Banco de Memoria (<50ms).`);
      setGlassdoorText("");
      setGlassdoorModalOpen(false);
    }
  }, [glassdoorText, company, role, importMasterAnswers]);

  const handleCopy = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleSelectRescuePhrase = (phrase: RescuePhrase) => {
    syncTeleprompter({
      question: `Frase de Rescate (${phrase.label})`,
      enText: phrase.en,
      esText: phrase.es,
      cleanText: phrase.en,
      isGenerating: false,
      modelName: "Rescate Inmediato ⚡",
      fromMemory: true,
    });
  };

  const handlePlayTTS = (textToSpeak: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak.slice(0, 600));
    utterance.lang = "en-US";
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  const lastTranscriptText = useMemo(
    () => transcriptLines.map((l) => l.text).join(" ").slice(-150),
    [transcriptLines]
  );

  // M5: Estado del Wizard del Dossier del Entrevistador
  const [showDossierWizard, setShowDossierWizard] = useState(false);
  const [wizardProfile, setWizardProfile] = useState<"technical" | "business" | "">("technical");
  const [wizardCompany, setWizardCompany] = useState("");
  const [wizardTone, setWizardTone] = useState<"warm" | "neutral" | "cold" | "aggressive">("neutral");

  const generateDossierText = () => {
    const profileLabel = wizardProfile === "technical"
      ? "Perfil Técnico (Engineer / Architect / Staff)"
      : "Perfil de Negocio (HR / Recruiter / Product / VP)";
    const toneMap = {
      warm: "Tono cálido y colaborativo. Espera rapport antes de profundidad técnica. Priorizar conexión humana y pasaj de cultural fit.",
      neutral: "Tono neutral y profesional. Evaluación directa. Equilibrar técnica con comunicación clara.",
      cold: "Tono frío y evaluativo. Alto umbral de prueba. Respuestas ultra-concretas con datos y trade-offs; evitar contenido fluff.",
      aggressive: "Tono desafiante (Have Backbone style). Pone a prueba la firmeza. Mantener posición técnica bajo presión, datos sobre opinión.",
    };
    const companyCtx = wizardCompany.trim()
      ? `Empresa: ${wizardCompany.trim()}. `
      : "";
    return `${profileLabel}. ${companyCtx}${toneMap[wizardTone]}`;
  };

  const applyDossierWizard = () => {
    const text = generateDossierText();
    setInterviewerBio(text);
    setShowDossierWizard(false);
  };

  // Preset 1-Click para la entrevista de Globant / Intermedia
  const loadGlobantPreset = useCallback(() => {
    setCompany("Globant");
    setRole("GCP Cloud Engineer");
    setInterviewerBio(
      "Marian Francheska Escalona, Recruiting Analyst en Globant. Entrevista inicial de screening (45 min) para Globant / Intermedia. Salto espontáneo a inglés (small talk, hobbies, Luna la perrita en Salta) y validación técnica de background en GCP, GCVE y Terraform."
    );
    setProfile(
      "Guillermo Fernando Farfán Romero. Ingeniero de Infraestructura Cloud y Software con +8 años de experiencia global en IT/desarrollo y ~4 años dedicados a Google Cloud Platform (GCP), Terraform, Linux, Docker y redes empresariales."
    );
    setExtraInstructions(
      "Respuestas conversacionales ultra-concisas (máximo 2 oraciones, 25-35 palabras). Bilingüe: responder en inglés fluido si pregunta en inglés (con [KEY], [EN], [PHO], [ES]) o español profesional con Spanglish técnico si pregunta en español. Pretensión contractor USD: $25-$30/h (o ~$4,000 USD/mes bruto). Mascota: perrita rescatada y adoptada Luna en Salta. NUNCA mencionar gatos. Nunca decir 8 años en GCP (discriminar +8 años IT total vs ~4 años GCP/Cloud)."
    );
    setInterviewMode("screening");
    syncTeleprompter({ interviewMode: "screening" });

    importMasterAnswers(GLOBANT_AND_GCP_MASTER_ANSWERS);
  }, [setCompany, setRole, setInterviewerBio, setProfile, setExtraInstructions, setInterviewMode, syncTeleprompter, importMasterAnswers]);

  // Preset 1-Click para la entrevista de Mercado Libre - NoSQL Service Team (Valeria - Eightfold AI)
  const loadMeliPreset = useCallback(() => {
    setCompany("MercadoLibre");
    setRole("Sr Software Engineer - NoSQL Service Team");
    setInterviewerBio(
      "Valeria (Agente de IA en Eightfold.ai). Evaluación inicial técnica para Mercado Libre (NoSQL Service Team, ID 126318). Evalúa: soporte multi-cloud más allá de AWS DocumentDB (GCP Firestore/MongoDB/Bigtable), segmentación y sharding de bases de datos, proxies de consulta y routing centralizado, migración a Istio en Kubernetes, resiliencia/alta disponibilidad/latencia P99, y uso avanzado de IA en el flujo diario de ingeniería. Estructura STAR estricta, alta densidad de palabras clave técnicas y métricas cuantificables."
    );
    setProfile(
      "Guillermo Fernando Farfán Romero. Ingeniero de Software e Infraestructura Cloud con +8 años de experiencia en sistemas distribuidos/backend y ~4 años dedicados a arquitecturas cloud (GCP/AWS), Kubernetes, optimización de bases de datos, proxies de conexión y plataformas de alta disponibilidad."
    );
    setExtraInstructions(
      "Respuestas concisas de alto impacto para evaluador IA (Valeria - Eightfold): estructurar con STAR tácito, incluir palabras clave exactas (DocumentDB, Firestore, Sharding, Database Proxy, Istio, Latencia P99, IA asistida). Enfatizar ~4 años en Cloud/GCP + Kubernetes y +8 años en IT/sistemas. Citar principios de Mercado Libre: Beta continuo, emprender tomando riesgos, ejecutar con excelencia."
    );
    setInterviewMode("technical");
    syncTeleprompter({ interviewMode: "technical" });

    importMasterAnswers(MELI_NOSQL_MASTER_ANSWERS);
  }, [setCompany, setRole, setInterviewerBio, setProfile, setExtraInstructions, setInterviewMode, syncTeleprompter, importMasterAnswers]);

  return (
    <div className="copilot-container min-h-screen bg-transparent text-zinc-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Navbar */}
      <header className="border-b border-white/[0.07] bg-[#080a10]/80 backdrop-blur-xl px-4 sm:px-6 py-2.5 flex items-center justify-between sticky top-0 z-40 transition-all">
        <div className="flex items-center gap-3">
          <BrandLogo />
          <div className="hidden sm:flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wide border transition-all ${
                sttStatus === "live"
                  ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                  : sttStatus === "connecting"
                  ? "bg-amber-500/10 text-amber-300 border-amber-500/30 animate-pulse"
                  : sttStatus === "error"
                  ? "bg-rose-500/10 text-rose-300 border-rose-500/30"
                  : "bg-white/[0.04] text-zinc-400 border-white/[0.06]"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  sttStatus === "live"
                    ? "bg-emerald-400 shadow-[0_0_6px_#34d399] animate-ping"
                    : sttStatus === "connecting"
                    ? "bg-amber-400"
                    : sttStatus === "error"
                    ? "bg-rose-400"
                    : "bg-zinc-500"
                }`}
              />
              <span>
                {sttStatus === "live"
                  ? "EN VIVO"
                  : sttStatus === "connecting"
                  ? "CONECTANDO..."
                  : sttStatus === "error"
                  ? "ERROR STT"
                  : "INACTIVO"}
              </span>
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/[0.07] shadow-inner backdrop-blur-md">
          <button
            type="button"
            onClick={() => setActiveTab("live")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
              activeTab === "live"
                ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
            }`}
          >
            Copiloto
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("context")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 ${
              activeTab === "context"
                ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
            }`}
          >
            <DocIcon />
            <span>Perfil & Stack</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("memory")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 ${
              activeTab === "memory"
                ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
            }`}
          >
            <span>Memoria ({masterAnswers.length})</span>
          </button>
        </div>

        {/* Top Right Controls */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={openTeleprompter}
            className="group flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-medium transition-all duration-150 shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]"
            title="Abrir Teleprompter flotante para ubicar bajo la cámara"
          >
            <ExternalLinkIcon />
            <span className="hidden md:inline font-semibold">HUD Teleprompter</span>
          </button>

          <Dropdown
            value={modelId}
            onChange={setModelId}
            options={MODELS.map((m) => ({
              id: m.id,
              label: m.label,
              tag: m.tag,
              icon: <ProviderIcon provider={m.provider} />,
            }))}
          />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col p-3 sm:p-4 max-w-6xl w-full mx-auto gap-3">
        {generationError && (
          <div className="p-3 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-xs flex items-center justify-between shadow-lg">
            <span>⚠️ {generationError}</span>
            <button type="button" onClick={() => stopGenerating()} className="underline hover:text-white">
              Cerrar
            </button>
          </div>
        )}

        {sttError && (
          <div className="p-3 rounded-xl bg-amber-950/80 border border-amber-800 text-amber-200 text-xs shadow-lg">
            ⚠️ {sttError}
          </div>
        )}

        {activeTab === "live" && (
          <div className="flex flex-col flex-1 gap-3">
            {/* Mission & Target Intel Bar: Mercado Libre / Globant */}
            {company === "MercadoLibre" ? (
              <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-[#0e121e]/85 to-yellow-950/30 p-3 sm:p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-[0_8px_30px_rgba(245,158,11,0.15)]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-base shrink-0 shadow-inner">
                    🟡
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">Entrevista Activa — Mercado Libre</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-200 border border-amber-500/40 animate-pulse">
                        Caduca: 24 Sep • 23:59 ART
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-200 border border-purple-500/40">
                        🤖 Valeria (Agente IA Eightfold)
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        NoSQL Service Team
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-zinc-100 mt-0.5">
                      Mercado Libre — Sr Software Engineer (NoSQL Service Team • ID 126318)
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      Multi-Cloud: <strong className="text-zinc-300">DocumentDB ➔ Firestore/GCP</strong> • Sharding & Routing • Istio • IA en workflow diario • Memoria: <strong className="text-zinc-200">{masterAnswers.length} listas</strong>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end md:self-center shrink-0 flex-wrap">
                  <a
                    href="https://mercadolibre.eightfold.ai/interview-ai/meeting/Yo9OAgvz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:scale-[1.02] active:scale-[0.98] inline-flex items-center gap-1.5"
                  >
                    <span>🎙️ Abrir Sala Eightfold AI</span>
                    <ExternalLinkIcon />
                  </a>
                  <button
                    type="button"
                    onClick={loadGlobantPreset}
                    className="px-2.5 py-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] text-zinc-400 hover:text-zinc-200 text-xs font-medium transition-all"
                    title="Cargar preset de Globant"
                  >
                    Preset Globant
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("context")}
                    className="px-3 py-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] text-zinc-300 text-xs font-medium transition-all"
                  >
                    ⚙️ Ver Stack
                  </button>
                </div>
              </div>
            ) : company === "Globant" ? (
              <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-[#0e121e]/80 to-indigo-950/30 p-3 sm:p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-base shrink-0 shadow-inner">
                    🎯
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">Entrevista Activa</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-200 border border-purple-500/40">
                        Completada hoy 10:00 ART
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        Bilingüe (Auto-Switch)
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-zinc-100 mt-0.5">
                      Globant / Intermedia — GCP Cloud Engineer
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      Reclutadora: <strong className="text-zinc-300">Marian Francheska Escalona</strong> • Tarifa: <span className="text-emerald-400 font-semibold">$25-$30/h USD</span> • Small talk: <span className="text-purple-300">Luna en Salta</span> • Memoria: <strong className="text-zinc-200">{masterAnswers.length} listas</strong>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end md:self-center shrink-0 flex-wrap">
                  <button
                    type="button"
                    onClick={loadMeliPreset}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:scale-[1.02] active:scale-[0.98]"
                  >
                    🟡 Cargar Mercado Libre (NoSQL)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("context")}
                    className="px-3 py-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] text-zinc-300 text-xs font-medium transition-all"
                  >
                    ⚙️ Ver Stack
                  </button>
                </div>
              </div>
            ) : company && role ? (
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3 sm:p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                    <BriefcaseIcon />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-zinc-200">
                        {role} en <span className="text-purple-400">{company}</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <button
                    type="button"
                    onClick={loadMeliPreset}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition-all"
                  >
                    🟡 Mercado Libre (NoSQL)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("context")}
                    className="px-3 py-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] text-zinc-300 text-xs font-medium transition-all"
                  >
                    ⚙️ Ver Perfil & Stack
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-[#0e121e]/85 to-indigo-950/40 p-3 sm:p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[0_8px_30px_rgba(245,158,11,0.15)]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-base shrink-0 shadow-inner">
                    🟡
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">Entrevista Pendiente</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-200 border border-amber-500/40 animate-pulse">
                        Caduca: 24 Sep • 23:59 ART
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-200 border border-purple-500/40">
                        🤖 Valeria (Agente IA)
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-zinc-100">
                      Mercado Libre — Sr Software Engineer (NoSQL Service Team)
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      Multi-Cloud (AWS DocumentDB a Firestore/GCP), Sharding, Istio, IA en workflow diario y respuestas STAR de alto impacto.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={loadMeliPreset}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:scale-[1.02] active:scale-[0.98] shrink-0"
                  >
                    🚀 Activar Mercado Libre NoSQL
                  </button>
                  <button
                    type="button"
                    onClick={loadGlobantPreset}
                    className="px-3 py-2 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] text-zinc-300 text-xs font-medium transition-all shrink-0"
                  >
                    Globant
                  </button>
                </div>
              </div>
            )}

            {/* Control Bar: 2-Tier Cockpit Deck */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0e121e]/75 backdrop-blur-xl shadow-[0_12px_40px_-10px_rgba(0,0,0,0.6)] p-3.5 sm:p-4 flex flex-col gap-3">
              {/* Tier 1: Audio Engine & Real-Time Telemetry Monitor */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2 flex-wrap">
                  {sttStatus === "idle" || sttStatus === "error" ? (
                    <>
                      <button
                        type="button"
                        onClick={() => connectDeepgram("dual", selectedMicId || undefined, selectedInterviewerId || undefined)}
                        className="group relative flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 text-xs font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.45)] active:scale-[0.98]"
                        title="Captura combinada: Micrófono (Vos) + Pestaña o Cable Virtual (Entrevistador)"
                      >
                        <span>Audio Dual 🎧</span>
                        <span className="px-1.5 py-0.5 rounded bg-black/20 text-black text-[9px] font-black uppercase tracking-wider hidden sm:inline">
                          Auto-VAD
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => connectDeepgram("mic", selectedMicId || undefined)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/[0.15] text-zinc-200 text-xs font-medium transition-all"
                        title="Solo micrófono"
                      >
                        <MicIcon />
                        <span>Solo Mic</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => connectDeepgram("tab")}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/[0.15] text-zinc-200 text-xs font-medium transition-all"
                        title="Capturar audio de Meet/Zoom compartiendo pestaña"
                      >
                        <span>Solo Pestaña</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDeviceSettings(!showDeviceSettings)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                          showDeviceSettings || selectedInterviewerId
                            ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                            : "border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] text-zinc-300"
                        }`}
                        title="Configuración de entradas de audio (Micrófono y Cable Virtual / Zoom)"
                      >
                        <span>⚙️ {selectedInterviewerId ? "Entradas (Cable)" : "Entradas"}</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={disconnectDeepgram}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)] active:scale-[0.98]"
                      >
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        <span>Detener Escucha</span>
                      </button>
                      <button
                        type="button"
                        onClick={togglePauseStt}
                        className={`px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                          isSttPaused
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                            : "border-white/[0.08] bg-white/[0.03] text-zinc-300 hover:bg-white/[0.07]"
                        }`}
                      >
                        {isSttPaused ? "▶️ Reanudar" : "⏸️ Pausar"}
                      </button>

                      {/* Vúmetro de Audio */}
                      {audioMode === "dual" ? (
                        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-black/40 border border-white/[0.08] text-[11px] font-mono text-zinc-300 backdrop-blur-sm">
                          <span className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full transition-all duration-100 ${audioEnergy.micRms > 0.008 ? "bg-emerald-400 shadow-[0_0_8px_#34d399] scale-125" : "bg-zinc-700"}`} />
                            <span className="text-zinc-400">Vos</span>
                          </span>
                          <span className="w-px h-3 bg-white/10" />
                          <span className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full transition-all duration-100 ${audioEnergy.tabRms > 0.008 ? "bg-sky-400 shadow-[0_0_8px_#38bdf8] scale-125" : "bg-zinc-700"}`} />
                            <span className="text-sky-300">Ellos</span>
                          </span>
                        </div>
                      ) : audioMode === "tab" ? (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/40 border border-white/[0.08] text-[11px] font-mono text-sky-300">
                          <span className={`w-2 h-2 rounded-full transition-all duration-100 ${audioEnergy.tabRms > 0.008 ? "bg-sky-400 shadow-[0_0_8px_#38bdf8] scale-125" : "bg-zinc-700"}`} />
                          <span className="font-semibold">Audio Pestaña</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/40 border border-white/[0.08] text-[11px] font-mono text-emerald-300">
                          <span className={`w-2 h-2 rounded-full transition-all duration-100 ${audioEnergy.micRms > 0.008 ? "bg-emerald-400 shadow-[0_0_8px_#34d399] scale-125" : "bg-zinc-700"}`} />
                          <span className="font-semibold">Micrófono</span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Live Speech Monitor / Ticker */}
                <div className="flex-1 min-w-[200px] flex items-center justify-end">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/40 border border-white/[0.06] text-zinc-400 text-xs max-w-md w-full justify-between backdrop-blur-sm">
                    <span className="flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-wider text-zinc-500 shrink-0">
                      <span className={`w-1.5 h-1.5 rounded-full ${sttStatus === "live" ? "bg-emerald-400 animate-pulse" : "bg-zinc-600"}`} />
                      Monitor
                    </span>
                    <div className="truncate text-zinc-300 text-right">
                      <ListenText text={lastTranscriptText} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tier 2: Co-Pilot Tactical Arsenal & Assistance Tools */}
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5 pt-2 border-t border-white/[0.05]">
                {/* Tactical Arsenal: Mode + Intel Weapons */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Selector de Modo de Entrevista */}
                  <div className="flex items-center rounded-xl border border-white/[0.08] bg-white/[0.03] p-1 text-xs font-medium">
                    <button
                      type="button"
                      onClick={() => {
                        setInterviewMode("technical");
                        syncTeleprompter({ interviewMode: "technical" });
                      }}
                      className={`px-2.5 py-1 rounded-lg transition-all duration-150 ${
                        interviewMode === "technical"
                          ? "bg-zinc-800 text-white font-semibold shadow-sm border border-white/10"
                          : "text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      🎙️ Técnico
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setInterviewMode("screening");
                        syncTeleprompter({ interviewMode: "screening" });
                      }}
                      className={`px-2.5 py-1 rounded-lg transition-all duration-150 ${
                        interviewMode === "screening"
                          ? "bg-purple-950/80 text-purple-200 font-semibold border border-purple-500/40 shadow-sm shadow-purple-950/50"
                          : "text-zinc-400 hover:text-zinc-200"
                      }`}
                      title="Modo Screening HR: Directivas breves, pretensión salarial ($4,000 USD / $25-30/h) y fit cultural"
                    >
                      🤝 Screening HR
                    </button>
                  </div>

                  <span className="w-px h-4 bg-white/10 mx-0.5 hidden sm:inline" />

                  <button
                    type="button"
                    onClick={handleCaptureScreen}
                    disabled={isGenerating || isVisionCapturing}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-xs font-medium transition-all duration-150 disabled:opacity-50"
                    title="Capturar pantalla y resolver ejercicio de LeetCode / diagrama (Ctrl+Shift+S)"
                  >
                    <span>📷 {isVisionCapturing ? "Capturando..." : "Pantalla"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleReverseQuestions}
                    disabled={isGenerating}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 text-xs font-medium transition-all duration-150 disabled:opacity-50"
                    title="Generar preguntas estratégicas de cierre basadas en los dolores de la entrevista (Ctrl+Shift+Q)"
                  >
                    <span>🎯 Cierre</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleGenerateSummary}
                    disabled={isGenerating || isSummaryLoading}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-medium transition-all duration-150 disabled:opacity-50"
                    title="Generar Scorecard Predictor FAANG y nota de agradecimiento hiper-personalizada"
                  >
                    <span>📊 Scorecard</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const vulns = analyzeCvVulnerabilities(profile, role, company);
                      setVulnerabilities(vulns);
                      setVulnModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-medium transition-all duration-150"
                    title="Auditar CV con Red Team y anticipar preguntas trampa"
                  >
                    <span>🛡️ Radar CV</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setScreenSafeMode((prev) => {
                        const next = !prev;
                        syncTeleprompter({ camouMode: next ? "ide" : "normal" });
                        return next;
                      });
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all duration-150 ${
                      screenSafeMode
                        ? "bg-purple-950/80 border-purple-500 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.3)] animate-pulse"
                        : "border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] text-zinc-300"
                    }`}
                    title="Alternar Pantalla Segura / Camuflaje IDE en el Teleprompter (Atajo: F8)"
                  >
                    <span>{screenSafeMode ? "🛡️ Camuflaje (F8) ON" : "🛡️ Camuflaje (F8)"}</span>
                  </button>
                </div>

                {/* Live Assistance & Telemetry Station */}
                <div className="flex items-center gap-1.5 flex-wrap lg:justify-end">
                  <button
                    type="button"
                    onClick={() => earbudWhisper.setIsEnabled(!earbudWhisper.isEnabled)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all duration-150 ${
                      earbudWhisper.isEnabled
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.25)] font-semibold"
                        : "border-white/[0.08] bg-white/[0.03] text-zinc-400 hover:text-zinc-200"
                    }`}
                    title="Susurro acelerado (1.5x) en auricular privado para las palabras clave de apertura"
                  >
                    <span>🎧 {earbudWhisper.isEnabled ? "Susurro ON" : "Susurro"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={gazeTracker.toggleTracking}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all duration-150 ${
                      gazeTracker.isTracking
                        ? gazeTracker.isLookingAway
                          ? "bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse font-bold"
                          : "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold"
                        : "border-white/[0.08] bg-white/[0.03] text-zinc-400 hover:text-zinc-200"
                    }`}
                    title="Entrenador de contacto visual con la cámara (100% privado en tu navegador)"
                  >
                    <span>👁️ {gazeTracker.isTracking ? (gazeTracker.isLookingAway ? "Mirá acá" : "Contacto OK") : "Eye Coach"}</span>
                  </button>

                  {sessionFacts.length > 0 && (
                    <span
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-mono"
                      title={`${sessionFacts.length} hechos técnicos consolidados en esta sesión`}
                    >
                      <span>📜</span>
                      <span>{sessionFacts.length}</span>
                    </span>
                  )}

                  {sessionTokens > 0 && (
                    <span
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-violet-500/30 bg-violet-500/10 text-violet-300 text-[11px] font-mono"
                      title={`Tokens estimados consumidos en esta sesión: ~${sessionTokens.toLocaleString()}`}
                    >
                      <span>🪙</span>
                      <span>~{sessionTokens > 1000 ? `${(sessionTokens / 1000).toFixed(1)}k` : sessionTokens}</span>
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={handleIcebreaker}
                    disabled={isGenerating}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-medium transition-all duration-150 disabled:opacity-50"
                    title="Preguntas estratégicas para hacerle a ellos"
                  >
                    <SparkleIcon />
                    <span className="hidden sm:inline">Preguntas</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Panel de Configuración de Entradas de Audio (Hardware & Cables Virtuales) */}
            {showDeviceSettings && (
              <div className="p-4 rounded-2xl border border-emerald-500/30 bg-[#0c101c]/95 backdrop-blur-2xl flex flex-wrap items-center gap-4 text-xs shadow-2xl animate-in fade-in">
                <div className="flex flex-col gap-1.5 min-w-[240px]">
                  <label className="text-[11px] font-semibold text-emerald-400">🎤 Tu Micrófono (Canal Izquierdo):</label>
                  <select
                    value={selectedMicId}
                    onChange={(e) => setSelectedMicId(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-black/50 border border-white/[0.1] text-zinc-200 text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Predeterminado del sistema</option>
                    {audioInputDevices.map((d) => (
                      <option key={d.deviceId} value={d.deviceId}>
                        {d.label || `Micrófono (${d.deviceId.slice(0, 8)}...)`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5 min-w-[260px]">
                  <label className="text-[11px] font-semibold text-sky-400">
                    🔊 Audio del Entrevistador (Zoom / Teams - Canal Derecho):
                  </label>
                  <select
                    value={selectedInterviewerId}
                    onChange={(e) => setSelectedInterviewerId(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-black/50 border border-white/[0.1] text-zinc-200 text-xs focus:outline-none focus:border-sky-500"
                  >
                    <option value="">Compartir Pestaña de Navegador (Por defecto)</option>
                    {audioInputDevices.map((d) => (
                      <option key={d.deviceId} value={d.deviceId}>
                        {d.label || `Dispositivo (${d.deviceId.slice(0, 8)}...)`} (VB-CABLE / Mezcla estéreo)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="text-[11px] text-zinc-400 max-w-sm">
                  💡 <em>Modo Sigiloso Zoom/Teams Desktop:</em> Si tenés la app nativa instalada, ruteá el audio con <strong>VB-CABLE</strong> o <strong>Mezcla Estéreo</strong> para escuchar al entrevistador sin tener que compartir pestaña.
                </div>
              </div>
            )}

            {/* Ticker / Monitor de Transcripción en Vivo */}
            {sttStatus === "live" && (
              <div className="px-4 py-3 rounded-2xl bg-[#0a0e1a]/90 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs shadow-[0_0_20px_rgba(16,185,129,0.1)] animate-in fade-in">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="font-semibold text-emerald-300 shrink-0">
                    {audioMode === "tab" ? "Escuchando Pestaña:" : audioMode === "dual" ? "Escuchando Entrevistador:" : "Escuchando Mic:"}
                  </span>
                  <span className="font-mono text-zinc-200 truncate">
                    {transcriptLines.length > 0 ? (
                      `"${transcriptLines[transcriptLines.length - 1].text}"`
                    ) : (
                      <span className="text-zinc-500 italic">Esperando que hable el entrevistador...</span>
                    )}
                  </span>
                </div>
                {transcriptLines.length > 0 && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={triggerCurrentInterviewerQuestion}
                      disabled={isGenerating}
                      className="px-3 py-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all active:scale-95 disabled:opacity-50"
                      title="Generar respuesta inmediata para lo que acaba de decir el entrevistador"
                    >
                      <span>⚡</span>
                      <span>Responder Turno</span>
                    </button>
                    <span className="text-[11px] font-mono text-zinc-500 shrink-0 px-2 py-0.5 rounded-lg bg-white/[0.04]">
                      {transcriptLines.length} turnos
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Frases de Rescate Inmediatas */}
            <RescuePhrases onSelect={handleSelectRescuePhrase} />

            {/* Header de Respuestas con botón de Limpiar */}
            {answers.length > 0 && (
              <div className="flex items-center justify-between px-1 text-xs text-zinc-400 font-medium">
                <span>{answers.length} {answers.length === 1 ? "respuesta" : "respuestas"}</span>
                <button
                  onClick={clearAnswers}
                  className="hover:text-zinc-200 transition-colors flex items-center gap-1.5 text-[11px] text-zinc-400 hover:text-red-400 px-2.5 py-1 rounded-lg hover:bg-red-500/10"
                  title="Limpiar respuestas de la pantalla"
                >
                  <span>🗑️</span>
                  <span>Limpiar feed</span>
                </button>
              </div>
            )}

            {/* Feed de Respuestas */}
            <div className="flex-1 flex flex-col gap-3.5 overflow-y-auto min-h-[320px]">
              {answers.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-b from-[#0e121e]/60 to-[#080a12]/90 p-8 sm:p-12 text-center backdrop-blur-xl shadow-2xl">
                  {/* Glowing background aura */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

                  {/* Glowing Avatar */}
                  <div className="relative mb-4">
                    <div className="absolute inset-0 rounded-2xl bg-emerald-500/20 blur-xl animate-pulse" />
                    <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-950 border border-emerald-500/40 flex items-center justify-center text-3xl shadow-xl shadow-emerald-950/40">
                      🦜
                    </div>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight mb-2">
                    {company ? `Listo para responder preguntas de ${company}` : "Copiloto Listo para tu Entrevista"}
                  </h3>
                  {company === "Globant" && (
                    <div className="mb-4 p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs text-left max-w-md w-full shadow-lg">
                      <div className="flex items-center justify-between font-bold text-purple-300 mb-2">
                        <span className="flex items-center gap-1.5">
                          <span>🎯</span>
                          <span>Entrevista Globant / Intermedia</span>
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-200 border border-purple-500/40">
                          Screening HR
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-zinc-300">
                        <div>💼 Rol: <span className="text-zinc-100 font-medium">GCP Cloud Engineer</span></div>
                        <div>💵 Tarifa: <span className="text-emerald-400 font-medium">$25-$30 USD/h</span></div>
                        <div>👤 Reclutadora: <span className="text-zinc-100 font-medium">Francheska Escalona</span></div>
                        <div>🌐 Idioma: <span className="text-purple-300 font-medium">Bilingüe (Auto-Switch)</span></div>
                        <div>🐕 Mascota: <span className="text-purple-300 font-medium">Luna (Salta)</span></div>
                        <div>📚 Memoria: <span className="text-zinc-100 font-medium">{masterAnswers.length} respuestas</span></div>
                      </div>
                    </div>
                  )}
                  <p className="text-xs sm:text-sm text-zinc-400 max-w-md mb-6 leading-relaxed">
                    Iniciá la escucha en <span className="text-emerald-400 font-semibold">Audio Dual</span> o escribí una pregunta abajo para recibir respuestas inmediatas, estructuradas con <strong className="text-zinc-200">Punchline First</strong> y ancladas a tu CV.
                  </p>

                  {/* Quick feature shortcuts */}
                  <div className="flex flex-wrap items-center justify-center gap-2 max-w-lg text-[11px]">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-zinc-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>Audio Dual (Vos + Entrevistador)</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-zinc-300">
                      <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-[10px] font-mono text-zinc-300">F2</kbd>
                      <span>Alternar Escucha</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-zinc-300">
                      <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-[10px] font-mono text-zinc-300">Ctrl+Shift+S</kbd>
                      <span>Analizar Pantalla</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-zinc-300">
                      <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-[10px] font-mono text-zinc-300">Esc</kbd>
                      <span>Botón Pánico</span>
                    </div>
                  </div>
                </div>
              ) : (
                answers.map((a, idx) => (
                  <AnswerCard
                    key={a.id}
                    answer={a}
                    isCurrent={idx === 0}
                    copiedId={copiedId}
                    onCopy={handleCopy}
                    onFeedback={(id, fb) => setAnswerFeedback(id, fb, saveMasterAnswer)}
                    onPlayTTS={handlePlayTTS}
                    onSaveToMemory={(ans) =>
                      saveMasterAnswer({
                        question: ans.question,
                        enText: ans.enText || ans.cleanText,
                        esText: ans.esText || ans.cleanText,
                        category: "Guardados",
                        tags: ans.cheats || [],
                      })
                    }
                  />
                ))
              )}
            </div>

            {/* Floating Command Input Bar */}
            <form
              onSubmit={handleManualSubmit}
              className="sticky bottom-3 pt-2 pb-1 bg-gradient-to-t from-[#08090e] via-[#08090e]/95 to-transparent z-30"
            >
              <div className="flex items-center gap-2 p-1.5 rounded-2xl border border-white/[0.1] bg-[#0e121e]/85 backdrop-blur-2xl shadow-[0_10px_35px_-5px_rgba(0,0,0,0.8)] focus-within:border-emerald-500/50 focus-within:shadow-[0_0_25px_rgba(16,185,129,0.2)] transition-all">
                <div className="pl-3 text-zinc-500 flex items-center">
                  <SparkleIcon />
                </div>
                <input
                  type="text"
                  value={manualQuestion}
                  onChange={(e) => setManualQuestion(e.target.value)}
                  placeholder="Preguntale al copiloto o pegá la pregunta del entrevistador..."
                  className="flex-1 bg-transparent px-2 py-2 text-zinc-100 placeholder-zinc-500 text-xs sm:text-sm focus:outline-none font-normal"
                />
                <button
                  type="submit"
                  disabled={isGenerating || !manualQuestion.trim()}
                  className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-30 disabled:hover:from-emerald-500 disabled:hover:to-teal-500 text-zinc-950 font-bold text-xs transition-all duration-150 shadow-[0_0_15px_rgba(16,185,129,0.25)] active:scale-[0.98] flex items-center gap-1.5 shrink-0"
                >
                  {isGenerating ? (
                    <>
                      <span className="w-3 h-3 rounded-full border-2 border-zinc-950 border-t-transparent animate-spin" />
                      <span>Generando...</span>
                    </>
                  ) : (
                    <>
                      <span>Responder</span>
                      <span className="text-[10px] opacity-70">↵</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Context & Profiles Tab */}
        {activeTab === "context" && (
          <div className="flex flex-col gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 shadow-lg">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                  <DocIcon /> Contexto de la Entrevista
                </h2>
                <p className="text-xs text-zinc-400">
                  Completá estos datos para que la IA responda anclada a tu experiencia real y al rol postulado.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="file"
                  id="pdf-upload"
                  accept="application/pdf"
                  onChange={handlePdfUpload}
                  className="hidden"
                />
                <label
                  htmlFor="pdf-upload"
                  className="cursor-pointer px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-all flex items-center gap-1.5"
                >
                  <DocIcon />
                  <span>{isPdfLoading ? "Extrayendo PDF..." : "Subir CV (PDF)"}</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const vulns = analyzeCvVulnerabilities(profile, role, company);
                    setVulnerabilities(vulns);
                    setVulnModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-amber-600/40 bg-amber-950/40 hover:bg-amber-900/50 text-xs font-semibold text-amber-300 transition-all flex items-center gap-1.5"
                  title="Auditar CV con Red Team y anticipar preguntas trampa"
                >
                  <span>🛡️ Radar de Vulnerabilidades</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Empresa</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Ej: Google, Globant, Mercado Libre..."
                  className="w-full px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-200 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Puesto / Rol Postulado</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Ej: Senior Backend Engineer (Python / Cloud)"
                  className="w-full px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-200 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Perfil del Candidato (CV, Experiencia, Logros y Stack)
              </label>
              <textarea
                value={profile}
                onChange={(e) => setProfile(e.target.value)}
                rows={6}
                placeholder="Pegá tu CV, experiencia o resumen técnico aquí..."
                className="w-full px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-200 text-xs font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Instrucciones Extra / Rubric Personalizada
              </label>
              <textarea
                value={extraInstructions}
                onChange={(e) => setExtraInstructions(e.target.value)}
                rows={2}
                placeholder="Ej: En preguntas técnicas mencionar trade-offs de arquitectura; en live coding plantear complejidad Big-O..."
                className="w-full px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-200 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Dossier & Perfil Psicológico del Entrevistador */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-zinc-300">
                  👤 Dossier & Perfil Psicológico del Entrevistador (Pre-Interview Intel)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-400">
                    LinkedIn / Bio para calibrar sesgo y tono (Infra / Producto / Startup)
                  </span>
                  {/* M5: Botón del Wizard del Dossier */}
                  <button
                    type="button"
                    onClick={() => setShowDossierWizard(!showDossierWizard)}
                    className="px-2 py-0.5 rounded bg-indigo-900/60 border border-indigo-500/50 hover:bg-indigo-800/70 text-indigo-300 text-[10px] font-bold transition-all"
                    title="Generar dossier con 3 preguntas rápidas"
                  >
                    🧙 Wizard
                  </button>
                </div>
              </div>

              {/* M5: Wizard del Dossier (3 preguntas) */}
              {showDossierWizard && (
                <div className="mb-2 p-3 rounded-xl bg-indigo-950/80 border border-indigo-500/40 flex flex-col gap-3">
                  <div className="text-[11px] text-indigo-300 font-semibold">
                    Respondé 3 preguntas rápidas y generamos el dossier automáticamente:
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-400 mb-1">1. ¿Perfil del entrevistador?</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setWizardProfile("technical")}
                        className={`px-2.5 py-1 rounded text-[10px] font-semibold border transition-all ${
                          wizardProfile === "technical"
                            ? "bg-sky-500 text-black border-sky-400"
                            : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
                        }`}
                      >
                        🔧 Técnico (Engineer / Architect)
                      </button>
                      <button
                        type="button"
                        onClick={() => setWizardProfile("business")}
                        className={`px-2.5 py-1 rounded text-[10px] font-semibold border transition-all ${
                          wizardProfile === "business"
                            ? "bg-emerald-500 text-black border-emerald-400"
                            : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
                        }`}
                      >
                        💼 Negocio (HR / Recruiter / Product)
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-400 mb-1">2. ¿Empresa / Stack? (opcional)</label>
                    <input
                      type="text"
                      value={wizardCompany}
                      onChange={(e) => setWizardCompany(e.target.value)}
                      placeholder="Ej: Google, Rappi (Go + GCP), startup B2B SaaS..."
                      className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-200 text-xs focus:outline-none focus:border-indigo-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-400 mb-1">3. ¿Cómo arranó la charla?</label>
                    <div className="flex gap-1.5 flex-wrap">
                      {(["warm", "neutral", "cold", "aggressive"] as const).map((tone) => (
                        <button
                          key={tone}
                          type="button"
                          onClick={() => setWizardTone(tone)}
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition-all ${
                            wizardTone === tone
                              ? "bg-indigo-500 text-white border-indigo-400"
                              : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
                          }`}
                        >
                          {{ warm: "😊 Cálida", neutral: "😐 Neutral", cold: "🥶 Fría", aggressive: "🔥 Desafiante" }[tone]}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1 border-t border-indigo-800/40">
                    <button
                      type="button"
                      onClick={applyDossierWizard}
                      className="px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white text-[10px] font-bold transition-all"
                    >
                      ✅ Aplicar Dossier
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDossierWizard(false)}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-semibold transition-all"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              <textarea
                value={interviewerBio}
                onChange={(e) => setInterviewerBio(e.target.value)}
                rows={2}
                placeholder="Pegá el bio, seniority o resumen de LinkedIn de tu entrevistador (ej: 'Staff ex-Google enfocado en C++ y latencia' o 'VP de Producto enfocado en impacto de negocio y ROI')..."
                className="w-full px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-200 text-xs focus:outline-none focus:border-indigo-400"
              />
            </div>

            {/* Language & Dialect Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-zinc-800 pt-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Idioma del Entrevistador</label>
                <select
                  value={sttLang}
                  onChange={(e) => setSttLang(e.target.value as "es" | "en")}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-200 text-xs"
                >
                  <option value="es">Español</option>
                  <option value="en">Inglés (English)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Dialecto de Respuesta</label>
                <select
                  value={dialect}
                  onChange={(e) => setDialect(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-200 text-xs"
                >
                  <option value="rioplatense">Rioplatense (Voseo)</option>
                  <option value="neutro">Neutro Latinoamericano</option>
                  <option value="english">English Only</option>
                </select>
              </div>

              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300 select-none pb-2">
                  <input
                    type="checkbox"
                    checked={simpleEnglish}
                    onChange={(e) => setSimpleEnglish(e.target.checked)}
                    className="rounded border-zinc-700 text-emerald-500 focus:ring-0"
                  />
                  <span>Inglés Simple + Fonética [PHO]</span>
                </label>
              </div>
            </div>

            {/* Guardar Perfil */}
            <div className="border-t border-zinc-800 pt-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={profileNameInput}
                  onChange={(e) => setProfileNameInput(e.target.value)}
                  placeholder="Nombre del perfil (ej: Senior Backend Python)"
                  className="px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-200 text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (profileNameInput.trim()) {
                      saveProfile(profileNameInput.trim());
                      setProfileNameInput("");
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold"
                >
                  Guardar Perfil
                </button>
              </div>

              {savedProfiles.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400">Cargar:</span>
                  {savedProfiles.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => loadProfile(p.name)}
                      className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 flex items-center gap-1"
                    >
                      <span>{p.name}</span>
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteProfile(p.name);
                        }}
                        className="text-zinc-500 hover:text-red-400 ml-1"
                      >
                        ×
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Bóveda de Historias STAR */}
            <div className="border-t border-zinc-800 pt-4 mt-2">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                    <span>⭐</span> Bóveda de Historias STAR Reales ({starStories.length})
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Tus logros y anécdotas técnicas reales para que el copiloto nunca invente experiencias.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowStarForm(!showStarForm)}
                  className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all"
                >
                  {showStarForm ? "Cancelar" : "+ Nueva Historia"}
                </button>
              </div>

              {showStarForm && (
                <form onSubmit={handleSaveNewStarStory} className="p-3 bg-zinc-950/80 border border-amber-500/30 rounded-xl flex flex-col gap-2.5 mb-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-300 mb-1">Título del Proyecto / Logro</label>
                    <input
                      type="text"
                      value={newStarTitle}
                      onChange={(e) => setNewStarTitle(e.target.value)}
                      placeholder="Ej: Migración de Monolito a Kafka / Optimización de base de datos"
                      className="w-full px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-200 text-xs focus:outline-none focus:border-amber-400"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-300 mb-1">Situación & Tarea</label>
                      <textarea
                        value={newStarSituation}
                        onChange={(e) => setNewStarSituation(e.target.value)}
                        placeholder="El problema de escala, cuellos de botella o requerimiento inicial..."
                        rows={2}
                        className="w-full px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-200 text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-300 mb-1">Acción Técnica Real</label>
                      <textarea
                        value={newStarAction}
                        onChange={(e) => setNewStarAction(e.target.value)}
                        placeholder="Qué implementaste vos específicamente y qué trade-off defendiste..."
                        rows={2}
                        className="w-full px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-200 text-xs focus:outline-none focus:border-amber-400"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-300 mb-1">Resultado Cuantitativo (Métrica de impacto)</label>
                    <input
                      type="text"
                      value={newStarResult}
                      onChange={(e) => setNewStarResult(e.target.value)}
                      placeholder="Ej: -45% de latencia p99, sostenido a 20k QPS, ahorro de $3,500/mes"
                      className="w-full px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-200 text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <button type="submit" className="self-end px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold">
                    Guardar en Bóveda
                  </button>
                </form>
              )}

              {starStories.length === 0 ? (
                <p className="text-xs text-zinc-500 italic py-2">
                  No tenés historias STAR cargadas todavía. Agregá tus 2-3 proyectos más fuertes para que el modelo los use como anécdotas verídicas.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {starStories.map((story) => (
                    <div key={story.id} className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-amber-300">{story.title}</span>
                          <button
                            type="button"
                            onClick={() => deleteSTARStory(story.id)}
                            className="text-zinc-500 hover:text-red-400 text-xs"
                            title="Eliminar historia"
                          >
                            ✕
                          </button>
                        </div>
                        <p className="text-[11px] text-zinc-300 mb-1">
                          <strong className="text-emerald-400">Acción:</strong> {story.action}
                        </p>
                        {story.result && (
                          <p className="text-[11px] text-sky-300 font-medium">
                            <strong className="text-sky-400">Resultado:</strong> {story.result}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Master Memory Bank Tab */}
        {activeTab === "memory" && (
          <div className="flex flex-col gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 shadow-lg">
            <div className="flex flex-wrap items-center justify-between border-b border-zinc-800 pb-3 gap-3">
              <div>
                <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                  <span>⚡ Banco de Memoria Inteligente</span>
                </h2>
                <p className="text-xs text-zinc-400">
                  Respuestas instantáneas (&lt;50ms) coincidentes con preguntas típicas. Aisladas por empresa.
                </p>
              </div>

              <div className="flex items-center gap-2">

                <button
                  type="button"
                  onClick={() => importMasterAnswers(GLOBANT_AND_GCP_MASTER_ANSWERS)}
                  className="px-3 py-1.5 rounded-lg border border-purple-500/40 bg-purple-950/40 hover:bg-purple-900/60 text-purple-200 text-xs font-bold transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(168,85,247,0.2)]"
                  title="Cargar el banco maestro de respuestas preparadas para Globant, Intermedia, GCP, GCVE y RRHH"
                >
                  <span>⚡ Cargar Banco Completo ({GLOBANT_AND_GCP_MASTER_ANSWERS.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Esto reemplaza TODAS las entradas del Banco con las " + GLOBANT_AND_GCP_MASTER_ANSWERS.length + " respuestas actualizadas. Las entradas viejas se eliminan. ¿Continuar?")) {
                      replaceMasterAnswers(GLOBANT_AND_GCP_MASTER_ANSWERS);
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg border border-amber-500/40 bg-amber-950/40 hover:bg-amber-900/60 text-amber-200 text-xs font-bold transition-all flex items-center gap-1.5"
                  title="Reemplazar todo el banco viejo con las respuestas actualizadas"
                >
                  <span>🔄 Reemplazar Banco ({GLOBANT_AND_GCP_MASTER_ANSWERS.length})</span>
                </button>

                <button
                  type="button"
                  onClick={handleGenerateWarmup}
                  disabled={warmupLoading}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-black text-xs font-bold transition-all disabled:opacity-50"
                >
                  {warmupLoading ? "Generando 4 típicas..." : "Generar 4 típicas con IA"}
                </button>

                <label className="cursor-pointer px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-all flex items-center gap-1.5">
                  <DocIcon />
                  <span>Importar Markdown</span>
                  <input type="file" accept=".md" onChange={handleMarkdownImport} className="hidden" />
                </label>

                <button
                  type="button"
                  onClick={() => setGlassdoorModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg border border-amber-600/50 bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 text-xs font-semibold transition-all flex items-center gap-1.5"
                  title="Pegar preguntas de entrevistas de Glassdoor, Blind o Reddit para precargar respuestas en memoria"
                >
                  <span>📥 Glassdoor / Blind</span>
                </button>

                {masterAnswers.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAllMasterAnswers}
                    className="px-3 py-1.5 rounded-lg border border-red-900/50 bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-medium"
                  >
                    Borrar Todas
                  </button>
                )}
              </div>
            </div>

            {warmupMessage && (
              <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs">
                {warmupMessage}
              </div>
            )}

            {masterAnswers.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
                <p className="text-sm font-semibold text-zinc-300 mb-1">El Banco de Memoria está vacío</p>
                <p className="text-xs max-w-sm mx-auto">
                  Generá 4 preguntas típicas con IA, importá un informe anterior en Markdown o da thumbs-up en vivo a
                  respuestas para guardarlas.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto">
                {masterAnswers.map((ans) => (
                  <div key={ans.id} className="p-3 rounded-lg border border-zinc-800 bg-zinc-950 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-1">
                        <span className="font-bold text-zinc-400">{ans.company || "General"}</span>
                        <span>{ans.category || "General"}</span>
                      </div>
                      <h4 className="text-xs font-bold text-zinc-200 mb-2">{ans.question}</h4>
                      <p className="text-xs text-zinc-400 line-clamp-3 mb-2">{ans.enText || ans.esText}</p>
                    </div>

                    <div className="flex items-center justify-between border-t border-zinc-900 pt-2 text-[11px]">
                      <button
                        type="button"
                        onClick={() => toggleFavoriteMasterAnswer(ans.id)}
                        className={`text-xs ${ans.favorite ? "text-amber-400" : "text-zinc-600"}`}
                      >
                        ★ {ans.favorite ? "Favorita" : "Destacar"}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteMasterAnswer(ans.id)}
                        className="text-zinc-500 hover:text-red-400"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal: Radar de Vulnerabilidades del CV (Red Team) */}
        {vulnModalOpen && vulnerabilities && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setVulnModalOpen(false)}
          >
            <div
              className="bg-zinc-950 border border-amber-500/40 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-5 shadow-2xl flex flex-col gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🛡️</span>
                  <div>
                    <h3 className="text-sm font-bold text-amber-400">Radar de Vulnerabilidades del CV (Red Team)</h3>
                    <p className="text-[11px] text-zinc-400">Flancos débiles de tu experiencia y preguntas trampa que te harán.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setVulnModalOpen(false)}
                  className="text-zinc-500 hover:text-zinc-200 text-lg p-1"
                >
                  ✕
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {vulnerabilities.map((v, idx) => (
                  <div key={v.id || idx} className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-200">{v.title}</span>
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                          v.severity === "high"
                            ? "bg-red-950/60 text-red-400 border-red-800"
                            : "bg-amber-950/60 text-amber-400 border-amber-800"
                        }`}
                      >
                        {v.severity === "high" ? "Severidad Alta" : "Severidad Media"}
                      </span>
                    </div>
                    <div className="text-xs text-sky-300 font-medium">
                      ❓ <strong>Pregunta incisiva:</strong> &quot;{v.trapQuestion}&quot;
                    </div>
                    <div className="text-[11px] text-zinc-300 bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/80 flex flex-col gap-1">
                      <div className="font-bold text-emerald-400">🎯 Estrategia de pivote STAR:</div>
                      <div><strong className="text-zinc-400">S/T:</strong> {v.starPivot.situation} {v.starPivot.task}</div>
                      <div><strong className="text-zinc-400">Acción:</strong> {v.starPivot.action}</div>
                      <div><strong className="text-zinc-400">Resultado:</strong> {v.starPivot.result}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Modal: Scorecard Predictor FAANG & Thank-You Note */}
        {summaryModalOpen && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSummaryModalOpen(false)}
          >
            <div
              className="bg-zinc-950 border border-emerald-500/40 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-5 shadow-2xl flex flex-col gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📊</span>
                  <div>
                    <h3 className="text-sm font-bold text-emerald-400">Scorecard Predictor FAANG & Thank-You Note</h3>
                    <p className="text-[11px] text-zinc-400">Rúbrica de contratación estimada y borrador de email de agradecimiento.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSummaryModalOpen(false)}
                  className="text-zinc-500 hover:text-zinc-200 text-lg p-1"
                >
                  ✕
                </button>
              </div>

              {isSummaryLoading && (
                <div className="flex items-center gap-3 py-6 justify-center text-zinc-400 text-xs">
                  <span className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  <span>Analizando desempeño, consistencia y trade-offs con IA...</span>
                </div>
              )}

              {summaryText && (
                <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 text-xs text-zinc-200 overflow-y-auto max-h-[50vh]">
                  <MarkdownText text={summaryText} />
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(summaryText);
                    setSummaryCopied(true);
                    setTimeout(() => setSummaryCopied(false), 2000);
                  }}
                  disabled={!summaryText || isSummaryLoading}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40 transition-all"
                >
                  <CopyIcon />
                  <span>{summaryCopied ? "¡Copiado al portapapeles!" : "Copiar Todo"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSummaryModalOpen(false)}
                  className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Inyector de preguntas Glassdoor / Blind / Reddit */}
        {glassdoorModalOpen && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setGlassdoorModalOpen(false)}
          >
            <div
              className="bg-zinc-950 border border-amber-500/40 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-5 shadow-2xl flex flex-col gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📥</span>
                  <div>
                    <h3 className="text-sm font-bold text-amber-400">Inyector de Preguntas (Glassdoor / Blind / Reddit)</h3>
                    <p className="text-[11px] text-zinc-400">
                      Pegá listas o hilos de preguntas para precargarlas en el Banco de Memoria (&lt;50ms) para {company || "tu entrevista"}.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setGlassdoorModalOpen(false)}
                  className="text-zinc-500 hover:text-zinc-200 text-lg p-1"
                >
                  ✕
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-zinc-300">
                  Preguntas (una por línea o lista numerada):
                </label>
                <textarea
                  value={glassdoorText}
                  onChange={(e) => setGlassdoorText(e.target.value)}
                  placeholder={`1. Tell me about a time you had to deal with high latency in distributed services.\n2. How do you design an idempotent payment processing API?\n3. Why do you want to work at ${company || "this company"}?\n4. What was the hardest production bug you resolved?`}
                  rows={8}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs font-mono focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                <span className="text-[11px] text-zinc-500">
                  {glassdoorText.split("\n").filter((l) => l.trim().length > 5).length} preguntas detectadas
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setGlassdoorModalOpen(false)}
                    className="px-3 py-1.5 rounded-lg border border-zinc-700 hover:bg-zinc-800 text-zinc-400 text-xs transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleImportGlassdoor}
                    disabled={!glassdoorText.trim()}
                    className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all disabled:opacity-50"
                  >
                    Precargar en Memoria
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
