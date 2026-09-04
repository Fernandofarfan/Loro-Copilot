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
- **Tests unitarios:** `npm test` (ejecuta [Vitest](https://vitest.dev/) con suite completa de 152 tests en 25 suites de `__tests__/`).
- **Chequeo de tipos:** `npx tsc --noEmit`.
- **Build de producción:** `npm run build`.

## Estructura de Archivos

- `app/app/page.tsx` — Vista principal del Copiloto en vivo (soporte Audio Dual 🎧 con selector de hardware/VB-CABLE, ventana de gracia de 4.5s anti-falsos positivos en Barge-in, Hotkeys sigilosos `F2`/`F3`/`F4`/`` ` ``, Screen Vision multimodal `Ctrl+Shift+S`, Susurro al Oído, Cierre de Oro, Eye Coach, Fact Ledger badge, Radar de Vulnerabilidades del CV, Inyector de preguntas Glassdoor/Blind en Memoria (<50ms), Scorecard Predictor FAANG con Análisis Forense Post-Mortem, Bóveda de Historias STAR reales, Sugeridor Automático de Historias STAR con auto-match heurístico, Detector de Desafíos de Firmeza (Have Backbone), Dossier & Perfil Psicológico del Entrevistador (Pre-Interview Intel), WebSocket a Deepgram y sincronización con HUD).
- `app/simulador/page.tsx` — Simulador interactivo de entrevistas (Avatar, selector de personalidades del entrevistador FAANG, Radar de Vulnerabilidades Red Team integrado, TTS con Web Speech API, reporte de métricas y feedback).
- `app/teleprompter/page.tsx` — HUD flotante ultraliviano para ubicar debajo de la webcam; Modo Camuflaje "IDE (VS Code) / Terminal (Linux Bash)" para compartir pantalla sin sospechas, modo Always-on-Top nativo (`documentPictureInPicture`), control de opacidad stealth, Lectura Biónica, Karaoke Speech Pacer a ~135 WPM, Cheat Sheet de Números de System Design (Jeff Dean numbers), detector de silencio incómodo (>3.5s) con frase puente flotante, matriz de trade-offs `[WHY_NOT]`, casos borde `[EDGE_CASES]`, tabla de Dry-Run Stepper paso a paso, alerta visual de Have Backbone, sugeridor flotante de historias STAR coincidentes, chips `[KEY]`, botón Panic (`Escape`) sincronizado vía `BroadcastChannel` y `localStorage`.
- `app/components/` — Componentes modulares de UI (`AnswerCard` con badges de validación Big-O, Fast-Transpiler Multilenguaje Instantáneo a Go/Python/TS/Java/C++, Dry-Run Stepper de ejecución paso a paso, banner Have Backbone, bloques `[EDGE_CASES]` y `[WHY_NOT]`, y `ArchitectureCanvas` SVG/Excalidraw para System Design, `RescuePhrases`, `Dropdown`, `Icons`, `InfoTip`, `ListenText`, `MarkdownText`).
- `app/components/ArchitectureCanvas.tsx` — Canvas interactivo que renderiza diagramas de flujo y arquitectura a partir de bloques `[MERMAID]`, con exportación 1-click a Excalidraw ("📋 Copiar a Excalidraw") y descarga SVG vectorizado ("💾 Descargar SVG").
- `app/hooks/useInterviewContext.ts` — Hook reutilizable para gestión y persistencia de perfiles, contexto, Dossier Psicológico del Entrevistador (`interviewerBio`), banco de respuestas maestras (`masterAnswers`) y Bóveda de Historias STAR reales (`starStories`).
- `app/hooks/useDeepgram.ts` — Hook modular para ciclo de vida de WebSocket, captura de audio (mic/tab/dual) con soporte de deviceId físico y virtual (VB-CABLE), remuestreo estéreo AudioWorklet PCM16 con filtro de voz y noise gate adaptativo, VAD local, barge-in sustancial (>=15 chars), liberación estricta de nodos Web Audio y trigger de generación especulativa en turnos largos.
- `app/hooks/useAnswerStream.ts` — Hook para streaming SSE de respuestas con pre-fetching especulativo, Punchline First (`keyWords`), callback de susurro `onPunchline`, extracción de `edgeCases`, `whyNot` y `dryRun` en tiempo real, Dual Stream de trampas en background, Fact Ledger acumulativo, inyección de historias STAR y Dossier Psicológico, depuración Anti-Slop con salvaguarda anti-loop, soporte multimodal/visión y generador de preguntas.
- `app/hooks/useTeleprompter.ts` — Hook para pop-out de ventana HUD y sincronización en tiempo real vía `BroadcastChannel` y `localStorage` con soporte de `edgeCases`, `whyNot`, `dryRun`, `matchedStory` y `firmnessAlert`.
- `app/hooks/useScreenVision.ts` — Captura de pantalla en WebP ultraliviano y Live OCR multimodal para LeetCode y diagramas de arquitectura (`Ctrl+Shift+S` o tecla `` ` ``) con generación de Dry-Run Stepper.
- `app/hooks/useEarbudWhisper.ts` — Modo "Susurro al Oído" con sintetizador Web Speech API acelerado (1.5x) para dictado privado del punchline en auricular.
- `app/hooks/useGazeTracker.ts` — Asistente de contacto visual (Eye-Contact Coach) con la webcam local (100% privado en navegador) para evitar desviar la mirada al teleprompter.
- `app/api/answer/route.ts` — Generación de respuestas con streaming SSE, Fast-Transpiler Multilenguaje (`type: "transpile"`), calibración de sesgo y tono por Dossier Psicológico del Entrevistador (`interviewerBio`), directiva de trazado de estados Dry-Run Stepper (`[DRY_RUN]`), Prompt Caching (KV-Cache), Punchline First, directivas `[EDGE_CASES]` y `[WHY_NOT]`, clasificación temprana de preguntas (`system_design`, `live_coding`, `behavioral`, `salary_negotiation`, `fit`), Company Dossier context injection, Fact Ledger consistency, anclaje en Historias STAR reales, Spanglish técnico, soporte multimodal para Vision Coding (`mode: "vision_coding"`), modo Cierre de Oro (`type: "reverse_questions"`) y detector de trampas en background (`mode: "trap_detector"`).
- `app/api/deepgram-token/route.ts` — Emisión de token temporal (grant de 60s) para aislar la API key permanente de Deepgram.
- `app/api/simulador/route.ts` — Generador de preguntas dinámicas según personalidad elegida (`amazon_bar_raiser`, `skeptic_architect`, `faang_recruiter`, `standard`) y feedback estructurado JSON.
- `app/api/waitlist/route.ts` — Captura y registro de lista de espera con rate limiting.
- `app/api/summary/route.ts` — Generador de Scorecard Predictor FAANG (Strong Hire / Hire / Lean Hire / No Hire), Análisis Forense & Detección de Fugas (Post-Mortem Técnico) y borrador de Follow-up Thank-You Note en Markdown citando trade-offs y Fact Ledger de la sesión.
- `app/lib/vulnerabilityRadar.ts` — Radar de Vulnerabilidades del CV (Red Team): motor heurístico de auditoría de CV y generador de prompts para anticipar flancos débiles, preguntas incisivas y estrategias de pivote STAR.
- `app/lib/simuladorPersonas.ts` — Directivas especializadas y constructor de system prompts para las personalidades del simulador.
- `app/lib/excalidrawExport.ts` — Conversor de diagramas Mermaid a formato nativo clipboard JSON de Excalidraw.
- `app/lib/antiSlopFilter.ts` — Filtro de estilo y limpiador de clichés formuláicos de IA ("AI Slop") con protección estricta contra bucles infinitos (`MAX_ITERATIONS = 10`) para asegurar tono pragmático de ingeniería de producción.
- `app/lib/factLedger.ts` — Grafo de memoria de sesión (Fact Ledger) para extracción, deduplicación e inyección de afirmaciones previas para evitar contradicciones.
- `app/lib/companyDossier.ts` — Base de conocimiento de stacks tecnológicos reales, arquitecturas y principios culturales de más de 20 empresas de tecnología líderes.
- `app/lib/mermaidParser.ts` — Parser liviano de diagramas Mermaid Flowchart para el Architecture Canvas.
- `app/lib/cvChunker.ts` — Grafo temporal y segmentación semántica de CV con ranking por recencia, seniority (`Architect`/`Lead`/`Senior`), métricas cuantitativas y recuperación quirúrgica (RAG local).
- `app/lib/codeEvaluator.ts` — Validador sintáctico estático del lado cliente (JS/TS/Python), verificación de indentación, balance de delimitadores y extracción de complejidades Big-O (tiempo y espacio).
- `app/lib/speechCoach.ts` — Análisis de telemetría de habla: cálculo de WPM, ratio de escucha/habla y conteo de muletillas (*fillers*).
- `app/lib/llm.ts` — Clientes HTTP y parsers SSE para cada provider (Gemini, OpenCode, Anthropic, OpenAI) con soporte multimodal (`image`), timeouts (`AbortController`) y fallback inteligente.
- `app/lib/security.ts` — Verificación de `Origin`/`Referer` y Rate Limiter en memoria con lazy cleanup.
- `app/lib/interviewHelpers.ts` — Clasificador temprano de preguntas (`classifyQuestionType` con `salary_negotiation`), detector de preguntas trampa, parser de bloques (`[KEY]`, `[EN]`, `[PHO]`, `[ES]`, `[EDGE_CASES]`, `[WHY_NOT]`) con soporte para streaming en vivo y limpieza de marcadores de razonamiento, sinónimos canónicos (`CANONICAL_SYNONYMS`), aisladores `matchesCompany()` / `matchesRole()` y motor de búsqueda de memoria `findMatchingAnswer()`.
- `app/lib/track.ts` — Wrapper fail-safe de analytics (`track()`, `identify()`).
- `public/pcm-worklet.js` — AudioWorklet para remuestreo y conversión de Float32 a PCM16 16kHz estéreo con cálculo RMS, filtro de voz paso-alto, noise gate adaptativo y VAD local.
- `docs/` — Centro de documentación técnica:
  - `docs/ARCHITECTURE.md` — Mapeo completo del flujo de datos, diagramas de secuencia Mermaid y especificación de las capacidades avanzadas y de nivel élite.
  - `docs/master_answers_all_roles.md` — Enciclopedia universal de 107 preguntas y respuestas en 12 capítulos para todos los CVs.
  - `docs/EXTENSION.md` — Extensión de Chrome para captura local en desarrollo.
  - `docs/LAUNCH.md` — Checklist de lanzamiento y antimarketing.
  - `docs/BRANCH_PROTECTION.md` — Reglas de protección de ramas en GitHub.
- `__tests__/` — Suite de 152 tests unitarios automatizados en 25 archivos (`antiSlopFilter`, `codeEvaluator`, `companyDossier`, `cvChunker`, `deepgramToken`, `excalidrawExport`, `factLedger`, `firmnessAndStarMatch`, `gazeTracker`, `interviewHelpers`, `llm`, `mermaidParser`, `parseBlocks`, `salaryNegotiation`, `screenVision`, `security`, `simuladorPersonas`, `speechCoach`, `starStories`, `timelineRAG`, `useAnswerStream`, `useDeepgram`, `useInterviewContext`, `useTeleprompter`, `vulnerabilityRadar`).

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
