# AGENTS.md

Contexto para agentes de IA que trabajen en este repo.

## Qué es esto

**Loro Copilot** — herramienta **personal** de Guillermo Fernando Farfán Romero (no un producto multi-usuario). Escucha la entrevista por micrófono, audio de pestaña (Meet/Zoom) o **Audio Dual** (mic = candidato, pestaña/VB-CABLE = entrevistador), transcribe con Deepgram Nova-2 multicanal y genera respuestas ancladas a su CV y al banco Globant.

Uso actual: preparación del screening **Globant / Intermedia** (GCP Cloud Engineer, Marian Francheska Escalona, ~45 min, salto a inglés, GCP / GCVE / Terraform). El perfil (Salta, Luna, +8 años IT / ~4 años cloud, $4.000 USD / $25–30/h) está hardcodeado **a propósito**.

Deploy: Next.js 14 (App Router) en Vercel, proyecto `loro-copilot`. URL: `https://loro-copilot.vercel.app`.

### Capacidades reales (cableadas)

Teleprompter HUD pop-out (lectura biónica, Panic `Escape`, camuflaje IDE/Terminal, pacer ~135 WPM), bloques `[EN]` / `[PHO]` / `[ES]` / `[KEY]`, Dual Stream de trampas (`mode: "trap_detector"`), memoria léxica &lt;50 ms, simulador con evaluación JSON, multi-modelo (`opencode`, `gemini`, `anthropic`, `openai`).

### No inventar / no “arreglar” como si faltara producto

- **No parametrizar la identidad** ni sacar Luna / Salta / tarifa del system prompt: es el candidato.
- **No** hay auth, billing, ni DB. Persistencia = `localStorage`.
- Speech Coach **en vivo en `/app` no está**: `app/lib/speechCoach.ts` + tests sí; `analyzeSpeech` no se importa en el copiloto. El simulador usa `countFillers`.
- “Prompt Caching / KV-Cache”: solo prefijo estático al inicio del user prompt. Sin APIs de cache de proveedores.
- Extensión Chrome: código en `extension/`; la app **no** consume `LORO_EXT_DG_MESSAGE`.
- Company dossier: **9 empresas**, no 20+.
- RAG: ranking léxico + recencia en `cvChunker.ts`, no embeddings.
- Gaze tracker: heurística de luminosidad ~4 FPS, no ML.
- Glassdoor/Blind: pegado de texto, no scraping.
- No hay `.github/workflows/ci.yml`. Antes de push a `main`: `npm test` y `npx tsc --noEmit`.

## Cómo correrlo y probarlo

```bash
npm install
cp .env.example .env.local   # DEEPGRAM_API_KEY y OPENCODE_API_KEY / GEMINI_API_KEY
npm run dev
```

### Comandos de validación

- **Tests unitarios:** `npm test` — Vitest, **207 tests en 26 archivos** de `__tests__/`.
- **Tipos:** `npx tsc --noEmit`.
- **Build:** `npm run build`.
- **E2E:** `npm run test:e2e` — Playwright smoke (título, URLs, waitlist 400). No cubre audio/SSE/HUD. No corre en CI.

## Estructura de archivos

- `app/app/page.tsx` — Copiloto en vivo: audio dual (hardware/VB-CABLE), barge-in ~4.5 s, hotkeys `F2`/`F3`/`F4`/`` ` ``, Screen Vision `Ctrl+Shift+S` (re-pide `getDisplayMedia` en cada captura), Susurro al Oído, Cierre de Oro, Eye Coach (luminosidad), Fact Ledger, Radar CV, paste Glassdoor/Blind, scorecard, STAR, preset **Activar Entrevista Globant**, Deepgram + HUD.
- `app/simulador/page.tsx` — Simulador: personalidades FAANG, gimnasio 25 s, pushback, radar CV, espejo acústico + `countFillers`, inyección de JD, TTS, feedback. Gate de email al ver el reporte.
- `app/teleprompter/page.tsx` — HUD: Jeff Dean pills, YAGNI, alineación webcam, modo `T`, puente anti-silencio, trigger cards, fonética, camuflaje IDE/Terminal, `documentPictureInPicture`, biónica, pacer, `[WHY_NOT]` / `[EDGE_CASES]` / dry-run, Panic `Escape` vía `BroadcastChannel` + `localStorage`.
- `app/components/` — `AnswerCard`, `ArchitectureCanvas`, `RescuePhrases`, etc.
- `app/hooks/useInterviewContext.ts` — Perfiles, `interviewerBio`, `masterAnswers`, `starStories` en `localStorage`.
- `app/hooks/useDeepgram.ts` — WS Deepgram, mic/tab/dual, worklet PCM16, VAD, barge-in ≥15 chars, reconnect (máx. 3), prefetch especulativo.
- `app/hooks/useAnswerStream.ts` — SSE, `getInstantBridge`, trigger cards, fonética, punchline, trap detector, Fact Ledger, STAR, anti-slop, visión.
- `app/hooks/useTeleprompter.ts` — Pop-out HUD y sync.
- `app/hooks/useScreenVision.ts` — Un frame WebP por captura; no es share persistente.
- `app/hooks/useEarbudWhisper.ts` — TTS 1.5x del punchline. Riesgo: puede fugarse al mic de la call si el output no está en auricular.
- `app/hooks/useGazeTracker.ts` — Luminosidad vertical de webcam, privado en el browser.
- `app/api/answer/route.ts` — SSE Edge: transpile, 2 oraciones / 25–35 palabras, `interviewerBio`, `[DRY_RUN]`, `[EDGE_CASES]`, `[WHY_NOT]`, clasificación de pregunta, dossier de empresa, Fact Ledger, STAR, visión, reverse questions, trap detector. Prefijo de prompt ordenado (no KV-Cache de proveedor).
- `app/api/deepgram-token/route.ts` — Grant Deepgram **TTL 120 s**. Nunca expone la API key permanente en prod.
- `app/api/simulador/route.ts` — Preguntas por personalidad + `pushbackMode` + feedback JSON.
- `app/api/waitlist/route.ts` — Google Form + rate limit.
- `app/api/summary/route.ts` — Scorecard FAANG + post-mortem + thank-you note.
- `app/lib/globantMasterAnswers.ts` — Banco maestro Globant/GCP/GCVE + enciclopedia base (preset 1-click).
- `app/lib/companyDossier.ts` — **9** empresas (Globant/Intermedia incluido).
- `app/lib/cvChunker.ts` — Chunking + ranking léxico/recencia (RAG local, sin embeddings).
- `app/lib/speechCoach.ts` — `analyzeSpeech` / `countFillers`. Cableado: simulador (`countFillers`) y tests. No el copiloto live.
- `app/lib/security.ts` — `verifyOrigin`, rate limit in-memory (Upstash si hay env), `CAPACITY_CLOSED`.
- `app/lib/interviewHelpers.ts` — Puente, fonética, trigger cards, `classifyQuestionType`, parser de bloques, `findMatchingAnswer`.
- `app/lib/track.ts` — Analytics fail-safe. PostHog si hay key.
- `public/pcm-worklet.js` — Downsample PCM16 16 kHz estéreo, RMS, filtro, noise gate, VAD.
- `extension/` — MV3 localhost. **No integrada** con Next.
- `docs/` — ver `docs/README.md`.
- `__tests__/` — 26 archivos, 207 tests: `antiSlopFilter`, `codeEvaluator`, `companyDossier`, `cvChunker`, `deepgramToken`, `excalidrawExport`, `factLedger`, `firmnessAndStarMatch`, `gazeTracker`, `interviewHelpers`, `llm`, `mermaidParser`, `parseBlocks`, `salaryNegotiation`, `screenVision`, `security`, `simuladorPersonas`, `speechCoach`, `starStories`, `tacticalImprovements`, `timelineRAG`, `useAnswerStream`, `useDeepgram`, `useInterviewContext`, `useTeleprompter`, `vulnerabilityRadar`.

## Convenciones de código

- **Comentarios en español**: solo el “por qué” no obvio. No comentar lo evidente.
- **Analytics**: `track()` / `identify()` en `app/lib/track.ts`. Eventos `snake_case`.
- **Disparo de respuestas**: manual o por fin de turno (`UtteranceEnd` / VAD), controlado por el usuario.
- **Runtime `edge`**: `export const runtime = "edge"` en `app/api/`. Sin `fs` / `net`.
- **Seguridad**: toda ruta API nueva llama `verifyOrigin(req)` y `checkRateLimit(req)`.

## Variables de entorno

| Variable | Requerida | Qué hace |
|---|:---:|---|
| `DEEPGRAM_API_KEY` | Sí | Transcripción Nova-2. Grant al cliente TTL 120 s. |
| `OPENCODE_API_KEY` / `OPENROUTER_API_KEY` | No | OpenCode / OpenRouter. |
| `GEMINI_API_KEY` | No | Gemini Flash. |
| `ANTHROPIC_API_KEY` | No | Claude. |
| `OPENAI_API_KEY` | No | GPT y TTS del simulador. |
| `LLM_PROVIDER` | No | Override de proveedor. |
| `NEXT_PUBLIC_POSTHOG_KEY` | No | PostHog. |
| `NEXT_PUBLIC_SITE_URL` | No | Allowlist de Origin. |
| `CAPACITY_CLOSED` | No | `1` cierra answer/token con 503. |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | No | Rate limit global; si no, Map por isolate. |
| `GFORM_ACTION` | No | Waitlist. |

## Flujo de deploy

- `main` despliega a producción en Vercel al hacer `git push`.
- Correr `npm test` y `npx tsc --noEmit` antes de pushear. No hay GitHub Actions.

## Perfil del candidato y reglas de experiencia

- **Nombre completo:** Guillermo Fernando Farfán Romero
- **Ubicación:** Salta, Argentina (UTC-3), disponible remoto.
- **Contacto:** +54 9 11 2187-1473 | `fernando.farfan16@gmail.com` | [gfarfan.dev](https://gfarfan.dev/) | [LinkedIn](https://www.linkedin.com/in/guillermo-farfan/) | [Credly](https://www.credly.com/users/fernando-farfan.855a5067/badges)
- **Nivel de inglés:** B2 Profesional / fluido técnico y de negocios.
- **Pretensión salarial de referencia:** $4,000 USD bruto / mes (o ~$25–$30+ USD/hora contractor).
- **Regla ESTRICTA de años de experiencia:**
  - **TOTAL en IT / Software / Sistemas:** +8 años (desarrollo, backend, arquitectura, bases de datos, troubleshooting).
  - **ESPECÍFICA en Infraestructura Cloud / Linux / DevOps:** **~4 años** (GCP, GKE, Terraform, Ansible, Docker, Bash, Linux sysadmin/hardening).
  - **NUNCA afirmar "8 años en infraestructura / DevOps / GCP"**: discriminar +8 de base vs ~4 dedicados a cloud.
- **Mascota:** perrita rescatada y adoptada **Luna**. Compañera de remoto en Salta. **NUNCA mencionar gatos.**

## Estándar de respuestas habladas (Zero-Bullet Mandate)

- **Un solo párrafo de exactamente 2 oraciones (25–35 palabras):**
  - **Oración 1 (10–14 palabras):** veredicto (*Answer / Punchline*).
  - **Oración 2 (12–16 palabras):** razón / patrón / trade-off (*Why / Solution*).
- **PROHIBIDO** viñetas (`•`, `- `, `*`) o listas (`1.`, `2.`) en `[EN]` y `[ES]`.
- **PROHIBIDO** inventar porcentajes o métricas en el inglés hablado.

## Invariantes Python y Unix

- Claves de dict: inmutables/hashables. `set` no puede ser clave; usar `frozenset`.
- Tipado nativo 3.9+ (`list[int]`, `dict[str, Any]`) no `typing.List`.
- `@pytest.fixture` con `yield` para teardown.
- `chmod +x`, `pgrep -fl` / `ps aux | grep`, `lsof -i :8000` / `ss -tulpn`.
