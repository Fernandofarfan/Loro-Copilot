import { NextResponse } from "next/server";
import { verifyOrigin, checkRateLimitAsync, checkCapacity } from "../../lib/security";

export const runtime = "edge";

// Emite un TOKEN TEMPORAL de Deepgram (grant, TTL 60s), nunca la API key permanente.
// El token expira a los 60s: alcanza para abrir el WebSocket y luego es descartado.
export async function POST(req: Request) {
  // 0. Kill switch de capacidad
  const capacity = checkCapacity();
  if (!capacity.ok) {
    return NextResponse.json({ error: capacity.error }, { status: capacity.status || 503 });
  }

  // 1. Verificación de Origin / Referer
  const originCheck = verifyOrigin(req);
  if (!originCheck.ok) {
    return NextResponse.json({ error: originCheck.error || "No autorizado" }, { status: originCheck.status || 403 });
  }

  // 2. Rate limiting (10 tokens por minuto por IP)
  const rl = await checkRateLimitAsync(req, { limit: 10, windowMs: 60_000, keyPrefix: "deepgram-token" });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Límite de solicitudes excedido. Por favor, esperá un momento." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
    );
  }

  const rawKey = process.env.DEEPGRAM_API_KEY;
  if (!rawKey) {
    return NextResponse.json(
      { error: "Servicio de transcripción no configurado." },
      { status: 500 }
    );
  }
  const apiKey = rawKey.trim().replace(/^["']|["']$/g, "");

  // Generar token temporal vía Deepgram Auth Grant API (TTL 120s)
  try {
    const r = await fetch("https://api.deepgram.com/v1/auth/grant", {
      method: "POST",
      headers: {
        Authorization: `Token ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ttl_seconds: 120 }),
    });

    if (r.ok) {
      const j = await r.json().catch(() => ({}));
      const token = j.access_token || j.key;
      if (token) {
        return NextResponse.json({ token, scheme: "bearer", expires_in: j.expires_in ?? 120 });
      }
    }

    // Solo habilitar fallback en desarrollo local real (nunca en Vercel, ni staging, ni preview)
    if (process.env.NODE_ENV === "development" && !process.env.VERCEL && apiKey) {
      return NextResponse.json({ token: apiKey, scheme: "token", expires_in: 3600 });
    }

    return NextResponse.json(
      { error: "Error al emitir autorización con el servicio de transcripción." },
      { status: 500 }
    );
  } catch (err: unknown) {
    console.error("Deepgram network error:", err);
    return NextResponse.json(
      { error: "Error de conexión con el servicio de transcripción." },
      { status: 500 }
    );
  }
}
