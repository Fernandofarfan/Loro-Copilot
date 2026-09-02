import { NextResponse } from "next/server";
import { verifyOrigin, checkRateLimitAsync } from "../../lib/security";

export const runtime = "edge";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

export async function POST(req: Request) {
  // 1. Verificación de Origin / Referer
  const originCheck = verifyOrigin(req);
  if (!originCheck.ok) {
    return NextResponse.json(
      { error: originCheck.error || "No autorizado" },
      { status: originCheck.status || 403 }
    );
  }

  // 2. Rate limiting (10 solicitudes por minuto por IP)
  const rl = await checkRateLimitAsync(req, { limit: 10, windowMs: 60_000, keyPrefix: "waitlist" });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Por favor, intentá más tarde." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
    );
  }

  let body: { email?: string; source?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const email = (body.email || "").trim().toLowerCase();
  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "Por favor, ingresá un email válido." }, { status: 400 });
  }

  const gformAction = process.env.GFORM_ACTION;
  const gformEmailEntry = process.env.GFORM_EMAIL_ENTRY;

  // Si no está configurado el backend de persistencia, responder 503 explícito
  if (!gformAction || !gformEmailEntry) {
    return NextResponse.json(
      { ok: false, error: "Servicio de lista de espera temporalmente no disponible." },
      { status: 503 }
    );
  }

  try {
    const formData = new URLSearchParams();
    formData.append(gformEmailEntry, email);
    if (body.source) {
      formData.append("entry.source", body.source);
    }
    const formRes = await fetch(gformAction, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    if (!formRes.ok && formRes.status !== 0) {
      console.error("Error al registrar en Google Form:", formRes.status);
      return NextResponse.json(
        { ok: false, error: "No se pudo registrar tu solicitud en este momento. Por favor, intentá nuevamente." },
        { status: 502 }
      );
    }
  } catch (e) {
    console.error("Error enviando a Google Form:", e);
    return NextResponse.json(
      { ok: false, error: "No se pudo completar el registro. Intentá nuevamente." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, message: "¡Listo! Te avisaremos apenas haya nuevos cupos." });
}
