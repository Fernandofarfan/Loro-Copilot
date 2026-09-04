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
  matchSTARStory,
  detectFirmnessChallenge,
  type MasterAnswer,
} from "../lib/interviewHelpers";
import { chunkCv, selectRelevantCvChunks } from "../lib/cvChunker";
import { analyzeCvVulnerabilities, type VulnerabilityItem } from "../lib/vulnerabilityRadar";
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
    deleteMasterAnswer,
    clearAllMasterAnswers,
    toggleFavoriteMasterAnswer,
    starStories,
    saveSTARStory,
    deleteSTARStory,
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

  // Hook de Teleprompter HUD Pop-out
  const { isOpen: isTeleprompterOpen, openTeleprompter, syncTeleprompter } = useTeleprompter();

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
    setTranscriptLines((prev) => {
      const idx = prev.findIndex((l) => l.id === line.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = line;
        return next;
      }
      return [...prev.slice(-25), line];
    });
  }, []);

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

  // Trigger automático de respuesta al detectar fin de habla (UtteranceEnd)
  const handleUtteranceEnd = useCallback(() => {
    if (!autoRespond || isGeneratingRef.current) return;

    if (utteranceTimerRef.current) {
      clearTimeout(utteranceTimerRef.current);
    }

    utteranceTimerRef.current = setTimeout(() => {
      if (isGeneratingRef.current) return;
      const currentLines = transcriptLinesRef.current;

      // No responder si el último que habló fue el candidato (speaker === 1)
      const lastLine = currentLines[currentLines.length - 1];
      if (lastLine && lastLine.speaker === 1) {
        return;
      }

      // Extraer limpiamente solo el turno actual del entrevistador evitando mezclar preguntas anteriores
      const { text: recentText, newLastId, isIncomplete } = extractCurrentTurnQuestion(
        currentLines,
        lastProcessedLineIdRef.current
      );

      // Si la frase parece incompleta (respiración, conector final, etc.), esperar al siguiente fragmento
      if (isIncomplete) {
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
        const matchedStory = matchSTARStory(recentText, starStoriesRef.current);
        const firmnessAlert = detectFirmnessChallenge(recentText);

        if (matchedStory || firmnessAlert.isChallenge) {
          syncTeleprompter({
            question: recentText,
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
          question: recentText,
          transcript: currentLines
            .map((l) => `[${l.speaker === 0 ? "Entrevistador" : "Yo"}]: ${l.text}`)
            .join("\n"),
          company,
          role,
          profile: focusedProfile,
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
      }
    }, 1000); // 1000ms de debounce para permitir pausas y respiración natural
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
      // Auto-cancelación por Barge-in: solo si ya transcurrieron al menos 4.5 segundos de generación
      // para evitar que ecos de la pregunta, ruido inicial o paquetes tardíos de Deepgram la cancelen
      if (isGeneratingRef.current && Date.now() - generationStartTimeRef.current > 4500) {
        stopGenerating();
      }
    },
    onSpeculativeTurn: (interimText) => {
      if (!autoRespond || isGeneratingRef.current) return;
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
      image: { mimeType: "image/webp", data: base64 },
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

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = manualQuestion.trim();
    if (!q) return;
    setManualQuestion("");
    const currentLines = transcriptLinesRef.current;
    if (currentLines.length > 0) {
      lastProcessedLineIdRef.current = currentLines[currentLines.length - 1]?.id || null;
    }
    const lang = detectQuestionLanguage(q);

    // Auto-match STAR y Detector de test de firmeza en submit manual
    const matchedStory = matchSTARStory(q, starStoriesRef.current);
    const firmnessAlert = detectFirmnessChallenge(q);

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

    try {
      const res = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company,
          role,
          profile,
          transcript: fullTranscript || "(Sin transcripción grabada en esta sesión)",
          facts: sessionFacts,
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

  return (
    <div className="copilot-container min-h-screen bg-[#09090b] text-[#f4f4f5] flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur px-4 py-2.5 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <BrandLogo />
          <div className="hidden sm:flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                sttStatus === "live"
                  ? "bg-emerald-950 text-emerald-400 border border-emerald-800/60 animate-pulse"
                  : sttStatus === "connecting"
                  ? "bg-amber-950 text-amber-400 border border-amber-800/60"
                  : sttStatus === "error"
                  ? "bg-red-950 text-red-400 border border-red-800/60"
                  : "bg-zinc-800 text-zinc-400"
              }`}
            >
              {sttStatus === "live"
                ? "● EN VIVO"
                : sttStatus === "connecting"
                ? "CONECTANDO..."
                : sttStatus === "error"
                ? "ERROR STT"
                : "INACTIVO"}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-zinc-900/90 p-1 rounded-lg border border-zinc-800">
          <button
            type="button"
            onClick={() => setActiveTab("live")}
            className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
              activeTab === "live" ? "bg-emerald-500 text-black shadow-sm" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Copiloto
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("context")}
            className={`px-3 py-1 rounded text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "context" ? "bg-emerald-500 text-black shadow-sm" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <DocIcon />
            <span>Perfil & Stack</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("memory")}
            className={`px-3 py-1 rounded text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "memory" ? "bg-emerald-500 text-black shadow-sm" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <span>Memoria ({masterAnswers.length})</span>
          </button>
        </div>

        {/* Top Right Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openTeleprompter}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-600/40 bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 text-xs font-medium transition-all shadow-sm"
            title="Abrir Teleprompter flotante para ubicar bajo la cámara"
          >
            <ExternalLinkIcon />
            <span className="hidden md:inline">HUD Teleprompter</span>
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
      <main className="flex-1 flex flex-col p-4 max-w-6xl w-full mx-auto">
        {generationError && (
          <div className="mb-3 p-3 rounded-lg bg-red-950/80 border border-red-800 text-red-200 text-xs flex items-center justify-between">
            <span>⚠️ {generationError}</span>
            <button type="button" onClick={() => stopGenerating()} className="underline hover:text-white">
              Cerrar
            </button>
          </div>
        )}

        {sttError && (
          <div className="mb-3 p-3 rounded-lg bg-amber-950/80 border border-amber-800 text-amber-200 text-xs">
            ⚠️ {sttError}
          </div>
        )}

        {activeTab === "live" && (
          <div className="flex flex-col flex-1 gap-3">
            {/* Control Bar */}
            <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/70 flex flex-wrap items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-2">
                {sttStatus === "idle" || sttStatus === "error" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => connectDeepgram("dual", selectedMicId || undefined, selectedInterviewerId || undefined)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-md shadow-emerald-950"
                      title="Captura combinada: Micrófono (Vos) + Pestaña o Cable Virtual (Entrevistador)"
                    >
                      <span>Audio Dual 🎧</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => connectDeepgram("mic", selectedMicId || undefined)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-all"
                      title="Solo micrófono"
                    >
                      <MicIcon />
                      <span>Solo Mic</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => connectDeepgram("tab")}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-all"
                      title="Capturar audio de Meet/Zoom compartiendo pestaña"
                    >
                      <span>Solo Pestaña</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeviceSettings(!showDeviceSettings)}
                      className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg border text-xs font-medium transition-all ${
                        showDeviceSettings || selectedInterviewerId
                          ? "border-emerald-500/60 bg-emerald-950/50 text-emerald-300 shadow-sm"
                          : "border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
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
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all"
                    >
                      <span>Detener Escucha</span>
                    </button>
                    <button
                      type="button"
                      onClick={togglePauseStt}
                      className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${
                        isSttPaused
                          ? "bg-amber-500 text-black border-amber-400"
                          : "border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                      }`}
                    >
                      {isSttPaused ? "Reanudar" : "Pausar"}
                    </button>

                    {/* Vúmetro de Audio Dual */}
                    {audioMode === "dual" && (
                      <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-[10px] font-mono text-zinc-400">
                        <span className="flex items-center gap-1">
                          <span className={`w-2 h-2 rounded-full transition-colors ${audioEnergy.micRms > 0.012 ? "bg-emerald-400 animate-pulse" : "bg-zinc-700"}`} />
                          <span>Vos</span>
                        </span>
                        <span className="flex items-center gap-1 ml-1">
                          <span className={`w-2 h-2 rounded-full transition-colors ${audioEnergy.tabRms > 0.012 ? "bg-sky-400 animate-pulse" : "bg-zinc-700"}`} />
                          <span>Ellos</span>
                        </span>
                      </div>
                    )}
                  </>
                )}

                <button
                  type="button"
                  onClick={handleCaptureScreen}
                  disabled={isGenerating || isVisionCapturing}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-purple-600/40 bg-purple-950/40 hover:bg-purple-900/50 text-purple-300 text-xs font-semibold transition-all disabled:opacity-50"
                  title="Capturar pantalla y resolver ejercicio de LeetCode / diagrama (Ctrl+Shift+S)"
                >
                  <span>{isVisionCapturing ? "📷 Capturando..." : "📷 Analizar Pantalla"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleReverseQuestions}
                  disabled={isGenerating}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-sky-600/40 bg-sky-950/40 hover:bg-sky-900/50 text-sky-300 text-xs font-semibold transition-all disabled:opacity-50"
                  title="Generar preguntas estratégicas de cierre basadas en los dolores de la entrevista (Ctrl+Shift+Q)"
                >
                  <span>🎯 Cierre de Oro</span>
                </button>

                <button
                  type="button"
                  onClick={handleGenerateSummary}
                  disabled={isGenerating || isSummaryLoading}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-purple-600/40 bg-purple-950/40 hover:bg-purple-900/50 text-purple-300 text-xs font-semibold transition-all disabled:opacity-50"
                  title="Generar Scorecard Predictor FAANG y nota de agradecimiento hiper-personalizada"
                >
                  <span>📊 Scorecard & Follow-up</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const vulns = analyzeCvVulnerabilities(profile, role, company);
                    setVulnerabilities(vulns);
                    setVulnModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-amber-600/40 bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 text-xs font-semibold transition-all"
                  title="Auditar CV con Red Team y anticipar preguntas trampa"
                >
                  <span>🛡️ Radar CV</span>
                </button>

                <button
                  type="button"
                  onClick={() => earbudWhisper.setIsEnabled(!earbudWhisper.isEnabled)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${
                    earbudWhisper.isEnabled
                      ? "bg-amber-500 text-black border-amber-400 font-bold shadow-md shadow-amber-950"
                      : "border-zinc-700 bg-zinc-800/80 text-zinc-400 hover:text-zinc-200"
                  }`}
                  title="Susurro acelerado (1.5x) en auricular privado para las palabras clave de apertura"
                >
                  <span>{earbudWhisper.isEnabled ? "🎧 Susurro ON" : "🎧 Susurro OFF"}</span>
                </button>

                <button
                  type="button"
                  onClick={gazeTracker.toggleTracking}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${
                    gazeTracker.isTracking
                      ? gazeTracker.isLookingAway
                        ? "bg-amber-950/90 border-amber-500 text-amber-300 animate-pulse font-bold"
                        : "bg-emerald-950/80 border-emerald-500/60 text-emerald-300 font-bold"
                      : "border-zinc-700 bg-zinc-800/80 text-zinc-400 hover:text-zinc-200"
                  }`}
                  title="Entrenador de contacto visual con la cámara (100% privado en tu navegador)"
                >
                  <span>👁️</span>
                  <span>{gazeTracker.isTracking ? (gazeTracker.isLookingAway ? "Mirá a la cámara" : "Contacto OK") : "Eye Coach"}</span>
                </button>

                {sessionFacts.length > 0 && (
                  <span
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 text-xs font-mono"
                    title={`${sessionFacts.length} hechos técnicos consolidados en esta sesión para garantizar coherencia`}
                  >
                    <span>📜</span>
                    <span>{sessionFacts.length} hechos</span>
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleIcebreaker}
                  disabled={isGenerating}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-indigo-600/40 bg-indigo-950/40 hover:bg-indigo-900/50 text-indigo-300 text-xs font-medium transition-all disabled:opacity-50"
                >
                  <SparkleIcon />
                  <span className="hidden sm:inline">Preguntas para ellos</span>
                </button>
              </div>

              {/* Ticker de habla en vivo */}
              <div className="flex-1 min-w-[200px] flex items-center justify-end">
                <div className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800/80 text-zinc-400 text-xs max-w-md truncate">
                  <ListenText text={lastTranscriptText} />
                </div>
              </div>
            </div>

            {/* Panel de Configuración de Entradas de Audio (Hardware & Cables Virtuales) */}
            {showDeviceSettings && (
              <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/95 flex flex-wrap items-center gap-4 text-xs shadow-xl">
                <div className="flex flex-col gap-1 min-w-[240px]">
                  <label className="text-[11px] font-semibold text-emerald-400">🎤 Tu Micrófono (Canal Izquierdo):</label>
                  <select
                    value={selectedMicId}
                    onChange={(e) => setSelectedMicId(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Predeterminado del sistema</option>
                    {audioInputDevices.map((d) => (
                      <option key={d.deviceId} value={d.deviceId}>
                        {d.label || `Micrófono (${d.deviceId.slice(0, 8)}...)`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1 min-w-[260px]">
                  <label className="text-[11px] font-semibold text-sky-400">
                    🔊 Audio del Entrevistador (Zoom / Teams - Canal Derecho):
                  </label>
                  <select
                    value={selectedInterviewerId}
                    onChange={(e) => setSelectedInterviewerId(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs focus:outline-none focus:border-sky-500"
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

            {/* Frases de Rescate Inmediatas */}
            <RescuePhrases onSelect={handleSelectRescuePhrase} />

            {/* Feed de Respuestas */}
            <div className="flex-1 flex flex-col gap-3 overflow-y-auto min-h-[300px]">
              {answers.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-xl p-8 text-center text-zinc-500">
                  <span className="text-3xl mb-2">🦜</span>
                  <p className="text-sm font-semibold text-zinc-300 mb-1">
                    {company ? `Listo para responder preguntas de ${company}` : "Listo para tu entrevista"}
                  </p>
                  <p className="text-xs max-w-sm">
                    Iniciá la escucha por micrófono o escribí una pregunta abajo para recibir respuestas en vivo
                    fundamentadas en tu CV.
                  </p>
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

            {/* Manual Input Bar */}
            <form onSubmit={handleManualSubmit} className="flex gap-2 sticky bottom-2 pt-2 bg-[#09090b]">
              <input
                type="text"
                value={manualQuestion}
                onChange={(e) => setManualQuestion(e.target.value)}
                placeholder="Preguntale al copiloto o pegá la pregunta del entrevistador..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-200 text-xs focus:outline-none focus:border-emerald-500 shadow-inner"
              />
              <button
                type="submit"
                disabled={isGenerating || !manualQuestion.trim()}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-black font-bold text-xs transition-all shadow-md"
              >
                {isGenerating ? "Generando..." : "Responder"}
              </button>
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
                <span className="text-[10px] text-zinc-400">
                  LinkedIn / Bio para calibrar sesgo y tono (Infra / Producto / Startup)
                </span>
              </div>
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
                  placeholder="Nombre del perfil (ej: Backend EPAM)"
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
