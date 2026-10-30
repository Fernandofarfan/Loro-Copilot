"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { track } from "../lib/track";

interface UseEarbudWhisperOptions {
  defaultEnabled?: boolean;
  rate?: number;
  volume?: number;
}

export function useEarbudWhisper({
  defaultEnabled = false,
  rate = 1.45,
  volume = 0.35,
}: UseEarbudWhisperOptions = {}) {
  const [isEnabled, setIsEnabled] = useState(defaultEnabled);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  // Flag síncrono: isSpeaking recién cambia en utterance.onstart (evento async con
  // latencia real de TTS); con solo el estado, un stop() en esa ventana no corta nada.
  const activeRef = useRef(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const stop = useCallback(() => {
    activeRef.current = false;
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsSpeaking(false);
  }, []);

  const clearActive = useCallback(() => {
    activeRef.current = false;
    setIsSpeaking(false);
  }, []);

  // Corta SOLO si el susurro del earbud es el que está hablando: el TTS manual
  // ("Escuchar") comparte speechSynthesis y no debe morir con cada request nueva.
  const stopIfActive = useCallback(() => {
    if (activeRef.current) stop();
  }, [stop]);

  const whisper = useCallback(
    (textToSpeak: string, lang: "en" | "es" = "en") => {
      if (!isEnabled || !synthRef.current || !textToSpeak.trim()) return;

      // Cancelar cualquier síntesis en curso para no generar cola de audio vieja
      synthRef.current.cancel();

      // Extraer solo la primera frase o palabras clave para máxima agilidad
      const cleanText = textToSpeak
        .replace(/\[\/?KEY\]/gi, "")
        .replace(/\[\/?EN\]/gi, "")
        .replace(/\[\/?ES\]/gi, "")
        .replace(/\[\/?PHO\]/gi, "")
        .replace(/\|/g, ", ")
        .split("\n")[0]
        .split(". ")[0]
        .trim();

      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = rate; // Habla acelerada para recibir la señal en <1 segundo
      utterance.volume = volume; // Volumen discreto para no filtrarse al micrófono
      utterance.lang = lang === "es" ? "es-ES" : "en-US";

      // Búsqueda de voz natural si está disponible
      const voices = synthRef.current.getVoices();
      const preferredVoice = voices.find(
        (v) => v.lang.startsWith(lang === "es" ? "es" : "en") && (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Samantha") || v.name.includes("Jorge"))
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        activeRef.current = false;
        setIsSpeaking(false);
      };
      utterance.onerror = () => {
        activeRef.current = false;
        setIsSpeaking(false);
      };

      activeRef.current = true;
      try {
        synthRef.current.speak(utterance);
      } catch (err) {
        // Un fallo de TTS no debe dejar activeRef colgado (mataría el TTS manual después)
        // ni romper el stream que llamó a whisper() vía onPunchline
        activeRef.current = false;
        console.warn("[earbud] speechSynthesis.speak falló:", err);
        return;
      }
      track("earbud_whisper_played", { lang, length: cleanText.length });
    },
    [isEnabled, rate, volume]
  );

  return {
    isEnabled,
    setIsEnabled,
    isSpeaking,
    whisper,
    stop,
    stopIfActive,
    clearActive,
  };
}
