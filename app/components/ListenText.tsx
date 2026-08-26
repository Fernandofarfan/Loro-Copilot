"use client";

import React, { useState, useRef, useEffect } from "react";
import { VolumeIcon } from "./Icons";

interface ListenTextProps {
  text: string;
  lang?: "en" | "es";
  label?: string;
  className?: string;
}

export function ListenText({ text, lang = "en", label = "Escuchar", className = "" }: ListenTextProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleToggle = async () => {
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
      return;
    }

    const cleanText = text.replace(/[*_#`]/g, "").trim();
    if (!cleanText) return;

    setIsPlaying(true);

    // Intento 1: API de TTS Backend
    try {
      const res = await fetch("/api/simulador/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: cleanText.slice(0, 500), lang }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;

        audio.onended = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(url);
        };
        audio.onerror = () => {
          fallbackSpeechSynthesis(cleanText, lang);
        };

        await audio.play();
        return;
      }
    } catch {
      // Fallback a speech synthesis nativo
    }

    fallbackSpeechSynthesis(cleanText, lang);
  };

  const fallbackSpeechSynthesis = (textToSpeak: string, targetLang: "en" | "es") => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = targetLang === "en" ? "en-US" : "es-AR";
    utterance.rate = 1.0;

    // Buscar una voz de calidad
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) =>
        (targetLang === "en" && (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Samantha"))) ||
        (targetLang === "es" && (v.name.includes("Google") || v.name.includes("Paulina") || v.name.includes("Monica")))
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
        isPlaying
          ? "bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse"
          : "bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border-zinc-700/50 hover:text-white"
      } ${className}`}
      title={isPlaying ? "Detener reproducción" : "Escuchar pronunciación"}
    >
      <VolumeIcon size={13} />
      <span>{isPlaying ? "Detener" : label}</span>
    </button>
  );
}

export default ListenText;
