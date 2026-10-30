import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Los tests de hooks usan // @vitest-environment happy-dom al tope del archivo.
    // El resto (helpers, lib, api) corre en node por defecto.
    environment: "node",
    pool: "threads",
    exclude: ["**/node_modules/**", "**/e2e/**", "**/.next/**", "**/archive/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "html"],
      include: [
        "app/lib/*.ts",
        "app/hooks/*.ts",
      ],
      exclude: [
        "app/lib/llm.ts",
        "app/lib/pdf.ts",
        "app/lib/track.ts",
      ],
      thresholds: {
        lines: 50,
        functions: 50,
        branches: 40,
        statements: 50,
      },
    },
  },
});
