"use client";

import { useState, useRef, useCallback } from "react";
import { apiFetch } from "../lib/apiFetch";
import {
  parseBlocks,
  checkInstantGreeting,
  findMatchingAnswer,
  getInstantBridge,
  getSurgicalPhonetics,
  extractTriggerCards,
  detectInstantTrap,
  getInstantWhyNot,
  getScaleLatencyPills,
  getInstantYagniTip,
  type MasterAnswer,
  type InstantBridge,
  type SurgicalPhonetic,
  type InstantTrapResult,
  type ScaleLatencyPill,
  type STARStory,
} from "../lib/interviewHelpers";
import { parseModelJson } from "../lib/llm";
import { track } from "../lib/track";
import { type TeleprompterPayload } from "./useTeleprompter";
import { extractFactsFromAnswer, mergeSessionFacts, type SessionFact } from "../lib/factLedger";
import { cleanAiSlop } from "../lib/antiSlopFilter";

export type Feedback = "up" | "down" | null;

export interface Answer {
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
  keyWords?: string[];
  edgeCases?: string[];
  whyNot?: string;
  dryRun?: string;
  firmnessTip?: string;
  bridge?: InstantBridge | null;
  triggerCards?: string[];
  surgicalPhonetics?: SurgicalPhonetic[];
  matchedStory?: {
    storyIndex: number;
    title: string;
    action: string;
    result: string;
    score: number;
  } | null;
  instantTrap?: InstantTrapResult | null;
  instantWhyNot?: string | null;
  scalePills?: ScaleLatencyPill[];
  yagni?: string;
}

interface RequestAnswerParams {
  question: string;
  transcript: string;
  company: string;
  role: string;
  profile: string;
  interviewerBio?: string;
  extraInstructions?: string;
  provider: string;
  model: string;
  modelLabel?: string;
  detectedLang?: string;
  simpleEnglish?: boolean;
  dialect?: "rioplatense" | "neutro" | "english";
  bilingualMode?: boolean;
  type?: "answer" | "icebreaker" | "reverse_questions";
  mode?: "default" | "trap_detector" | "vision_coding";
  image?: { mimeType: string; data: string } | null;
  masterAnswers?: MasterAnswer[];
  starStories?: Array<{ title?: string; situation?: string; task?: string; action?: string; result?: string }>;
  onSaveMasterAnswer?: (ans: { question: string; enText: string; esText: string; category?: string; tags?: string[] }) => void;
  syncTeleprompter?: (payload: TeleprompterPayload, persist?: boolean) => void;
  onPunchline?: (punchline: string, lang: "en" | "es") => void;
}

const MAX_ANSWERS = 20; // Límite de respuestas en memoria para evitar crecimiento infinito del DOM

export function useAnswerStream() {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [sessionFacts, setSessionFacts] = useState<SessionFact[]>([]);
  // M7: Estimación de tokens usados en la sesión (~4 chars = 1 token)
  const [sessionTokens, setSessionTokens] = useState(0);

  const answersRef = useRef(answers);
  answersRef.current = answers;
  const sessionFactsRef = useRef(sessionFacts);
  sessionFactsRef.current = sessionFacts;

  const abortControllerRef = useRef<AbortController | null>(null);
  // El trap detector tiene su propio controller: comparte destino con la request pero
  // debe poder abortarse aunque la respuesta principal se adopte de un prefetch.
  const trapAbortRef = useRef<AbortController | null>(null);
  const speculativeJobRef = useRef<{
    questionPrefix: string;
    controller: AbortController;
    responsePromise: Promise<Response | null>;
    ttlTimer?: ReturnType<typeof setTimeout>;
  } | null>(null);
  const idCounterRef = useRef(1);
  // Solo la request más reciente puede apagar isGenerating: el finally de una request
  // abortada llega como microtask DESPUÉS de que la nueva ya marcó isGenerating=true.
  const activeRequestSeqRef = useRef(0);
  const punchlineTriggeredRef = useRef(false);
  const generationStartTimeRef = useRef(0);
  // M4: Rastreo de historias STAR usadas en la sesión para deprioritización
  const usedStoryIndicesRef = useRef<Set<number>>(new Set());

  const stopGenerating = useCallback(() => {
    if (abortControllerRef.current) {
      try {
        abortControllerRef.current.abort();
      } catch {}
      abortControllerRef.current = null;
    }
    if (trapAbortRef.current) {
      try {
        trapAbortRef.current.abort();
      } catch {}
      trapAbortRef.current = null;
    }
    if (speculativeJobRef.current) {
      if (speculativeJobRef.current.ttlTimer) clearTimeout(speculativeJobRef.current.ttlTimer);
      try {
        speculativeJobRef.current.controller.abort();
      } catch {}
      speculativeJobRef.current = null;
    }
    setIsGenerating(false);
  }, []);

  const clearAnswers = useCallback(() => {
    setAnswers([]);
  }, []);

  const setAnswerFeedback = useCallback(
    (
      answerId: number,
      fb: Feedback,
      onSaveMasterAnswer?: (ans: {
        question: string;
        enText: string;
        esText: string;
        category?: string;
        tags?: string[];
      }) => void
    ) => {
      setAnswers((prev) =>
        prev.map((a) => {
          if (a.id !== answerId) return a;
          const nextFb = a.feedback === fb ? null : fb;
          track("answer_feedback", { feedback: nextFb, fromMemory: a.fromMemory });

          // Auto-aprendizaje: solo guardar si el texto es válido y no es un error
          const validText = (a.enText || a.cleanText || "").trim();
          if (
            nextFb === "up" &&
            !a.fromMemory &&
            onSaveMasterAnswer &&
            validText &&
            !validText.startsWith("⚠️")
          ) {
            onSaveMasterAnswer({
              question: a.question,
              enText: a.enText || a.cleanText,
              esText: a.esText || a.cleanText,
              category: "Favoritos",
              tags: ["aprendido", "feedback_positivo"],
            });
          }

          return { ...a, feedback: nextFb };
        })
      );
    },
    []
  );

  const requestAnswer = useCallback(
    async ({
      question,
      transcript,
      company,
      role,
      profile,
      interviewerBio,
      extraInstructions,
      provider,
      model,
      modelLabel = "IA",
      detectedLang = "es",
      simpleEnglish = false,
      dialect = "rioplatense",
      bilingualMode = true,
      type = "answer",
      mode = "default",
      image = null,
      masterAnswers = [],
      starStories = [],
      syncTeleprompter,
      onPunchline,
    }: RequestAnswerParams) => {
      // Abortar generación activa previa si existiera
      if (abortControllerRef.current) {
        try {
          abortControllerRef.current.abort();
        } catch {}
        abortControllerRef.current = null;
      }
      if (trapAbortRef.current) {
        try {
          trapAbortRef.current.abort();
        } catch {}
        trapAbortRef.current = null;
      }
      setIsGenerating(false);
      setGenerationError(null);
      punchlineTriggeredRef.current = false;

      const startTime = Date.now();
      generationStartTimeRef.current = startTime;
      const currentId = idCounterRef.current++;
      const mySeq = ++activeRequestSeqRef.current;

      // Sync al HUD preservando la alerta ya emitida (el trap detector llega async y no
      // debe ser pisado por los chunks del stream principal que traen alert="").
      let lastHudPayload: TeleprompterPayload | null = null;
      const hudSync = (payload: TeleprompterPayload, persist = true) => {
        const merged: TeleprompterPayload = {
          ...payload,
          alert: payload.alert || lastHudPayload?.alert || "",
        };
        lastHudPayload = merged;
        syncTeleprompter?.(merged, persist);
      };

      // 1. Verificación de Saludo / Small talk instantáneo (<10ms)
      const greetingMatch = checkInstantGreeting(question, company);
      if (greetingMatch && type === "answer") {
        if (speculativeJobRef.current) {
          if (speculativeJobRef.current.ttlTimer) clearTimeout(speculativeJobRef.current.ttlTimer);
          try {
            speculativeJobRef.current.controller.abort();
          } catch {}
          speculativeJobRef.current = null;
        }
        const greetingAnswer: Answer = {
          id: currentId,
          question,
          text: greetingMatch.cleanText,
          esText: greetingMatch.esText,
          enText: greetingMatch.enText,
          cleanText: greetingMatch.cleanText,
          bilingual: true,
          alert: "",
          cheats: [],
          snippet: "",
          done: true,
          ts: Date.now(),
          feedback: null,
          latencyMs: Date.now() - startTime,
          modelName: "Saludo Instantáneo ⚡",
          fromMemory: true,
        };

        setAnswers((prev) => [greetingAnswer, ...prev].slice(0, MAX_ANSWERS));
        syncTeleprompter?.({
          question,
          enText: greetingMatch.enText,
          esText: greetingMatch.esText,
          cleanText: greetingMatch.cleanText,
          isGenerating: false,
          modelName: "Saludo Instantáneo ⚡",
          fromMemory: true,
        });
        return;
      }

      // 2. Verificación de Memoria Inteligente Local (<50ms)
      if (type === "answer" && masterAnswers.length > 0) {
        const memoryMatch = findMatchingAnswer(question, masterAnswers, 0.48, company, role);
        if (memoryMatch) {
          if (speculativeJobRef.current) {
            if (speculativeJobRef.current.ttlTimer) clearTimeout(speculativeJobRef.current.ttlTimer);
            try {
              speculativeJobRef.current.controller.abort();
            } catch {}
            speculativeJobRef.current = null;
          }
          const match = memoryMatch.match;
          const memAnswer: Answer = {
            id: currentId,
            question,
            text: match.enText || match.esText,
            esText: match.esText,
            enText: match.enText,
            cleanText: match.enText || match.esText,
            bilingual: !!(match.enText && match.esText),
            alert: "",
            cheats: match.tags || [],
            snippet: "",
            done: true,
            ts: Date.now(),
            feedback: null,
            latencyMs: Date.now() - startTime,
            modelName: `Memoria Local (${Math.round(memoryMatch.score * 100)}% match) ⚡`,
            fromMemory: true,
          };

          setAnswers((prev) => [memAnswer, ...prev].slice(0, MAX_ANSWERS));
          syncTeleprompter?.({
            question,
            enText: match.enText,
            esText: match.esText,
            cleanText: match.enText || match.esText,
            isGenerating: false,
            modelName: "Memoria Local ⚡",
            fromMemory: true,
          });
          return;
        }
      }

      // Generar instantáneamente el Puente Apertura (<1ms) para evitar silencios incómodos
      const instantBridge = getInstantBridge(question, detectedLang === "es" ? "es" : "en");
      const initialTriggerCards = extractTriggerCards([], "", question);
      const instantTrap = detectInstantTrap(question);
      const instantWhyNot = getInstantWhyNot(question);
      const scalePills = getScaleLatencyPills(question);
      const instantYagni = getInstantYagniTip(question);

      // 3. Streaming desde el Backend LLM
      const initialAnswer: Answer = {
        id: currentId,
        question,
        text: "",
        esText: "",
        enText: "",
        phoText: "",
        cleanText: "",
        bilingual: false,
        alert: instantTrap ? `⚠️ TRAMPA: ${instantTrap.reason}` : "",
        cheats: [],
        snippet: "",
        done: false,
        ts: Date.now(),
        feedback: null,
        modelName: modelLabel,
        keyWords: [],
        bridge: instantBridge,
        triggerCards: initialTriggerCards,
        surgicalPhonetics: [],
        instantTrap,
        instantWhyNot,
        scalePills,
        yagni: instantYagni || undefined,
      };

      setAnswers((prev) => [initialAnswer, ...prev].slice(0, MAX_ANSWERS));
      setIsGenerating(true);

      hudSync({
        question,
        enText: instantBridge.bridgeEn,
        esText: instantBridge.bridgeEs,
        cleanText: instantBridge.bridgeEn,
        isGenerating: true,
        modelName: modelLabel,
        bridge: instantBridge,
        triggerCards: initialTriggerCards,
        instantTrap,
        instantWhyNot,
        scalePills,
        yagni: instantYagni || undefined,
      });

      const controller = new AbortController();
      abortControllerRef.current = controller;

      // Stream 2: Detector Asíncrono de Trampas / Red Flags en segundo plano (solo en preguntas verbales)
      if (type === "answer" && mode !== "vision_coding" && question.length >= 10) {
        const trapController = new AbortController();
        trapAbortRef.current = trapController;
        apiFetch("/api/answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: trapController.signal,
          body: JSON.stringify({
            question,
            role,
            company,
            provider,
            model,
            mode: "trap_detector",
          }),
        })
          .then((r) => (r.ok ? r.text() : ""))
          .then((trapRaw) => {
            const trapMatch = trapRaw.match(/\[TRAMPA\]([\s\S]*?)\[\/TRAMPA\]/i);
            if (trapMatch && trapMatch[1].trim()) {
              const trapAlert = trapMatch[1].trim();
              setAnswers((prev) =>
                prev.map((a) => (a.id === currentId ? { ...a, alert: trapAlert } : a))
              );
              // Si ya arrancó otra request, no tocar el HUD con el lastHudPayload viejo.
              // Solo la alerta: el spread de lastHudPayload re-enviaba la question de esta
              // request y pisaba displays que ya cambiaron (frases de rescate, repregunta).
              if (activeRequestSeqRef.current === mySeq) {
                hudSync({ alert: trapAlert });
              }
            }
          })
          .catch((err) => {
            console.debug("[trap_detector] sin alerta (falla silenciosa tolerada)", err);
          });
      }

      try {
        const previousAnswers = (answersRef.current || []).slice(0, 2).map((a) => ({
          q: a.question,
          a: a.cleanText || a.text,
        }));

        const reqPayload = {
          question,
          transcript,
          company,
          role,
          profile,
          interviewerBio,
          extraInstructions,
          provider,
          model,
          detectedLang,
          simpleEnglish,
          dialect,
          bilingualMode,
          type,
          mode,
          image,
          previousAnswers,
          facts: sessionFactsRef.current,
          starStories,
        };

        let res: Response;
        if (
          speculativeJobRef.current &&
          question.toLowerCase().startsWith(speculativeJobRef.current.questionPrefix.toLowerCase().slice(0, 30))
        ) {
          const specJob = speculativeJobRef.current;
          speculativeJobRef.current = null;
          if (specJob.ttlTimer) clearTimeout(specJob.ttlTimer);
          try {
            const maybeRes = await specJob.responsePromise;
            if (maybeRes && maybeRes.ok) {
              res = maybeRes;
              // La request adopta el controller del prefetch; abortar el propio (sin fetch
              // asociado en este camino) para no dejar un controller huérfano sin dueño.
              try { controller.abort(); } catch {}
              abortControllerRef.current = specJob.controller;
            } else {
              try { specJob.controller.abort(); } catch {}
              res = await apiFetch("/api/answer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                signal: controller.signal,
                body: JSON.stringify(reqPayload),
              });
            }
          } catch {
            try { specJob.controller.abort(); } catch {}
            res = await apiFetch("/api/answer", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              signal: controller.signal,
              body: JSON.stringify(reqPayload),
            });
          }
        } else {
          if (speculativeJobRef.current) {
            if (speculativeJobRef.current.ttlTimer) clearTimeout(speculativeJobRef.current.ttlTimer);
            try {
              speculativeJobRef.current.controller.abort();
            } catch {}
            speculativeJobRef.current = null;
          }
          res = await apiFetch("/api/answer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
            body: JSON.stringify(reqPayload),
          });
        }

        if (!res.ok) {
          const errText = await res.text().catch(() => "");
          let errMsg: string;
          if (res.status === 401 || res.status === 403) {
            errMsg = "Token o credenciales inválidas. Verificá LORO_SHARED_TOKEN en .env.local.";
          } else if (res.status === 429) {
            errMsg = "Límite de solicitudes alcanzado. Esperá unos segundos antes de consultar nuevamente.";
          } else if (res.status === 502 || res.status === 504) {
            errMsg = "El proveedor LLM no responde o agotó el tiempo de espera. Probá cambiar de modelo en el selector superior.";
          } else if (res.status === 503) {
            errMsg = "Capacidad temporalmente agotada o servidor cerrado (CAPACITY_CLOSED). Esperá un minuto y volvé a intentar.";
          } else {
            errMsg = errText || `Error del servidor (${res.status}). Reintentá en unos segundos.`;
          }
          setGenerationError(errMsg);
          setAnswers((prev) =>
            prev.map((a) =>
              a.id === currentId
                ? { ...a, done: true, text: `⚠️ ${errMsg}`, cleanText: `⚠️ ${errMsg}` }
                : a
            )
          );
          // El HUD no debe quedar en "GENERANDO" tras un error
          if (activeRequestSeqRef.current === mySeq) {
            setIsGenerating(false);
            hudSync({ isGenerating: false });
          }
          return;
        }

        if (!res.body) {
          throw new Error("La respuesta del servidor llegó vacía. Reintentá la pregunta.");
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedText = "";
        let lastUpdateTime = 0;
        let lastTeleprompterSync = 0;
        let lastParsed: ReturnType<typeof parseBlocks> | null = null;
        const TELEPROMPTER_THROTTLE_MS = 500; // localStorage + BroadcastChannel no necesitan alta frecuencia

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          accumulatedText += decoder.decode(value, { stream: true });
          const now = Date.now();

          // Throttle adaptativo: más agresivo para textos largos donde parseBlocks es O(n) costoso
          const THROTTLE_MS = accumulatedText.length > 3000 ? 250 : accumulatedText.length > 1500 ? 150 : 120;

          // Throttle de updates para evitar render-thrashing excesivo
          if (now - lastUpdateTime >= THROTTLE_MS) {
            lastUpdateTime = now;
            const parsed = parseBlocks(accumulatedText);
            lastParsed = parsed;

            if (onPunchline && !punchlineTriggeredRef.current) {
              if (parsed.keyWords && parsed.keyWords.length > 0) {
                punchlineTriggeredRef.current = true;
                onPunchline(parsed.keyWords.join(" | "), detectedLang === "es" ? "es" : "en");
              } else if (parsed.enText || parsed.cleanText) {
                punchlineTriggeredRef.current = true;
                onPunchline((parsed.enText || parsed.cleanText).split("\n")[0], detectedLang === "es" ? "es" : "en");
              }
            }

            const currentTriggerCards = extractTriggerCards(parsed.keyWords, parsed.enText || parsed.cleanText, question);
            const currentSurgicalPho = getSurgicalPhonetics(parsed.enText || parsed.cleanText);

            setAnswers((prev) =>
              prev.map((a) =>
                a.id === currentId
                  ? {
                      ...a,
                      text: accumulatedText,
                      esText: parsed.esText,
                      enText: parsed.enText,
                      phoText: parsed.phoText,
                      cleanText: parsed.cleanText,
                      bilingual: parsed.bilingual,
                      alert: parsed.alert || a.alert,
                      cheats: parsed.cheats,
                      snippet: parsed.snippet,
                      keyWords: parsed.keyWords || [],
                      edgeCases: parsed.edgeCases,
                      whyNot: parsed.whyNot,
                      dryRun: parsed.dryRun,
                      bridge: instantBridge,
                      triggerCards: currentTriggerCards,
                      surgicalPhonetics: currentSurgicalPho,
                      scalePills,
                      yagni: parsed.yagni || instantYagni || undefined,
                    }
                  : a
              )
            );

            // Sincronizar Teleprompter por BroadcastChannel sin bloquear disco (localStorage) en streaming continuo
            if (now - lastTeleprompterSync >= TELEPROMPTER_THROTTLE_MS) {
              lastTeleprompterSync = now;
              hudSync(
                {
                  question,
                  enText: parsed.enText || parsed.cleanText,
                  phoText: parsed.phoText,
                  esText: parsed.esText,
                  cleanText: parsed.cleanText,
                  isGenerating: true,
                  modelName: modelLabel,
                  keyWords: parsed.keyWords,
                  alert: parsed.alert,
                  edgeCases: parsed.edgeCases,
                  whyNot: parsed.whyNot,
                  dryRun: parsed.dryRun,
                  bridge: instantBridge,
                  triggerCards: currentTriggerCards,
                  surgicalPhonetics: currentSurgicalPho,
                  instantTrap,
                  instantWhyNot,
                  scalePills,
                  yagni: parsed.yagni || instantYagni || undefined,
                },
                false
              );
            }

            // Ceder macrotask al Event Loop para permitir al navegador pintar el frame
            // y procesar eventos de UI sin disparar el diálogo "La página no responde"
            await new Promise((r) => setTimeout(r, 0));
          }
        }

        const finalParsed = parseBlocks(accumulatedText);
        const latencyMs = Date.now() - startTime;

        // M7: Acumular estimación de tokens (chars/4) al completar cada respuesta
        const tokensThisAnswer = Math.round((accumulatedText.length + question.length) / 4);
        setSessionTokens((prev) => prev + tokensThisAnswer);

        // 1. Extraer y consolidar hechos en el Fact Ledger de la sesión
        const newFacts = extractFactsFromAnswer(accumulatedText);
        if (newFacts.length > 0) {
          setSessionFacts((prev) => mergeSessionFacts(prev, newFacts));
        }

        // 2. Limpieza de AI slop formuláico para entregar texto más humano y directo
        if (finalParsed.cleanText) {
          finalParsed.cleanText = cleanAiSlop(finalParsed.cleanText);
        }
        if (finalParsed.enText) {
          finalParsed.enText = cleanAiSlop(finalParsed.enText);
        }

        if (onPunchline && !punchlineTriggeredRef.current) {
          if (finalParsed.keyWords && finalParsed.keyWords.length > 0) {
            punchlineTriggeredRef.current = true;
            onPunchline(finalParsed.keyWords.join(" | "), detectedLang === "es" ? "es" : "en");
          } else if (finalParsed.enText || finalParsed.cleanText) {
            punchlineTriggeredRef.current = true;
            onPunchline((finalParsed.enText || finalParsed.cleanText).split("\n")[0], detectedLang === "es" ? "es" : "en");
          }
        }

        const finalTriggerCards = extractTriggerCards(finalParsed.keyWords, finalParsed.enText || finalParsed.cleanText, question);
        const finalSurgicalPho = getSurgicalPhonetics(finalParsed.enText || finalParsed.cleanText);

        setAnswers((prev) =>
          prev.map((a) =>
            a.id === currentId
              ? {
                  ...a,
                  done: true,
                  latencyMs,
                  text: accumulatedText,
                  esText: finalParsed.esText,
                  enText: finalParsed.enText,
                  phoText: finalParsed.phoText,
                  cleanText: finalParsed.cleanText,
                  bilingual: finalParsed.bilingual,
                  alert: finalParsed.alert || a.alert,
                  cheats: finalParsed.cheats,
                  snippet: finalParsed.snippet,
                  keyWords: finalParsed.keyWords || [],
                  edgeCases: finalParsed.edgeCases,
                  whyNot: finalParsed.whyNot,
                  dryRun: finalParsed.dryRun,
                  bridge: instantBridge,
                  triggerCards: finalTriggerCards,
                  surgicalPhonetics: finalSurgicalPho,
                  instantTrap,
                  instantWhyNot,
                  scalePills,
                  yagni: finalParsed.yagni || instantYagni || undefined,
                }
              : a
          )
        );

        hudSync({
          question,
          enText: finalParsed.enText || finalParsed.cleanText,
          phoText: finalParsed.phoText,
          esText: finalParsed.esText,
          cleanText: finalParsed.cleanText,
          isGenerating: false,
          modelName: modelLabel,
          keyWords: finalParsed.keyWords,
          alert: finalParsed.alert,
          edgeCases: finalParsed.edgeCases,
          whyNot: finalParsed.whyNot,
          dryRun: finalParsed.dryRun,
          bridge: instantBridge,
          triggerCards: finalTriggerCards,
          surgicalPhonetics: finalSurgicalPho,
          instantTrap,
          instantWhyNot,
          scalePills,
          yagni: finalParsed.yagni || instantYagni || undefined,
        });
      } catch (err: unknown) {
        if (
          err instanceof Error &&
          (err.name === "AbortError" || err.message?.toLowerCase().includes("abort"))
        ) {
          // Cancelación intencional: si no llegó a recibir texto real, limpiar el answer para no dejar cards zombie "generando…"
          setAnswers((prev) =>
            prev
              .filter((a) => a.id !== currentId || (a.cleanText || a.text || "").trim().length > 0)
              .map((a) => (a.id === currentId && !a.done ? { ...a, done: true } : a))
          );
          if (activeRequestSeqRef.current === mySeq) hudSync({ isGenerating: false });
        } else {
          console.error("Error en streaming de respuesta:", err);
          const baseMsg = err instanceof Error && err.message ? err.message : "Error de conexión";
          const isFetchFailed = /failed to fetch|network error|connection refused/i.test(baseMsg);
          const errMsg = isFetchFailed
            ? "No se pudo conectar con el backend local (/api/answer). Verificá que 'npm run dev' siga corriendo."
            : `${baseMsg} — revisá tu conexión y volvé a intentar`;
          setGenerationError(errMsg);
          setAnswers((prev) =>
            prev.map((a) =>
              a.id === currentId
                ? { ...a, done: true, text: `⚠️ ${errMsg}`, cleanText: `⚠️ ${errMsg}` }
                : a
            )
          );
          if (activeRequestSeqRef.current === mySeq) hudSync({ isGenerating: false });
        }
      } finally {
        // Solo la request vigente apaga el estado: el finally de una request abortada
        // puede ejecutarse después de que la siguiente ya marcó isGenerating=true.
        if (activeRequestSeqRef.current === mySeq) setIsGenerating(false);
      }
    },
    // Todo el estado se lee por refs: la identidad del callback debe ser estable
    []
  );

  // Genera 4 preguntas típicas reales usando el LLM con JSON estructurado (Fase 1.2)
  const generateWarmupAnswers = useCallback(
    async ({
      company,
      role,
      profile,
      provider = "opencode",
      model = "deepseek/deepseek-chat",
      signal,
    }: {
      company: string;
      role: string;
      profile: string;
      provider?: string;
      model?: string;
      signal?: AbortSignal;
    }): Promise<MasterAnswer[]> => {
      const res = await apiFetch("/api/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal,
        body: JSON.stringify({
          profile,
          company,
          role,
          provider,
          model,
          type: "warmup",
        }),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(errText || "No se pudo conectar con el generador de preguntas.");
      }

      const text = await res.text();
      const rawJson = parseModelJson(text);

      if (!Array.isArray(rawJson) || rawJson.length === 0) {
        throw new Error("El modelo no devolvió una lista válida de preguntas.");
      }

      const list = rawJson as Array<{
        question?: string;
        enText?: string;
        answer?: string;
        esText?: string;
        answerEs?: string;
        category?: string;
        tags?: string[];
      }>;
      return list.slice(0, 4).map((item, idx) => ({
        id: `warmup_${Date.now()}_${idx}`,
        question: String(item.question || `Pregunta ${idx + 1}`),
        enText: String(item.enText || item.answer || ""),
        esText: String(item.esText || item.answerEs || item.enText || ""),
        category: String(item.category || "General"),
        tags: Array.isArray(item.tags) ? item.tags : ["warmup"],
        company: company || "General",
        role: role || "",
        favorite: true,
        createdAt: Date.now(),
      }));
    },
    []
  );

  const startSpeculativePreFetch = useCallback(
    (params: {
      question: string;
      transcript?: string;
      company?: string;
      role?: string;
      profile?: string;
      interviewerBio?: string;
      extraInstructions?: string;
      provider?: string;
      model?: string;
      detectedLang?: string;
      simpleEnglish?: boolean;
      dialect?: string;
      bilingualMode?: boolean;
      previousAnswers?: string[];
      facts?: SessionFact[];
      starStories?: STARStory[];
    }) => {
      if (isGenerating || !params.question || params.question.trim().length < 30) return;

      if (
        speculativeJobRef.current &&
        params.question.toLowerCase().startsWith(speculativeJobRef.current.questionPrefix.toLowerCase().slice(0, 25))
      ) {
        return;
      }

      if (speculativeJobRef.current) {
        if (speculativeJobRef.current.ttlTimer) clearTimeout(speculativeJobRef.current.ttlTimer);
        try {
          speculativeJobRef.current.controller.abort();
        } catch {}
        speculativeJobRef.current = null;
      }

      const controller = new AbortController();
      // Prevenir "Unhandled Runtime Error: AbortError" si el pre-fetch es cancelado antes o no es consumido
      const responsePromise = apiFetch("/api/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          question: params.question,
          transcript: params.transcript || "",
          company: params.company || "",
          role: params.role || "",
          profile: params.profile || "",
          interviewerBio: params.interviewerBio || "",
          extraInstructions: params.extraInstructions || "",
          provider: params.provider || "opencode",
          model: params.model || "deepseek-v4-flash",
          detectedLang: params.detectedLang || "en",
          type: "answer",
          mode: "default",
          simpleEnglish: params.simpleEnglish ?? false,
          dialect: params.dialect || "general",
          bilingualMode: params.bilingualMode ?? false,
          previousAnswers: (params.previousAnswers || []).slice(-5),
          facts: params.facts || sessionFactsRef.current,
          starStories: params.starStories || [],
        }),
      }).catch(() => null);

      // TTL: un prefetch que nunca se consume (la pregunta final llegó distinta o no llegó)
      // no debe mantener la Response viva indefinidamente. El chequeo de identidad hace
      // inocuo el timer aunque el job ya se haya consumido/descartado en otro camino.
      const ttlTimer = setTimeout(() => {
        if (speculativeJobRef.current?.controller === controller) {
          try { controller.abort(); } catch {}
          speculativeJobRef.current = null;
        }
      }, 60_000);

      speculativeJobRef.current = {
        questionPrefix: params.question,
        controller,
        responsePromise,
        ttlTimer,
      };
    },
    [isGenerating]
  );

  return {
    answers,
    isGenerating,
    generationStartTimeRef,
    generationError,
    clearGenerationError: () => setGenerationError(null),
    sessionFacts,
    clearSessionFacts: () => setSessionFacts([]),
    sessionTokens,
    resetSessionTokens: () => setSessionTokens(0),
    usedStoryIndicesRef,
    resetUsedStories: () => { usedStoryIndicesRef.current = new Set(); },
    requestAnswer,
    startSpeculativePreFetch,
    stopGenerating,
    clearAnswers,
    setAnswerFeedback,
    generateWarmupAnswers,
  };
}
