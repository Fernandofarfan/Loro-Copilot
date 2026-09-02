# 🦜 Loro Copilot

**Loro Copilot** es un asistente profesional de entrevistas de trabajo potenciado por IA en tiempo real. Combina transcripción de ultra-baja latencia (Deepgram), anclaje contextual al CV/puesto del candidato y sugerencia de respuestas inmediatas y estructuradas con modelos de lenguaje de última generación.

---

## 🚀 Características Principales

- **🎙️ Transcripción en Vivo de Ultra-Baja Latencia**: Escucha continua por micrófono o audio de pestaña (Google Meet, Zoom, Teams) con remuestreo en tiempo real a 16kHz PCM16 mediante `AudioWorklet`.
- **🗣️ Modo Bilingüe con Fonética en Vivo (`[EN]`, `[PHO]`, `[ES]`)**: Si el entrevistador habla en inglés, genera la respuesta técnica en inglés, una transcripción fonética simplificada en español para leer de corrido con naturalidad nativa y la traducción conceptual.
- **🪟 Teleprompter Flotante (HUD Stealth)**: Ventana emergente pop-out sincronizada en tiempo real mediante `BroadcastChannel` para ubicar directamente debajo de la webcam y mantener contacto visual.
- **🤖 Simulador de Entrevistas Interactivo**: Modo de práctica con entrevistador virtual por IA, soporte de voz (TTS/STT), turnos conversacionales automáticos y reporte de desempeño con score, fortalezas y áreas de mejora.
- **⚡ Múltiples Proveedores de IA y Fallbacks**: Soporte para **DeepSeek Chat**, **Gemini 2.5 Flash**, **GPT-4o Mini**, **Claude 3.5 Haiku**, con conmutación por error (fallbacks) automática en Edge Runtime.
- **🧠 Análisis Inteligente en Vivo**:
  - Clasificador automático de preguntas (Técnica, STAR/Comportamental, Pretensión Salarial, General).
  - Detector de preguntas trampa/delicadas con tips estratégicos al instante.
  - Frases de rescate rápido ("Ganar tiempo", "Pedir repetición", "Clarificar", "Cierre seguro").
  - Banco de memoria inteligente con caché instantánea (<50ms) y autoaprendizaje.
- **🛡️ Máxima Privacidad**: Sin base de datos ni registros obligatorios. El CV y las notas se almacenan en el `localStorage` del usuario y el audio no se graba ni persiste.

---

## 🛠️ Tecnologías

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Edge Runtime)
- **Frontend**: React 18, TypeScript, CSS nativo de alta performance
- **Audio & STT**: Web Audio API, `AudioWorkletProcessor` (PCM16), [Deepgram Nova-2](https://deepgram.com/)
- **Modelos de IA**: OpenCode / OpenRouter (DeepSeek), Google Gemini, Anthropic Claude, OpenAI GPT
- **Testing**: [Vitest](https://vitest.dev/)
- **Analytics**: PostHog (fail-safe) + Vercel Analytics

---

## 📦 Instalación y Configuración Local

### Requisitos previos
- Node.js 18.x o superior
- Claves de API de Deepgram y de tu proveedor de LLM preferido (Gemini / OpenRouter / OpenAI / Anthropic)

### 1. Clonar el repositorio e instalar dependencias
```bash
git clone https://github.com/Fernandofarfan/Loro-Copilot.git
cd Loro-Copilot
npm install
```

### 2. Configurar variables de entorno
Crea tu archivo local copiando el ejemplo:
```bash
cp .env.example .env.local
```

Completa al menos las claves esenciales en `.env.local`:
```env
DEEPGRAM_API_KEY="tu_clave_de_deepgram"
OPENCODE_API_KEY="tu_clave_de_opencode_o_openrouter"
# o alternativamente:
GEMINI_API_KEY="tu_clave_de_gemini"
```

### 3. Ejecutar en desarrollo
```bash
npm run dev
```
Abre [http://localhost:3000](http://localhost:3000) en tu navegador (recomendado Google Chrome).

---

## 🧪 Tests y Validación

Para ejecutar la suite completa de pruebas unitarias:
```bash
npm test
```

Para verificar tipos de TypeScript sin emitir build:
```bash
npm run typecheck
```

Para compilar el build de producción:
```bash
npm run build
```

---

## 🔐 Variables de Entorno

| Variable | Requerida | Propósito |
|---|:---:|---|
| `DEEPGRAM_API_KEY` | **Sí** | Transcripción streaming con Nova-2. |
| `OPENCODE_API_KEY` / `OPENROUTER_API_KEY` | Opcional | Clave para modelos OpenCode / OpenRouter (MiMo, DeepSeek, GPT). |
| `GEMINI_API_KEY` | Opcional | Clave para modelos Gemini Flash. |
| `ANTHROPIC_API_KEY` | Opcional | Clave para modelos Claude. |
| `OPENAI_API_KEY` | Opcional | Clave para modelos OpenAI. |
| `LLM_PROVIDER` | No | Override de proveedor por defecto (`opencode`, `gemini`, `anthropic`, `openai`). |
| `NEXT_PUBLIC_POSTHOG_KEY` | No | Clave de proyecto para telemetría PostHog. |
| `NEXT_PUBLIC_SITE_URL` | No | URL pública para metadatos OG y referer headers. |

---

## 📂 Estructura del Proyecto

```text
loro/
├── app/
│   ├── api/                     # Rutas API en Edge Runtime
│   │   ├── answer/              # Generación streaming de respuestas
│   │   ├── deepgram-token/      # Emisión de grants temporales (TTL 60s)
│   │   ├── simulador/           # Lógica y evaluación del simulador
│   │   └── summary/             # Resumen post-entrevista en Markdown
│   ├── app/                     # Copiloto en vivo principal
│   ├── components/              # Componentes modulares (AnswerCard, Icons, etc.)
│   ├── copiloto/                # Landing del Copiloto
│   ├── hooks/                   # Custom React hooks (useInterviewContext)
│   ├── lib/                     # Utilidades (LLM streaming, seguridad, helpers)
│   ├── mock/                    # Landing del Simulador
│   ├── simulador/               # Simulador de entrevistas interactivo
│   ├── teleprompter/            # HUD Pop-out para cámara
│   ├── Hub.tsx                  # Vista principal de selección de modo
│   └── page.tsx                 # Home / Landing principal
├── extension/                   # Extensión de Chrome para captura en segundo plano
├── public/                      # Assets estáticos y AudioWorklet (pcm-worklet.js)
└── __tests__/                   # Suite de tests con Vitest
```

---

## 📄 Licencia

Desarrollado para la preparación y acompañamiento en entrevistas técnicas y de liderazgo. Distribuido bajo fines educativos y de validación profesional.

