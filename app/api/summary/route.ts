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

const SYSTEM_PROMPT = `Sos un experto en entrevistas técnicas y de Recursos Humanos. Tu tarea es analizar la transcripción completa de una entrevista de trabajo que acaba de terminar y darle feedback estructurado al candidato.

Recibís:
1. EMPRESA y ROL (contexto).
2. PERFIL del candidato.
3. TRANSCRIPCIÓN completa de la entrevista (etiquetada con [Entrevistador] y [Yo]).

Devolvé el feedback en ESTRICTO formato Markdown usando exactamente estas secciones:

### 🌟 Puntos Fuertes
(2 o 3 viñetas destacando lo que el candidato respondió bien o dónde brilló su perfil).

### ⚠️ Áreas de Mejora
(1 o 2 viñetas donde dudó, respondió cortante, o podría haber dado mejores ejemplos).

### 💡 Siguientes Pasos (Follow-up)
(1 sugerencia clara de qué hacer ahora, ej: cómo mandar el mail de agradecimiento o qué tema repasar para la siguiente ronda).

No uses saludos ni despedidas, devolvé solo el Markdown solicitado.`;

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
  const profile = (body.profile || "").slice(0, 6000);
  const company = (body.company || "").slice(0, 200);
  const role = (body.role || "").slice(0, 1500);
  const transcript = (body.transcript || "").slice(0, 12000);

  const userContent = `## EMPRESA\n${company || "(sin especificar)"}\n\n## ROL\n${role || "(sin especificar)"}\n\n## PERFIL\n${profile || "(sin especificar)"}\n\n## TRANSCRIPCIÓN\n${transcript || "(sin transcripción)"}`;

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
