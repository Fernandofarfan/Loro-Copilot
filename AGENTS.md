# AGENTS.md

Contexto para agentes de IA (Claude Code, Cursor, Antigravity, etc.) que trabajen en este repo.

## Qué es esto

**Loro Copilot** — asistente profesional de entrevistas con IA en tiempo real. Escucha la entrevista por micrófono, audio de pestaña (Meet/Zoom) o en modo de **Audio Dual Simultáneo** (Micrófono para vos + Pestaña para el entrevistador), transcribe en vivo con Deepgram multicanal y, al detectarse el turno o silencio local (VAD <80ms), genera respuestas inmediatas con LLM ancladas al CV mediante RAG dinámico, empresa y puesto del usuario.

Incluye modo de **Teleprompter HUD pop-out con Lectura Biónica y botón Panic (`Escape`)**, **asistencia bilingüe directa (`[EN]`, `[PHO]`, `[ES]`) con estructura Punchline First (`[KEY]`)**, **Dual Stream para detección de preguntas trampa en segundo plano**, **Banco de Memoria Inteligente (<50ms)**, **Speech Coach en vivo (WPM, balance de habla y muletillas)**, **simulador de entrevistas con evaluación automatizada** y soporte multi-modelo (`opencode`, `gemini`, `anthropic`, `openai`) con optimización de **Prompt Caching en Edge**.

Deploy: Next.js 14 (App Router) en Vercel. Proyecto: `loro-copilot`. URL de producción: `https://loro-copilot.vercel.app`.

## Cómo correrlo y probarlo

```bash
npm install
cp .env.example .env.local   # Completar al menos DEEPGRAM_API_KEY y OPENCODE_API_KEY / GEMINI_API_KEY
npm run dev
```

### Comandos de Validación
- **Tests unitarios:** `npm test` (ejecuta [Vitest](https://vitest.dev/) con suite completa de 115 tests en `__tests__/`).
- **Chequeo de tipos:** `npx tsc --noEmit`.
- **Build de producción:** `npm run build`.

## Estructura de Archivos

- `app/app/page.tsx` — Vista principal del Copiloto en vivo (soporte Audio Dual 🎧, vúmetro estéreo, Screen Vision `Ctrl+Shift+S`, Susurro al Oído, Cierre de Oro `Ctrl+Shift+Q`, WebSocket a Deepgram, renderizado en streaming, banco de memoria instantánea, RAG de CV, sincronización con Teleprompter y atajos `Ctrl+1`/`Ctrl+2`).
- `app/simulador/page.tsx` — Simulador interactivo de entrevistas (Avatar, TTS con Web Speech API, reporte de métricas y feedback).
- `app/teleprompter/page.tsx` — HUD flotante ultraliviano para ubicar debajo de la webcam; modo Always-on-Top nativo (`documentPictureInPicture`), control de opacidad stealth, Lectura Biónica, chips `[KEY]`, alerta de trampas, botón Panic (`Escape`) sincronizado vía `BroadcastChannel` y `localStorage`.
- `app/components/` — Componentes modulares de UI (`AnswerCard` con badges de validación de código Big-O, `RescuePhrases`, `Dropdown`, `Icons`, `InfoTip`, `ListenText`, `MarkdownText`).
- `app/hooks/useInterviewContext.ts` — Hook reutilizable para gestión y persistencia de perfiles, contexto y banco de respuestas maestras (`masterAnswers`).
- `app/hooks/useDeepgram.ts` — Hook modular para ciclo de vida de WebSocket, captura de audio (mic/tab/dual), remuestreo estéreo AudioWorklet PCM16, VAD local, barge-in y trigger de generación especulativa en turnos largos.
- `app/hooks/useAnswerStream.ts` — Hook para streaming SSE de respuestas con pre-fetching especulativo, Punchline First (`keyWords`), callback de susurro `onPunchline`, Dual Stream de trampas en background, soporte multimodal/visión y generador de preguntas.
- `app/hooks/useTeleprompter.ts` — Hook para pop-out de ventana HUD y sincronización en tiempo real vía `BroadcastChannel` y `localStorage`.
- `app/hooks/useScreenVision.ts` — Captura de pantalla en WebP ultraliviano y Live OCR multimodal para LeetCode y diagramas de arquitectura (`Ctrl+Shift+S`).
- `app/hooks/useEarbudWhisper.ts` — Modo "Susurro al Oído" con sintetizador Web Speech API acelerado (1.5x) para dictado privado del punchline en auricular.
- `app/api/answer/route.ts` — Generación de respuestas con streaming SSE, Prompt Caching (KV-Cache), Punchline First, clasificación temprana de preguntas, Spanglish técnico, soporte multimodal para Vision Coding (`mode: "vision_coding"`), modo Cierre de Oro (`type: "reverse_questions"`) y detector de trampas en background (`mode: "trap_detector"`).
- `app/api/deepgram-token/route.ts` — Emisión de token temporal (grant de 60s) para aislar la API key permanente de Deepgram.
- `app/api/simulador/route.ts` — Generador de preguntas dinámicas y feedback estructurado JSON.
- `app/api/waitlist/route.ts` — Captura y registro de lista de espera con rate limiting.
- `app/api/summary/route.ts` — Generador de resumen post-entrevista en Markdown.
- `app/lib/cvChunker.ts` — Grafo temporal y segmentación semántica de CV con ranking por recencia, seniority (`Architect`/`Lead`/`Senior`), métricas cuantitativas y recuperación quirúrgica (RAG local).
- `app/lib/codeEvaluator.ts` — Validador sintáctico estático del lado cliente (JS/TS/Python), verificación de indentación, balance de delimitadores y extracción de complejidades Big-O (tiempo y espacio).
- `app/lib/speechCoach.ts` — Análisis de telemetría de habla: cálculo de WPM, ratio de escucha/habla y conteo de muletillas (*fillers*).
- `app/lib/llm.ts` — Clientes HTTP y parsers SSE para cada provider (Gemini, OpenCode, Anthropic, OpenAI) con soporte multimodal (`image`), timeouts (`AbortController`) y fallback inteligente.
- `app/lib/security.ts` — Verificación de `Origin`/`Referer` y Rate Limiter en memoria con lazy cleanup.
- `app/lib/interviewHelpers.ts` — Clasificador temprano de preguntas (`classifyQuestionType`), detector de preguntas trampa, parser de bloques (`[KEY]`, `[EN]`, `[PHO]`, `[ES]`), sinónimos canónicos (`CANONICAL_SYNONYMS`), aisladores `matchesCompany()` / `matchesRole()` y motor de búsqueda de memoria `findMatchingAnswer()`.
- `app/lib/track.ts` — Wrapper fail-safe de analytics (`track()`, `identify()`).
- `public/pcm-worklet.js` — AudioWorklet para remuestreo y conversión de Float32 a PCM16 16kHz estéreo con cálculo RMS y VAD local.
- `docs/` — Centro de documentación técnica:
  - `docs/ARCHITECTURE.md` — Mapeo completo del flujo de datos, diagramas de secuencia Mermaid y especificación de las 8 capacidades avanzadas.
  - `docs/master_answers_all_roles.md` — Enciclopedia universal de 107 preguntas y respuestas en 12 capítulos para todos los CVs.
  - `docs/EXTENSION.md` — Extensión de Chrome para captura local en desarrollo.
  - `docs/LAUNCH.md` — Checklist de lanzamiento y antimarketing.
  - `docs/BRANCH_PROTECTION.md` — Reglas de protección de ramas en GitHub.
- `__tests__/` — Suite de 115 tests unitarios automatizados (`interviewHelpers`, `cvChunker`, `speechCoach`, `llm`, `parseBlocks`, `security`, `deepgramToken`, `useAnswerStream`, `useInterviewContext`, `useDeepgram`, `useTeleprompter`, `codeEvaluator`, `timelineRAG`, `screenVision`).

## Convenciones de Código

- **Comentarios en español**: Solo para el "por qué" no obvio (constraints, decisiones de producto, workarounds). No comentar lo evidente.
- **Analytics**: Siempre a través de `track()` / `identify()` de `app/lib/track.ts`. Nombres de eventos en `snake_case` (ej. `answer_requested`).
- **Disparo de respuestas**: Tanto manual como automático por detección de fin de turno (`UtteranceEnd` / VAD local), controlado por el usuario.
- **Runtime `edge`**: Mantener `export const runtime = "edge"` en todas las rutas de `app/api/`. Evitar módulos exclusivos de Node.js (como `fs` o `net`).
- **Seguridad**: Toda nueva ruta de API debe invocar `verifyOrigin(req)` y `checkRateLimit(req)`.

## Variables de Entorno

| Variable | Requerida | Qué hace |
|---|:---:|---|
| `DEEPGRAM_API_KEY` | Sí | Transcripción en streaming con Deepgram Nova-2. |
| `OPENCODE_API_KEY` / `OPENROUTER_API_KEY` | No | Modelos de OpenCode / OpenRouter (MiMo, DeepSeek, GLM, GPT Luna). |
| `GEMINI_API_KEY` | No | Modelos Google Gemini Flash. |
| `ANTHROPIC_API_KEY` | No | Modelos Anthropic Claude. |
| `OPENAI_API_KEY` | No | Modelos OpenAI GPT. |
| `LLM_PROVIDER` | No | Override de proveedor predeterminado (`opencode`, `gemini`, etc.). |
| `NEXT_PUBLIC_POSTHOG_KEY` | No | Telemetría PostHog en cliente. |

## Flujo de Deploy

- La rama `main` despliega automáticamente a producción en Vercel al hacer `git push`.
- Asegurarse de correr `npm test` y `npx tsc --noEmit` antes de pushear cambios a `main`.
