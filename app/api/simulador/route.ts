import { NextResponse } from "next/server";
import {
  streamForProvider,
  buildCandidates,
  resolveProvider,
  resolveModel,
  completeJsonForProvider,
  type Provider,
} from "../../lib/llm";
import { verifyOrigin, verifySharedSecret, checkRateLimitAsync, checkCapacity } from "../../lib/security";
import {
  analyzeCvVulnerabilities,
} from "../../lib/vulnerabilityRadar";
import {
  buildInterviewerSystemPrompt,
} from "../../lib/simuladorPersonas";
import { sanitizeForPrompt } from "../../lib/promptUtils";

export const runtime = "edge";

const SYSTEM_PROMPT_INTERVIEWER = buildInterviewerSystemPrompt("standard");

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
  try {
    const parsed = await completeJsonForProvider(provider, models, systemPrompt, userContent, {
      temperature: 0.2,
      maxTokens: 4096,
    });
    return NextResponse.json(parsed);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(`Error generando feedback: ${msg}`, { status: 502 });
  }
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

  // 1b. Token compartido (solo si LORO_SHARED_TOKEN está configurado)
  const secretCheck = verifySharedSecret(req);
  if (!secretCheck.ok) {
    return new Response(secretCheck.error || "No autorizado", { status: secretCheck.status || 401 });
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
    action?: "next-question" | "feedback" | "closing" | "vulnerability-radar";
    persona?: "standard" | "amazon_bar_raiser" | "skeptic_architect" | "faang_recruiter";
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
    pushbackMode?: boolean;
    jobDescription?: string;
    image?: string;
  };
  try {
    body = await req.json();
  } catch {
    return new Response("Body inválido.", { status: 400 });
  }

  const action = body.action || "next-question";
  const profile = sanitizeForPrompt((body.profile || "").slice(0, 6000));
  const company = sanitizeForPrompt((body.company || "").slice(0, 200));
  const role = sanitizeForPrompt((body.role || "").slice(0, 1500));
  const jobDescription = sanitizeForPrompt((body.jobDescription || "").slice(0, 4000));
  const rawImage = typeof body.image === "string" ? body.image : null;
  const image =
    rawImage && rawImage.startsWith("data:image/") && rawImage.length <= 3_000_000
      ? {
          mimeType: rawImage.slice(5, rawImage.indexOf(";")),
          data: rawImage.slice(rawImage.indexOf(",") + 1),
        }
      : null;

  // Manejo de escaneo de radar de vulnerabilidades previo a la entrevista
  if (action === "vulnerability-radar") {
    const vulns = analyzeCvVulnerabilities(profile, role, company);
    return NextResponse.json({ vulnerabilities: vulns });
  }

  const provider: Provider = resolveProvider(body.provider);
  const model = resolveModel(provider, (body.model || "").slice(0, 100));

  const interviewType = sanitizeForPrompt((body.interviewType || "General").slice(0, 100));
  const answerLang = body.answerLang === "en" ? "en" : "es";

  const history = (body.history || []).slice(0, 20).map((h) => ({
    question: sanitizeForPrompt(String(h?.question || "")).slice(0, 600),
    answer: sanitizeForPrompt(String(h?.answer || "")).slice(0, 2000),
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

  let userContent = `## EMPRESA\n${company || "(sin especificar)"}\n\n## DESCRIPCIÓN DEL PUESTO\n${role || "(sin especificar)"}\n\n## PERFIL DEL CANDIDATO\n${profile || "(sin perfil)"}\n\n## TIPO DE ENTREVISTA\n${interviewType}\n\n## PROGRESO\n${progressText}\n\n## ${isFeedback ? "IDIOMA DEL REPORTE" : "IDIOMA DE LA RESPUESTA"}\n${answerLangLabel}\n${isClosing ? "\n## CIERRE\nLa entrevista TERMINÓ. Despedite amablemente.\n" : ""}\n## HISTORIAL\n${historyText}`;

  if (jobDescription) {
    userContent += `\n\n## JOB DESCRIPTION / VACANTE ESPECÍFICA (OBLIGATORIO)\n${jobDescription}\nINSTRUCCIÓN CRÍTICA: Enfoca todas tus preguntas técnicas, desafíos y pushbacks EXCLUSIVAMENTE en las tecnologías, responsabilidades y stack real de esta Job Description.`;
  }
  const systemPrompt = isFeedback
    ? SYSTEM_PROMPT_FEEDBACK
    : buildInterviewerSystemPrompt(body.persona || "standard", !!body.pushbackMode);

  const candidates = buildCandidates(provider, model, 3);

  try {
    if (isFeedback) {
      return await getFeedbackJson(provider, candidates, systemPrompt, userContent);
    } else {
      return await streamForProvider[provider](candidates, userContent, systemPrompt, { image });
    }
  } catch (err: unknown) {
    return new Response(`Error del modelo: ${err instanceof Error ? err.message : "desconocido"}`, { status: 502 });
  }
}
