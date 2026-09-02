// Convierte audio Float32 a PCM16 y lo remuestrea a 16kHz preservando muestras residuales
// entre llamadas de process() (Web Audio quantum de 128 samples).
class PCMWorklet extends AudioWorkletProcessor {
  constructor() {
    super();
    this.targetRate = 16000;
    this.remainderIndex = 0;
    this.leftoverBuffer = new Float32Array(0);
  }

  process(inputs) {
    const input = inputs[0];
    if (!input || input.length === 0) return true;
    const channel = input[0];
    if (!channel || channel.length === 0) return true;

    const inRate = sampleRate; // global del AudioWorklet
    const ratio = inRate / this.targetRate;

    // Concatenar sobrantes del quantum anterior con el buffer actual
    let fullBuffer;
    if (this.leftoverBuffer.length > 0) {
      fullBuffer = new Float32Array(this.leftoverBuffer.length + channel.length);
      fullBuffer.set(this.leftoverBuffer, 0);
      fullBuffer.set(channel, this.leftoverBuffer.length);
    } else {
      fullBuffer = channel;
    }

    if (Math.abs(ratio - 1.0) < 0.001) {
      const pcm = this._toPCM(fullBuffer);
      this.port.postMessage(pcm.buffer, [pcm.buffer]);
      this.leftoverBuffer = new Float32Array(0);
      return true;
    }

    // Downsample con ventana móvil y tracking exacto de offset fraccional
    const totalSamples = fullBuffer.length;
    let outCount = 0;
    let currPos = this.remainderIndex;

    // Primer pase: contar cuántos samples caben exactamente
    while (currPos + ratio <= totalSamples) {
      outCount++;
      currPos += ratio;
    }

    if (outCount > 0) {
      const out = new Int16Array(outCount);
      currPos = this.remainderIndex;
      for (let i = 0; i < outCount; i++) {
        const nextPos = currPos + ratio;
        const start = Math.floor(currPos);
        const end = Math.min(totalSamples, Math.ceil(nextPos));
        let sum = 0;
        let count = 0;
        for (let j = start; j < end; j++) {
          sum += fullBuffer[j];
          count++;
        }
        let s = count ? sum / count : 0;
        s = Math.max(-1, Math.min(1, s));
        out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        currPos = nextPos;
      }
      this.port.postMessage(out.buffer, [out.buffer]);
    }

    // Guardar los samples residuales que quedaron después de currPos
    const lastConsumedIndex = Math.floor(currPos);
    if (lastConsumedIndex < totalSamples) {
      this.leftoverBuffer = fullBuffer.slice(lastConsumedIndex);
      this.remainderIndex = currPos - lastConsumedIndex;
    } else {
      this.leftoverBuffer = new Float32Array(0);
      this.remainderIndex = currPos - totalSamples;
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
