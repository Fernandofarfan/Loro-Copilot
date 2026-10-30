import { test, expect } from "@playwright/test";

// Smoke del copiloto sin Deepgram real: pregunta manual + /api/answer mockeado.
test.describe("Copiloto con SSE mockeado", () => {
  test("una pregunta manual produce una AnswerCard con la respuesta", async ({ page }) => {
    await page.route("**/api/answer", (route) =>
      route.fulfill({
        status: 200,
        contentType: "text/plain; charset=utf-8",
        body:
          "[KEY] latency | cache | tradeoffs [/KEY]\n" +
          "[EN] Cache aggressively at the edge and measure p99 latency. Prefer the simplest design that handles current load.[/EN]\n" +
          "[ES] Cacheá en el borde y medí p99.",
      })
    );

    await page.goto("/app");
    const input = page.getByPlaceholder(/Preguntale al copiloto/);
    await input.fill("How would you reduce API latency?");
    await page.getByRole("button", { name: /Responder/ }).click();

    await expect(page.getByText(/Cache aggressively at the edge/)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/Cacheá en el borde/)).toBeVisible();

    const hudData = await page.evaluate(() => {
      const raw = localStorage.getItem("loro_teleprompter_data");
      return raw ? JSON.parse(raw) : null;
    });
    expect(hudData).not.toBeNull();
    expect(hudData.question).toBe("How would you reduce API latency?");
    expect(hudData.enText).toContain("Cache aggressively at the edge");
  });
});
