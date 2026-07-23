chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "DG_MESSAGE") {
    // Reenviamos el mensaje de la extensión al código React
    window.postMessage({ type: "LORO_EXT_DG_MESSAGE", data: msg.data }, "*");
  }
});
