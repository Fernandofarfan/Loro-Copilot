"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { track } from "../lib/track";

export type DeepgramStatus = "idle" | "connecting" | "live" | "error";
export type AudioMode = "mic" | "tab" | "dual";

export interface TranscriptLine {
  id: number;
  text: string;
  final: boolean;
  speaker: number;
  lang?: string;
}

export interface AudioEnergy {
  micRms: number;
  tabRms: number;
}

interface UseDeepgramOptions {
  onTranscript: (line: TranscriptLine) => void;
  onUtteranceEnd?: () => void;
  onLanguageDetected?: (lang: string) => void;
  onBargeIn?: () => void;
  onEnergy?: (e: AudioEnergy) => void;
  lang?: string;
}

export function useDeepgram({
  onTranscript,
  onUtteranceEnd,
  onLanguageDetected,
  onBargeIn,
  onEnergy,
  lang = "es",
}: UseDeepgramOptions) {
  const [status, setStatus] = useState<DeepgramStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [activeMode, setActiveMode] = useState<AudioMode>("mic");
  const [energy, setEnergy] = useState<AudioEnergy>({ micRms: 0, tabRms: 0 });

  // Callbacks y configuraciones en refs para evitar closures obsoletos (stale callbacks)
  const onTranscriptRef = useRef(onTranscript);
  onTranscriptRef.current = onTranscript;

  const onUtteranceEndRef = useRef(onUtteranceEnd);
  onUtteranceEndRef.current = onUtteranceEnd;

  const onLanguageDetectedRef = useRef(onLanguageDetected);
  onLanguageDetectedRef.current = onLanguageDetected;

  const onBargeInRef = useRef(onBargeIn);
  onBargeInRef.current = onBargeIn;

  const onEnergyRef = useRef(onEnergy);
  onEnergyRef.current = onEnergy;

  const langRef = useRef(lang);
  langRef.current = lang;

  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;

  const statusRef = useRef<DeepgramStatus>("idle");
  statusRef.current = status;

  const activeModeRef = useRef<AudioMode>("mic");
  activeModeRef.current = activeMode;

  // Refs de hardware y red
  const wsRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const silentGainRef = useRef<GainNode | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  // Control de generación para asegurar un único socket y stream activo
  const connectionGenRef = useRef(0);
  const tokenAbortControllerRef = useRef<AbortController | null>(null);

  // Timers y reconexión
  const keepAliveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const intentionalCloseRef = useRef(false);

  // Control de IDs de líneas de transcripción (interims no generan spam de IDs)
  const lineCounterRef = useRef(1);
  const currentInterimIdRef = useRef<number | null>(null);
  const lastSpeakerRef = useRef<number>(0);

  const clearTimers = useCallback(() => {
    if (keepAliveTimerRef.current) {
      clearInterval(keepAliveTimerRef.current);
      keepAliveTimerRef.current = null;
    }
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
      } catch {}
      wakeLockRef.current = null;
    }
  }, []);

  const requestWakeLock = useCallback(async () => {
    if (typeof navigator !== "undefined" && "wakeLock" in navigator) {
      try {
        wakeLockRef.current = await navigator.wakeLock.request("screen");
      } catch {}
    }
  }, []);

  const disconnect = useCallback(() => {
    intentionalCloseRef.current = true;
    connectionGenRef.current++; // invalidar handlers asíncronos pendientes
    clearTimers();
    releaseWakeLock();

    if (tokenAbortControllerRef.current) {
      tokenAbortControllerRef.current.abort();
      tokenAbortControllerRef.current = null;
    }

    if (wsRef.current) {
      try {
        wsRef.current.onopen = null;
        wsRef.current.onmessage = null;
        wsRef.current.onerror = null;
        wsRef.current.onclose = null;
        wsRef.current.close();
      } catch {}
      wsRef.current = null;
    }

    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((track) => track.stop());
      } catch {}
      streamRef.current = null;
    }

    if (workletNodeRef.current) {
      try {
        workletNodeRef.current.disconnect();
      } catch {}
      workletNodeRef.current = null;
    }

    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.disconnect();
      } catch {}
      sourceNodeRef.current = null;
    }

    if (silentGainRef.current) {
      try {
        silentGainRef.current.disconnect();
      } catch {}
      silentGainRef.current = null;
    }

    if (audioCtxRef.current) {
      try {
        if (audioCtxRef.current.state !== "closed") {
          audioCtxRef.current.close().catch(() => {});
        }
      } catch {}
      audioCtxRef.current = null;
    }

    setStatus("idle");
    setErrorMessage(null);
    setEnergy({ micRms: 0, tabRms: 0 });
    currentInterimIdRef.current = null;
    lineCounterRef.current = 1;
    reconnectAttemptsRef.current = 0;
  }, [clearTimers, releaseWakeLock]);

  // Manejo de visibilidad de pestaña: reanudar AudioContext si se suspende
  useEffect(() => {
    const handleVisibility = () => {
      const ctx = audioCtxRef.current;
      if (
        document.visibilityState === "visible" &&
        ctx &&
        ctx.state !== "closed" &&
        ctx.state === "suspended"
      ) {
        ctx.resume().catch(() => {});
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("pageshow", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("pageshow", handleVisibility);
      disconnect();
    };
  }, [disconnect]);

  const connectWs = useCallback(
    async (gen: number, existingStream?: MediaStream, isDual = false) => {
      if (connectionGenRef.current !== gen) return;

      try {
        tokenAbortControllerRef.current = new AbortController();

        // 1. Obtener Token Temporal (Grant 120s)
        const tokenRes = await fetch("/api/deepgram-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: tokenAbortControllerRef.current.signal,
        });

        if (connectionGenRef.current !== gen) return;

        if (!tokenRes.ok) {
          const errData = await tokenRes.json().catch(() => ({}));
          const errMsg =
            errData.error ||
            (tokenRes.status === 503
              ? "Capacidad temporalmente agotada."
              : "Error de autenticación con el servicio de transcripción.");
          setStatus("error");
          setErrorMessage(errMsg);
          return;
        }

        const { token, scheme } = await tokenRes.json();
        if (connectionGenRef.current !== gen) return;

        if (!token) {
          setStatus("error");
          setErrorMessage("No se recibió token de autorización.");
          return;
        }

        // 2. Parámetros de Deepgram Nova-2 (Multicanal para Dual Audio)
        const sttLanguage = langRef.current === "en" ? "en" : "multi";
        const params = new URLSearchParams({
          model: "nova-2",
          language: sttLanguage,
          smart_format: "true",
          interim_results: "true",
          endpointing: "1000",
          utterance_end_ms: "1500",
          vad_events: "true",
          diarize: isDual ? "false" : "true",
          encoding: "linear16",
          sample_rate: "16000",
          channels: isDual ? "2" : "1",
          multichannel: isDual ? "true" : "false",
        }).toString();

        const ws = new WebSocket(`wss://api.deepgram.com/v1/listen?${params}`, [
          scheme || "bearer",
          token,
        ]);

        if (wsRef.current) {
          try {
            wsRef.current.onopen = null;
            wsRef.current.onmessage = null;
            wsRef.current.onerror = null;
            wsRef.current.onclose = null;
            wsRef.current.close();
          } catch {}
        }
        wsRef.current = ws;

        ws.onopen = () => {
          if (connectionGenRef.current !== gen) {
            try {
              ws.close();
            } catch {}
            return;
          }
          reconnectAttemptsRef.current = 0;
          setStatus("live");
          requestWakeLock();
          track("deepgram_connected", { language: sttLanguage, isDual });

          clearTimers();
          keepAliveTimerRef.current = setInterval(() => {
            if (connectionGenRef.current !== gen) return;
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
              try {
                wsRef.current.send(JSON.stringify({ type: "KeepAlive" }));
              } catch {}
            }
          }, 8000);

          if (workletNodeRef.current) {
            workletNodeRef.current.port.onmessage = (e) => {
              if (connectionGenRef.current !== gen) return;
              if (isPausedRef.current) return;

              if (wsRef.current?.readyState === WebSocket.OPEN && e.data instanceof ArrayBuffer) {
                wsRef.current.send(e.data);
              } else if (e.data && typeof e.data === "object") {
                if (e.data.type === "barge_in") {
                  onBargeInRef.current?.();
                } else if (e.data.type === "local_vad_silence") {
                  onUtteranceEndRef.current?.();
                } else if (e.data.type === "energy") {
                  const energyData = { micRms: e.data.micRms, tabRms: e.data.tabRms };
                  setEnergy(energyData);
                  onEnergyRef.current?.(energyData);
                }
              }
            };
          }
        };

        ws.onmessage = (event) => {
          if (connectionGenRef.current !== gen) return;
          try {
            const data = JSON.parse(event.data);

            if (data.type === "UtteranceEnd") {
              currentInterimIdRef.current = null;
              onUtteranceEndRef.current?.();
              return;
            }

            if (data.channel?.alternatives?.[0]) {
              const alt = data.channel.alternatives[0];
              const transcript = (alt.transcript || "").trim();

              const detectedLang = alt.languages?.[0] || alt.language;
              if (detectedLang && onLanguageDetectedRef.current) {
                onLanguageDetectedRef.current(detectedLang);
              }

              if (transcript) {
                let speaker = 0;
                if (isDual && Array.isArray(data.channel_index)) {
                  // Canal 0 (L) = Mic Candidato (speaker 1)
                  // Canal 1 (R) = Pestaña Entrevistador (speaker 0)
                  speaker = data.channel_index[0] === 0 ? 1 : 0;
                } else {
                  speaker = alt.words?.[0]?.speaker ?? 0;
                }

                // Barge-in: Si el entrevistador habla, notificar interrupción inmediata
                if (speaker === 0) {
                  onBargeInRef.current?.();
                }

                const isFinal = !!data.is_final;
                let targetId: number;
                if (currentInterimIdRef.current !== null && lastSpeakerRef.current === speaker) {
                  targetId = currentInterimIdRef.current;
                } else {
                  targetId = lineCounterRef.current++;
                  currentInterimIdRef.current = targetId;
                }

                lastSpeakerRef.current = speaker;

                if (isFinal) {
                  currentInterimIdRef.current = null;
                }

                onTranscriptRef.current?.({
                  id: targetId,
                  text: transcript,
                  final: isFinal,
                  speaker,
                  lang: detectedLang,
                });
              }
            }
          } catch {}
        };

        ws.onerror = (err) => {
          if (connectionGenRef.current !== gen) return;
          console.error("Deepgram WS error:", err);
        };

        ws.onclose = () => {
          if (connectionGenRef.current !== gen) return;
          clearTimers();
          releaseWakeLock();

          if (!intentionalCloseRef.current && streamRef.current && reconnectAttemptsRef.current < 3) {
            const delay = 600 * Math.pow(2, reconnectAttemptsRef.current);
            reconnectAttemptsRef.current++;
            setStatus("connecting");
            reconnectTimerRef.current = setTimeout(() => {
              if (connectionGenRef.current === gen) {
                connectWs(gen, streamRef.current || undefined, activeModeRef.current === "dual");
              }
            }, delay);
          } else if (statusRef.current === "live" || statusRef.current === "connecting") {
            setStatus("idle");
          }
        };
      } catch (err: unknown) {
        if (connectionGenRef.current !== gen) return;
        if (err instanceof Error && err.name === "AbortError") return;
        console.error("Error al conectar WebSocket:", err);
        setStatus("error");
        setErrorMessage("No se pudo establecer la conexión de audio.");
      }
    },
    [clearTimers, releaseWakeLock, requestWakeLock]
  );

  const connect = useCallback(
    async (mode: AudioMode = "mic") => {
      disconnect();
      const currentGen = ++connectionGenRef.current;
      intentionalCloseRef.current = false;
      setStatus("connecting");
      setErrorMessage(null);
      setActiveMode(mode);
      activeModeRef.current = mode;

      try {
        let stream: MediaStream;
        let isDual = false;

        if (mode === "dual") {
          isDual = true;

          // 1. Micrófono del candidato
          const micStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          });

          // 2. Audio de la pestaña (Meet / Zoom)
          let tabStream: MediaStream;
          try {
            tabStream = await navigator.mediaDevices.getDisplayMedia({
              video: true,
              audio: {
                echoCancellation: false,
                noiseSuppression: false,
                autoGainControl: false,
              },
            });
          } catch (tabErr) {
            micStream.getTracks().forEach((t) => t.stop());
            throw tabErr;
          }

          // Detener video inmediatamente para ahorrar recursos
          tabStream.getVideoTracks().forEach((t) => t.stop());
          const tabAudioTracks = tabStream.getAudioTracks();
          if (tabAudioTracks.length === 0) {
            micStream.getTracks().forEach((t) => t.stop());
            tabStream.getTracks().forEach((t) => t.stop());
            setStatus("error");
            setErrorMessage(
              "No se detectó audio en la pestaña. Asegurate de tildar 'Compartir audio del sistema / pestaña' al seleccionarla."
            );
            return;
          }

          stream = new MediaStream([
            ...micStream.getAudioTracks(),
            ...tabStream.getAudioTracks(),
          ]);

          if (connectionGenRef.current !== currentGen) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }

          stream.getAudioTracks().forEach((track) => {
            track.onended = () => {
              if (connectionGenRef.current === currentGen) {
                disconnect();
              }
            };
          });

          streamRef.current = stream;

          const audioCtx = new AudioContext({ sampleRate: 16000 });
          audioCtxRef.current = audioCtx;

          await audioCtx.audioWorklet.addModule("/pcm-worklet.js");
          if (connectionGenRef.current !== currentGen) {
            stream.getTracks().forEach((t) => t.stop());
            audioCtx.close().catch(() => {});
            return;
          }

          const micSource = audioCtx.createMediaStreamSource(micStream);
          const tabSource = audioCtx.createMediaStreamSource(tabStream);
          const merger = audioCtx.createChannelMerger(2);

          // Canal 0 (L): Micrófono Candidato
          micSource.connect(merger, 0, 0);
          // Canal 1 (R): Pestaña Entrevistador
          tabSource.connect(merger, 0, 1);

          const workletNode = new AudioWorkletNode(audioCtx, "pcm-worklet", {
            numberOfInputs: 1,
            numberOfOutputs: 1,
            channelCount: 2,
          });
          workletNodeRef.current = workletNode;

          const silentGain = audioCtx.createGain();
          silentGain.gain.value = 0;
          silentGainRef.current = silentGain;

          merger.connect(workletNode);
          workletNode.connect(silentGain);
          silentGain.connect(audioCtx.destination);

          await connectWs(currentGen, stream, true);
        } else if (mode === "tab") {
          stream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: {
              echoCancellation: false,
              noiseSuppression: false,
              autoGainControl: false,
            },
          });

          stream.getVideoTracks().forEach((track) => {
            track.stop();
          });

          const audioTracks = stream.getAudioTracks();
          if (audioTracks.length === 0) {
            stream.getTracks().forEach((t) => t.stop());
            setStatus("error");
            setErrorMessage(
              "No se detectó audio en la pestaña compartida. Asegurate de activar 'Compartir audio' al seleccionar la pestaña."
            );
            return;
          }

          if (connectionGenRef.current !== currentGen) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }

          stream.getAudioTracks().forEach((track) => {
            track.onended = () => {
              if (connectionGenRef.current === currentGen) {
                disconnect();
              }
            };
          });

          streamRef.current = stream;

          const audioCtx = new AudioContext({ sampleRate: 16000 });
          audioCtxRef.current = audioCtx;

          await audioCtx.audioWorklet.addModule("/pcm-worklet.js");
          if (connectionGenRef.current !== currentGen) {
            stream.getTracks().forEach((t) => t.stop());
            audioCtx.close().catch(() => {});
            return;
          }

          const sourceNode = audioCtx.createMediaStreamSource(stream);
          sourceNodeRef.current = sourceNode;
          const workletNode = new AudioWorkletNode(audioCtx, "pcm-worklet");
          workletNodeRef.current = workletNode;

          const silentGain = audioCtx.createGain();
          silentGain.gain.value = 0;
          silentGainRef.current = silentGain;

          sourceNode.connect(workletNode);
          workletNode.connect(silentGain);
          silentGain.connect(audioCtx.destination);

          await connectWs(currentGen, stream, false);
        } else {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          });

          if (connectionGenRef.current !== currentGen) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }

          stream.getAudioTracks().forEach((track) => {
            track.onended = () => {
              if (connectionGenRef.current === currentGen) {
                disconnect();
              }
            };
          });

          streamRef.current = stream;

          const audioCtx = new AudioContext({ sampleRate: 16000 });
          audioCtxRef.current = audioCtx;

          await audioCtx.audioWorklet.addModule("/pcm-worklet.js");
          if (connectionGenRef.current !== currentGen) {
            stream.getTracks().forEach((t) => t.stop());
            audioCtx.close().catch(() => {});
            return;
          }

          const sourceNode = audioCtx.createMediaStreamSource(stream);
          sourceNodeRef.current = sourceNode;
          const workletNode = new AudioWorkletNode(audioCtx, "pcm-worklet");
          workletNodeRef.current = workletNode;

          const silentGain = audioCtx.createGain();
          silentGain.gain.value = 0;
          silentGainRef.current = silentGain;

          sourceNode.connect(workletNode);
          workletNode.connect(silentGain);
          silentGain.connect(audioCtx.destination);

          await connectWs(currentGen, stream, false);
        }
      } catch (err: unknown) {
        if (connectionGenRef.current !== currentGen) return;
        console.error("Error al iniciar captura de audio:", err);
        setStatus("error");
        setErrorMessage(
          err instanceof Error ? err.message : "No se pudo acceder al micrófono o audio del sistema."
        );
        disconnect();
      }
    },
    [connectWs, disconnect]
  );

  const togglePause = useCallback(() => {
    setIsPaused((p) => !p);
  }, []);

  return {
    status,
    errorMessage,
    isPaused,
    activeMode,
    energy,
    connect,
    disconnect,
    togglePause,
  };
}
