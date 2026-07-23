let capturingTabId = null;

chrome.action.onClicked.addListener(async (tab) => {
  if (capturingTabId) {
    // Si ya estamos capturando, detenemos
    await chrome.offscreen.closeDocument();
    capturingTabId = null;
    chrome.action.setBadgeText({ text: "" });
    return;
  }

  // Obtenemos el ID del stream de la pestaña activa (ej: Meet)
  chrome.tabCapture.getMediaStreamId({ targetTabId: tab.id }, async (streamId) => {
    if (!streamId) {
      console.error("No se pudo obtener el streamId");
      return;
    }

    // Buscamos la pestaña de Loro para preguntarle el idioma
    let sttLang = "es";
    try {
      const loroTabs = await chrome.tabs.query({ url: "http://localhost:3000/*" });
      if (loroTabs.length > 0) {
        const [{ result }] = await chrome.scripting.executeScript({
          target: { tabId: loroTabs[0].id },
          func: () => localStorage.getItem("copiloto:lang:v1") || "es"
        });
        if (result) sttLang = result;
      }
    } catch(err) {
      console.error("No se pudo obtener el idioma", err);
    }

    // Creamos el documento offscreen
    const hasDocument = await chrome.offscreen.hasDocument();
    if (!hasDocument) {
      await chrome.offscreen.createDocument({
        url: "offscreen.html",
        reasons: ["USER_MEDIA"],
        justification: "Capturando audio para Loro Copilot"
      });
    }

    // Le mandamos el streamId y el idioma al offscreen para que arranque la conexión
    chrome.runtime.sendMessage({
      type: "START_CAPTURE",
      streamId: streamId,
      lang: sttLang === "en" ? "en-US" : "es"
    });

    capturingTabId = tab.id;
    chrome.action.setBadgeText({ text: "REC" });
    chrome.action.setBadgeBackgroundColor({ color: "#10b981" });
  });
});

// Reenviamos mensajes del offscreen al content script de localhost:3000
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "DG_MESSAGE") {
    chrome.tabs.query({ url: "http://localhost:3000/*" }, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, msg);
      });
    });
  }
});
