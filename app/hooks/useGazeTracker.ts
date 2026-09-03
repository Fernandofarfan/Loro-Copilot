"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export interface GazeTrackerOptions {
  enabled?: boolean;
  lookawayThresholdMs?: number;
  onLookaway?: (durationMs: number) => void;
  onEyeContactRestored?: () => void;
}

export function useGazeTracker({
  enabled = false,
  lookawayThresholdMs = 2200,
  onLookaway,
  onEyeContactRestored,
}: GazeTrackerOptions = {}) {
  const [isTracking, setIsTracking] = useState(false);
  const [isLookingAway, setIsLookingAway] = useState(false);
  const [lookawayCount, setLookawayCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lookawayStartRef = useRef<number | null>(null);

  const stopTracking = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsTracking(false);
    setIsLookingAway(false);
    lookawayStartRef.current = null;
  }, []);

  const analyzeFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const { data, width, height } = frame;

    // Medición de luminosidad en tercio superior (ojos/frente) vs tercio medio (nariz/boca)
    // Cuando el usuario baja la cabeza para leer notas, el tercio superior se oscurece por inclinación
    let topLuminance = 0;
    let midLuminance = 0;
    let topCount = 0;
    let midCount = 0;

    const topLimit = Math.floor(height * 0.35);
    const midLimit = Math.floor(height * 0.7);

    for (let y = 0; y < midLimit; y += 4) {
      for (let x = 0; x < width; x += 4) {
        const idx = (y * width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;

        if (y < topLimit) {
          topLuminance += lum;
          topCount++;
        } else {
          midLuminance += lum;
          midCount++;
        }
      }
    }

    const avgTop = topCount > 0 ? topLuminance / topCount : 128;
    const avgMid = midCount > 0 ? midLuminance / midCount : 128;

    // Inclinación hacia abajo acusada (lectura de teclado o pantalla baja)
    const ratio = avgMid > 0 ? avgTop / avgMid : 1;
    const lookingDown = ratio < 0.72;

    const now = Date.now();
    if (lookingDown) {
      if (!lookawayStartRef.current) {
        lookawayStartRef.current = now;
      } else if (now - lookawayStartRef.current > lookawayThresholdMs) {
        if (!isLookingAway) {
          setIsLookingAway(true);
          setLookawayCount((c) => c + 1);
          onLookaway?.(now - lookawayStartRef.current);
        }
      }
    } else {
      if (lookawayStartRef.current && now - lookawayStartRef.current > lookawayThresholdMs) {
        onEyeContactRestored?.();
      }
      lookawayStartRef.current = null;
      if (isLookingAway) {
        setIsLookingAway(false);
      }
    }
  }, [lookawayThresholdMs, isLookingAway, onLookaway, onEyeContactRestored]);

  const startTracking = useCallback(async () => {
    try {
      setError(null);
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("getUserMedia no soportado en este navegador");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 160 }, height: { ideal: 120 }, facingMode: "user" },
        audio: false,
      });

      streamRef.current = stream;

      if (!videoRef.current) {
        const v = document.createElement("video");
        v.playsInline = true;
        v.muted = true;
        videoRef.current = v;
      }

      if (!canvasRef.current) {
        const c = document.createElement("canvas");
        c.width = 160;
        c.height = 120;
        canvasRef.current = c;
      }

      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      setIsTracking(true);

      if (intervalRef.current) clearInterval(intervalRef.current);
      // Muestreo liviano a ~4 FPS (250ms)
      intervalRef.current = setInterval(analyzeFrame, 250);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al iniciar Gaze Tracker";
      setError(msg);
      stopTracking();
    }
  }, [analyzeFrame, stopTracking]);

  const toggleTracking = useCallback(() => {
    if (isTracking) {
      stopTracking();
    } else {
      startTracking();
    }
  }, [isTracking, startTracking, stopTracking]);

  useEffect(() => {
    if (enabled && !isTracking) {
      startTracking();
    } else if (!enabled && isTracking) {
      stopTracking();
    }
    return () => {
      stopTracking();
    };
  }, [enabled, isTracking, startTracking, stopTracking]);

  return {
    isTracking,
    isLookingAway,
    lookawayCount,
    error,
    startTracking,
    stopTracking,
    toggleTracking,
  };
}
