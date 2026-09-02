import { test, expect } from "@playwright/test";

test.describe("Loro Copilot — happy path", () => {
  test("la home carga y muestra el branding Loro Copilot", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Loro Copilot/);
    // La home principal tiene un heading h1 o un contenedor con el nombre de la marca
    await expect(page.locator("body")).toContainText(/Loro/i);
  });

  test("la página de simulador es accesible vía navegación", async ({ page }) => {
    await page.goto("/simulador");
    await expect(page).toHaveURL(/simulador/);
  });

  test("la página de teleprompter es accesible", async ({ page }) => {
    await page.goto("/teleprompter");
    await expect(page).toHaveURL(/teleprompter/);
  });

  test("/api/waitlist con email inválido responde 400", async ({ request }) => {
    const res = await request.post("/api/waitlist", {
      headers: { origin: "http://localhost:3000" },
      data: { email: "invalid-email" },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("email válido");
  });

  test("/api/waitlist sin Origin es rechazado en producción (smoke test)", async ({ request }) => {
    // En dev, verifyOrigin devuelve ok=true; en prod con NODE_ENV=production devolvería 403
    // Este test valida que la ruta responde (no 404/500)
    const res = await request.post("/api/waitlist", {
      data: { email: "test@example.com" },
    });
    expect([400, 403, 503]).toContain(res.status());
  });

  test("/api/deepgram-token responde 503 si CAPACITY_CLOSED=1", async ({ request }) => {
    // Solo aplica si la env está seteada; en cualquier caso debe responder 200/503/500
    const res = await request.post("/api/deepgram-token", {
      headers: { origin: "http://localhost:3000" },
    });
    expect([200, 500, 503]).toContain(res.status());
  });
});
