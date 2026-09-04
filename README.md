# 🦜 Loro Copilot

**Loro Copilot** es un asistente profesional de entrevistas de trabajo potenciado por IA en tiempo real. Combina captura de audio estéreo de ultra-baja latencia (Deepgram), detección de silencios local (VAD <80ms), anclaje contextual al CV/puesto del candidato mediante RAG dinámico, optimización de Prompt Caching en Edge y sugerencia de respuestas estructuradas ("Punchline First") con modelos de lenguaje de última generación.

---

## 🚀 Características Principales

- **🎧 Audio Dual Simultáneo (Micrófono + Pestaña)**: Captura combinada de tu voz (Canal L) y la del entrevistador (Canal R) con remuestreo estéreo a 16kHz PCM16 en `AudioWorklet`, diarización multicanal exacta en Deepgram y liberación estricta de nodos Web Audio.
- **⏱️ VAD Local y Barge-in Inteligente**: Detección de actividad vocal en `<80ms` con ventana de gracia anti-falsos positivos (4.5s) y umbral de discurso sustancial (>=15 caracteres) para no cortar respuestas involuntariamente.
- **⚡ Prompt Caching (KV-Cache) y Estructura "Punchline First"**: Prefijo estático inmutable para activar caché en DeepSeek/Gemini/Claude y entrega obligatoria del bloque `[KEY]` con 3 palabras clave telegráficas para empezar a hablar en el segundo 1.
- **🎯 Clasificador Temprano de Preguntas**: Categorización instantánea en `<5ms` (*System Design*, *Live Coding / LeetCode*, *Behavioral STAR*, *Fit Cultural*, *Técnico*) inyectando directivas de respuesta específicas.
- **🛡️ Dual Stream Asíncrono de Trampas**: Modelo secundario en segundo plano que detecta preguntas trampa, supuestos ocultos o red flags (`⚠️ TIP TÁCTICO`).
- **🗣️ Modo Bilingüe con Fonética en Vivo (`[EN]`, `[PHO]`, `[ES]`)**: Respuesta en inglés senior, pronunciación fonética simplificada en español con mayúsculas y resumen conceptual.
- **🪟 Teleprompter Flotante con Lectura Biónica**: HUD emergente sincronizado en 0ms con `BroadcastChannel`, chips dorados `[KEY]`, ajuste tipográfico, lectura biónica periférica y botón de pánico (`Escape`) para ocultar la ventana de inmediato.
- **🧠 RAG Dinámico del CV por Proyectos (`cvChunker`)**: Segmenta el perfil y recupera de forma quirúrgica los proyectos relevantes donde usaste las tecnologías de la pregunta.
- **⚖️ Matriz de Trade-offs y Bloque `[WHY_NOT]` en Streaming**: Extracción en tiempo real de alternativas descartadas sin mezclarse con la respuesta principal.
- **🛡️ Filtro Anti-Slop de Grado de Producción**: Eliminación de muletillas de IA formuláicas con protección estricta contra bucles infinitos (`MAX_ITERATIONS = 10`).
- **📊 Speech Coach en Tiempo Real**: Telemetría de habla que mide palabras por minuto (WPM), proporción de escucha vs. habla (*Talk-to-Listen Ratio*) y conteo de muletillas (*fillers*).
- **🤖 Simulador de Entrevistas Interactivo**: Práctica con entrevistador virtual por IA, voz natural (TTS/STT), turnos conversacionales y reporte de desempeño con feedback estructurado.
- **⚡ Múltiples Proveedores de IA y Fallbacks**: Soporte para **DeepSeek Chat / MiMo**, **Gemini Flash**, **GPT-4o Mini**, **Claude Haiku**, con conmutación automática por error en Edge Runtime.
- **🧠 Banco de Memoria Inteligente (<50ms)**: Caché local con sinónimos canónicos (`CANONICAL_SYNONYMS`), aislamiento por empresa y rol (`matchesRole`) y enciclopedia de 107 respuestas maestras (`docs/master_answers_all_roles.md`).
- **🛡️ Máxima Privacidad**: Sin base de datos ni registros obligatorios. El CV y las notas se almacenan en el `localStorage` del usuario y el audio no se graba ni persiste.

---

## 🛠️ Tecnologías

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Edge Runtime)
- **Frontend**: React 18, TypeScript, CSS nativo de alto rendimiento
- **Audio & STT**: Web Audio API, `AudioWorkletProcessor` (PCM16 estéreo), [Deepgram Nova-2](https://deepgram.com/)
- **Modelos de IA**: OpenCode / OpenRouter (DeepSeek, MiMo), Google Gemini, Anthropic Claude, OpenAI GPT
- **Testing**: [Vitest](https://vitest.dev/) (152 tests automatizados en 25 suites)
- **Analytics**: PostHog (fail-safe) + Vercel Analytics

---

## 📚 Centro de Documentación (`docs/`)

Toda la documentación técnica y operativa se encuentra organizada en el directorio [`docs/`](./docs/README.md):

- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) — Diagramas de secuencia Mermaid, pipeline de audio dual y diseño de sistemas.
- [docs/master_answers_all_roles.md](./docs/master_answers_all_roles.md) — Banco maestro universal de 107 preguntas y respuestas en 12 capítulos para todos los CVs.
- [docs/EXTENSION.md](./docs/EXTENSION.md) — Extensión de Chrome Manifest V3 para captura local en desarrollo.
- [docs/LAUNCH.md](./docs/LAUNCH.md) — Estrategia y checklist pre-lanzamiento, límites y antimarketing.
- [docs/BRANCH_PROTECTION.md](./docs/BRANCH_PROTECTION.md) — Reglas recomendadas de protección de ramas en GitHub.

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

Para ejecutar la suite completa de **152 pruebas unitarias automatizadas en 25 suites**:
```bash
npm test
```

Para verificar tipos de TypeScript sin emitir build:
```bash
npx tsc --noEmit
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
│   │   ├── answer/              # Generación streaming con Prompt Caching y Punchline First
│   │   ├── deepgram-token/      # Emisión de grants temporales (TTL 60s)
│   │   ├── simulador/           # Lógica y evaluación del simulador
│   │   └── summary/             # Resumen post-entrevista en Markdown
│   ├── app/                     # Copiloto en vivo principal con soporte Audio Dual
│   ├── components/              # Componentes modulares (AnswerCard, RescuePhrases, etc.)
│   ├── hooks/                   # Custom React hooks (useDeepgram, useAnswerStream, etc.)
│   ├── lib/                     # Utilidades (cvChunker, speechCoach, interviewHelpers, llm)
│   ├── simulador/               # Simulador de entrevistas interactivo
│   └── teleprompter/            # HUD Pop-out con Lectura Biónica y botón Panic
├── docs/                        # Documentación centralizada (Arquitectura, Extensión, Launch)
├── pdf/                         # 12 CVs de referencia en PDF (EN/ES)
├── extension/                   # Extensión de Chrome para captura local
├── public/                      # AudioWorklet estéreo PCM16 (pcm-worklet.js)
└── __tests__/                   # Suite de 152 tests con Vitest (25 suites)
```

---

## 📄 Licencia

Desarrollado para la preparación y acompañamiento en entrevistas técnicas y de liderazgo. Distribuido bajo fines educativos y de validación profesional.
