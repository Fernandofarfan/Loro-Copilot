# Branch protection — `main` (deseado, no activo)

La CI **existe**: `.github/workflows/ci.yml` corre en push y PR a `main` con dos jobs:

- `unit`: `npm run lint` + `npm run typecheck` + `npm test` + `npm run build`.
- `e2e`: Playwright (`npm run test:e2e`) con Chromium. Cubre home, simulador, teleprompter, waitlist 400, waitlist sin Origin, token 503 y una pregunta manual con SSE mockeado. No cubre audio real, streaming real de Deepgram ni HUD pop-out.

```bash
npm test          # 280 tests / 32 archivos
npx tsc --noEmit
```

---

## Falta habilitar la protección de rama

`Settings → Branches → Branch protection rules → main`:

- Require status checks: jobs `unit` y `e2e`.
- Require PR + 1 aprobación (opcional en un repo personal).
- Linear history (squash/rebase).
- Include administrators.

Hoy Fernando pushea a `main`; la CI corre pero **no bloquea** el merge/push (no hay deploy automático: el proyecto corre en local). El riesgo es romper el copiloto propio si se ignora un job en rojo.
