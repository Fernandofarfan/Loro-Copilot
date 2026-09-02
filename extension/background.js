let capturingTabId = null;

const SUPPORTED_HOST_PATTERNS = [
  "http://localhost:3000/*",
  "http://127.0.0.1:3000/*",
  "https://loro-copilot.vercel.app/*",
];

async function findLoroTabs() {
  for (const pattern of SUPPORTED_HOST_PATTERNS) {
    const tabs = await chrome.tabs.query({ url: pattern });
    if (tabs.length > 0) return tabs;
  }
  return [];
}

chrome.action.onClicked.addListener(async (tab) => {
  if (capturingTabId) {
    await chrome.offscreen.closeDocument().catch(() => {});
    capturingTabId = null;
    chrome.action.setBadgeText({ text: "" });
    return;
  }

  // Obtenemos el ID del stream de la pestaña activa (ej: Meet / Zoom)
  chrome.tabCapture.getMediaStreamId({ targetTabId: tab.id }, async (streamId) => {
    if (!streamId) {
      console.error("No se pudo obtener el streamId de la pestaña.");
      return;
    }

    let sttLang = "es";
    let apiBase = "https://loro-copilot.vercel.app";

    try {
      const loroTabs = await findLoroTabs();
      if (loroTabs.length > 0) {
        const tabUrl = new URL(loroTabs[0].url);
        apiBase = tabUrl.origin;
        const [{ result }] = await chrome.scripting.executeScript({
          target: { tabId: loroTabs[0].id },
          func: () => localStorage.getItem("copiloto:lang:v1") || "es",
        });
        if (result) sttLang = result;
      }
    } catch (err) {
      console.warn("No se pudo obtener contexto de la pestaña de Loro Copilot:", err);
    }

    const hasDocument = await chrome.offscreen.hasDocument();
    if (!hasDocument) {
      await chrome.offscreen.createDocument({
        url: "offscreen.html",
        reasons: ["USER_MEDIA"],
        justification: "Captura de audio de pestaña para streaming STT en Loro Copilot",
      });
    }

    chrome.runtime.sendMessage({
      type: "START_CAPTURE",
      streamId,
      apiBase,
      lang: sttLang === "en" ? "en-US" : "es",
    });

    capturingTabId = tab.id;
    chrome.action.setBadgeText({ text: "REC" });
    chrome.action.setBadgeBackgroundColor({ color: "#10b981" });
  });
});

// Reenviamos mensajes del offscreen al content script de la web app
chrome.runtime.onMessage.addListener(async (msg) => {
  if (msg.type === "DG_MESSAGE") {
    const loroTabs = await findLoroTabs();
    for (const t of loroTabs) {
      if (t.id) {
        chrome.tabs.sendMessage(t.id, msg).catch(() => {});
      }
    }
  }
});
