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
}

const STORAGE_KEY = "loro_teleprompter_data";
const CHANNEL_NAME = "loro_teleprompter_channel";

export function useTeleprompter() {
  const bcRef = useRef<BroadcastChannel | null>(null);
  const winRef = useRef<Window | null>(null);
  const checkTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isOpen, setIsOpen] = useState(false);

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

  const syncTeleprompter = useCallback((payload: TeleprompterPayload) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {}

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
