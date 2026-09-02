# 🧩 Extensión de Chrome — Loro Copilot (Modo Captura Local)

La extensión de Chrome permite capturar audio de pestañas (Google Meet, Zoom Web, Teams) sin depender exclusivamente de `getDisplayMedia` en la ventana principal.

---

## 🔒 Política de Seguridad y Origen (Entorno Local)

- **Entorno Soportado:** Desarrollo y pruebas locales (`http://localhost:3000`). La app web en producción utiliza `getDisplayMedia` de forma nativa para captura de pestañas sin requerir extensiones instaladas.
- **Producción:** En producción (`NODE_ENV === "production"`), el backend de `loro-copilot.vercel.app` aplica una estricta política de `verifyOrigin` que bloquea solicitudes sin origen autorizado para evitar abusos o uso no autorizado de tokens STT.
- **Comunicación Segura:** La mensajería interna entre `offscreen.js` y la pestaña web (`content.js`) restringe el `postMessage` al origen exacto de la pestaña (`window.location.origin`) eliminando el uso de `*`.

---

## 🛠️ Estructura de la Extensión

- `manifest.json` — Manifiesto Manifest V3 con permisos de `tabCapture`, `offscreen` y `storage`.
- `background.js` — Service worker que gestiona la creación del documento offscreen y el ciclo de captura de pestaña.
- `offscreen.js` — Contexto aislado de audio que:
  1. Solicita el token temporal efímero a `/api/deepgram-token`.
  2. Conecta el stream PCM16 a `wss://api.deepgram.com/v1/listen`.
  3. Mantiene una ganancia nula (`GainNode` gain 0) para procesar el audio sin generar sidetone ni eco en los altavoces.
  4. Envía los mensajes de transcripción a `content.js`.
- `content.js` — Inyecta los eventos en la sesión web activa.

---

## 📦 Cómo Cargar la Extensión en Chrome (Desarrollo)

1. Abrir Google Chrome e ingresar a `chrome://extensions/`.
2. Activar el **Modo de desarrollador** (esquina superior derecha).
3. Hacer clic en **Cargar descomprimida** (*Load unpacked*).
4. Seleccionar la carpeta `extension/` de este repositorio.
5. Iniciar la app local con `npm run dev` en `http://localhost:3000`.
