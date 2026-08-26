import { describe, it, expect } from "vitest";
import { checkRateLimit, verifyOrigin } from "../app/lib/security";

describe("security", () => {
  describe("checkRateLimit", () => {
    it("debe permitir solicitudes dentro del límite", () => {
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
    });
  });

  describe("verifyOrigin", () => {
    it("debe permitir requests de dominios válidos", () => {
      const req = new Request("https://loro-copilot.vercel.app/api/answer", {
        headers: {
          origin: "https://loro-copilot.vercel.app",
        },
      });
      const res = verifyOrigin(req);
      expect(res.ok).toBe(true);
    });

    it("debe permitir previews de vercel (*.vercel.app)", () => {
      const req = new Request("https://preview-123.vercel.app/api/answer", {
        headers: {
          origin: "https://preview-123.vercel.app",
        },
      });
      const res = verifyOrigin(req);
      expect(res.ok).toBe(true);
    });

    it("debe rechazar orígenes no autorizados", () => {
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
});
