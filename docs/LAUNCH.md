# LAUNCH.md — ops personales (lanzamiento público archivado)

**Estado actual:** Loro es la herramienta de Fernando para el screening Globant / Intermedia. No hay lanzamiento a comunidades, paywall ni cupos de usuarios.

Lo de abajo sirve para **no quedarse sin crédito de Deepgram/LLM en la semana de la entrevista**. Los borradores de posts (r/devsarg, Sysarmy, etc.) quedan como archivo histórico; no publicar.

---

## 1. Deepgram (el gasto que importa)

Nova-2 streaming ≈ **US$0.06** por ~10 min. Una sesión de screening de 45 min es barata; un loop abierto 8 h no.

- [ ] [console.deepgram.com](https://console.deepgram.com) → crédito + alertas de usage.
- [ ] Key con permiso de `auth/grant` (Member o superior).
- [ ] `DEEPGRAM_API_KEY` en Vercel.

`app/api/deepgram-token/route.ts` emite un grant **TTL 120 s**. Si el grant falla, responde 500 y **nunca** manda la API key permanente al browser (en prod).

El frontend abre `wss://api.deepgram.com/v1/listen` con ese token.

## 2. LLM

Al menos una key viva: `OPENCODE_API_KEY` / `GEMINI_API_KEY` / `OPENAI_API_KEY` / `ANTHROPIC_API_KEY`.

Free tier de Gemini se acaba fácil si se deja el simulador girando. Para uso de una persona no hace falta “salir del free tier” salvo que se dispare el simulador.

- [ ] Presupuesto/alertas en la cuenta que pague el modelo (ej. US$20–50).

## 3. Kill switch

Si hay que cortar APIs ya:

1. Vercel → env `CAPACITY_CLOSED` = `1` (Production).
2. Redeploy (los env no aplican solos).
3. `/api/answer` y `/api/deepgram-token` → 503.

Reabrir: borrar la var o `0` + redeploy.

## 4. PostHog (opcional)

Sin `NEXT_PUBLIC_POSTHOG_KEY` no hay funnel. `@vercel/analytics` está en `package.json` y **no se usa**. Para uso personal no es bloqueante.

## 5. Vercel Hobby

Bandwidth 100 GB/mes y edge invocations. Suficiente para un usuario.

## 6. Humo antes de la call Globant (no “desde el celular”)

El copiloto dual + HUD es **Chrome de escritorio**.

- [ ] Preset **Activar Entrevista Globant**.
- [ ] Audio dual 5–10 min con Meet de prueba (mic + pestaña o VB-CABLE).
- [ ] Confirmar que Deepgram sigue transcribiendo y que `/api/answer` responde.
- [ ] HUD bajo la webcam + Panic `Escape`.
- [ ] **No** usar Susurro al oído si el TTS puede filtrarse al mic de la call.

Waitlist / paywall / “cupos del día” **no aplican** a este uso.

---

# Archivo histórico — borradores de post (no publicar)

Reglas de entonces: primera persona, admitir que es una web común (no “indetectable”), un solo link. Quedan por si algún día se abre el repo.

Tracking: `?ref=nombre` en `https://loro-copilot.vercel.app`.

## 1. r/devsarg (`?ref=devsarg`)

> Hola gente. Estuve en búsqueda y me pasaba que en inglés me quedaba en blanco. Me armé un copiloto: escucha la entrevista (mic o pestaña), transcribe, y arma la respuesta con el CV. Si es en inglés trae fonética. Teleprompter para la webcam. Stack: AudioWorklet → Deepgram Nova-2 → LLM en Edge. Sin DB ni login; el CV vive en localStorage y el audio no se guarda. Limitaciones: es una web común (no es indetectable), anda mejor en Chrome. https://loro-copilot.vercel.app?ref=devsarg

## 2. Sysarmy / Discords (`?ref=sysarmy`)

> Che, herramienta para no quedarme en blanco en entrevistas en inglés: escucha la llamada y sopla respuestas ancladas al CV. Gratis en su momento; hoy es uso personal. https://loro-copilot.vercel.app?ref=sysarmy

## FAQ (si alguien pregunta)

**¿Es trampa?** Apoyo con el CV real; el modelo tiene prohibido inventar experiencia. Leer un guion mal también se nota.

**¿Qué hacen con el CV?** No hay DB. `localStorage`. El audio va en streaming a Deepgram y no se persiste en Loro.

**¿Grabar al entrevistador?** No graba: transcribe y descarta el audio. La normativa varía por país.

**¿Cuál es el negocio?** Ninguno ahora. Una persona, una entrevista.
