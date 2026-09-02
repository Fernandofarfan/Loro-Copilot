let ws = null;
let currentStream = null;
let currentAudioContext = null;

chrome.runtime.onMessage.addListener(async (msg) => {
  if (msg.type === "START_CAPTURE") {
    startCapture(msg.streamId, msg.lang || "es", msg.apiBase || "http://localhost:3000");
  } else if (msg.type === "STOP_CAPTURE") {
    stopCapture();
  }
});

function stopCapture() {
  if (ws) {
    try {
      ws.close();
    } catch {}
    ws = null;
  }
  if (currentAudioContext) {
    try {
      currentAudioContext.close();
    } catch {}
    currentAudioContext = null;
  }
  if (currentStream) {
    try {
      currentStream.getTracks().forEach((t) => t.stop());
    } catch {}
    currentStream = null;
  }
}

async function startCapture(streamId, lang = "es", apiBase = "http://localhost:3000") {
  stopCapture();

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        mandatory: {
          chromeMediaSource: "tab",
          chromeMediaSourceId: streamId,
        },
      },
      video: false,
    });
    currentStream = stream;

    // Pedimos token temporal al backend mediante POST
    const tokenRes = await fetch(`${apiBase}/api/deepgram-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!tokenRes.ok) {
      console.error("Error obteniendo token de Deepgram:", tokenRes.status);
      return;
    }

    const data = await tokenRes.json();
    if (!data.token) {
      console.error("Respuesta sin token de Deepgram:", data);
      return;
    }

    const sttLanguage = lang.startsWith("en") ? "en" : "es";
    const params = new URLSearchParams({
      model: "nova-2",
      language: sttLanguage,
      smart_format: "true",
      interim_results: "true",
      endpointing: "800",
      utterance_end_ms: "1000",
      vad_events: "true",
      diarize: "true",
      encoding: "linear16",
      sample_rate: "16000",
      channels: "1",
    }).toString();

    ws = new WebSocket(`wss://api.deepgram.com/v1/listen?${params}`, [data.scheme || "bearer", data.token]);

    ws.onopen = () => {
      const audioContext = new AudioContext({ sampleRate: 16000 });
      currentAudioContext = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      const silentGain = audioContext.createGain();
      silentGain.gain.value = 0; // Sin sidetone / eco

      source.connect(processor);
      processor.connect(silentGain);
      silentGain.connect(audioContext.destination);

      processor.onaudioprocess = (e) => {
        if (ws && ws.readyState === WebSocket.OPEN) {
          const inputData = e.inputBuffer.getChannelData(0);
          const pcm16 = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            const s = Math.max(-1, Math.min(1, inputData[i]));
            pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
          }
          ws.send(pcm16.buffer);
        }
      };
    };

    ws.onmessage = (event) => {
      chrome.runtime.sendMessage({
        type: "DG_MESSAGE",
        data: event.data,
      });
    };

    ws.onerror = (err) => {
      console.error("Error en WebSocket de Deepgram en Offscreen:", err);
    };

    ws.onclose = () => {
      console.log("WebSocket de Deepgram cerrado en Offscreen");
    };

    stream.getAudioTracks().forEach((track) => {
      track.onended = () => stopCapture();
    });
  } catch (err) {
    console.error("Error iniciando captura offscreen:", err);
  }
}
