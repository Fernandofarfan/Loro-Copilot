# 🧩 Extensión de Chrome — Loro Copilot

Este directorio (`extension/`) contiene la extensión complementaria para Google Chrome, diseñada para capturar audio de pestañas y llamadas en segundo plano sin interrumpir la navegación.

---

## 🎯 ¿Para qué sirve?

Al utilizar la versión web de Loro Copilot, compartir audio mediante `getDisplayMedia` requiere seleccionar la pestaña activa. La extensión de Chrome permite:
1. **Captura Directa de Audio de Pestaña:** Utiliza `chrome.tabCapture` y la API de **Offscreen Documents** para capturar el stream de audio de Google Meet o Zoom.
2. **Streaming a Deepgram en Background:** Procesa el audio y lo reenvía directamente vía WebSocket, reduciendo la carga del hilo principal de la pestaña.
3. **Comunicación con la Web App:** Envía los mensajes transcriptos a la aplicación web (`window.postMessage` con tipo `LORO_EXT_DG_MESSAGE`).

---

## 📂 Estructura de la Extensión

```text
extension/
├── manifest.json       # Manifiesto Manifest V3 con permisos de audio y offscreen
├── background.js       # Service worker principal que gestiona el ciclo de vida
├── content.js          # Script inyectado para hacer puente de mensajes con la web
├── offscreen.html      # Documento offscreen para reproducir/capturar AudioContext
└── offscreen.js        # Lógica de conexión WebSocket y procesamiento PCM
```

---

## 🛠️ Cómo Instalarla en Modo Desarrollador

1. Abre Google Chrome y navega a `chrome://extensions/`.
2. Activa el interruptor **Modo de desarrollador** (esquina superior derecha).
3. Haz clic en el botón **Cargar descomprimida** (*Load unpacked*).
4. Selecciona la carpeta `extension/` dentro de este repositorio.
5. Abre [https://loro-copilot.vercel.app/app](https://loro-copilot.vercel.app/app) o tu entorno local `http://localhost:3000/app` para comenzar a utilizarla.
