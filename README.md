# 🦜 Loro Copilot

Herramienta **personal** de Guillermo Fernando Farfán Romero para preparar y acompañar entrevistas en vivo. Foco actual: presets **Snappy Commerce** (Full Stack), **IT Patagonia** (DevOps & FinOps Sr) y **Mercado Libre** (NoSQL Service Team): audio dual, transcripción Deepgram, bancos de respuestas anclados a su CV y HUD teleprompter.

No es un SaaS multi-usuario. El perfil (Salta, Luna, +8 años IT / ~4 años cloud GCP, $4.000 USD / $25–30/h) está **hardcodeado a propósito** en prompts y presets.

Deploy: **ninguno**. Es una herramienta 100% personal que corre en local con `npm run dev`. No se publica, no se vende y no se abre a otros usuarios.

---

## Qué hace de verdad

- **Audio dual** (micrófono + pestaña o VB-CABLE): PCM16 16 kHz estéreo en `AudioWorklet`, diarización por canal en Deepgram Nova-2.
- **Turn-taking**: VAD local, `UtteranceEnd`, debounce adaptativo (900/1300/2800 ms), barge-in con gracia 1.5–3 s y umbral de discurso sustancial.
- **Respuestas Punchline First**: bloques `[KEY]` / `[EN]` / `[PHO]` / `[ES]` en un párrafo de 2 oraciones (25–35 palabras), sin viñetas.
- **Memoria local &lt;50 ms**: matching léxico (Jaccard / Dice / cobertura + sinónimos canónicos), no embeddings.
- **RAG del CV**: `cvChunker` segmenta y rankea por tokens, recencia y seniority. No hay vector DB.
- **HUD teleprompter**: pop-out + `BroadcastChannel`, lectura biónica, Panic (`Escape`), camuflaje IDE/Terminal, pacer ~135 WPM.
- **Simulador**: personalidades FAANG, pushback, gimnasio 25 s, espejo acústico (`MediaRecorder`) y `countFillers`.
- **Bancos maestros por empresa**: `meliMasterAnswers.ts`, `snappyCommerceMasterAnswers.ts`, `itPatagoniaMasterAnswers.ts` (presets 1-click, cargados con `import()` diferido) + `docs/master_answers_all_roles.md` (107 Q&A personales).

Chrome de escritorio es el runtime real. Dual audio / HUD / Screen Vision no están pensados para iOS.

---

## Qué no está (aunque a veces se documentó)

| Claim viejo | Realidad |
|---|---|
| Speech Coach en vivo en el copiloto | `analyzeSpeech` existe y tiene tests; **no se importa** en `/app`. En el simulador sí corre `countFillers`. |
| Prompt Caching / KV-Cache (~75% costo) | Solo **orden de prefijo** en el prompt. No hay `cache_control` ni `cachedContent`. |
| Extensión de Chrome conectada | `extension/` captura audio en localhost; la app Next **no escucha** `LORO_EXT_DG_MESSAGE`. En prod se usa `getDisplayMedia`. |
| Dossier de 20+ empresas | **11**: MercadoLibre, Uber, Stripe, Netflix, Amazon, Google, Meta, Globant, IT Patagonia, Nubank, VAIRIX. |
| RAG semántico / embeddings | Overlap de tokens + heurísticas de recencia. |
| Eye Coach ML | Ratio de luminosidad de la webcam a ~4 FPS. |
| Inyector Glassdoor/Blind | Textarea para **pegar** listas; no hay scraper. |
| Paywall / cupos de sesión en el copiloto | No. El simulador pide email al ver el feedback. Waitlist = Google Form. |
| Auth ni DB | No hay. Persistencia = `localStorage`. Sí hay CI: `.github/workflows/ci.yml` (unit + e2e). |
| Indetectable | Es una web. El camouflage IDE/Terminal y Panic ayudan; no es overlay nativo invisible al screen share. |

---

## Stack

- Next.js 14, React 18, TypeScript, Edge Runtime en `/api/*`
- Deepgram Nova-2 (grant efímero TTL **120 s**)
- OpenCode / OpenRouter, Gemini, Anthropic, OpenAI (fallback en `app/lib/llm.ts`)
- Vitest: **280 tests en 32 archivos**. Playwright e2e = 7 tests (smoke + pregunta manual con SSE mockeado); corre en CI.
- Analytics: PostHog opcional (`NEXT_PUBLIC_POSTHOG_KEY`).

---

## Docs

- [docs/README.md](./docs/README.md) — índice
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) — flujo real (audio → STT → memoria/LLM → HUD)
- [docs/master_answers_all_roles.md](./docs/master_answers_all_roles.md) — 107 respuestas personales (Fernando)
- [docs/EXTENSION.md](./docs/EXTENSION.md) — extensión local, **no cableada** a la app
- [docs/LAUNCH.md](./docs/LAUNCH.md) — ops (Deepgram, kill switch). Lanzamiento público **fuera de alcance**
- [docs/BRANCH_PROTECTION.md](./docs/BRANCH_PROTECTION.md) — reglas deseadas; CI definida en `.github/workflows/ci.yml`
- [AGENTS.md](./AGENTS.md) — contexto para agentes de IA

---

## Local

```bash
npm install
cp .env.example .env.local   # DEEPGRAM_API_KEY + OPENCODE_API_KEY o GEMINI_API_KEY
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en Chrome.

```bash
npm test
npx tsc --noEmit
npm run build
```

Correr `npm test` y `npx tsc --noEmit` antes de pushear a `main` (la CI lo verifica; no hay deploy automático).

---

## Variables de entorno

| Variable | Requerida | Propósito |
|---|:---:|---|
| `DEEPGRAM_API_KEY` | **Sí** | Streaming Nova-2. El cliente recibe un grant de 120 s, no la key. |
| `OPENCODE_API_KEY` / `OPENROUTER_API_KEY` | No | OpenCode / OpenRouter. |
| `GEMINI_API_KEY` | No | Gemini Flash. |
| `ANTHROPIC_API_KEY` | No | Claude. |
| `OPENAI_API_KEY` | No | GPT + TTS del simulador. |
| `LLM_PROVIDER` | No | Override (`opencode`, `gemini`, `anthropic`, `openai`). |
| `NEXT_PUBLIC_POSTHOG_KEY` | No | Telemetría PostHog. |
| `NEXT_PUBLIC_SITE_URL` | No | Origin allowlist / OG. |
| `CAPACITY_CLOSED` | No | Kill switch (`1` → 503 en answer/token). |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | No | Rate limit distribuido; si no, Map en memoria por isolate. |
| `GFORM_ACTION` | No | Waitlist (Google Form). |

---

## Árbol

```text
loro/
├── app/
│   ├── api/           # Edge: answer, deepgram-token, simulador (+ tts), summary, waitlist
│   ├── app/           # Copiloto en vivo (presets Snappy / IT Patagonia / MELI)
│   ├── components/
│   ├── hooks/
│   ├── lib/           # cvChunker, bancos por empresa, interviewHelpers, …
│   ├── simulador/
│   └── teleprompter/
├── docs/
├── pdf/               # CVs personales de Fernando
├── extension/         # Chrome MV3 local; no integrada a Next
├── public/pcm-worklet.js
└── __tests__/         # 280 tests / 32 archivos
```
