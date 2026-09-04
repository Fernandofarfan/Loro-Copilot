import {
  streamAnthropic,
  streamOpenAI,
  streamGemini,
  streamOpenCode,
  resolveProvider,
  resolveModel,
  FALLBACK_MODELS,
  type Provider,
} from "../../lib/llm";
import { verifyOrigin, checkRateLimitAsync, checkCapacity } from "../../lib/security";

export const runtime = "edge";

// Escapa caracteres XML de delimitación para evitar inyección de prompt via inputs de usuario
function sanitizeForPrompt(text: string): string {
  return text
    .replace(/</g, "‹")   // reemplazar < por guillemet izquierdo (similar visual, no interpretable como tag)
    .replace(/>/g, "›");  // reemplazar > por guillemet derecho
}

const SYSTEM_PROMPT = `Sos un entrevistador y director de contratación técnico de nivel Staff/FAANG. Tu tarea es evaluar con máximo rigor la transcripción de una entrevista técnica/profesional que acaba de terminar y brindarle un análisis de nivel élite al candidato.

Recibís:
1. EMPRESA y ROL (contexto).
2. PERFIL del candidato.
3. HECHOS Y DECISIONES TÉCNICAS CONFIRMADAS (Fact Ledger).
4. TRANSCRIPCIÓN completa de la entrevista (etiquetada con [Entrevistador] y [Yo]).

Devolvé el análisis en ESTRICTO formato Markdown usando exactamente estas secciones:

### 📊 Scorecard Predictor FAANG
- **Veredicto:** [**STRONG HIRE** | **HIRE** | **LEAN HIRE** | **NO HIRE**]
- **Claridad & Estructura:** [Puntaje]/100
- **Profundidad Técnica & Arquitectura:** [Puntaje]/100
- **Consistencia & Dominio (Fact Ledger):** [Puntaje]/100
*(1 párrafo conciso fundamentando el veredicto en base a la solidez de las respuestas del candidato).*

### 🌟 Puntos Fuertes
(2 o 3 viñetas destacando dónde brilló técnicamente, qué respuestas fueron sobresalientes y qué trade-offs explicó con madurez).

### ⚠️ Áreas de Mejora
(1 o 2 viñetas señalando dónde faltaron métricas cuantitativas, dónde hubo respuestas difusas o qué puntos debió profundizar).

### 💡 Siguientes Pasos (Follow-up)
(1 recomendación estratégica concreta para encarar la siguiente ronda de entrevistas o afianzar temas débiles).

### 🕵️ Análisis Forense & Detección de Fugas (Post-Mortem Técnico)
- **Ratio y Dinámica de Habla:** (Evaluación de si el candidato mantuvo diálogo bidireccional o cayó en monólogos de más de 2 minutos).
- **Fugas Técnicas & Trade-offs Omitidos:** (Puntos donde el candidato omitió mencionar métricas duras, no justificó alternativas descartadas o titubeó).
- **Muletillas & Tono:** (Señalamiento de muletillas frecuentes o momentos donde faltó asertividad).

### ✉️ Nota de Agradecimiento Hiper-Personalizada (Thank-You Note)
(Redactá un correo o mensaje de LinkedIn listo para copiar y enviar al entrevistador/reclutador. DEBE mencionar explícitamente al menos una decisión técnica, debate de arquitectura o herramienta específica debatida durante la sesión, mostrando genuino interés, proactividad y escucha activa).

No agregues introducciones ni despedidas ajenas, devolvé únicamente el Markdown solicitado.`;

export async function POST(req: Request) {
  // 0. Kill switch de capacidad
  const capacity = checkCapacity();
  if (!capacity.ok) {
    return new Response(capacity.error, { status: capacity.status || 503 });
  }

  // 1. Verificación de Origin
  const originCheck = verifyOrigin(req);
  if (!originCheck.ok) {
    return new Response(originCheck.error || "No autorizado", { status: originCheck.status || 403 });
  }

  // 2. Rate Limiting (20 summaries por minuto por IP)
  const rl = await checkRateLimitAsync(req, { limit: 20, windowMs: 60_000, keyPrefix: "summary" });
  if (!rl.allowed) {
    return new Response("Límite de solicitudes excedido. Aguardá un momento.", {
      status: 429,
      headers: { "Retry-After": String(rl.retryAfterSeconds) },
    });
  }

  let body: {
    profile?: string;
    company?: string;
    role?: string;
    transcript?: string;
    facts?: string[];
    model?: string;
    provider?: string;
  };
  try {
    body = await req.json();
  } catch {
    return new Response("Body inválido.", { status: 400 });
  }

  const provider: Provider = resolveProvider(body.provider);
  const model = resolveModel(provider, (body.model || "").slice(0, 100));
  const profile = sanitizeForPrompt((body.profile || "").slice(0, 6000));
  const company = sanitizeForPrompt((body.company || "").slice(0, 200));
  const role = sanitizeForPrompt((body.role || "").slice(0, 1500));
  const transcript = sanitizeForPrompt((body.transcript || "").slice(0, 12000));
  const factsList = Array.isArray(body.facts) && body.facts.length > 0
    ? body.facts.map((f) => `- ${sanitizeForPrompt(String(f))}`).join("\n")
    : "(Ningún hecho específico registrado)";

  const userContent = `## EMPRESA\n${company || "(sin especificar)"}\n\n## ROL\n${role || "(sin especificar)"}\n\n## PERFIL\n${profile || "(sin especificar)"}\n\n## HECHOS Y DECISIONES TÉCNICAS CONFIRMADAS (Fact Ledger)\n${factsList}\n\n## TRANSCRIPCIÓN\n${transcript || "(sin transcripción)"}`;

  const candidates = Array.from(new Set([model, ...FALLBACK_MODELS[provider]])).slice(0, 3);

  try {
    if (provider === "anthropic") return await streamAnthropic(candidates, userContent, SYSTEM_PROMPT);
    if (provider === "opencode" || provider === "openrouter") return await streamOpenCode(candidates, userContent, SYSTEM_PROMPT);
    if (provider === "openai") return await streamOpenAI(candidates, userContent, SYSTEM_PROMPT);
    return await streamGemini(candidates, userContent, SYSTEM_PROMPT);
  } catch (err: unknown) {
    return new Response(`Error generando resumen: ${err instanceof Error ? err.message : "desconocido"}`, { status: 502 });
  }
}
