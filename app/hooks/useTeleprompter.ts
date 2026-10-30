"use client";

import { useEffect, useRef, useCallback, useState } from "react";

export interface TeleprompterPayload {
  question?: string;
  enText?: string;
  phoText?: string;
  esText?: string;
  cleanText?: string;
  isGenerating?: boolean;
  modelName?: string;
  fromMemory?: boolean;
  keyWords?: string[];
  alert?: string;
  edgeCases?: string[];
  whyNot?: string;
  dryRun?: string;
  matchedStory?: {
    storyIndex: number;
    title: string;
    action: string;
    result: string;
    score: number;
  } | null;
  firmnessAlert?: {
    isChallenge: boolean;
    tip?: string;
  } | null;
  bridge?: {
    bridgeEn: string;
    bridgeEs: string;
    category?: string;
  } | null;
  triggerCards?: string[];
  surgicalPhonetics?: Array<{
    word: string;
    phonetic: string;
    tip?: string;
  }>;
  instantTrap?: {
    isTrap: boolean;
    reason: string;
    suggestedPivot?: string;
  } | null;
  instantWhyNot?: string | null;
  scalePills?: Array<{
    label: string;
    val: string;
    compare?: string;
  }>;
  yagni?: string | null;
  interviewMode?: "technical" | "screening";
  experienceAlert?: boolean;
  camouMode?: "normal" | "ide" | "terminal";
  command?: "TRIGGER_REVERSE_QUESTIONS" | "SET_CAMOUFLAGE" | "TOGGLE_SCREEN_SAFE_MODE" | "TOGGLE_PANIC";
}

const STORAGE_KEY = "loro_teleprompter_data";
const CHANNEL_NAME = "loro_teleprompter_channel";

// Claves de paneles/avisos que pertenecen a UN turno: al cambiar de pregunta se
// limpian, porque el merge nunca borra claves ausentes (ni el de persist ni el del HUD).
export const TURN_PANEL_KEYS: Array<keyof TeleprompterPayload> = [
  "alert",
  "matchedStory",
  "bridge",
  "triggerCards",
  "edgeCases",
  "whyNot",
  "dryRun",
  "surgicalPhonetics",
  "scalePills",
  "yagni",
  "instantTrap",
  "instantWhyNot",
  "firmnessAlert",
  "keyWords",
];

export type TeleprompterInboundMessage =
  | { type: "CAMOU_MODE"; camouMode: "normal" | "ide" | "terminal" }
  | { type: "TRIGGER_REVERSE_QUESTIONS" }
  | { type: "TOGGLE_PANIC" }
  | Record<string, unknown>;

export function useTeleprompter(options?: { onMessage?: (data: TeleprompterInboundMessage) => void }) {
  const bcRef = useRef<BroadcastChannel | null>(null);
  const winRef = useRef<Window | null>(null);
  const checkTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const onMessageRef = useRef(options?.onMessage);
  onMessageRef.current = options?.onMessage;

  const clearCheckTimer = useCallback(() => {
    if (checkTimerRef.current) {
      clearInterval(checkTimerRef.current);
      checkTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && typeof BroadcastChannel !== "undefined") {
      try {
        bcRef.current = new BroadcastChannel(CHANNEL_NAME);
        bcRef.current.onmessage = (event) => {
          onMessageRef.current?.(event.data);
        };
      } catch (e) {
        console.warn("BroadcastChannel no disponible en este entorno", e);
      }
    }

    return () => {
      clearCheckTimer();
      if (bcRef.current) {
        bcRef.current.close();
        bcRef.current = null; // limpiar ref explícitamente
      }
      // No cerrar la ventana en cleanup (el usuario puede querer que siga abierta)
      // pero sí limpiar la ref para evitar sincronización duplicada
      winRef.current = null;
    };
  }, [clearCheckTimer]);

  const syncTeleprompter = useCallback((payload: TeleprompterPayload, persist = true) => {
    if (persist) {
      try {
        // Merge con lo persistido: un delta (p.ej. solo camouMode) no debe pisar el
        // último payload completo — un HUD reabierto arrancaría en blanco
        let merged: TeleprompterPayload = payload;
        try {
          const prev = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
          if (prev && typeof prev === "object") {
            merged = { ...prev, ...payload };
            // Turno nuevo (cambió la pregunta): limpiar a mano los paneles del turno
            // anterior para que no reaparezcan al reabrir el HUD
            const prevQ = typeof prev.question === "string" ? prev.question : "";
            const newQ = typeof payload.question === "string" ? payload.question : "";
            if (newQ && newQ !== prevQ) {
              for (const key of TURN_PANEL_KEYS) {
                if (!(key in payload)) delete (merged as Record<string, unknown>)[key];
              }
            }
          }
        } catch {}
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      } catch (e) {
        // Cuota llena o storage no disponible: avisar pero no romper la UI
        console.warn("[teleprompter] localStorage no persistió (¿cuota llena?)", e);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("loro:quota-exceeded", { detail: { key: STORAGE_KEY } }));
        }
      }
    }

    if (bcRef.current) {
      try {
        bcRef.current.postMessage(payload);
      } catch {}
    }
  }, []);

  const openTeleprompter = useCallback(() => {
    if (typeof window === "undefined") return;

    if (winRef.current && !winRef.current.closed) {
      winRef.current.focus();
      return;
    }

    clearCheckTimer();

    const width = 580;
    const height = 340;
    const left = Math.max(0, Math.round((window.screen.width - width) / 2));
    const top = 0; // Ubicado en la parte superior, pegado a la webcam

    const newWin = window.open(
      "/teleprompter",
      "LoroTeleprompterHUD",
      `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes`
    );

    if (newWin) {
      winRef.current = newWin;
      setIsOpen(true);
      checkTimerRef.current = setInterval(() => {
        if (!winRef.current || winRef.current.closed) {
          setIsOpen(false);
          clearCheckTimer();
        }
      }, 1000);
    }
  }, [clearCheckTimer]);

  return {
    isOpen,
    openTeleprompter,
    syncTeleprompter,
  };
}
