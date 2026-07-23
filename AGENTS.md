# AGENTS.md

Contexto para agentes de IA (Claude Code, Cursor, etc.) que trabajen en este repo.

## Qué es esto

**Interview Copilot** — asistente profesional de entrevistas con IA en tiempo real. Escucha
la entrevista por mic o audio de pestaña (Meet/Zoom), transcribe en vivo con Deepgram y,
al tocar "Responder", genera una respuesta con un LLM ancladas al CV/empresa/puesto que
cargó el usuario. Producto en español, sin login, sin fricción — pensado para viralizar
por WhatsApp.

Deploy: Next.js 14 (App Router) en Vercel. Proyecto de Vercel: `interview-copilot`. URL de
producción: `https://loro-copilot.vercel.app`.

## Cómo correrlo

```bash
npm install
cp .env.example .env.local   # completar DEEPGRAM_API_KEY y GEMINI_API_KEY como mínimo
npm run dev
```

No hay `lint` ni `test` en `package.json` — no hay suite de tests ni linter configurado
en este proyecto. Para chequear tipos: `npx tsc --noEmit` (requiere `npm install` primero,
si no vas a ver ruido de módulos faltantes que no tiene que ver con tu cambio).

## Estructura

- `app/app/page.tsx` — **toda** la UI y lógica de cliente en un solo componente grande
  (estado, WebSocket a Deepgram, generación de respuestas).
  Es el archivo que más se toca.
- `app/api/deepgram-token/route.ts` — emite un token temporal (grant, 60s) de Deepgram.
  La API key permanente nunca llega al browser.
- `app/api/answer/route.ts` — genera la respuesta con streaming. Soporta tres providers
  (`gemini` | `anthropic` | `openai`) aunque la UI hoy solo expone modelos Gemini.
- `app/lib/track.ts` — wrapper de analytics (`track()`, `identify()`), fail-safe (nunca
  rompe la UI). Todo evento nuevo se agrega al union type `FunnelEvent` acá.

## Convenciones del código

- Comentarios en **español**, solo para el "por qué" no obvio (constraints, decisiones de
  producto, workarounds). No comentar lo que el código ya dice.
- Analytics: siempre a través de `track()`/`identify()` de `app/lib/track.ts`. Nombrar eventos en snake_case
  (`answer_requested`, no `answerRequested`).
- El generar respuesta es **siempre manual** (botón "Responder"), nunca automático
  mientras la persona habla — es una decisión de producto explícita, no la cambies sin
  que te lo pidan.
- Runtime `edge` en las rutas de API (`export const runtime = "edge"`) — ojo con APIs de
  Node que no existen en Edge.

## Variables de entorno

Ver `.env.example` para la lista completa y comentarios. Resumen:

| Variable | Requerida | Qué hace |
|---|---|---|
| `DEEPGRAM_API_KEY` | Sí | Transcripción streaming |
| `GEMINI_API_KEY` | Sí | Generación de respuestas (provider default) |
| `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` | No | Providers alternativos, soportados en backend, sin UI hoy |
| `GEMINI_MODEL` / `ANTHROPIC_MODEL` / `OPENAI_MODEL` | No | Override de modelo por provider |


Las `NEXT_PUBLIC_*` se leen en build time — cambiarlas en Vercel requiere redeploy.

## Deploy y ramas

- `main` se deployea solo a producción en Vercel al hacer push (Git integration).
- Flujo típico: rama de trabajo → commit → PR → merge (squash) a `main` → Vercel
  redeploya solo.
- No hay CI configurado (`.github/workflows` no existe) — el único check automático en
  los PRs es el deployment de preview de Vercel.
