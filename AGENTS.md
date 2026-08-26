# AGENTS.md

Contexto para agentes de IA (Claude Code, Cursor, Antigravity, etc.) que trabajen en este repo.

## Qué es esto

**Loro Copilot** — asistente profesional de entrevistas con IA en tiempo real. Escucha la entrevista por micrófono o audio de pestaña (Meet/Zoom), transcribe en vivo con Deepgram y, al dispararse el turno ("Responder"), genera respuestas inmediatas con LLM ancladas al CV, empresa y puesto del usuario.

Incluye modo de **Teleprompter HUD pop-out**, **asistencia bilingüe directa (`[EN]`, `[ES]`)**, **Banco de Memoria Inteligente y Caché Instantánea (<50ms)**, **simulador de entrevistas con evaluación automatizada** y soporte multi-modelo (`opencode`, `gemini`, `anthropic`, `openai`).

Deploy: Next.js 14 (App Router) en Vercel. Proyecto: `loro-copilot`. URL de producción: `https://loro-copilot.vercel.app`.

## Cómo correrlo y probarlo

```bash
npm install
cp .env.example .env.local   # Completar al menos DEEPGRAM_API_KEY y OPENCODE_API_KEY / GEMINI_API_KEY
npm run dev
```

### Comandos de Validación
- **Tests unitarios:** `npm test` (ejecuta [Vitest](https://vitest.dev/) con suite completa en `__tests__/`).
- **Chequeo de tipos:** `npx tsc --noEmit`.
- **Build de producción:** `npm run build`.

## Estructura de Archivos

- `app/app/page.tsx` — Vista principal del Copiloto en vivo (estado de audio, WebSocket a Deepgram con endpointing rápido de 800ms, renderizado en streaming, banco de memoria instantánea, sincronización con Teleprompter).
- `app/simulador/page.tsx` — Simulador interactivo de entrevistas (Avatar, TTS con Web Speech API, reporte de métricas y feedback).
- `app/teleprompter/page.tsx` — HUD flotante ultraliviano para ubicar debajo de la webcam; sincronizado vía `BroadcastChannel` y `localStorage`.
- `app/components/` — Componentes modulares de UI (`AnswerCard`, `RescuePhrases`, `Dropdown`, `Icons`, `InfoTip`, `ListenText`, `MarkdownText`).
- `app/hooks/useInterviewContext.ts` — Hook reutilizable para gestión y persistencia de perfiles, contexto y banco de respuestas maestras (`masterAnswers`).
- `app/api/answer/route.ts` — Generación de respuestas con streaming SSE y soporte multi-modelo (`MiMo`, `DeepSeek`, `GLM`, `GPT`, `Gemini`, `Claude`).
- `app/api/deepgram-token/route.ts` — Emisión de token temporal (grant de 60s) para aislar la API key permanente de Deepgram.
- `app/api/simulador/route.ts` — Generador de preguntas dinámicas y feedback estructurado JSON.
- `app/api/summary/route.ts` — Generador de resumen post-entrevista en Markdown.
- `app/lib/llm.ts` — Clientes HTTP y parsers SSE para cada provider con timeouts (`AbortController`) y fallback inteligente.
- `app/lib/security.ts` — Verificación de `Origin`/`Referer` y Rate Limiter en memoria.
- `app/lib/interviewHelpers.ts` — Clasificador de preguntas, detector de preguntas trampa, parser de bloques (`[EN]`, `[ES]`) y motor de búsqueda de memoria `findMatchingAnswer()`.
- `app/lib/track.ts` — Wrapper fail-safe de analytics (`track()`, `identify()`).
- `public/pcm-worklet.js` — AudioWorklet para remuestreo y conversión de Float32 a Int16 (PCM16 16kHz).
- `__tests__/` — Tests unitarios automatizados (`interviewHelpers`, `llm`, `parseBlocks`, `security`).

## Convenciones de Código

- **Comentarios en español**: Solo para el "por qué" no obvio (constraints, decisiones de producto, workarounds). No comentar lo evidente.
- **Analytics**: Siempre a través de `track()` / `identify()` de `app/lib/track.ts`. Nombres de eventos en `snake_case` (ej. `answer_requested`).
- **Disparo de respuestas**: Tanto manual como automático por detección de fin de turno (`UtteranceEnd`), controlado por el usuario.
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

