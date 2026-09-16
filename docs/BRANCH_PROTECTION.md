# Branch protection — `main` (deseado, no activo)

No hay `.github/workflows/ci.yml`. GitHub no corre tests en push. Hasta que exista CI, el gate es manual:

```bash
npm test          # 207 tests / 26 archivos
npx tsc --noEmit
```

`npm run test:e2e` es smoke Playwright (título, URLs, waitlist 400). No cubre audio, SSE ni HUD.

---

## Si se agrega CI más adelante

`Settings → Branches → Branch protection rules → main`:

- Require status checks: jobs `unit` (vitest + tsc) y, si se quiere, `e2e`.
- Require PR + 1 aprobación (opcional en un repo personal).
- Linear history (squash/rebase).
- Include administrators.

Hoy Fernando pushea a `main` y Vercel despliega. El riesgo es romper el copiloto Globant sin red de CI.
