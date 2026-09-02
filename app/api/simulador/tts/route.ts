import { verifyOrigin, checkRateLimitAsync, checkCapacity } from "../../../lib/security";
import { fetchWithTimeout } from "../../../lib/llm";

export const runtime = "edge";

// Voz del entrevistador del simulador. gpt-4o-mini-tts soporta `instructions`
// (tono/acento); tts-1 no, por eso el retry lo omite.
const TTS_MODEL = "gpt-4o-mini-tts";
const TTS_MODEL_FALLBACK = "tts-1";
const TTS_VOICE = "nova";
const FALLBACK_SPEED = 1.25;

const INSTRUCTIONS: Record<"es" | "en", string> = {
  es: "Sos una entrevistadora argentina, cálida y amena. Hablá con acento rioplatense (Buenos Aires): voseo, entonación porteña, la 'll' e 'y' como 'sh' suave. Ritmo rápido y enérgico de conversación porteña, sin sonar apurada ni leída.",
  en: "You are a warm, friendly and professional female job interviewer. Fast, energetic conversational pace, without sounding rushed.",
};

async function requestSpeech(apiKey: string, model: string, text: string, lang: "es" | "en") {
  const body: Record<string, unknown> = {
    model,
    voice: TTS_VOICE,
    input: text,
    response_format: "mp3",
  };
  if (model === TTS_MODEL) {
    body.instructions = INSTRUCTIONS[lang];
  } else {
    body.speed = FALLBACK_SPEED;
  }
  return fetchWithTimeout(
    "https://api.openai.com/v1/audio/speech",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    },
    30_000
  );
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

  // 2. Rate Limiting (60 TTS por minuto por IP)
  const rl = await checkRateLimitAsync(req, { limit: 60, windowMs: 60_000, keyPrefix: "tts" });
  if (!rl.allowed) {
    return new Response("Límite de solicitudes excedido.", {
      status: 429,
      headers: { "Retry-After": String(rl.retryAfterSeconds) },
    });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response("Falta OPENAI_API_KEY para la voz del entrevistador.", { status: 500 });
  }

  let body: { text?: string; lang?: string };
  try {
    body = await req.json();
  } catch {
    return new Response("Body inválido", { status: 400 });
  }

  const text = (body.text || "").trim().slice(0, 1000);
  if (!text) {
    return new Response("Texto vacío", { status: 400 });
  }
  const lang: "es" | "en" = body.lang === "en" ? "en" : "es";

  try {
    let res = await requestSpeech(apiKey, TTS_MODEL, text, lang);
    if (!res.ok) {
      res = await requestSpeech(apiKey, TTS_MODEL_FALLBACK, text, lang);
    }
    if (!res.ok) {
      const err = await res.text().catch(() => "");
      return new Response(`Error de OpenAI TTS: ${err}`, { status: 502 });
    }
    const audioData = await res.arrayBuffer();
    return new Response(audioData, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err: any) {
    return new Response(`Error generando voz: ${err?.message || "desconocido"}`, { status: 502 });
  }
}
