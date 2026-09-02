chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "DG_MESSAGE") {
    // Reenviamos el mensaje de la extensión a la pestaña web restringiendo al origen actual
    window.postMessage({ type: "LORO_EXT_DG_MESSAGE", data: msg.data }, window.location.origin);
  }
});
