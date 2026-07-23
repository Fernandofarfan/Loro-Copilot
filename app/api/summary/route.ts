export const runtime = "edge";


import { streamAnthropic, streamOpenRouter, streamOpenAI, streamGemini } from "../../lib/llm";

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

// Override por env SOLO si está explícitamente seteada
const GEMINI_MODEL_OVERRIDE = process.env.GEMINI_MODEL || "";
const ANTHROPIC_MODEL_OVERRIDE = process.env.ANTHROPIC_MODEL || "";
const OPENAI_MODEL_OVERRIDE = process.env.OPENAI_MODEL || "";
const OPENROUTER_MODEL_OVERRIDE = process.env.OPENROUTER_MODEL || "";
const DEFAULT_PROVIDER_OVERRIDE = (process.env.LLM_PROVIDER || "").toLowerCase();

function resolveModel(provider: string, requested: string): string {
  if (provider === "anthropic") return ANTHROPIC_MODEL_OVERRIDE || requested || "claude-haiku-4-5";
  if (provider === "openai") return OPENAI_MODEL_OVERRIDE || requested || "gpt-4o-mini";
  if (provider === "openrouter") return OPENROUTER_MODEL_OVERRIDE || requested || "openai/gpt-4o-mini";
  return GEMINI_MODEL_OVERRIDE || requested || "gemini-2.5-flash";
}

function resolveProvider(requested?: string): string {
  const envProvider = DEFAULT_PROVIDER_OVERRIDE;
  if (envProvider === "gemini" || envProvider === "anthropic" || envProvider === "openai" || envProvider === "openrouter") {
    return envProvider;
  }
  if (requested === "anthropic" || requested === "openai" || requested === "openrouter") return requested;
  return "gemini";
}

export async function POST(req: Request) {
  // No rate limits nor origin checks for local instance

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

  const provider = resolveProvider(body.provider);
  const model = resolveModel(provider, (body.model || "").slice(0, 100));
  const profile = (body.profile || "").slice(0, 8000);
  const company = (body.company || "").slice(0, 200);
  const role = (body.role || "").slice(0, 2000);
  const transcript = (body.transcript || "").slice(0, 15000); // transcript más largo permitido

  const userContent = `## EMPRESA\n${company}\n\n## ROL\n${role}\n\n## PERFIL\n${profile}\n\n## TRANSCRIPCIÓN\n${transcript}`;

  const FALLBACK: Record<string, string[]> = {
    openrouter: ["openai/gpt-4o-mini", "openai/gpt-4.1-mini"],
    openai: ["gpt-4.1-mini", "gpt-4o-mini"],
    anthropic: ["claude-haiku-4-5"],
    gemini: ["gemini-2.5-flash"],
  };
  const candidates = [model, ...FALLBACK[provider].filter((m) => m !== model)];

  try {
    if (provider === "anthropic") return await streamAnthropic(candidates, userContent, SYSTEM_PROMPT);
    if (provider === "openrouter") return await streamOpenRouter(candidates, userContent, SYSTEM_PROMPT);
    if (provider === "openai") return await streamOpenAI(candidates, userContent, SYSTEM_PROMPT);
    return await streamGemini(candidates, userContent, SYSTEM_PROMPT);
  } catch (err: any) {
    return new Response(`Error del modelo: ${err?.message || "desconocido"}`, { status: 502 });
  }
}
