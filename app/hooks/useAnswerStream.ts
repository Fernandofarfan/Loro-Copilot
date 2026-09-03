"use client";

import { useState, useRef, useCallback } from "react";
import {
  parseBlocks,
  checkInstantGreeting,
  findMatchingAnswer,
  type MasterAnswer,
} from "../lib/interviewHelpers";
import { parseModelJson } from "../lib/llm";
import { track } from "../lib/track";
import { type TeleprompterPayload } from "./useTeleprompter";

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
}

interface RequestAnswerParams {
  question: string;
  transcript: string;
  company: string;
  role: string;
  profile: string;
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
  onSaveMasterAnswer?: (ans: { question: string; enText: string; esText: string; category?: string; tags?: string[] }) => void;
  syncTeleprompter?: (payload: TeleprompterPayload) => void;
  onPunchline?: (punchline: string, lang: "en" | "es") => void;
}

export function useAnswerStream() {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const answersRef = useRef(answers);
  answersRef.current = answers;

  const abortControllerRef = useRef<AbortController | null>(null);
  const speculativeJobRef = useRef<{
    questionPrefix: string;
    controller: AbortController;
    responsePromise: Promise<Response>;
  } | null>(null);
  const idCounterRef = useRef(1);
  const punchlineTriggeredRef = useRef(false);

  const stopGenerating = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (speculativeJobRef.current) {
      speculativeJobRef.current.controller.abort();
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
      syncTeleprompter,
      onPunchline,
    }: RequestAnswerParams) => {
      stopGenerating();
      setGenerationError(null);
      punchlineTriggeredRef.current = false;

      const startTime = Date.now();
      const currentId = idCounterRef.current++;

      // 1. Verificación de Saludo / Small talk instantáneo (<10ms)
      const greetingMatch = checkInstantGreeting(question, company);
      if (greetingMatch && type === "answer") {
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

        setAnswers((prev) => [greetingAnswer, ...prev]);
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
        const memoryMatch = findMatchingAnswer(question, masterAnswers, 0.65, company, role);
        if (memoryMatch) {
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

          setAnswers((prev) => [memAnswer, ...prev]);
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
        alert: "",
        cheats: [],
        snippet: "",
        done: false,
        ts: Date.now(),
        feedback: null,
        modelName: modelLabel,
        keyWords: [],
      };

      setAnswers((prev) => [initialAnswer, ...prev]);
      setIsGenerating(true);

      syncTeleprompter?.({
        question,
        enText: "Generando respuesta...",
        esText: "",
        cleanText: "",
        isGenerating: true,
        modelName: modelLabel,
      });

      const controller = new AbortController();
      abortControllerRef.current = controller;

      // Stream 2: Detector Asíncrono de Trampas / Red Flags en segundo plano
      if (type === "answer" && question.length >= 10) {
        fetch("/api/answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
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
            }
          })
          .catch(() => {});
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
        };

        let res: Response;
        if (
          speculativeJobRef.current &&
          question.toLowerCase().startsWith(speculativeJobRef.current.questionPrefix.toLowerCase().slice(0, 30))
        ) {
          try {
            res = await speculativeJobRef.current.responsePromise;
            abortControllerRef.current = speculativeJobRef.current.controller;
            speculativeJobRef.current = null;
          } catch {
            if (speculativeJobRef.current) {
              speculativeJobRef.current.controller.abort();
              speculativeJobRef.current = null;
            }
            res = await fetch("/api/answer", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              signal: controller.signal,
              body: JSON.stringify(reqPayload),
            });
          }
        } else {
          if (speculativeJobRef.current) {
            speculativeJobRef.current.controller.abort();
            speculativeJobRef.current = null;
          }
          res = await fetch("/api/answer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
            body: JSON.stringify(reqPayload),
          });
        }

        if (!res.ok) {
          const errText = await res.text().catch(() => "");
          const errMsg =
            res.status === 503
              ? "Capacidad temporalmente agotada."
              : errText || `Error del servidor (${res.status})`;
          setGenerationError(errMsg);
          setAnswers((prev) =>
            prev.map((a) =>
              a.id === currentId
                ? { ...a, done: true, text: `⚠️ ${errMsg}`, cleanText: `⚠️ ${errMsg}` }
                : a
            )
          );
          setIsGenerating(false);
          return;
        }

        if (!res.body) {
          throw new Error("Respuesta sin body legible.");
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedText = "";
        let lastUpdateTime = 0;
        const THROTTLE_MS = 50;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          accumulatedText += decoder.decode(value, { stream: true });
          const now = Date.now();

          // Throttle de updates para evitar render-thrashing excesivo
          if (now - lastUpdateTime >= THROTTLE_MS) {
            lastUpdateTime = now;
            const parsed = parseBlocks(accumulatedText);

            if (onPunchline && !punchlineTriggeredRef.current) {
              if (parsed.keyWords && parsed.keyWords.length > 0) {
                punchlineTriggeredRef.current = true;
                onPunchline(parsed.keyWords.join(" | "), detectedLang === "es" ? "es" : "en");
              } else if (parsed.enText || parsed.cleanText) {
                punchlineTriggeredRef.current = true;
                onPunchline((parsed.enText || parsed.cleanText).split("\n")[0], detectedLang === "es" ? "es" : "en");
              }
            }

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
                      alert: parsed.alert,
                      cheats: parsed.cheats,
                      snippet: parsed.snippet,
                      keyWords: parsed.keyWords || [],
                    }
                  : a
              )
            );

            syncTeleprompter?.({
              question,
              enText: parsed.enText || parsed.cleanText,
              phoText: parsed.phoText,
              esText: parsed.esText,
              cleanText: parsed.cleanText,
              isGenerating: true,
              modelName: modelLabel,
              keyWords: parsed.keyWords,
              alert: parsed.alert,
            });
          }
        }

        const finalParsed = parseBlocks(accumulatedText);
        const latencyMs = Date.now() - startTime;

        if (onPunchline && !punchlineTriggeredRef.current) {
          if (finalParsed.keyWords && finalParsed.keyWords.length > 0) {
            punchlineTriggeredRef.current = true;
            onPunchline(finalParsed.keyWords.join(" | "), detectedLang === "es" ? "es" : "en");
          } else if (finalParsed.enText || finalParsed.cleanText) {
            punchlineTriggeredRef.current = true;
            onPunchline((finalParsed.enText || finalParsed.cleanText).split("\n")[0], detectedLang === "es" ? "es" : "en");
          }
        }

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
                  alert: finalParsed.alert,
                  cheats: finalParsed.cheats,
                  snippet: finalParsed.snippet,
                  keyWords: finalParsed.keyWords || [],
                }
              : a
          )
        );

        syncTeleprompter?.({
          question,
          enText: finalParsed.enText || finalParsed.cleanText,
          phoText: finalParsed.phoText,
          esText: finalParsed.esText,
          cleanText: finalParsed.cleanText,
          isGenerating: false,
          modelName: modelLabel,
          keyWords: finalParsed.keyWords,
          alert: finalParsed.alert,
        });
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          // Cancelación intencional: marcar el answer como completo (sin mensaje de error)
          setAnswers((prev) =>
            prev.map((a) => (a.id === currentId && !a.done ? { ...a, done: true } : a))
          );
        } else {
          console.error("Error en streaming de respuesta:", err);
          const errMsg = err instanceof Error ? err.message : "Error de conexión";
          setGenerationError(errMsg);
          setAnswers((prev) =>
            prev.map((a) =>
              a.id === currentId
                ? { ...a, done: true, text: `⚠️ ${errMsg}`, cleanText: `⚠️ ${errMsg}` }
                : a
            )
          );
        }
      } finally {
        setIsGenerating(false);
      }
    },
    [stopGenerating]
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
      const res = await fetch("/api/answer", {
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
      provider?: string;
      model?: string;
      detectedLang?: string;
    }) => {
      if (isGenerating || !params.question || params.question.trim().length < 30) return;

      if (
        speculativeJobRef.current &&
        params.question.toLowerCase().startsWith(speculativeJobRef.current.questionPrefix.toLowerCase().slice(0, 25))
      ) {
        return;
      }

      if (speculativeJobRef.current) {
        speculativeJobRef.current.controller.abort();
        speculativeJobRef.current = null;
      }

      const controller = new AbortController();
      const responsePromise = fetch("/api/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          question: params.question,
          transcript: params.transcript || "",
          company: params.company || "",
          role: params.role || "",
          profile: params.profile || "",
          provider: params.provider || "opencode",
          model: params.model || "deepseek-v4-flash",
          detectedLang: params.detectedLang || "en",
          type: "answer",
          mode: "default",
        }),
      });

      speculativeJobRef.current = {
        questionPrefix: params.question,
        controller,
        responsePromise,
      };
    },
    [isGenerating]
  );

  return {
    answers,
    isGenerating,
    generationError,
    requestAnswer,
    startSpeculativePreFetch,
    stopGenerating,
    clearAnswers,
    setAnswerFeedback,
    generateWarmupAnswers,
  };
}
