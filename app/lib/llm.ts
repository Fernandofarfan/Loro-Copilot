export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://loro-copilot.vercel.app";
export const APP_NAME = "Loro Copilot";

export type Provider = "gemini" | "anthropic" | "openai" | "openrouter" | "opencode";

export type LLMOptions = {
  maxTokens?: number;
  temperature?: number;
  timeoutMs?: number;
  image?: { mimeType: string; data: string } | null;
};

export const DEFAULT_MODELS: Record<Provider, string> = {
  gemini: process.env.GEMINI_MODEL || "gemini-flash-latest",
  anthropic: "claude-3-5-haiku-20241022",
  openai: "gpt-4o-mini",
  opencode: process.env.OPENCODE_MODEL || "deepseek-v4-flash",
  openrouter: "deepseek/deepseek-chat",
};

export const FALLBACK_MODELS: Record<Provider, string[]> = {
  opencode: Array.from(
    new Set([
      ...(process.env.OPENCODE_MODEL ? [process.env.OPENCODE_MODEL] : []),
      "deepseek-v4-flash",
      "mimo-v2.5",
      "glm-5.3-flash",
    ])
  ).slice(0, 3),
  openrouter: ["deepseek/deepseek-chat", "openai/gpt-4o-mini"],
  openai: ["gpt-4o-mini", "gpt-4o"],
  anthropic: ["claude-3-5-haiku-20241022", "claude-3-5-sonnet-20241022"],
  gemini: Array.from(
    new Set([
      ...(process.env.GEMINI_MODEL ? [process.env.GEMINI_MODEL] : []),
      "gemini-flash-latest",
      "gemini-flash-lite-latest",
      "gemini-3.6-flash",
    ])
  ).slice(0, 3),
};

export function resolveProvider(requested?: string): Provider {
  const req = (requested || "").toLowerCase();
  if (req === "gemini" || req === "anthropic" || req === "openai" || req === "openrouter" || req === "opencode") {
    return req as Provider;
  }
  const envProvider = (process.env.LLM_PROVIDER || "").toLowerCase();
  if (envProvider === "gemini" || envProvider === "anthropic" || envProvider === "openai" || envProvider === "openrouter" || envProvider === "opencode") {
    return envProvider as Provider;
  }
  if (process.env.OPENCODE_API_KEY || process.env.OPENROUTER_API_KEY) return "opencode";
  if (process.env.GEMINI_API_KEY) return "gemini";
  if (process.env.OPENAI_API_KEY) return "openai";
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  return "opencode";
}

export function resolveModel(provider: Provider, requested?: string): string {
  if (requested && requested.trim()) return requested.trim();
  if (provider === "anthropic") return process.env.ANTHROPIC_MODEL || DEFAULT_MODELS.anthropic;
  if (provider === "openai") return process.env.OPENAI_MODEL || DEFAULT_MODELS.openai;
  if (provider === "gemini") return process.env.GEMINI_MODEL || DEFAULT_MODELS.gemini;
  return process.env.OPENCODE_MODEL || process.env.OPENROUTER_MODEL || DEFAULT_MODELS[provider];
}

// Envuelve un ReadableStream de texto plano con los headers correctos.
export function textStreamResponse(stream: ReadableStream) {
  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}

// Parser SSE genérico: lee el body upstream, parte por líneas "data:", y por
// cada JSON extrae el texto con `extract`. Reenvía solo texto plano al cliente.
// Incluye un techo de stream (60s) para no dejar colgado el isolate si el upstream se congela.
export function sseTextStream(
  upstream: ReadableStream<Uint8Array>,
  extract: (json: string) => string | null,
  streamTimeoutMs = 60_000
): ReadableStream {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const reader = upstream.getReader();
  let buffer = "";
  let inThinkTag = false;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let isClosed = false;

  return new ReadableStream({
    start(controller) {
      if (streamTimeoutMs > 0) {
        timer = setTimeout(() => {
          if (isClosed) return;
          try {
            isClosed = true;
            reader.cancel();
            controller.error(
              new Error(`Timeout de streaming del LLM excedido (${Math.round(streamTimeoutMs / 1000)}s).`)
            );
          } catch {}
        }, streamTimeoutMs);
      }
    },
    async pull(controller) {
      try {
        const processLine = (rawLine: string) => {
          const trimmed = rawLine.trim();
          if (!trimmed.startsWith("data:")) return false;
          const json = trimmed.slice(5).trim();
          if (!json || json === "[DONE]") return false;

          try {
            const text = extract(json);
            if (text) {
              // Filtrado de tags <think> / </think> de modelos de razonamiento como DeepSeek R1
              let cleanChunk = text;
              if (cleanChunk.includes("<think>")) {
                inThinkTag = true;
                cleanChunk = cleanChunk.replace(/<think>[\s\S]*?<\/think>/g, "");
                cleanChunk = cleanChunk.replace(/<think>[\s\S]*/g, "");
              } else if (cleanChunk.includes("</think>")) {
                inThinkTag = false;
                cleanChunk = cleanChunk.replace(/[\s\S]*?<\/think>/g, "");
              } else if (inThinkTag) {
                return false;
              }

              cleanChunk = cleanChunk.replace(/<\/?think>/gi, "");
              if (cleanChunk) {
                controller.enqueue(encoder.encode(cleanChunk));
                return true;
              }
            }
          } catch {
            // Ignora fragmentos incompletos o inválidos de SSE
          }
          return false;
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            if (timer) {
              clearTimeout(timer);
              timer = null;
            }
            if (buffer.trim()) {
              processLine(buffer);
              buffer = "";
            }
            if (!isClosed) {
              isClosed = true;
              controller.close();
            }
            return;
          }
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          let enqueuedAny = false;

          for (const line of lines) {
            if (processLine(line)) {
              enqueuedAny = true;
            }
          }
          // Ceder el control de pull al consumidor tan pronto como se emita texto (respetando backpressure de WHATWG Streams)
          if (enqueuedAny) return;
        }
      } catch (err) {
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
        if (!isClosed) {
          isClosed = true;
          controller.error(err);
        }
      }
    },
    cancel() {
      isClosed = true;
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      reader.cancel();
    },
  });
}

// Fetch helper con timeout vía AbortController
export async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs = 25_000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...init,
      signal: controller.signal,
    });
    return res;
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(`Timeout de ${timeoutMs / 1000}s esperando respuesta del LLM.`);
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

// ---------- Gemini (Google) ----------
export async function streamGemini(
  models: string[],
  userContent: string,
  systemPrompt: string,
  options: LLMOptions = {}
): Promise<Response> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response("Falta GEMINI_API_KEY en las variables de entorno.", { status: 500 });
  }

  const maxTokens = options.maxTokens ?? (systemPrompt.includes("[ES]") ? 1200 : 600);
  const parts: Array<Record<string, unknown>> = [{ text: userContent }];
  if (options.image) {
    parts.push({ inlineData: { mimeType: options.image.mimeType, data: options.image.data } });
  }

  const payload = {
    contents: [{ role: "user", parts }],
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: {
      temperature: options.temperature ?? 0.4,
      maxOutputTokens: maxTokens,
    },
  };

  let detail = "";
  for (const model of models) {
    if (!model) continue;
    try {
      const upstream = await fetchWithTimeout(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify(payload),
        },
        options.timeoutMs ?? 25_000
      );

      if (upstream.ok && upstream.body) {
        return textStreamResponse(
          sseTextStream(upstream.body, (json) => {
            const evt = JSON.parse(json);
            return evt.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
          })
        );
      }
      detail = await upstream.text().catch(() => "");
    } catch (err: unknown) {
      detail = err instanceof Error ? err.message : String(err);
    }
  }
  return new Response(`Gemini error: ${detail}`, { status: 502 });
}

// ---------- Anthropic (Claude) ----------
export async function streamAnthropic(
  models: string[],
  userContent: string,
  systemPrompt: string,
  options: LLMOptions = {}
): Promise<Response> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response("Falta ANTHROPIC_API_KEY en Vercel para usar Claude.", { status: 500 });
  }

  const maxTokens = options.maxTokens ?? (systemPrompt.includes("[ES]") ? 1200 : 600);
  let detail = "";

  for (const model of models) {
    if (!model) continue;
    try {
      const upstream = await fetchWithTimeout(
        "https://api.anthropic.com/v1/messages",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model,
            max_tokens: maxTokens,
            temperature: options.temperature ?? 0.4,
            system: systemPrompt,
            messages: [
              {
                role: "user",
                content: options.image
                  ? [
                      {
                        type: "image",
                        source: {
                          type: "base64",
                          media_type: options.image.mimeType,
                          data: options.image.data,
                        },
                      },
                      { type: "text", text: userContent },
                    ]
                  : userContent,
              },
            ],
            stream: true,
          }),
        },
        options.timeoutMs ?? 25_000
      );

      if (upstream.ok && upstream.body) {
        return textStreamResponse(
          sseTextStream(upstream.body, (json) => {
            const evt = JSON.parse(json);
            if (evt.type === "content_block_delta" && evt.delta?.type === "text_delta") {
              return evt.delta.text ?? null;
            }
            return null;
          })
        );
      }
      detail = await upstream.text().catch(() => "");
    } catch (err: unknown) {
      detail = err instanceof Error ? err.message : String(err);
    }
  }
  return new Response(`Claude error: ${detail}`, { status: 502 });
}

// ---------- OpenAI (GPT) ----------
export async function streamOpenAI(
  models: string[],
  userContent: string,
  systemPrompt: string,
  options: LLMOptions = {}
): Promise<Response> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response("Falta OPENAI_API_KEY en Vercel para usar GPT.", { status: 500 });
  }

  let detail = "";
  for (const model of models) {
    if (!model) continue;
    const isReasoning = /^(gpt-5|o[0-9])/.test(model);
    const maxTokens = options.maxTokens ?? (systemPrompt.includes("[ES]") ? 1200 : 600);

    const userMessageContent = options.image
      ? [
          { type: "text", text: userContent },
          {
            type: "image_url",
            image_url: {
              url: `data:${options.image.mimeType};base64,${options.image.data}`,
            },
          },
        ]
      : userContent;

    const reqBody: Record<string, unknown> = {
      model,
      stream: true,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessageContent },
      ],
    };

    if (isReasoning) {
      reqBody.max_completion_tokens = options.maxTokens ?? (systemPrompt.includes("[ES]") ? 1500 : 900);
      reqBody.reasoning_effort = "low";
    } else {
      reqBody.max_tokens = maxTokens;
      reqBody.temperature = options.temperature ?? 0.4;
    }

    try {
      const upstream = await fetchWithTimeout(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(reqBody),
        },
        options.timeoutMs ?? 25_000
      );

      if (upstream.ok && upstream.body) {
        return textStreamResponse(
          sseTextStream(upstream.body, (json) => {
            const evt = JSON.parse(json);
            return evt.choices?.[0]?.delta?.content ?? null;
          })
        );
      }
      detail = await upstream.text().catch(() => "");
    } catch (err: unknown) {
      detail = err instanceof Error ? err.message : String(err);
    }
  }
  return new Response(`GPT error: ${detail}`, { status: 502 });
}

// ---------- OpenCode / OpenRouter ----------
export async function streamOpenCode(
  models: string[],
  userContent: string,
  systemPrompt: string,
  options: LLMOptions = {}
): Promise<Response> {
  const apiKey = process.env.OPENCODE_API_KEY || process.env.OPENROUTER_API_KEY;
  const rawBaseUrl = process.env.OPENCODE_BASE_URL || process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";
  const baseUrl = rawBaseUrl.replace(/\/$/, "");

  if (!apiKey) {
    if (process.env.GEMINI_API_KEY) {
      return streamGemini(FALLBACK_MODELS.gemini, userContent, systemPrompt, options);
    }
    return new Response(
      "Falta OPENCODE_API_KEY / OPENROUTER_API_KEY en las variables de entorno para usar OpenCode.",
      { status: 500 }
    );
  }

  const envModel = process.env.OPENCODE_MODEL || process.env.OPENROUTER_MODEL;
  const isOpenCodeHost = baseUrl.includes("opencode");
  const candidateModels = Array.from(
    new Set(
      [
        ...models,
        ...(envModel ? [envModel] : []),
        ...(isOpenCodeHost
          ? ["deepseek-v4-flash", "glm-5.3-flash", "mimo-v2.5"]
          : ["deepseek/deepseek-chat", "google/gemini-flash-1.5"])
      ].filter(Boolean)
    )
  ).slice(0, 3);

  let detail = "";
  for (const model of candidateModels) {
    if (!model) continue;
    if (isOpenCodeHost && (model.startsWith("openai/") || model.startsWith("google/") || model.startsWith("anthropic/"))) {
      continue;
    }
    const isReasoning = /^(gpt-5|o[0-9]|deepseek-r1)/.test(model);
    const maxTokens = options.maxTokens ?? 1200;

    const userMessageContent = options.image
      ? [
          { type: "text", text: userContent },
          {
            type: "image_url",
            image_url: {
              url: `data:${options.image.mimeType};base64,${options.image.data}`,
            },
          },
        ]
      : userContent;

    const reqBody: Record<string, unknown> = {
      model,
      stream: true,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessageContent },
      ],
    };

    if (isReasoning) {
      reqBody.max_completion_tokens = options.maxTokens ?? 1500;
      reqBody.reasoning_effort = "low";
    } else {
      reqBody.max_tokens = maxTokens;
      reqBody.temperature = options.temperature ?? 0.35;
    }

    try {
      const upstream = await fetchWithTimeout(
        `${baseUrl}/chat/completions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            "HTTP-Referer": SITE_URL,
            "X-Title": APP_NAME,
          },
          body: JSON.stringify(reqBody),
        },
        options.timeoutMs ?? 25_000
      );

      const contentType = upstream.headers.get("content-type") || "";

      if (upstream.ok && upstream.body && (contentType.includes("text/event-stream") || contentType.includes("application/x-ndjson"))) {
        let sentThinkingMarker = false;
        return textStreamResponse(
          sseTextStream(upstream.body, (json) => {
            const evt = JSON.parse(json);
            const delta = evt.choices?.[0]?.delta;
            if (delta?.content) return delta.content;
            if (delta?.reasoning_content && !sentThinkingMarker) {
              sentThinkingMarker = true;
              return "🧠 *Analizando respuesta...*\n\n";
            }
            return null;
          })
        );
      }

      if (upstream.ok && contentType.includes("json")) {
        const j = await upstream.json().catch(() => null);
        const text = j?.choices?.[0]?.message?.content;
        if (text) {
          return new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
        }
      }

      detail = await upstream.text().catch(() => "");
    } catch (err: unknown) {
      detail = err instanceof Error ? err.message : String(err);
    }
  }

  if (process.env.GEMINI_API_KEY) {
    return streamGemini(FALLBACK_MODELS.gemini, userContent, systemPrompt, options);
  }

  return new Response(`Error de API (${baseUrl}): ${detail || "La API no devolvió una respuesta válida."}`, { status: 502 });
}

export const streamOpenRouter = streamOpenCode;

// Helper para parsear JSON retornado por modelos evitando markdown fences
export function parseModelJson(text: string): unknown {
  const cleaned = (text || "").trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  try {
    return JSON.parse(cleaned);
  } catch {
    const startObj = cleaned.indexOf("{");
    const endObj = cleaned.lastIndexOf("}");
    const startArr = cleaned.indexOf("[");
    const endArr = cleaned.lastIndexOf("]");

    if (startArr >= 0 && endArr > startArr && (startObj === -1 || startArr < startObj)) {
      return JSON.parse(cleaned.slice(startArr, endArr + 1));
    }
    if (startObj >= 0 && endObj > startObj) {
      return JSON.parse(cleaned.slice(startObj, endObj + 1));
    }
    throw new Error("JSON inválido del modelo");
  }
}
