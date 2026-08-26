import { verifyOrigin, checkRateLimit } from "../../lib/security";

export const runtime = "edge";

type Provider = "gemini" | "anthropic" | "openai" | "openrouter" | "opencode";

const GEMINI_MODEL_OVERRIDE = process.env.GEMINI_MODEL || "";
const ANTHROPIC_MODEL_OVERRIDE = process.env.ANTHROPIC_MODEL || "";
const OPENAI_MODEL_OVERRIDE = process.env.OPENAI_MODEL || "";
const OPENCODE_MODEL_OVERRIDE = process.env.OPENCODE_MODEL || process.env.OPENROUTER_MODEL || "";
const DEFAULT_PROVIDER_OVERRIDE = (process.env.LLM_PROVIDER || "").toLowerCase();
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://loro-copilot.vercel.app";
const APP_NAME = "Loro Copilot";

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

function resolveModel(provider: Provider, requested: string): string {
  if (provider === "anthropic") return ANTHROPIC_MODEL_OVERRIDE || requested || "claude-haiku-4-5";
  if (provider === "openai") return OPENAI_MODEL_OVERRIDE || requested || "gpt-4o-mini";
  if (provider === "opencode" || provider === "openrouter") return OPENCODE_MODEL_OVERRIDE || requested || "deepseek-v4-flash-free";
  return GEMINI_MODEL_OVERRIDE || requested || "gemini-3.6-flash";
}

function resolveProvider(requested?: string): Provider {
  const envProvider = DEFAULT_PROVIDER_OVERRIDE as Provider;
  if (envProvider === "gemini" || envProvider === "anthropic" || envProvider === "openai" || envProvider === "openrouter" || envProvider === "opencode") {
    return envProvider;
  }
  if (requested === "anthropic" || requested === "openai" || requested === "openrouter" || requested === "opencode") return requested;
  return "opencode";
}

export async function POST(req: Request) {
  // 1. Origin Check
  const originCheck = verifyOrigin(req);
  if (!originCheck.ok) {
    return new Response(originCheck.error || "No autorizado", { status: originCheck.status || 403 });
  }

  // 2. Rate Limiting (40 req/min)
  const rl = checkRateLimit(req, { limit: 40, windowMs: 60_000, keyPrefix: "simulador" });
  if (!rl.allowed) {
    return new Response("Límite de solicitudes excedido.", { status: 429 });
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
    lastAnswerLikelyCut?: boolean;
    image?: string;
  };
  try {
    body = await req.json();
  } catch {
    return new Response("Body inválido.", { status: 400 });
  }

  const action = body.action || "next-question";
  const provider: Provider = resolveProvider(body.provider);
  const model = resolveModel(provider, (body.model || "").slice(0, 100));

  const profile = (body.profile || "").slice(0, 6000);
  const company = (body.company || "").slice(0, 200);
  const role = (body.role || "").slice(0, 1500);
  const interviewType = (body.interviewType || "General").slice(0, 100);
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

  const FALLBACK: Record<Provider, string[]> = {
    opencode: ["deepseek-v4-flash-free", "deepseek-v4-flash", "glm-5.2", "gpt-5.6-luna"],
    openrouter: ["deepseek-v4-flash-free", "deepseek-v4-flash", "glm-5.2"],
    openai: ["gpt-4.1-mini", "gpt-4o-mini"],
    anthropic: ["claude-haiku-4-5"],
    gemini: ["gemini-3.6-flash", "gemini-2.5-flash"],
  };
  const candidates = [model, ...FALLBACK[provider].filter((m) => m !== model)];

  try {
    if (isFeedback) {
      return await getFeedback(provider, candidates, systemPrompt, userContent);
    } else {
      if (provider === "anthropic") return await streamAnthropic(candidates, systemPrompt, userContent);
      if (provider === "opencode" || provider === "openrouter") return await streamOpenRouter(candidates, systemPrompt, userContent);
      if (provider === "openai") return await streamOpenAI(candidates, systemPrompt, userContent);
      return await streamGemini(candidates, systemPrompt, userContent);
    }
  } catch (err: any) {
    return new Response(`Error del modelo: ${err?.message || "desconocido"}`, { status: 502 });
  }
}

function textStreamResponse(stream: ReadableStream) {
  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

function sseTextStream(
  upstream: ReadableStream<Uint8Array>,
  extract: (json: string) => string | null
): ReadableStream {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const reader = upstream.getReader();
  let buffer = "";
  return new ReadableStream({
    async pull(controller) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
          return;
        }
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        let enqueuedAny = false;
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const json = trimmed.slice(5).trim();
          if (!json || json === "[DONE]") continue;
          try {
            const text = extract(json);
            if (text) {
              controller.enqueue(encoder.encode(text));
              enqueuedAny = true;
            }
          } catch {}
        }
        if (enqueuedAny) return;
      }
    },
    cancel() {
      reader.cancel();
    },
  });
}

async function streamGemini(models: string[], systemPrompt: string, userContent: string): Promise<Response> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return new Response("Falta GEMINI_API_KEY.", { status: 500 });
  const payload = {
    contents: [{ role: "user", parts: [{ text: userContent }] }],
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: {
      temperature: 0.5,
      maxOutputTokens: 512,
      thinkingConfig: { thinkingBudget: 0 },
    },
  };
  let detail = "";
  for (const model of models) {
    if (!model) continue;
    try {
      const upstream = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (upstream.ok && upstream.body) {
        return textStreamResponse(
          sseTextStream(upstream.body, (json) => {
            const evt = JSON.parse(json);
            return evt.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
          })
        );
      }
      detail = await upstream.text().catch(() => "");
    } catch (e: any) {
      detail = e?.message || "";
    }
  }
  return new Response(`Gemini error: ${detail}`, { status: 502 });
}

async function streamAnthropic(models: string[], systemPrompt: string, userContent: string): Promise<Response> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return new Response("Falta ANTHROPIC_API_KEY.", { status: 500 });
  let detail = "";
  for (const model of models) {
    if (!model) continue;
    try {
      const upstream = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          max_tokens: 512,
          temperature: 0.5,
          system: systemPrompt,
          messages: [{ role: "user", content: userContent }],
          stream: true,
        }),
      });
      if (upstream.ok && upstream.body) {
        return textStreamResponse(
          sseTextStream(upstream.body, (json) => {
            const evt = JSON.parse(json);
            if (evt.type === "content_block_delta" && evt.delta?.type === "text_delta") {
              return evt.delta.text ?? null;
            }
            return null;
          })
        );
      }
      detail = await upstream.text().catch(() => "");
    } catch (e: any) {
      detail = e?.message || "";
    }
  }
  return new Response(`Claude error: ${detail}`, { status: 502 });
}

async function streamOpenAI(models: string[], systemPrompt: string, userContent: string): Promise<Response> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return new Response("Falta OPENAI_API_KEY.", { status: 500 });
  let detail = "";
  for (const model of models) {
    if (!model) continue;
    const isReasoning = /^(gpt-5|o[0-9])/.test(model);
    const reqBody: Record<string, unknown> = {
      model,
      stream: true,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
    };
    if (isReasoning) {
      reqBody.max_completion_tokens = 900;
      reqBody.reasoning_effort = "low";
    } else {
      reqBody.max_tokens = 512;
      reqBody.temperature = 0.5;
    }
    try {
      const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(reqBody),
      });
      if (upstream.ok && upstream.body) {
        return textStreamResponse(
          sseTextStream(upstream.body, (json) => {
            const evt = JSON.parse(json);
            return evt.choices?.[0]?.delta?.content ?? null;
          })
        );
      }
      detail = await upstream.text().catch(() => "");
    } catch (e: any) {
      detail = e?.message || "";
    }
  }
  return new Response(`GPT error: ${detail}`, { status: 502 });
}

async function streamOpenRouter(models: string[], systemPrompt: string, userContent: string): Promise<Response> {
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENCODE_API_KEY;
  const baseUrl = process.env.OPENROUTER_BASE_URL || process.env.OPENCODE_BASE_URL || "https://openrouter.ai/api/v1";
  if (!apiKey) return new Response("Falta OPENROUTER_API_KEY.", { status: 500 });
  let detail = "";
  for (const model of models) {
    if (!model) continue;
    const isReasoning = /^(gpt-5|o[0-9]|deepseek-r1)/.test(model);
    const reqBody: Record<string, unknown> = {
      model,
      stream: true,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
    };
    if (isReasoning) {
      reqBody.max_completion_tokens = 900;
      reqBody.reasoning_effort = "low";
    } else {
      reqBody.max_tokens = 512;
      reqBody.temperature = 0.5;
    }
    try {
      const upstream = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": SITE_URL,
          "X-Title": APP_NAME,
        },
        body: JSON.stringify(reqBody),
      });
      if (upstream.ok && upstream.body) {
        return textStreamResponse(
          sseTextStream(upstream.body, (json) => {
            const evt = JSON.parse(json);
            return evt.choices?.[0]?.delta?.content ?? null;
          })
        );
      }
      detail = await upstream.text().catch(() => "");
    } catch (e: any) {
      detail = e?.message || "";
    }
  }
  return new Response(`OpenRouter error: ${detail}`, { status: 502 });
}

function parseModelJson(text: string): unknown {
  const cleaned = (text || "").trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(cleaned.slice(start, end + 1));
    throw new Error("JSON inválido del modelo");
  }
}

async function getFeedback(
  provider: Provider,
  models: string[],
  systemPrompt: string,
  userContent: string
): Promise<Response> {
  if (provider === "openai" || provider === "openrouter" || provider === "opencode") {
    const isOpencode = provider === "opencode" || provider === "openrouter";
    const baseUrl = isOpencode ? (process.env.OPENCODE_BASE_URL || process.env.OPENROUTER_BASE_URL || "https://api.opencode.ai/v1") : "https://api.openai.com/v1";
    const apiKey = isOpencode ? (process.env.OPENCODE_API_KEY || process.env.OPENROUTER_API_KEY) : process.env.OPENAI_API_KEY;
    if (!apiKey) return new Response(isOpencode ? "Falta OPENCODE_API_KEY." : "Falta OPENAI_API_KEY.", { status: 500 });
    let detail = "";
    for (const model of models) {
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          ...(provider === "openrouter" ? { "HTTP-Referer": SITE_URL, "X-Title": APP_NAME } : {}),
        },
        body: JSON.stringify({
          model,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userContent },
          ],
        }),
      });
      if (res.ok) {
        const j = await res.json();
        try {
          return Response.json(parseModelJson(j.choices?.[0]?.message?.content || "{}"));
        } catch {
          detail = "JSON inválido del modelo";
          continue;
        }
      }
      detail = await res.text().catch(() => "");
    }
    return new Response(`Feedback error: ${detail}`, { status: 502 });
  }

  if (provider === "anthropic") {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return new Response("Falta ANTHROPIC_API_KEY.", { status: 500 });
    let detail = "";
    for (const model of models) {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
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
      });
      if (res.ok) {
        const j = await res.json();
        try {
          return Response.json(parseModelJson(j.content?.[0]?.text || "{}"));
        } catch {
          detail = "JSON inválido del modelo";
          continue;
        }
      }
      detail = await res.text().catch(() => "");
    }
    return new Response(`Anthropic feedback error: ${detail}`, { status: 502 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return new Response("Falta GEMINI_API_KEY.", { status: 500 });
  let detail = "";
  for (const model of models) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: userContent }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 4096,
            responseMimeType: "application/json",
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
      }
    );
    if (res.ok) {
      const j = await res.json();
      try {
        return Response.json(parseModelJson(j.candidates?.[0]?.content?.parts?.[0]?.text || "{}"));
      } catch {
        detail = "JSON inválido del modelo";
        continue;
      }
    }
    detail = await res.text().catch(() => "");
  }
  return new Response(`Gemini feedback error: ${detail}`, { status: 502 });
}
