import { verifyOrigin, checkRateLimit } from "../../lib/security";

export const runtime = "edge";

// Emite un TOKEN TEMPORAL de Deepgram (grant), no la API key permanente.
// El token expira a los 60s: alcanza para abrir el WebSocket y después es
// inútil. La key permanente NUNCA llega al navegador.
export async function POST(req: Request) {
  // 1. Verificación de Origin / Referer
  const originCheck = verifyOrigin(req);
  if (!originCheck.ok) {
    return Response.json({ error: originCheck.error || "No autorizado" }, { status: originCheck.status || 403 });
  }

  // 2. Rate limiting (20 tokens por minuto por IP)
  const rl = checkRateLimit(req, { limit: 20, windowMs: 60_000, keyPrefix: "deepgram-token" });
  if (!rl.allowed) {
    return Response.json(
      { error: "Límite de solicitudes excedido. Por favor, esperá un momento." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  const rawKey = process.env.DEEPGRAM_API_KEY;
  if (!rawKey) {
    return Response.json(
      { error: "Falta DEEPGRAM_API_KEY en las variables de entorno." },
      { status: 500 }
    );
  }
  const apiKey = rawKey.trim().replace(/^["']|["']$/g, "");

  // Camino seguro: token temporal (grant, TTL 60s). Requiere que la key tenga
  // permiso para emitir grants (rol Member+ con scope adecuado).
  try {
    const r = await fetch("https://api.deepgram.com/v1/auth/grant", {
      method: "POST",
      headers: {
        Authorization: `Token ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ttl_seconds: 60 }),
    });

    if (r.ok) {
      const j: any = await r.json().catch(() => ({}));
      const token = j.access_token || j.key;
      if (token) {
        return Response.json({ token, scheme: "bearer", expires_in: j.expires_in ?? 60 });
      }
    }

    // Si la key de Deepgram no tiene permisos de emitir grants (403 Forbidden),
    // hacemos fallback al esquema 'token' directo para que la transcripción en vivo funcione.
    return Response.json({ token: apiKey, scheme: "token", fallback: true });
  } catch (err: any) {
    // Si hay error de red al llamar a Deepgram, también permitimos fallback al token directo
    return Response.json({ token: apiKey, scheme: "token", fallback: true });
  }
}
