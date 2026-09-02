# Branch Protection Rules — main

Configuración recomendada para `Settings → Branches → Branch protection rules → main`:

## ✅ Required status checks
Marcar **"Require status checks to pass before merging"** y seleccionar:

- `unit` (del job en `.github/workflows/ci.yml`)
- `e2e` (del job en `.github/workflows/ci.yml`)

## ✅ Restrictions adicionales recomendadas
- **Require a pull request before merging** → 1 aprobación mínima
- **Do not allow bypassing the above settings** (incluye a admins)
- **Require linear history** (squash o rebase merge)
- **Include administrators**: ✅

## Resultado esperado
Ningún push directo a `main` puede mergear si:
1. Falla `unit` (lint, vitest, typecheck)
2. Falla `e2e` (Playwright Chromium)

Configurar manualmente en GitHub UI ya que `branch protection` no se puede expresar
en YAML versionado de forma nativa.
