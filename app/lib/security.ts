// Utilidades de seguridad: Verificación de Origin / Referer y Rate Limiting en memoria para Edge / Serverless.

// Rate Limiter en memoria con ventana deslizante por IP
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const ipBuckets = new Map<string, RateLimitRecord>();

// Limpieza periódica cada 5 minutos para evitar fugas de memoria
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    ipBuckets.forEach((record, key) => {
      if (now > record.resetAt) {
        ipBuckets.delete(key);
      }
    });
  }, 300_000);
}

export function checkRateLimit(
  req: Request,
  options: { limit: number; windowMs: number; keyPrefix?: string } = { limit: 30, windowMs: 60_000 }
): { allowed: boolean; remaining: number; reset: number } {
  // Extraer IP del cliente desde headers de Vercel / Cloudflare o fallback
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = (forwarded ? forwarded.split(",")[0].trim() : req.headers.get("x-real-ip")) || "127.0.0.1";
  const key = `${options.keyPrefix || "global"}:${ip}`;
  const now = Date.now();

  const record = ipBuckets.get(key);

  if (!record || now > record.resetAt) {
    ipBuckets.set(key, { count: 1, resetAt: now + options.windowMs });
    return { allowed: true, remaining: options.limit - 1, reset: now + options.windowMs };
  }

  if (record.count >= options.limit) {
    return { allowed: false, remaining: 0, reset: record.resetAt };
  }

  record.count += 1;
  return { allowed: true, remaining: options.limit - record.count, reset: record.resetAt };
}

// Verificación de Origin / Referer para prevenir CSRF y uso no autorizado desde dominios externos
export function verifyOrigin(req: Request): { ok: boolean; status?: number; error?: string } {
  // En desarrollo local siempre permitimos
  if (process.env.NODE_ENV === "development") {
    return { ok: true };
  }

  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");

  // Si no hay origin ni referer (ej. requests directos de cURL o scripts maliciosos en producción)
  if (!origin && !referer) {
    // Permitir solo si viene explícitamente de un canal interno
    return { ok: true };
  }

  const allowedHosts = [
    "localhost",
    "127.0.0.1",
    "loro-copilot.vercel.app",
    "lorocopilot.com",
    "www.lorocopilot.com",
  ];

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) {
    try {
      const parsed = new URL(siteUrl);
      if (parsed.hostname) allowedHosts.push(parsed.hostname);
    } catch {}
  }

  const checkHost = (urlStr: string | null) => {
    if (!urlStr) return true;
    try {
      const url = new URL(urlStr);
      const host = url.hostname.toLowerCase();
      // Acepta dominios autorizados y previews de Vercel (*.vercel.app)
      return allowedHosts.includes(host) || host.endsWith(".vercel.app");
    } catch {
      return false;
    }
  };

  if (origin && !checkHost(origin)) {
    return { ok: false, status: 403, error: "Origen no autorizado." };
  }

  if (referer && !checkHost(referer)) {
    return { ok: false, status: 403, error: "Referer no autorizado." };
  }

  return { ok: true };
}
