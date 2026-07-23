let ws = null;
let mediaRecorder = null;

chrome.runtime.onMessage.addListener(async (msg) => {
  if (msg.type === "START_CAPTURE") {
    startCapture(msg.streamId, msg.lang);
  }
});

async function startCapture(streamId, lang = "es") {
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

    // Pedimos token al backend de localhost
    const res = await fetch("http://localhost:3000/api/deepgram-token");
    const data = await res.json();
    
    const params = new URLSearchParams({
      model: "nova-2",
      language: lang,
      smart_format: "true",
      interim_results: "true",
      endpointing: "500",
      utterance_end_ms: "3000",
      vad_events: "true",
      diarize: "true",
      encoding: "linear16",
      sample_rate: "16000",
      channels: "1",
    }).toString();

    ws = new WebSocket(`wss://api.deepgram.com/v1/listen?${params}`, [data.scheme || "token", data.token]);

    ws.onopen = () => {
      console.log("Conectado a Deepgram desde Offscreen");
      
      // Capturar y enviar PCM
      const audioContext = new AudioContext({ sampleRate: 16000 });
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      
      source.connect(processor);
      processor.connect(audioContext.destination);
      
      processor.onaudioprocess = (e) => {
        if (ws.readyState === WebSocket.OPEN) {
          const inputData = e.inputBuffer.getChannelData(0);
          const pcm16 = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            pcm16[i] = Math.max(-1, Math.min(1, inputData[i])) * 32767;
          }
          ws.send(pcm16.buffer);
        }
      };
    };

    ws.onmessage = (event) => {
      // Reenviamos el evento al background, que lo mandará a localhost:3000
      chrome.runtime.sendMessage({
        type: "DG_MESSAGE",
        data: JSON.parse(event.data)
      });
    };

    ws.onclose = () => console.log("WebSocket cerrado");

  } catch (err) {
    console.error("Error al capturar tab:", err);
  }
}
