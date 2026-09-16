# Extensión de Chrome — captura local (no integrada)

La carpeta `extension/` es un companion Manifest V3 para capturar audio de pestañas (Meet / Zoom Web / Teams) en **desarrollo** (`http://localhost:3000`), sin depender solo de `getDisplayMedia` en la ventana del copiloto.

**Estado:** el código existe. La app Next **no escucha** `LORO_EXT_DG_MESSAGE`. En producción el copiloto usa `getDisplayMedia` / VB-CABLE vía `useDeepgram.ts`. No instalar esto para la entrevista Globant salvo que se cablee el listener.

---

## Seguridad

- Pensada para localhost. En prod, `verifyOrigin` bloquea orígenes no allowlisteados.
- `content.js` hace `postMessage` al origen de la pestaña (`window.location.origin`), no a `*`.

---

## Archivos

- `manifest.json` — MV3: `tabCapture`, `offscreen`, `storage`.
- `background.js` — service worker, documento offscreen, ciclo de captura.
- `offscreen.js` — pide grant a `/api/deepgram-token` (TTL 120 s), WS PCM16 a Deepgram, `GainNode` en 0 (sin sidetone).
- `content.js` — reenvía transcripciones a la página con `type: "LORO_EXT_DG_MESSAGE"`. **Ningún hook de Next las consume.**

---

## Cargar en Chrome (solo si se va a integrar)

1. `chrome://extensions/` → Modo desarrollador → Cargar descomprimida → carpeta `extension/`.
2. `npm run dev` en `http://localhost:3000`.
3. Hasta que `/app` escuche el mensaje, la transcripción de la extensión no llega al copiloto.
