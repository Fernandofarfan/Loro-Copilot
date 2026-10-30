// Utilidades de seguridad: Verificación de Origin / Referer, Rate Limiting en memoria y Kill Switch de Capacidad para Edge / Serverless.

// Rate Limiter en memoria con ventana deslizante por IP (best-effort por isolate en Vercel Edge)
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const ipBuckets = new Map<string, RateLimitRecord>();

// IP del cliente confiable: x-real-ip lo setea el edge (Vercel) y no es spoofable.
// NUNCA usar el primer valor de x-forwarded-for: el cliente lo prependea y rota
// buckets falsos, bypassando el rate limit completo.
function getClientIp(req: Request): string {
  const realIp = req.headers.get("x-real-ip");
  if (realIp && realIp.trim()) return realIp.trim();
  for (const header of ["x-vercel-forwarded-for", "x-forwarded-for"]) {
    const raw = req.headers.get(header);
    if (raw) {
      const last = raw.split(",").pop()?.trim();
      if (last) return last;
    }
  }
  return "127.0.0.1";
}

function lazyCleanIpBuckets(now: number) {
  // Limpieza lazy si el tamaño supera 100 registros para evitar fugas en runtime Edge
  if (ipBuckets.size > 100) {
    ipBuckets.forEach((record, key) => {
      if (now > record.resetAt) {
        ipBuckets.delete(key);
      }
    });
  }
}

export async function checkRateLimitAsync(
  req: Request,
  options: { limit: number; windowMs: number; keyPrefix?: string } = { limit: 30, windowMs: 60_000 }
): Promise<{ allowed: boolean; remaining: number; reset: number; retryAfterSeconds: number }> {
  const restUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const restToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

  // Advertencia: en producción sin Upstash, el rate limit es por-isolate (no efectivo bajo carga)
  if (process.env.NODE_ENV === "production" && (!restUrl || !restToken)) {
    console.warn("[security] ADVERTENCIA: Rate limiting en memoria (por-isolate). Configurar UPSTASH_REDIS_REST_URL y UPSTASH_REDIS_REST_TOKEN para rate limiting efectivo en producción.");
  }

  if (restUrl && restToken) {
    try {
      const ip = getClientIp(req);
      const key = `rl:${options.keyPrefix || "global"}:${ip}`;
      const expireSeconds = Math.ceil(options.windowMs / 1000);

      // Comando multi-pipeline en Upstash: INCR key + EXPIRE key NX
      const res = await fetch(`${restUrl}/pipeline`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${restToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          ["INCR", key],
          ["EXPIRE", key, expireSeconds, "NX"],
          ["TTL", key],
        ]),
      });

      if (res.ok) {
        const results = await res.json();
        const currentCount = Number(results[0]?.result ?? 1);
        const ttl = Number(results[2]?.result ?? expireSeconds);
        const now = Date.now();
        const resetAt = now + (ttl > 0 ? ttl * 1000 : options.windowMs);

        if (currentCount > options.limit) {
          return {
            allowed: false,
            remaining: 0,
            reset: resetAt,
            retryAfterSeconds: ttl > 0 ? ttl : 1,
          };
        }

        return {
          allowed: true,
          remaining: Math.max(0, options.limit - currentCount),
          reset: resetAt,
          retryAfterSeconds: 0,
        };
      }
    } catch {
      // Fallback a Map en memoria si Upstash falla
    }
  }

  return checkRateLimit(req, options);
}

export function checkRateLimit(
  req: Request,
  options: { limit: number; windowMs: number; keyPrefix?: string } = { limit: 30, windowMs: 60_000 }
): { allowed: boolean; remaining: number; reset: number; retryAfterSeconds: number } {
  const ip = getClientIp(req);
  const key = `${options.keyPrefix || "global"}:${ip}`;
  const now = Date.now();

  lazyCleanIpBuckets(now);

  const record = ipBuckets.get(key);

  if (!record || now > record.resetAt) {
    const resetAt = now + options.windowMs;
    ipBuckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: options.limit - 1, reset: resetAt, retryAfterSeconds: 0 };
  }

  if (record.count >= options.limit) {
    const retryAfterSeconds = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
    return { allowed: false, remaining: 0, reset: record.resetAt, retryAfterSeconds };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: options.limit - record.count,
    reset: record.resetAt,
    retryAfterSeconds: 0,
  };
}

// Verificación de Origin / Referer para prevenir CSRF y uso no autorizado desde dominios externos
export function verifyOrigin(req: Request): { ok: boolean; status?: number; error?: string } {
  // En desarrollo local siempre permitimos
  if (process.env.NODE_ENV === "development") {
    return { ok: true };
  }

  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");

  // En producción se exige Origin o Referer
  if (!origin && !referer) {
    return { ok: false, status: 403, error: "Origen o Referer requerido en producción." };
  }

  const isProd = process.env.NODE_ENV === "production";
  const allowedHosts = [
    "loro-copilot.vercel.app",
    "lorocopilot.com",
    "www.lorocopilot.com",
  ];

  // Solo permitir localhost / 127.0.0.1 fuera del entorno de producción
  if (!isProd) {
    allowedHosts.push("localhost", "127.0.0.1");
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) {
    try {
      const parsed = new URL(siteUrl);
      if (parsed.hostname) allowedHosts.push(parsed.hostname.toLowerCase());
    } catch {}
  }

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    try {
      const parsed = new URL(vercelUrl.startsWith("http") ? vercelUrl : `https://${vercelUrl}`);
      if (parsed.hostname) allowedHosts.push(parsed.hostname.toLowerCase());
    } catch {}
  }

  const checkHost = (urlStr: string | null) => {
    if (!urlStr) return true;
    try {
      const url = new URL(urlStr);
      const host = url.hostname.toLowerCase();
      return allowedHosts.includes(host);
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

// Verificación opcional de token compartido para frenar el abuso de costos en rutas LLM.
// Solo se enforcea si LORO_SHARED_TOKEN está configurado (default: passthrough).
// El cliente lo envía como header `x-loro-token` vía app/lib/apiFetch.ts.
export function verifySharedSecret(req: Request): { ok: boolean; status?: number; error?: string } {
  const expected = process.env.LORO_SHARED_TOKEN;
  if (!expected) return { ok: true };
  const provided = req.headers.get("x-loro-token");
  if (provided && provided === expected) return { ok: true };
  return {
    ok: false,
    status: 401,
    error: "Token compartido ausente o inválido (ver LORO_SHARED_TOKEN / NEXT_PUBLIC_LORO_SHARED_TOKEN).",
  };
}

// Kill Switch: si CAPACITY_CLOSED=1, frena el consumo de APIs LLM y STT
export function checkCapacity(): { ok: boolean; status?: number; error?: string } {
  if (process.env.CAPACITY_CLOSED === "1") {
    return {
      ok: false,
      status: 503,
      error: "🛑 Capacidad temporalmente agotada por alta demanda. Por favor, intentá nuevamente más tarde.",
    };
  }
  return { ok: true };
}
