# Índice de documentación — Loro Copilot

Herramienta **personal** de Fernando para entrevistas (foco actual: Globant / Intermedia). Estos docs describen el código que existe, no un producto público.

---

## En `docs/`

| Documento | Qué hay |
|---|---|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Flujo audio dual → Deepgram → memoria/RAG léxico → SSE → HUD. Incluye **límites honestos** (Speech Coach no live, sin KV-Cache de proveedor, 9 empresas, extensión desconectada). |
| [master_answers_all_roles.md](./master_answers_all_roles.md) | Banco personal de Fernando: **107** Q&A en 12 capítulos (Luna, Salta, GCP, GCVE, tarifa $25–30/h). No es un banco genérico “para cualquier CV”. |
| [EXTENSION.md](./EXTENSION.md) | Chrome MV3 para captura local en `localhost:3000`. La app Next **no** consume sus mensajes. |
| [LAUNCH.md](./LAUNCH.md) | Ops útiles (Deepgram, kill switch). Lanzamiento guerrilla **archivado**; uso actual = una persona. |
| [BRANCH_PROTECTION.md](./BRANCH_PROTECTION.md) | Reglas deseadas de GitHub. **No hay** `.github/workflows/ci.yml`. Hasta entonces: `npm test` + `npx tsc --noEmit` a mano. |

---

## En la raíz

- [README.md](../README.md) — instalación, env, qué está y qué no.
- [AGENTS.md](../AGENTS.md) — contrato para agentes: identidad hardcodeada, no “productizar”.
