"use client";

import { useState, useCallback } from "react";
import { track } from "../lib/track";

interface UseScreenVisionOptions {
  onVisionResult?: (result: { question: string; prompt: string; imageBase64: string }) => void;
  onError?: (err: string) => void;
}

export function useScreenVision({ onVisionResult, onError }: UseScreenVisionOptions = {}) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const captureScreenFrame = useCallback(async (): Promise<string | null> => {
    if (typeof window === "undefined" || !navigator.mediaDevices?.getDisplayMedia) {
      const msg = "La captura de pantalla no está soportada en este navegador.";
      setError(msg);
      onError?.(msg);
      return null;
    }

    setIsCapturing(true);
    setError(null);
    let displayStream: MediaStream | null = null;

    try {
      // 1. Solicitar captura de pantalla / ventana de Meet/Zoom/LeetCode
      displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: "window",
        } as MediaTrackConstraints,
        audio: false,
      });

      const videoTrack = displayStream.getVideoTracks()[0];
      if (!videoTrack) {
        throw new Error("No se obtuvo track de video de la pantalla.");
      }

      // 2. Renderizar frame en elemento de video temporal
      const video = document.createElement("video");
      video.muted = true;
      video.playsInline = true;
      video.srcObject = displayStream;

      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => {
          video.play().then(resolve).catch(reject);
        };
        video.onerror = () => reject(new Error("Error al reproducir el video de captura."));
      });

      // Pequeña espera para asegurar que el frame tenga contenido renderizado
      await new Promise((r) => setTimeout(r, 100));

      // 3. Dibujar en Canvas y comprimir a WebP
      const canvas = document.createElement("canvas");
      const maxDim = 1280;
      let width = video.videoWidth || 1280;
      let height = video.videoHeight || 720;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("No se pudo obtener el contexto 2D del canvas.");

      ctx.drawImage(video, 0, 0, width, height);

      // 4. Detener tracks de inmediato para no dejar el icono de compartir pantalla activo
      videoTrack.stop();
      displayStream.getTracks().forEach((t) => t.stop());

      // 5. Convertir a WebP Base64 (muy liviano, ~50-80KB)
      const dataUrl = canvas.toDataURL("image/webp", 0.85);
      const base64Data = dataUrl.split(",")[1];

      track("screen_vision_captured", { width, height });
      return base64Data;
    } catch (err: unknown) {
      if (displayStream) {
        displayStream.getTracks().forEach((t) => t.stop());
      }
      const msg = err instanceof Error ? err.message : "Error al capturar la pantalla.";
      if (msg.includes("Permission denied") || msg.includes("denied")) {
        // Usuario canceló el diálogo del navegador
        setError(null);
      } else {
        setError(msg);
        onError?.(msg);
      }
      return null;
    } finally {
      setIsCapturing(false);
    }
  }, [onError]);

  return {
    isCapturing,
    error,
    captureScreenFrame,
  };
}
