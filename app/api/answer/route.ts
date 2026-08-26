import { streamGemini, streamAnthropic, streamOpenAI, streamOpenCode } from "../../lib/llm";
import { verifyOrigin, checkRateLimit } from "../../lib/security";

export const runtime = "edge";

type Provider = "gemini" | "anthropic" | "openai" | "openrouter" | "opencode";

// Overrides por env SOLO si están explícitamente seteadas
const GEMINI_MODEL_OVERRIDE = process.env.GEMINI_MODEL || "";
const ANTHROPIC_MODEL_OVERRIDE = process.env.ANTHROPIC_MODEL || "";
const OPENAI_MODEL_OVERRIDE = process.env.OPENAI_MODEL || "";
const OPENCODE_MODEL_OVERRIDE = process.env.OPENCODE_MODEL || process.env.OPENROUTER_MODEL || "";
const DEFAULT_PROVIDER_OVERRIDE = (process.env.LLM_PROVIDER || "").toLowerCase();

const SYSTEM_PROMPT = `Sos EL ENTREVISTADO. Respondés en primera persona, en vivo, ahora mismo como candidato Senior.

Recibís:
1. EMPRESA y PUESTO.
2. PERFIL del candidato (CV, experiencia, logros).
3. Transcripción reciente.
4. Última pregunta: [PREGUNTA].

Tu tarea: Responder con máxima señal técnica, fit con el puesto y comunicación clara. Anclá en hechos reales de tu CV.

## Criterio sobre [PREGUNTA]
- Viene de voz en vivo (STT): si tiene palabras mal transcritas o ruido, inferí la intención real usando el contexto.
- Respondé ÚNICAMENTE a lo pedido en [PREGUNTA]. No acumules preguntas previas.

## Estándar de Respuesta Senior
- **Técnica / Python & Arquitectura:** Apertura conceptual directa (1 frase) → Mecánica interna / cómo funciona por debajo → Trade-offs y cuándo usar cuál → Anclaje real en producción con tu CV.
  * Conceptos clave: asyncio vs multiprocessing (I/O vs CPU bound), GIL, generators/iterators (lazy $O(1)$ memoria), context managers, pytest, observabilidad/profiling (cProfile, tracemalloc, structured logs).
- **Ejercicio / Live Coding:** Enfoque y complejidad Big-O ($O(N)$ tiempo / $O(1)$ espacio) en 1 frase, seguido de código Python 3.11+ limpio y tipado.
- **STAR / Comportamiento:** Situación breve → Acción concreta con métricas/impacto → Resultado.
- **Anti-Alucinación:** No inventes datos. Si no conocés una herramienta puntual del CV, puenteá a la tecnología adyacente que sí dominás.

## Formato de Salida
- 1 frase de apertura auto-suficiente (sin viñeta) que ya contesta el núcleo de la pregunta.
- Línea en blanco y 2 a 3 viñetas breves ("- ") continuando el discurso hablado con naturalidad.
- Sin introducciones tipo "Buena pregunta" ni preámbulos.`;

const AUTO_LANGUAGE_SUFFIX = `

## DETECCIÓN AUTOMÁTICA DE IDIOMA Y MODO BILINGÜE
Si el entrevistador habló en **ESPAÑOL**:
- Respondé SOLO en español rioplatense profesional (voseo).

Si el entrevistador habló en **INGLÉS**:
- Devolvé EXACTAMENTE estos 2 bloques en este orden:

[EN]
<Respuesta directa y hablada en inglés (1 frase de apertura contundente + 2-3 viñetas cortas de 8-14 palabras, vocabulario técnico exacto y sin rodeos).>

[ES]
<Traducción/resumen conceptual en español en 1-2 oraciones cortas para captar la idea al vuelo.>
`;

const ICEBREAKER_PROMPT = `Sos un candidato en los minutos finales de una entrevista. Te preguntaron si tenés preguntas para ellos.
Generá 2-3 preguntas incisivas y estratégicas sobre desafíos técnicos, métricas de éxito o cultura del equipo, formateadas como viñetas (- ).`;

function resolveModel(provider: Provider, requested: string): string {
  if (provider === "anthropic") return requested || ANTHROPIC_MODEL_OVERRIDE || "claude-haiku-4-5";
  if (provider === "openai") return requested || OPENAI_MODEL_OVERRIDE || "gpt-4o-mini";
  if (provider === "opencode" || provider === "openrouter") return requested || OPENCODE_MODEL_OVERRIDE || "deepseek-v4-flash";
  return requested || GEMINI_MODEL_OVERRIDE || "gemini-3.6-flash";
}

function resolveProvider(requested?: string): Provider {
  if (requested === "gemini" || requested === "anthropic" || requested === "openai" || requested === "openrouter" || requested === "opencode") {
    return requested;
  }
  const envProvider = DEFAULT_PROVIDER_OVERRIDE as Provider;
  if (envProvider === "gemini" || envProvider === "anthropic" || envProvider === "openai" || envProvider === "openrouter" || envProvider === "opencode") {
    return envProvider;
  }
  return "opencode";
}

export async function POST(req: Request) {
  // 1. Verificación de Origin / Referer
  const originCheck = verifyOrigin(req);
  if (!originCheck.ok) {
    return new Response(originCheck.error || "No autorizado", { status: originCheck.status || 403 });
  }

  // 2. Rate limiting (40 respuestas por minuto por IP)
  const rl = checkRateLimit(req, { limit: 40, windowMs: 60_000, keyPrefix: "answer" });
  if (!rl.allowed) {
    return new Response("Límite de solicitudes excedido. Por favor, aguardá unos instantes.", { status: 429 });
  }

  let body: {
    profile?: string;
    company?: string;
    role?: string;
    answerLang?: string;
    detectedLang?: string;
    transcript?: string;
    question?: string;
    provider?: string;
    model?: string;
    bilingualMode?: boolean;
    simpleEnglish?: boolean;
    type?: "answer" | "icebreaker";
    extraInstructions?: string;
    previousAnswers?: { q: string; a: string }[];
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
  // Limitar transcripción a los últimos 2,500 caracteres para optimizar TTFT y evitar acumulación
  const transcript = (body.transcript || "").slice(-2500);
  const question = (body.question || "").slice(0, 1000);
  const detectedLang = body.detectedLang || "es";

  const answerLangLabel = `
INFO DE SISTEMA: El entrevistador habló en **${detectedLang === "en" ? "INGLÉS" : "ESPAÑOL"}**.
- Si es INGLÉS: Respondé usando los bloques [EN] y [ES].
- Si es ESPAÑOL: Respondé en Español rioplatense natural.`;

  const basePrompt = body.type === "icebreaker" ? ICEBREAKER_PROMPT : SYSTEM_PROMPT;
  const effectiveSystemPrompt = basePrompt + AUTO_LANGUAGE_SUFFIX;
  const extraInstructions = (body.extraInstructions || "").slice(0, 800);

  // Limitar a las últimas 2 respuestas previas para no inflar tokens
  const previousAnswers = (body.previousAnswers || []).slice(-2);
  let historySection = "";
  if (previousAnswers.length > 0) {
    historySection = `## RESPUESTAS PREVIAS (NO REPETIR ANÉCDOTAS):\n`;
    previousAnswers.forEach((pa) => {
      historySection += `Q: ${pa.q.slice(0, 200)}\nA: ${pa.a.slice(0, 300)}\n\n`;
    });
  }

  const userContent = `## EMPRESA
${company || "(sin especificar)"}

## PUESTO
${role || "(sin especificar)"}

## PERFIL DEL CANDIDATO
${profile || "(sin perfil cargado)"}

${extraInstructions ? `## INSTRUCCIONES EXTRA\n${extraInstructions}\n` : ""}
## IDIOMA
${answerLangLabel}

${body.type === "icebreaker" ? "## MODO ICEBREAKER (PREGUNTAS AL ENTREVISTADOR)" : ""}
${historySection}
## CONTEXTO RECIENTE
${transcript || "(vacío)"}

## ÚLTIMA PREGUNTA A RESPONDER
[PREGUNTA] ${question || "(ninguna aún)"}`;

  const FALLBACK: Record<Provider, string[]> = {
    opencode: ["deepseek-v4-flash-free", "deepseek-v4-flash", "glm-5.2", "gpt-5.6-luna"],
    openrouter: ["deepseek-v4-flash-free", "deepseek-v4-flash", "glm-5.2"],
    openai: ["gpt-4.1-mini", "gpt-4o-mini"],
    anthropic: ["claude-haiku-4-5"],
    gemini: ["gemini-3.6-flash", "gemini-2.5-flash"],
  };

  const candidates = [model, ...FALLBACK[provider].filter((m) => m !== model)];

  try {
    if (provider === "anthropic") return await streamAnthropic(candidates, userContent, effectiveSystemPrompt);
    if (provider === "opencode" || provider === "openrouter") return await streamOpenCode(candidates, userContent, effectiveSystemPrompt);
    if (provider === "openai") return await streamOpenAI(candidates, userContent, effectiveSystemPrompt);
    return await streamGemini(candidates, userContent, effectiveSystemPrompt);
  } catch (err: any) {
    return new Response(`Error del modelo: ${err?.message || "desconocido"}`, { status: 502 });
  }
}
