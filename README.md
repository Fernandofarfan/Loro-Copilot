# 🦜 Loro Copilot

Herramienta **personal** de Guillermo Fernando Farfán Romero para preparar y acompañar entrevistas en vivo. El foco actual es el screening de **Globant / Intermedia** (GCP Cloud Engineer, reclutadora Marian Francheska Escalona): audio dual, transcripción Deepgram, banco de respuestas anclado a su CV y HUD teleprompter.

No es un SaaS multi-usuario. El perfil (Salta, Luna, +8 años IT / ~4 años cloud GCP, $4.000 USD / $25–30/h) está **hardcodeado a propósito** en prompts y presets.

Deploy: Next.js 14 (App Router) en Vercel → `https://loro-copilot.vercel.app`.

---

## Qué hace de verdad

- **Audio dual** (micrófono + pestaña o VB-CABLE): PCM16 16 kHz estéreo en `AudioWorklet`, diarización por canal en Deepgram Nova-2.
- **Turn-taking**: VAD local, `UtteranceEnd`, debounce, barge-in con gracia ~4.5 s y umbral de discurso sustancial.
- **Respuestas Punchline First**: bloques `[KEY]` / `[EN]` / `[PHO]` / `[ES]` en un párrafo de 2 oraciones (25–35 palabras), sin viñetas.
- **Memoria local &lt;50 ms**: matching léxico (Jaccard / Dice / cobertura + sinónimos canónicos), no embeddings.
- **RAG del CV**: `cvChunker` segmenta y rankea por tokens, recencia y seniority. No hay vector DB.
- **HUD teleprompter**: pop-out + `BroadcastChannel`, lectura biónica, Panic (`Escape`), camuflaje IDE/Terminal, pacer ~135 WPM.
- **Simulador**: personalidades FAANG, pushback, gimnasio 25 s, espejo acústico (`MediaRecorder`) y `countFillers`.
- **Banco Globant + enciclopedia**: `app/lib/globantMasterAnswers.ts` y `docs/master_answers_all_roles.md` (107 Q&A personales).

Chrome de escritorio es el runtime real. Dual audio / HUD / Screen Vision no están pensados para iOS.

---

## Qué no está (aunque a veces se documentó)

| Claim viejo | Realidad |
|---|---|
| Speech Coach en vivo en el copiloto | `analyzeSpeech` existe y tiene tests; **no se importa** en `/app`. En el simulador sí corre `countFillers`. |
| Prompt Caching / KV-Cache (~75% costo) | Solo **orden de prefijo** en el prompt. No hay `cache_control` ni `cachedContent`. |
| Extensión de Chrome conectada | `extension/` captura audio en localhost; la app Next **no escucha** `LORO_EXT_DG_MESSAGE`. En prod se usa `getDisplayMedia`. |
| Dossier de 20+ empresas | **9**: MercadoLibre, Uber, Stripe, Netflix, Amazon, Google, Meta, Globant, Nubank. |
| RAG semántico / embeddings | Overlap de tokens + heurísticas de recencia. |
| Eye Coach ML | Ratio de luminosidad de la webcam a ~4 FPS. |
| Inyector Glassdoor/Blind | Textarea para **pegar** listas; no hay scraper. |
| Paywall / cupos de sesión en el copiloto | No. El simulador pide email al ver el feedback. Waitlist = Google Form. |
| Auth, DB, CI de GitHub | No hay. Persistencia = `localStorage`. No existe `.github/workflows/ci.yml`. |
| Indetectable | Es una web. El camouflage IDE/Terminal y Panic ayudan; no es overlay nativo invisible al screen share. |

---

## Stack

- Next.js 14, React 18, TypeScript, Edge Runtime en `/api/*`
- Deepgram Nova-2 (grant efímero TTL **120 s**)
- OpenCode / OpenRouter, Gemini, Anthropic, OpenAI (fallback en `app/lib/llm.ts`)
- Vitest: **207 tests en 26 archivos**. Playwright e2e = smoke (título/URL/waitlist), no corre en CI.
- Analytics: PostHog opcional (`NEXT_PUBLIC_POSTHOG_KEY`). `@vercel/analytics` está en `package.json` y **no se importa**.

---

## Docs

- [docs/README.md](./docs/README.md) — índice
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) — flujo real (audio → STT → memoria/LLM → HUD)
- [docs/master_answers_all_roles.md](./docs/master_answers_all_roles.md) — 107 respuestas personales (Fernando)
- [docs/EXTENSION.md](./docs/EXTENSION.md) — extensión local, **no cableada** a la app
- [docs/LAUNCH.md](./docs/LAUNCH.md) — ops (Deepgram, kill switch). Lanzamiento público **fuera de alcance**
- [docs/BRANCH_PROTECTION.md](./docs/BRANCH_PROTECTION.md) — reglas deseadas; CI todavía no existe
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

Correr `npm test` y `npx tsc --noEmit` antes de pushear a `main` (Vercel despliega esa rama).

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
│   ├── api/           # Edge: answer, deepgram-token, simulador, summary, waitlist
│   ├── app/           # Copiloto en vivo (preset Globant)
│   ├── components/
│   ├── hooks/
│   ├── lib/           # cvChunker, globantMasterAnswers, interviewHelpers, …
│   ├── simulador/
│   └── teleprompter/
├── docs/
├── pdf/               # CVs personales de Fernando
├── extension/         # Chrome MV3 local; no integrada a Next
├── public/pcm-worklet.js
└── __tests__/         # 207 tests / 26 archivos
```
