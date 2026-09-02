// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../app/api/deepgram-token/route";

describe("/api/deepgram-token", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.DEEPGRAM_API_KEY = "test_permanent_api_key_secret_12345";
    delete process.env.CAPACITY_CLOSED;
  });

  it("debe responder 503 cuando CAPACITY_CLOSED=1", async () => {
    process.env.CAPACITY_CLOSED = "1";
    const req = new Request("http://localhost:3000/api/deepgram-token", {
      method: "POST",
      headers: { origin: "http://localhost:3000" },
    });

    const res = await POST(req);
    expect(res.status).toBe(503);
    const json = await res.json();
    expect(json.error).toContain("Capacidad");
  });

  it("debe responder 500 y NUNCA devolver la raw key ni errText crudo si Deepgram grant falla", async () => {
    // Mock de fetch fallido
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      statusText: "Forbidden",
      text: () => Promise.resolve("Internal secret permission denied details 12345"),
    } as any);

    const req = new Request("http://localhost:3000/api/deepgram-token", {
      method: "POST",
      headers: { origin: "http://localhost:3000" },
    });

    const res = await POST(req);
    expect(res.status).toBe(500);

    const json = await res.json();
    expect(json.token).toBeUndefined();
    expect(json.fallback).toBeUndefined();
    expect(JSON.stringify(json)).not.toContain("test_permanent_api_key_secret_12345");
    expect(JSON.stringify(json)).not.toContain("Internal secret permission denied details 12345");
  });

  it("debe devolver el token temporal cuando Deepgram grant responde 200", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ key: "temp_grant_token_67890", expires_in: 120 }),
    } as any);

    const req = new Request("http://localhost:3000/api/deepgram-token", {
      method: "POST",
      headers: { origin: "http://localhost:3000" },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.token).toBe("temp_grant_token_67890");
    expect(json.scheme).toBe("bearer");
    expect(json.token).not.toBe("test_permanent_api_key_secret_12345");
  });
});
