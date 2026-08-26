import { describe, it, expect } from "vitest";
import { parseBlocks } from "../app/lib/interviewHelpers";

describe("parseBlocks", () => {
  it("debe parsear bloques bilingües [EN] y [ES]", () => {
    const raw = `[EN]
In Python, asyncio is single-threaded cooperative multitasking.
- Use asyncio for I/O-bound tasks.
- Use multiprocessing for CPU-bound tasks.

[ES]
Asyncio sirve para tareas de I/O bloqueante sin usar hilos múltiples.`;

    const parsed = parseBlocks(raw);
    expect(parsed.bilingual).toBe(true);
    expect(parsed.enText).toContain("asyncio is single-threaded");
    expect(parsed.esText).toContain("Asyncio sirve para tareas");
  });

  it("debe parsear etiquetas [ALERT], [CHEATS] y [SNIPPET]", () => {
    const raw = `[ALERT]
No digas que usaste threads para CPU-bound
[/ALERT]

[CHEATS]
GIL | asyncio.to_thread | cProfile
[/CHEATS]

[SNIPPET]
\`\`\`python
async def fetch_data():
    return await client.get("/api")
\`\`\`
[/SNIPPET]

Respuesta general.`;

    const parsed = parseBlocks(raw);
    expect(parsed.alert).toBe("No digas que usaste threads para CPU-bound");
    expect(parsed.cheats).toEqual(["GIL", "asyncio.to_thread", "cProfile"]);
    expect(parsed.snippet).toContain("async def fetch_data()");
  });

  it("debe limpiar etiquetas <think> de modelos de razonamiento", () => {
    const raw = `<think>
El usuario preguntó por el GIL. Debo mencionar que previene ejecución concurrente de bytecode.
</think>
El GIL es un mutex que protege el acceso a los objetos de Python.`;

    const parsed = parseBlocks(raw);
    expect(parsed.cleanText).not.toContain("<think>");
    expect(parsed.cleanText).not.toContain("El usuario preguntó por el GIL");
    expect(parsed.cleanText).toContain("El GIL es un mutex");
  });
});
