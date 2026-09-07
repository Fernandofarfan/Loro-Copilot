/**
 * PCMWorklet — Convierte audio Float32 a PCM16 y lo remuestrea a 16kHz.
 * - Modo Mono (default, isDual=false): Remezcla cualquier entrada (mono o estéreo de pestaña/mic) a 1 canal PCM16.
 * - Modo Dual (isDual=true): Canal 0 = Mic (L), Canal 1 = Pestaña/Cable (R). Salida interleaved estéreo PCM16.
 * Incorpora cálculo de energía RMS y detector local de actividad de voz (VAD).
 */
class PCMWorklet extends AudioWorkletProcessor {
  constructor() {
    super();
    this.targetRate = 16000;
    this.remainderIndex = 0;
    this.leftoverBuffer0 = new Float32Array(0);
    this.leftoverBuffer1 = new Float32Array(0);

    this.isDual = false;
    this.mode = "mic"; // "mic", "tab", "dual"

    // VAD local y detección de energía
    this.energyInterval = 1600; // ~100ms a 16kHz
    this.sampleCountSinceEnergy = 0;
    this.accumEnergy0 = 0;
    this.accumEnergy1 = 0;

    this.isInterviewerSpeaking = false;
    this.interviewerSilenceSamples = 0;
    this.speechThreshold = 0.02;
    this.silenceThreshold = 0.01;

    // Filtro paso-alto y noise gate solo para micrófono
    this.hpPrevX0 = 0;
    this.hpPrevY0 = 0;
    this.noiseGateThreshold = 0.005;

    this.port.onmessage = (e) => {
      if (e.data && e.data.type === "config") {
        this.isDual = !!e.data.isDual;
        if (e.data.mode) {
          this.mode = e.data.mode;
        }
      }
    };
  }

  process(inputs) {
    const input = inputs[0];
    if (!input || input.length === 0) return true;

    const inRate = sampleRate; // sampleRate nativo del AudioContext
    const ratio = inRate / this.targetRate;

    let inChan0 = input[0];
    if (!inChan0 || inChan0.length === 0) return true;

    let inChan1 = null;

    if (this.isDual && input.length >= 2 && input[1] && input[1].length > 0) {
      // Modo Dual: Canal 0 = Mic, Canal 1 = Pestaña/Cable
      inChan1 = input[1];
    } else if (!this.isDual && input.length >= 2 && input[1] && input[1].length > 0) {
      // Modo Mono (Mic o Pestaña estéreo como YouTube/Meet):
      // Downmix estricto (L + R) / 2 para evitar saturación y enviar SIEMPRE mono a Deepgram
      const len = inChan0.length;
      const downmixed = new Float32Array(len);
      const chan1 = input[1];
      for (let i = 0; i < len; i++) {
        downmixed[i] = (inChan0[i] + chan1[i]) * 0.5;
      }
      inChan0 = downmixed;
    }

    // 1. Concatenar sobrantes del quantum anterior
    let fullBuffer0;
    if (this.leftoverBuffer0.length > 0) {
      fullBuffer0 = new Float32Array(this.leftoverBuffer0.length + inChan0.length);
      fullBuffer0.set(this.leftoverBuffer0, 0);
      fullBuffer0.set(inChan0, this.leftoverBuffer0.length);
    } else {
      fullBuffer0 = inChan0;
    }

    let fullBuffer1 = null;
    if (inChan1) {
      if (this.leftoverBuffer1.length > 0) {
        fullBuffer1 = new Float32Array(this.leftoverBuffer1.length + inChan1.length);
        fullBuffer1.set(this.leftoverBuffer1, 0);
        fullBuffer1.set(inChan1, this.leftoverBuffer1.length);
      } else {
        fullBuffer1 = inChan1;
      }
    }

    // 2. Remuestreo y conversión a PCM16
    const totalSamples = fullBuffer0.length;
    let outCount = 0;
    let currPos = this.remainderIndex;

    while (currPos + ratio <= totalSamples) {
      outCount++;
      currPos += ratio;
    }

    if (outCount > 0) {
      currPos = this.remainderIndex;

      if (this.isDual && fullBuffer1) {
        // === MODO DUAL (Estéreo 2 canales para Deepgram) ===
        const out = new Int16Array(outCount * 2);
        let blockSumSq0 = 0;
        let blockSumSq1 = 0;

        for (let i = 0; i < outCount; i++) {
          const nextPos = currPos + ratio;
          const start = Math.floor(currPos);
          const end = Math.min(totalSamples, Math.ceil(nextPos));
          let sum0 = 0;
          let sum1 = 0;
          let count = 0;

          for (let j = start; j < end; j++) {
            sum0 += fullBuffer0[j];
            sum1 += fullBuffer1[j];
            count++;
          }

          let s0 = count ? sum0 / count : 0;
          let s1 = count ? sum1 / count : 0;

          // Filtro suave en micrófono
          const hpY0 = s0 - this.hpPrevX0 + 0.95 * this.hpPrevY0;
          this.hpPrevX0 = s0;
          this.hpPrevY0 = hpY0;
          s0 = hpY0;

          if (Math.abs(s0) < this.noiseGateThreshold) {
            s0 *= 0.5;
          }

          s0 = Math.max(-1, Math.min(1, s0));
          s1 = Math.max(-1, Math.min(1, s1));

          blockSumSq0 += s0 * s0;
          blockSumSq1 += s1 * s1;

          out[2 * i] = s0 < 0 ? s0 * 0x8000 : s0 * 0x7fff;
          out[2 * i + 1] = s1 < 0 ? s1 * 0x8000 : s1 * 0x7fff;
          currPos = nextPos;
        }

        this.port.postMessage(out.buffer, [out.buffer]);

        // VAD local y Barge-in sobre el canal del entrevistador (Canal 1)
        const blockRms1 = Math.sqrt(blockSumSq1 / outCount);
        if (blockRms1 > this.speechThreshold) {
          if (!this.isInterviewerSpeaking) {
            this.isInterviewerSpeaking = true;
            this.port.postMessage({ type: "barge_in", channel: 1, rms: blockRms1 });
          }
          this.interviewerSilenceSamples = 0;
        } else if (this.isInterviewerSpeaking && blockRms1 < this.silenceThreshold) {
          this.interviewerSilenceSamples += outCount;
          if (this.interviewerSilenceSamples >= 4000) {
            this.isInterviewerSpeaking = false;
            this.port.postMessage({ type: "local_vad_silence", channel: 1 });
          }
        }

        // Telemetría periódica de energía (~100ms)
        this.sampleCountSinceEnergy += outCount;
        this.accumEnergy0 += blockSumSq0;
        this.accumEnergy1 += blockSumSq1;
        if (this.sampleCountSinceEnergy >= this.energyInterval) {
          const micRms = Math.sqrt(this.accumEnergy0 / this.sampleCountSinceEnergy);
          const tabRms = Math.sqrt(this.accumEnergy1 / this.sampleCountSinceEnergy);
          this.port.postMessage({ type: "energy", micRms, tabRms });
          this.sampleCountSinceEnergy = 0;
          this.accumEnergy0 = 0;
          this.accumEnergy1 = 0;
        }
      } else {
        // === MODO MONO (1 canal 16kHz exacto para Deepgram) ===
        const out = new Int16Array(outCount);
        let blockSumSq0 = 0;

        for (let i = 0; i < outCount; i++) {
          const nextPos = currPos + ratio;
          const start = Math.floor(currPos);
          const end = Math.min(totalSamples, Math.ceil(nextPos));
          let sum0 = 0;
          let count = 0;

          for (let j = start; j < end; j++) {
            sum0 += fullBuffer0[j];
            count++;
          }

          let s0 = count ? sum0 / count : 0;

          // Solo aplicar filtro high-pass si es micrófono
          if (this.mode === "mic") {
            const hpY0 = s0 - this.hpPrevX0 + 0.95 * this.hpPrevY0;
            this.hpPrevX0 = s0;
            this.hpPrevY0 = hpY0;
            s0 = hpY0;
            if (Math.abs(s0) < this.noiseGateThreshold) {
              s0 *= 0.5;
            }
          }

          s0 = Math.max(-1, Math.min(1, s0));
          blockSumSq0 += s0 * s0;

          out[i] = s0 < 0 ? s0 * 0x8000 : s0 * 0x7fff;
          currPos = nextPos;
        }

        this.port.postMessage(out.buffer, [out.buffer]);

        // VAD local cuando es solo pestaña
        const blockRms0 = Math.sqrt(blockSumSq0 / outCount);
        if (this.mode === "tab") {
          if (blockRms0 > this.speechThreshold) {
            if (!this.isInterviewerSpeaking) {
              this.isInterviewerSpeaking = true;
              this.port.postMessage({ type: "barge_in", channel: 0, rms: blockRms0 });
            }
            this.interviewerSilenceSamples = 0;
          } else if (this.isInterviewerSpeaking && blockRms0 < this.silenceThreshold) {
            this.interviewerSilenceSamples += outCount;
            if (this.interviewerSilenceSamples >= 4000) {
              this.isInterviewerSpeaking = false;
              this.port.postMessage({ type: "local_vad_silence", channel: 0 });
            }
          }
        }

        // Telemetría periódica de energía (~100ms)
        this.sampleCountSinceEnergy += outCount;
        this.accumEnergy0 += blockSumSq0;
        if (this.sampleCountSinceEnergy >= this.energyInterval) {
          const currentRms = Math.sqrt(this.accumEnergy0 / this.sampleCountSinceEnergy);
          const isTab = this.mode === "tab";
          this.port.postMessage({
            type: "energy",
            micRms: isTab ? 0 : currentRms,
            tabRms: isTab ? currentRms : 0,
          });
          this.sampleCountSinceEnergy = 0;
          this.accumEnergy0 = 0;
        }
      }
    }

    // 3. Guardar samples residuales
    const MAX_LEFTOVER_SAMPLES = 2048;
    const lastConsumedIndex = Math.floor(currPos);
    if (lastConsumedIndex < totalSamples) {
      const raw0 = fullBuffer0.slice(lastConsumedIndex);
      this.leftoverBuffer0 = raw0.length > MAX_LEFTOVER_SAMPLES ? raw0.slice(-MAX_LEFTOVER_SAMPLES) : raw0;

      if (this.isDual && fullBuffer1) {
        const raw1 = fullBuffer1.slice(lastConsumedIndex);
        this.leftoverBuffer1 = raw1.length > MAX_LEFTOVER_SAMPLES ? raw1.slice(-MAX_LEFTOVER_SAMPLES) : raw1;
      }
      this.remainderIndex = currPos - lastConsumedIndex;
    } else {
      this.leftoverBuffer0 = new Float32Array(0);
      this.leftoverBuffer1 = new Float32Array(0);
      this.remainderIndex = Math.max(0, currPos - totalSamples);
    }

    return true;
  }
}

registerProcessor("pcm-worklet", PCMWorklet);
