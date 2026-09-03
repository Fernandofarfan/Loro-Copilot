/**
 * PCMWorklet — Convierte audio Float32 a PCM16 y lo remuestrea a 16kHz.
 * Soporta Mono (1 canal: Mic o Pestaña) y Estéreo / Dual Channel (Canal 0: Mic, Canal 1: Pestaña).
 * Incorpora cálculo de energía RMS y detector local de actividad de voz (VAD) para Barge-in y fin de turno local.
 */
class PCMWorklet extends AudioWorkletProcessor {
  constructor() {
    super();
    this.targetRate = 16000;
    this.remainderIndex = 0;
    this.leftoverBuffer0 = new Float32Array(0);
    this.leftoverBuffer1 = new Float32Array(0);

    // VAD local y detección de energía
    this.energyInterval = 1600; // ~100ms a 16kHz
    this.sampleCountSinceEnergy = 0;
    this.accumEnergy0 = 0;
    this.accumEnergy1 = 0;

    this.isInterviewerSpeaking = false;
    this.interviewerSilenceSamples = 0;
    this.speechThreshold = 0.025;
    this.silenceThreshold = 0.015;
  }

  process(inputs) {
    const input = inputs[0];
    if (!input || input.length === 0) return true;

    const channel0 = input[0];
    if (!channel0 || channel0.length === 0) return true;

    const isStereo = input.length >= 2 && input[1] && input[1].length > 0;
    const channel1 = isStereo ? input[1] : null;

    const inRate = sampleRate; // global del AudioWorklet
    const ratio = inRate / this.targetRate;

    // 1. Concatenar sobrantes del quantum anterior
    let fullBuffer0;
    if (this.leftoverBuffer0.length > 0) {
      fullBuffer0 = new Float32Array(this.leftoverBuffer0.length + channel0.length);
      fullBuffer0.set(this.leftoverBuffer0, 0);
      fullBuffer0.set(channel0, this.leftoverBuffer0.length);
    } else {
      fullBuffer0 = channel0;
    }

    let fullBuffer1 = null;
    if (channel1) {
      if (this.leftoverBuffer1.length > 0) {
        fullBuffer1 = new Float32Array(this.leftoverBuffer1.length + channel1.length);
        fullBuffer1.set(this.leftoverBuffer1, 0);
        fullBuffer1.set(channel1, this.leftoverBuffer1.length);
      } else {
        fullBuffer1 = channel1;
      }
    }

    // 2. Si no requiere downsampling (ya está a 16kHz)
    if (Math.abs(ratio - 1.0) < 0.001) {
      if (fullBuffer1) {
        const outStereo = new Int16Array(fullBuffer0.length * 2);
        for (let i = 0; i < fullBuffer0.length; i++) {
          let s0 = Math.max(-1, Math.min(1, fullBuffer0[i]));
          let s1 = Math.max(-1, Math.min(1, fullBuffer1[i]));
          outStereo[2 * i] = s0 < 0 ? s0 * 0x8000 : s0 * 0x7fff;
          outStereo[2 * i + 1] = s1 < 0 ? s1 * 0x8000 : s1 * 0x7fff;
        }
        this.port.postMessage(outStereo.buffer, [outStereo.buffer]);
      } else {
        const pcm = this._toPCM(fullBuffer0);
        this.port.postMessage(pcm.buffer, [pcm.buffer]);
      }
      this.leftoverBuffer0 = new Float32Array(0);
      this.leftoverBuffer1 = new Float32Array(0);
      this.remainderIndex = 0;
      return true;
    }

    // 3. Downsampling con ventana móvil
    const totalSamples = fullBuffer0.length;
    let outCount = 0;
    let currPos = this.remainderIndex;

    while (currPos + ratio <= totalSamples) {
      outCount++;
      currPos += ratio;
    }

    if (outCount > 0) {
      currPos = this.remainderIndex;

      if (fullBuffer1) {
        // Modo Estéreo Intercalado (L0, R0, L1, R1, ...)
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

          s0 = Math.max(-1, Math.min(1, s0));
          s1 = Math.max(-1, Math.min(1, s1));

          blockSumSq0 += s0 * s0;
          blockSumSq1 += s1 * s1;

          out[2 * i] = s0 < 0 ? s0 * 0x8000 : s0 * 0x7fff;
          out[2 * i + 1] = s1 < 0 ? s1 * 0x8000 : s1 * 0x7fff;
          currPos = nextPos;
        }

        this.port.postMessage(out.buffer, [out.buffer]);

        // VAD local y Barge-in sobre el canal del entrevistador (Canal 1 / Pestaña)
        const blockRms1 = Math.sqrt(blockSumSq1 / outCount);
        if (blockRms1 > this.speechThreshold) {
          if (!this.isInterviewerSpeaking) {
            this.isInterviewerSpeaking = true;
            this.port.postMessage({ type: "barge_in", channel: 1, rms: blockRms1 });
          }
          this.interviewerSilenceSamples = 0;
        } else if (this.isInterviewerSpeaking && blockRms1 < this.silenceThreshold) {
          this.interviewerSilenceSamples += outCount;
          // ~250ms de silencio tras hablar = fin de turno local
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
        // Modo Mono (solo Mic o solo Pestaña)
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
          s0 = Math.max(-1, Math.min(1, s0));
          blockSumSq0 += s0 * s0;

          out[i] = s0 < 0 ? s0 * 0x8000 : s0 * 0x7fff;
          currPos = nextPos;
        }

        this.port.postMessage(out.buffer, [out.buffer]);

        this.sampleCountSinceEnergy += outCount;
        this.accumEnergy0 += blockSumSq0;
        if (this.sampleCountSinceEnergy >= this.energyInterval) {
          const micRms = Math.sqrt(this.accumEnergy0 / this.sampleCountSinceEnergy);
          this.port.postMessage({ type: "energy", micRms, tabRms: 0 });
          this.sampleCountSinceEnergy = 0;
          this.accumEnergy0 = 0;
        }
      }
    }

    // 4. Guardar samples residuales
    const MAX_LEFTOVER_SAMPLES = 2048;
    const lastConsumedIndex = Math.floor(currPos);
    if (lastConsumedIndex < totalSamples) {
      const raw0 = fullBuffer0.slice(lastConsumedIndex);
      this.leftoverBuffer0 = raw0.length > MAX_LEFTOVER_SAMPLES ? raw0.slice(-MAX_LEFTOVER_SAMPLES) : raw0;

      if (fullBuffer1) {
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

  _toPCM(channel) {
    const pcm = new Int16Array(channel.length);
    for (let i = 0; i < channel.length; i++) {
      let s = Math.max(-1, Math.min(1, channel[i]));
      pcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return pcm;
  }
}

registerProcessor("pcm-worklet", PCMWorklet);
