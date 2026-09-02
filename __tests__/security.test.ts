// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { checkRateLimit, checkRateLimitAsync, verifyOrigin, checkCapacity } from "../app/lib/security";
import { POST as waitlistPOST } from "../app/api/waitlist/route";

describe("security", () => {
  describe("checkRateLimit", () => {
    it("debe permitir solicitudes dentro del límite y calcular retryAfterSeconds", () => {
      const req = new Request("http://localhost:3000/api/answer", {
        headers: { "x-forwarded-for": "192.168.1.100" },
      });

      const res1 = checkRateLimit(req, { limit: 3, windowMs: 10_000, keyPrefix: "test-rl-1" });
      expect(res1.allowed).toBe(true);
      expect(res1.remaining).toBe(2);

      const res2 = checkRateLimit(req, { limit: 3, windowMs: 10_000, keyPrefix: "test-rl-1" });
      expect(res2.allowed).toBe(true);
      expect(res2.remaining).toBe(1);

      const res3 = checkRateLimit(req, { limit: 3, windowMs: 10_000, keyPrefix: "test-rl-1" });
      expect(res3.allowed).toBe(true);
      expect(res3.remaining).toBe(0);

      const res4 = checkRateLimit(req, { limit: 3, windowMs: 10_000, keyPrefix: "test-rl-1" });
      expect(res4.allowed).toBe(false);
      expect(res4.remaining).toBe(0);
      expect(res4.retryAfterSeconds).toBeGreaterThan(0);
    });
  });

  describe("checkRateLimitAsync", () => {
    const originalEnv = { ...process.env };
    const originalFetch = globalThis.fetch;

    beforeEach(() => {
      process.env.UPSTASH_REDIS_REST_URL = "https://fake.upstash.io";
      process.env.UPSTASH_REDIS_REST_TOKEN = "fake-token";
    });

    afterEach(() => {
      process.env = { ...originalEnv };
      globalThis.fetch = originalFetch;
    });

    it("debe usar Upstash cuando la env está seteada y permitir dentro del límite", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [{ result: 1 }, { result: null }, { result: 55 }],
      } as any);

      const req = new Request("http://localhost:3000/api/answer", {
        headers: { "x-forwarded-for": "10.0.0.1" } as any,
      });

      const res = await checkRateLimitAsync(req, { limit: 30, windowMs: 60_000, keyPrefix: "test-async-1" });
      expect(res.allowed).toBe(true);
      expect(res.remaining).toBe(29);
      expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    });

    it("debe rechazar cuando Upstash indica count > limit", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [{ result: 4 }, { result: null }, { result: 30 }],
      } as any);

      const req = new Request("http://localhost:3000/api/answer", {
        headers: { "x-forwarded-for": "10.0.0.2" } as any,
      });

      const res = await checkRateLimitAsync(req, { limit: 3, windowMs: 60_000, keyPrefix: "test-async-2" });
      expect(res.allowed).toBe(false);
      expect(res.remaining).toBe(0);
    });

    it("debe hacer fallback a checkRateLimit cuando Upstash fetch falla", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({ ok: false } as any);

      const req = new Request("http://localhost:3000/api/answer", {
        headers: { "x-forwarded-for": "10.0.0.3" } as any,
      });

      const res = await checkRateLimitAsync(req, { limit: 3, windowMs: 10_000, keyPrefix: "test-async-fallback" });
      expect(res.allowed).toBe(true);
      expect(res.remaining).toBe(2);
    });

    it("debe hacer fallback a checkRateLimit cuando no hay env de Upstash", async () => {
      delete process.env.UPSTASH_REDIS_REST_URL;
      delete process.env.UPSTASH_REDIS_REST_TOKEN;
      delete process.env.KV_REST_API_URL;
      delete process.env.KV_REST_API_TOKEN;

      const req = new Request("http://localhost:3000/api/answer", {
        headers: { "x-forwarded-for": "10.0.0.4" } as any,
      });

      const res = await checkRateLimitAsync(req, { limit: 3, windowMs: 10_000, keyPrefix: "test-async-noenv" });
      expect(res.allowed).toBe(true);
      expect(res.remaining).toBe(2);
    });
  });

  describe("verifyOrigin", () => {
    it("debe permitir requests de dominios autorizados de producción", () => {
      const originalEnv = process.env.NODE_ENV;
      (process.env as any).NODE_ENV = "production";

      const req = new Request("https://loro-copilot.vercel.app/api/answer", {
        headers: {
          origin: "https://loro-copilot.vercel.app",
        },
      });
      const res = verifyOrigin(req);
      expect(res.ok).toBe(true);

      (process.env as any).NODE_ENV = originalEnv;
    });

    it("debe rechazar requests en producción sin Origin ni Referer", () => {
      const originalEnv = process.env.NODE_ENV;
      (process.env as any).NODE_ENV = "production";

      const req = new Request("https://loro-copilot.vercel.app/api/answer");
      const res = verifyOrigin(req);
      expect(res.ok).toBe(false);
      expect(res.status).toBe(403);

      (process.env as any).NODE_ENV = originalEnv;
    });

    it("debe rechazar localhost y 127.0.0.1 cuando NODE_ENV === production", () => {
      const originalEnv = process.env.NODE_ENV;
      (process.env as any).NODE_ENV = "production";

      const req = new Request("https://loro-copilot.vercel.app/api/answer", {
        headers: {
          origin: "http://localhost:3000",
        },
      });
      const res = verifyOrigin(req);
      expect(res.ok).toBe(false);
      expect(res.status).toBe(403);

      (process.env as any).NODE_ENV = originalEnv;
    });

    it("debe rechazar orígenes con wildcard *.vercel.app genéricos no autorizados", () => {
      const originalEnv = process.env.NODE_ENV;
      (process.env as any).NODE_ENV = "production";

      const req = new Request("https://loro-copilot.vercel.app/api/answer", {
        headers: {
          origin: "https://random-unauthorized-app.vercel.app",
        },
      });
      const res = verifyOrigin(req);
      expect(res.ok).toBe(false);
      expect(res.status).toBe(403);

      (process.env as any).NODE_ENV = originalEnv;
    });

    it("debe rechazar orígenes maliciosos", () => {
      const originalEnv = process.env.NODE_ENV;
      (process.env as any).NODE_ENV = "production";

      const req = new Request("https://loro-copilot.vercel.app/api/answer", {
        headers: {
          origin: "https://malicious-site.com",
        },
      });
      const res = verifyOrigin(req);
      expect(res.ok).toBe(false);
      expect(res.status).toBe(403);

      (process.env as any).NODE_ENV = originalEnv;
    });
  });

  describe("checkCapacity", () => {
    it("debe devolver ok si CAPACITY_CLOSED no está seteado", () => {
      delete process.env.CAPACITY_CLOSED;
      const res = checkCapacity();
      expect(res.ok).toBe(true);
    });

    it("debe devolver 503 si CAPACITY_CLOSED=1", () => {
      process.env.CAPACITY_CLOSED = "1";
      const res = checkCapacity();
      expect(res.ok).toBe(false);
      expect(res.status).toBe(503);
      expect(res.error).toContain("Capacidad");
      delete process.env.CAPACITY_CLOSED;
    });
  });

  describe("/api/waitlist route", () => {
    it("debe responder 400 si el email es inválido", async () => {
      const req = new Request("http://localhost:3000/api/waitlist", {
        method: "POST",
        headers: { origin: "http://localhost:3000" },
        body: JSON.stringify({ email: "invalid-email" }),
      });

      const res = await waitlistPOST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain("email válido");
    });

    it("debe responder 503 si GFORM_ACTION no está configurado", async () => {
      delete process.env.GFORM_ACTION;
      delete process.env.GFORM_EMAIL_ENTRY;

      const req = new Request("http://localhost:3000/api/waitlist", {
        method: "POST",
        headers: { origin: "http://localhost:3000" },
        body: JSON.stringify({ email: "valid.user@example.com" }),
      });

      const res = await waitlistPOST(req);
      expect(res.status).toBe(503);
      const data = await res.json();
      expect(data.ok).toBe(false);
    });

    it("debe responder 502 si el POST a Google Form falla y no devolver ok true ficticio", async () => {
      process.env.GFORM_ACTION = "https://docs.google.com/forms/d/e/fake/formResponse";
      process.env.GFORM_EMAIL_ENTRY = "entry.123456";

      const originalFetch = globalThis.fetch;
      globalThis.fetch = async () =>
        new Response("Google Form Error", { status: 500, statusText: "Internal Server Error" });

      try {
        const req = new Request("http://localhost:3000/api/waitlist", {
          method: "POST",
          headers: { origin: "http://localhost:3000" },
          body: JSON.stringify({ email: "valid.user@example.com" }),
        });

        const res = await waitlistPOST(req);
        expect(res.status).toBe(502);
        const data = await res.json();
        expect(data.ok).toBe(false);
        expect(data.error).toContain("No se pudo registrar");
      } finally {
        globalThis.fetch = originalFetch;
        delete process.env.GFORM_ACTION;
        delete process.env.GFORM_EMAIL_ENTRY;
      }
    });
  });
});
