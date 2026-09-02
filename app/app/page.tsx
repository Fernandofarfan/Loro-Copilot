"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
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
  type MasterAnswer,
} from "../lib/interviewHelpers";
import { useInterviewContext } from "../hooks/useInterviewContext";
import { useDeepgram, type TranscriptLine, type AudioMode } from "../hooks/useDeepgram";
import { useAnswerStream, type Answer } from "../hooks/useAnswerStream";
import { useTeleprompter } from "../hooks/useTeleprompter";
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
  // ⚡ Nivel Ultra Rápido (6s - 8s) — Óptimo en Vivo
  { id: "gemini-3-6-flash", label: "Gemini 3.6 Flash ⚡ (6.0s)", provider: "gemini", model: "gemini-3.6-flash", tag: "Ultra Rápido" },
  { id: "mimo-v2-5", label: "MiMo V2.5 ⚡ (6.2s)", provider: "opencode", model: "mimo-v2.5", tag: "Ultra Rápido" },
  { id: "glm-5-3-flash", label: "GLM 5.3 Flash ⚡ (6.5s)", provider: "opencode", model: "glm-5.3-flash", tag: "Ultra Rápido" },
  { id: "deepseek-v4-flash", label: "DeepSeek V4 Flash ⚡ (6.6s)", provider: "opencode", model: "deepseek-v4-flash", tag: "Ultra Rápido" },
  { id: "deepseek-v4-pro", label: "DeepSeek V4 Pro 🧠 (6.7s)", provider: "opencode", model: "deepseek-v4-pro", tag: "Senior / Pro" },
  { id: "glm-5-2", label: "GLM 5.2 ⚡ (6.9s)", provider: "opencode", model: "glm-5.2", tag: "Ultra Rápido" },
  { id: "qwen-3-8-flash", label: "Qwen 3.8 Flash ⚡ (7.6s)", provider: "opencode", model: "qwen-3.8-flash", tag: "Ultra Rápido" },
  { id: "mimo-v2-5-pro", label: "MiMo V2.5 Pro 🎯 (7.9s)", provider: "opencode", model: "mimo-v2.5-pro", tag: "Ultra Rápido" },

  // 🚀 Nivel Rápido / Balanceado (9s - 15s)
  { id: "grok-4-6", label: "Grok 4.6 ⚡ (9.2s)", provider: "opencode", model: "grok-4.6", tag: "Balanceado" },
  { id: "glm-5-3", label: "GLM 5.3 (9.6s)", provider: "opencode", model: "glm-5.3", tag: "Balanceado" },
  { id: "minimax-m2-7", label: "MiniMax M2.7 (10.2s)", provider: "opencode", model: "minimax-m2.7", tag: "Balanceado" },
  { id: "glm-5-1", label: "GLM 5.1 (11.1s)", provider: "opencode", model: "glm-5.1", tag: "Balanceado" },
  { id: "kimi-k2-7-code", label: "Kimi K2.7 Code 💻 (12.3s)", provider: "opencode", model: "kimi-k2.7-code", tag: "Coding" },
  { id: "kimi-k3", label: "Kimi K3 🧠 (13.6s)", provider: "opencode", model: "kimi-k3", tag: "Balanceado" },
  { id: "kimi-k2-6", label: "Kimi K2.6", provider: "opencode", model: "kimi-k2.6", tag: "Balanceado" },
  { id: "muse-spark-1-2", label: "Muse Spark 1.2 ✨ (15.4s)", provider: "opencode", model: "muse-spark-1.2", tag: "Balanceado" },

  // 🧠 Nivel Razonamiento / Deep Think (> 15s)
  { id: "hy4-preview", label: "Hy4 Preview 🔮 (16.7s)", provider: "opencode", model: "hy4-preview", tag: "Deep Think" },
  { id: "qwen-3-8-max", label: "Qwen 3.8 Max 🧠 (20.5s)", provider: "opencode", model: "qwen-3.8-max", tag: "Deep Think" },
  { id: "minimax-m3", label: "MiniMax M3 (21.6s)", provider: "opencode", model: "minimax-m3", tag: "Deep Think" },
  { id: "gpt-5-6-luna", label: "GPT 5.6 Luna 🚀 (29.1s)", provider: "opencode", model: "gpt-5.6-luna", tag: "Deep Think" },
  { id: "gemini-2-5-flash", label: "Gemini 2.5 Flash (31.4s)", provider: "gemini", model: "gemini-2.5-flash", tag: "Google" },
  { id: "gemini-3-5-flash", label: "Gemini 3.5 Flash (35.2s)", provider: "gemini", model: "gemini-3.5-flash", tag: "Google" },
  { id: "gemini-3-7-flash", label: "Gemini 3.7 Flash (45.9s)", provider: "gemini", model: "gemini-3.7-flash", tag: "Google" },
  { id: "hy3", label: "Hy3 (46.9s)", provider: "opencode", model: "hy3", tag: "Deep Think" },
  { id: "longcat-2-0", label: "LongCat 2.0 🐱 (64.7s)", provider: "opencode", model: "longcat-2.0", tag: "Deep Think" },
  { id: "qwen-3-7-max", label: "Qwen 3.7 Max (76.3s)", provider: "opencode", model: "qwen-3.7-max", tag: "Deep Think" },
  { id: "qwen-3-7-plus", label: "Qwen 3.7 Plus", provider: "opencode", model: "qwen-3.7-plus", tag: "Deep Think" },
  { id: "qwen-3-6-plus", label: "Qwen 3.6 Plus", provider: "opencode", model: "qwen-3.6-plus", tag: "Deep Think" },

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
    isLoaded: isContextLoaded,
  } = useInterviewContext("deepseek-v4-flash", MODELS.map((m) => m.id));

  // Hook de Teleprompter HUD Pop-out
  const { isOpen: isTeleprompterOpen, openTeleprompter, syncTeleprompter } = useTeleprompter();

  // Hook de Respuestas LLM & Streaming
  const {
    answers,
    isGenerating,
    generationError,
    requestAnswer,
    stopGenerating,
    clearAnswers,
    setAnswerFeedback,
    generateWarmupAnswers,
  } = useAnswerStream();

  const isGeneratingRef = useRef(isGenerating);
  isGeneratingRef.current = isGenerating;

  const masterAnswersRef = useRef(masterAnswers);
  masterAnswersRef.current = masterAnswers;

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
      return [...prev.slice(-40), line];
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
        requestAnswer({
          question: recentText,
          transcript: currentLines
            .map((l) => `[${l.speaker === 0 ? "Entrevistador" : "Yo"}]: ${l.text}`)
            .join("\n"),
          company,
          role,
          profile,
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
          syncTeleprompter,
        });
      }
    }, 1000); // 1000ms de debounce para permitir pausas y respiración natural
  }, [
    autoRespond,
    requestAnswer,
    company,
    role,
    profile,
    extraInstructions,
    selectedModel,
    simpleEnglish,
    dialect,
    bilingualMode,
    syncTeleprompter,
  ]);

  // Hook de Audio y Conexión Deepgram
  const {
    status: sttStatus,
    errorMessage: sttError,
    isPaused: isSttPaused,
    activeMode: audioMode,
    connect: connectDeepgram,
    disconnect: disconnectDeepgram,
    togglePause: togglePauseStt,
  } = useDeepgram({
    onTranscript: handleTranscript,
    onUtteranceEnd: handleUtteranceEnd,
    onLanguageDetected: (detected) => {
      const normalized = detected.toLowerCase().startsWith("en") ? "en" : "es";
      setSttLang(normalized);
    },
    lang: sttLang,
  });

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
    requestAnswer({
      question: q,
      transcript: currentLines
        .map((l) => `[${l.speaker === 0 ? "Entrevistador" : "Yo"}]: ${l.text}`)
        .join("\n"),
      company,
      role,
      profile,
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
      syncTeleprompter,
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
      syncTeleprompter,
    });
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

  const lastTranscriptText = transcriptLines.map((l) => l.text).join(" ").slice(-150);

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
                      onClick={() => connectDeepgram("mic")}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-md shadow-emerald-950"
                    >
                      <MicIcon />
                      <span>Escuchar Micrófono</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => connectDeepgram("tab")}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-all"
                      title="Capturar audio de Meet/Zoom compartiendo pestaña"
                    >
                      <span>Pestaña (Meet/Zoom)</span>
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
                  </>
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
      </main>
    </div>
  );
}
