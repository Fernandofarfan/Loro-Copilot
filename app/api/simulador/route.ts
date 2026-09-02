import { NextResponse } from "next/server";
import {
  streamGemini,
  streamAnthropic,
  streamOpenAI,
  streamOpenCode,
  resolveProvider,
  resolveModel,
  FALLBACK_MODELS,
  parseModelJson,
  fetchWithTimeout,
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

const SYSTEM_PROMPT_INTERVIEWER = `Sos el ENTREVISTADOR. Estás en la llamada haciendo la entrevista en vivo al candidato, ahora mismo.

Recibís:
1. EMPRESA y DESCRIPCIÓN DEL PUESTO (contexto).
2. El PERFIL del candidato (su CV, experiencia, logros).
3. El TIPO DE ENTREVISTA (Técnica, Comportamiento, HR, General).
4. El HISTORIAL de la entrevista hasta ahora (preguntas hechas y respuestas del candidato).

Tu tarea: Generar la SIGUIENTE PREGUNTA de la entrevista.
Reglas:
1. Sé un entrevistador profesional, realista y directo.
2. Si el HISTORIAL está vacío, da una breve bienvenida (máximo 1 oración) y haz la primera pregunta natural.
3. Si ya hay historial, evaluá la última respuesta. Si fue vaga o incompleta, hacé un follow-up directo. Si fue sólida, avanzá a la siguiente pregunta.
4. Mantené tu respuesta corta y conversacional (máximo 2-3 oraciones en total).
5. Hacé una sola pregunta a la vez.
6. Si aparece "## CIERRE": la entrevista terminó. Despedite cordialmente en 1-2 oraciones avisando que le preparás el informe.
7. Devolvé ÚNICAMENTE el texto que diría el entrevistador, sin etiquetas.`;

const SYSTEM_PROMPT_FEEDBACK = `Sos un COACH DE ENTREVISTAS experto ("El Loro" 🦜). Tu tarea es analizar una simulación de entrevista completa y generar un reporte de feedback detallado, constructivo y accionable en formato JSON.

Devolvé ÚNICAMENTE un objeto JSON válido con esta estructura:
{
  "score": 85,
  "level": "Sólido",
  "verdict": "En una entrevista real para este puesto, avanzarías a la siguiente ronda.",
  "topPriority": "La principal mejora de mayor impacto (1 frase).",
  "nextStep": "El paso accionable para lograrlo hoy.",
  "summary": "Resumen general del desempeño...",
  "indicators": [
    { "name": "Claridad", "score": 80 },
    { "name": "Estructura", "score": 70 },
    { "name": "Fit con el puesto", "score": 75 },
    { "name": "Confianza", "score": 65 },
    { "name": "Comunicación", "score": 70 }
  ],
  "strengths": ["Fortaleza 1", "Fortaleza 2"],
  "improvements": ["Mejora 1", "Mejora 2"],
  "questions": [
    {
      "question": "Pregunta realizada",
      "answer": "Respuesta dada",
      "score": 75,
      "analysis": "Análisis específico...",
      "suggestion": "Propuesta de respuesta ideal en primera persona..."
    }
  ]
}`;

async function getFeedbackJson(provider: Provider, models: string[], systemPrompt: string, userContent: string): Promise<Response> {
  let lastError = "";

  if (provider === "openai" || provider === "opencode" || provider === "openrouter") {
    const isOpencode = provider === "opencode" || provider === "openrouter";
    const apiKey = isOpencode
      ? process.env.OPENCODE_API_KEY || process.env.OPENROUTER_API_KEY
      : process.env.OPENAI_API_KEY;
    const rawBaseUrl = isOpencode
      ? process.env.OPENCODE_BASE_URL || process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1"
      : "https://api.openai.com/v1";
    const baseUrl = rawBaseUrl.replace(/\/$/, "");

    if (!apiKey) return new Response(`Falta API key para ${provider}.`, { status: 500 });

    for (const model of models) {
      if (!model) continue;
      try {
        const res = await fetchWithTimeout(`${baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userContent },
            ],
            temperature: 0.2,
            response_format: { type: "json_object" },
          }),
        }, 25_000);

        if (res.ok) {
          const j = await res.json();
          const content = j.choices?.[0]?.message?.content;
          if (content) {
            return NextResponse.json(parseModelJson(content));
          }
        }
        lastError = await res.text().catch(() => "");
      } catch (err: unknown) {
        lastError = err instanceof Error ? err.message : String(err);
      }
    }
  }

  if (provider === "anthropic") {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return new Response("Falta ANTHROPIC_API_KEY.", { status: 500 });

    for (const model of models) {
      if (!model) continue;
      try {
        const res = await fetchWithTimeout("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model,
            max_tokens: 2048,
            system: systemPrompt,
            messages: [{ role: "user", content: userContent }],
          }),
        }, 25_000);

        if (res.ok) {
          const j = await res.json();
          const text = j.content?.[0]?.text;
          if (text) {
            return NextResponse.json(parseModelJson(text));
          }
        }
        lastError = await res.text().catch(() => "");
      } catch (err: unknown) {
        lastError = err instanceof Error ? err.message : String(err);
      }
    }
  }

  // Gemini feedback
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    if (provider === "gemini") {
      return new Response("Falta GEMINI_API_KEY en las variables de entorno.", { status: 500 });
    }
    return new Response(`Error generando feedback (${provider}): ${lastError || "No se pudo obtener respuesta del modelo."}`, { status: 502 });
  }

  for (const model of models) {
    if (!model) continue;
    try {
      const res = await fetchWithTimeout(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": geminiKey,
          },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: userContent }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 4096,
              responseMimeType: "application/json",
            },
          }),
        },
        25_000
      );

      if (res.ok) {
        const j = await res.json();
        const text = j.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return NextResponse.json(parseModelJson(text));
        }
      }
      lastError = await res.text().catch(() => "");
    } catch (err: unknown) {
      lastError = err instanceof Error ? err.message : String(err);
    }
  }

  return new Response(`Error generando feedback: ${lastError}`, { status: 502 });
}

export async function POST(req: Request) {
  // 0. Kill switch de capacidad
  const capacity = checkCapacity();
  if (!capacity.ok) {
    return new Response(capacity.error, { status: capacity.status || 503 });
  }

  // 1. Origin Check
  const originCheck = verifyOrigin(req);
  if (!originCheck.ok) {
    return new Response(originCheck.error || "No autorizado", { status: originCheck.status || 403 });
  }

  // 2. Rate Limiting (40 req/min)
  const rl = await checkRateLimitAsync(req, { limit: 40, windowMs: 60_000, keyPrefix: "simulador" });
  if (!rl.allowed) {
    return new Response("Límite de solicitudes excedido.", {
      status: 429,
      headers: { "Retry-After": String(rl.retryAfterSeconds) },
    });
  }

  let body: {
    action?: "next-question" | "feedback" | "closing";
    profile?: string;
    company?: string;
    role?: string;
    interviewType?: string;
    answerLang?: string;
    provider?: string;
    model?: string;
    history?: Array<{ question: string; answer: string }>;
    questionIndex?: number;
    questionsCount?: number;
  };
  try {
    body = await req.json();
  } catch {
    return new Response("Body inválido.", { status: 400 });
  }

  const action = body.action || "next-question";
  const provider: Provider = resolveProvider(body.provider);
  const model = resolveModel(provider, (body.model || "").slice(0, 100));

  const profile = sanitizeForPrompt((body.profile || "").slice(0, 6000));
  const company = sanitizeForPrompt((body.company || "").slice(0, 200));
  const role = sanitizeForPrompt((body.role || "").slice(0, 1500));
  const interviewType = sanitizeForPrompt((body.interviewType || "General").slice(0, 100));
  const answerLang = body.answerLang === "en" ? "en" : "es";

  const history = (body.history || []).slice(0, 20).map((h) => ({
    question: String(h?.question || "").slice(0, 600),
    answer: String(h?.answer || "").slice(0, 2000),
  }));
  const historyText = history.length > 0
    ? history.map((h, i) => `Pregunta ${i + 1}: ${h.question}\nRespuesta ${i + 1}: ${h.answer}`).join("\n\n")
    : "(Aún no comenzó la entrevista)";

  const qIndex = Math.max(1, Math.min(50, Number(body.questionIndex) || history.length + 1));
  const qCount = Math.max(0, Math.min(20, Number(body.questionsCount) || 0));
  const progressText = qCount
    ? `Esta es la pregunta ${qIndex} de ${qCount}.${qIndex >= qCount ? " Es la ÚLTIMA pregunta." : ""}`
    : "(sin límite definido)";

  const isFeedback = action === "feedback";
  const isClosing = action === "closing";

  const answerLangLabel = isFeedback
    ? answerLang === "en"
      ? "Inglés (English). Escribí TODO el reporte en inglés."
      : "Español rioplatense (Argentina). Escribí todo el reporte en español rioplatense con voseo."
    : answerLang === "en"
      ? "Inglés (English). Formula tus preguntas en inglés."
      : "Español rioplatense (Argentina). Formulá tus preguntas con voseo porteño.";

  const userContent = `## EMPRESA\n${company || "(sin especificar)"}\n\n## DESCRIPCIÓN DEL PUESTO\n${role || "(sin especificar)"}\n\n## PERFIL DEL CANDIDATO\n${profile || "(sin perfil)"}\n\n## TIPO DE ENTREVISTA\n${interviewType}\n\n## PROGRESO\n${progressText}\n\n## ${isFeedback ? "IDIOMA DEL REPORTE" : "IDIOMA DE LA RESPUESTA"}\n${answerLangLabel}\n${isClosing ? "\n## CIERRE\nLa entrevista TERMINÓ. Despedite amablemente.\n" : ""}\n## HISTORIAL\n${historyText}`;
  const systemPrompt = isFeedback ? SYSTEM_PROMPT_FEEDBACK : SYSTEM_PROMPT_INTERVIEWER;

  const candidates = Array.from(new Set([model, ...FALLBACK_MODELS[provider]])).slice(0, 3);

  try {
    if (isFeedback) {
      return await getFeedbackJson(provider, candidates, systemPrompt, userContent);
    } else {
      if (provider === "anthropic") return await streamAnthropic(candidates, userContent, systemPrompt);
      if (provider === "opencode" || provider === "openrouter") return await streamOpenCode(candidates, userContent, systemPrompt);
      if (provider === "openai") return await streamOpenAI(candidates, userContent, systemPrompt);
      return await streamGemini(candidates, userContent, systemPrompt);
    }
  } catch (err: unknown) {
    return new Response(`Error del modelo: ${err instanceof Error ? err.message : "desconocido"}`, { status: 502 });
  }
}
