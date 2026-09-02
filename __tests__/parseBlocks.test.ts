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

  it("debe parsear bloque de fonética [PHO]", () => {
    const raw = `[EN]
I have extensive experience with distributed architectures.

[PHO]
(ai jæv ɪkˈstɛnsɪv ɪkˈspɪriəns wɪð dɪˈstrɪbjutəd ˈɑrkəˌtɛkʧərz)

[ES]
Tengo amplia experiencia con arquitecturas distribuidas.`;

    const parsed = parseBlocks(raw);
    expect(parsed.bilingual).toBe(true);
    expect(parsed.enText).toContain("extensive experience");
    expect(parsed.phoText).toContain("ai jæv");
    expect(parsed.esText).toContain("amplia experiencia");
  });

  it("debe parsear streaming parcial [EN] sin [ES] aún", () => {
    const raw = `[EN]
Hello, I have strong background in distributed systems`;

    const parsed = parseBlocks(raw);
    expect(parsed.bilingual).toBe(true);
    expect(parsed.enText).toBe("Hello, I have strong background in distributed systems");
    expect(parsed.esText).toBe("");
  });

  it("debe ocultar contenido de <think> en curso sin tag de cierre", () => {
    const raw = `<think>
El usuario me preguntó sobre microservicios. Debo empezar con bounded contexts.
Pensando en ejemplos reales...`;

    const parsed = parseBlocks(raw);
    expect(parsed.cleanText).toBe("");
    expect(parsed.cleanText).not.toContain("microservicios");
  });

  it("no debe tragar texto ante un [ALERT] sin tag de cierre [/ALERT]", () => {
    const raw = `[ALERT]
No hables de frameworks viejos
Respuesta principal que no debe ser tragada.`;

    const parsed = parseBlocks(raw);
    expect(parsed.alert).toBe("");
    expect(parsed.cleanText).toContain("Respuesta principal que no debe ser tragada.");
  });

  it("debe limpiar etiquetas [EN], [ES], [PHO] de cleanText", () => {
    const raw = `[EN]
I lead backend teams.

[PHO]
(ai lid bæk-ɛnd timz)

[ES]
Lidero equipos de backend.`;

    const parsed = parseBlocks(raw);
    expect(parsed.cleanText).not.toContain("[EN]");
    expect(parsed.cleanText).not.toContain("[ES]");
    expect(parsed.cleanText).not.toContain("[PHO]");
    expect(parsed.cleanText).toContain("I lead backend teams.");
    expect(parsed.cleanText).toContain("Lidero equipos de backend.");
  });

  it("debe parsear etiquetas [ALERT], [CHEATS] y [SNIPPET] cerradas", () => {
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

  it("debe limpiar etiquetas <think> cerradas", () => {
    const raw = `<think>
El usuario preguntó por el GIL. Debo mencionar que previene ejecución concurrente de bytecode.
</think>
El GIL es un mutex que protege el acceso a los objetos de Python.`;

    const parsed = parseBlocks(raw);
    expect(parsed.cleanText).not.toContain("<think>");
    expect(parsed.cleanText).not.toContain("</think>");
    expect(parsed.cleanText).toContain("El GIL es un mutex");
  });
});
