export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
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
  opencode: process.env.OPENCODE_MODEL || "glm-5.3-flash",
  openrouter: "deepseek/deepseek-chat",
};

export const FALLBACK_MODELS: Record<Provider, string[]> = {
  opencode: Array.from(
    new Set([
      ...(process.env.OPENCODE_MODEL ? [process.env.OPENCODE_MODEL] : []),
      "glm-5.3-flash",
      "deepseek-v4.1-flash",
      "deepseek-v4-flash",
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

export type ModelOption = { id: string; label: string; provider: Provider; model: string; tag: string };

// Catálogo único de modelos compartido por /app y /simulador
export const MODELS: ModelOption[] = [
  // ⚡ Nivel Ultra Rápido (< 2s) — Óptimo en Vivo
  { id: "glm-5-3-flash", label: "GLM 5.3 Flash ⚡ (6.3k req)", provider: "opencode", model: "glm-5.3-flash", tag: "Ultra Rápido" },
  { id: "glm-5-2", label: "GLM 5.2 ⚡ (880 req)", provider: "opencode", model: "glm-5.2", tag: "Ultra Rápido" },
  { id: "claude-haiku-5-5", label: "Claude Haiku 5.5 🧠 (Nuevo)", provider: "opencode", model: "claude-haiku-5.5", tag: "Top Tier" },
  { id: "deepseek-v4-1-flash", label: "DeepSeek V4.1 Flash ⚡ (34k req)", provider: "opencode", model: "deepseek-v4.1-flash", tag: "Ultra Rápido" },
  { id: "deepseek-v4-flash", label: "DeepSeek V4 Flash ⚡ (13k req)", provider: "opencode", model: "deepseek-v4-flash", tag: "Ultra Rápido" },
  { id: "mimo-v2-6-flash", label: "MiMo V2.6 Flash ⚡ (30k req)", provider: "opencode", model: "mimo-v2.6-flash", tag: "Ultra Rápido" },
  { id: "mimo-v2-5", label: "MiMo V2.5 ⚡ (30k req)", provider: "opencode", model: "mimo-v2.5", tag: "Ultra Rápido" },
  { id: "qwen-3-8-flash", label: "Qwen 3.8 Flash ⚡ (5.4k req)", provider: "opencode", model: "qwen3.8-flash", tag: "Ultra Rápido" },
  { id: "gemini-flash-latest", label: "Gemini Flash Latest ⚡", provider: "gemini", model: "gemini-flash-latest", tag: "Google" },
  { id: "gemini-flash-lite-latest", label: "Gemini Flash Lite ⚡", provider: "gemini", model: "gemini-flash-lite-latest", tag: "Google" },

  // ♾️ Ilimitados / Free (OpenCode Go)
  { id: "longcat-2-5-preview-free", label: "LongCat 2.5 Free ♾️", provider: "opencode", model: "longcat-2.5-preview-free", tag: "Ilimitado" },
  { id: "step-5-preview-free", label: "Step 5 Preview Free ♾️", provider: "opencode", model: "step-5-preview-free", tag: "Ilimitado" },
  { id: "cat-jam-free", label: "Cat Jam Free ♾️", provider: "opencode", model: "cat-jam-free", tag: "Ilimitado" },

  // 🚀 Nivel Pro / Senior (Alta Precisión & Calidad)
  { id: "gpt-6-luna", label: "GPT 6 Luna 🚀", provider: "opencode", model: "gpt-6-luna", tag: "Top Tier" },
  { id: "gpt-5-6-luna", label: "GPT 5.6 Luna 🎯", provider: "opencode", model: "gpt-5.6-luna", tag: "Top Tier" },
  { id: "deepseek-v4-pro", label: "DeepSeek V4 Pro 🧠 (1k req)", provider: "opencode", model: "deepseek-v4-pro", tag: "Senior / Pro" },
  { id: "mimo-v2-6-pro", label: "MiMo V2.6 Pro 🎯", provider: "opencode", model: "mimo-v2.6-pro", tag: "Senior / Pro" },
  { id: "mimo-v2-5-pro", label: "MiMo V2.5 Pro 🎯", provider: "opencode", model: "mimo-v2.5-pro", tag: "Senior / Pro" },
  { id: "kimi-k3", label: "Kimi K3 🧠", provider: "opencode", model: "kimi-k3", tag: "Balanceado" },
  { id: "kimi-k2-7-code", label: "Kimi K2.7 Code 💻", provider: "opencode", model: "kimi-k2.7-code", tag: "Coding" },
  { id: "space-bunny", label: "Space Bunny 🐰", provider: "opencode", model: "space-bunny", tag: "Balanceado" },

  // 🌌 Nivel Razonamiento / Deep Think & Grok
  { id: "grok-4-7", label: "Grok 4.7 🌌", provider: "opencode", model: "grok-4.7", tag: "Deep Think" },
  { id: "grok-4-6", label: "Grok 4.6 🌌", provider: "opencode", model: "grok-4.6", tag: "Deep Think" },
  { id: "qwen-3-8-max", label: "Qwen 3.8 Max 🧠", provider: "opencode", model: "qwen3.8-max", tag: "Deep Think" },
  { id: "glm-5-3", label: "GLM 5.3", provider: "opencode", model: "glm-5.3", tag: "Deep Think" },
  { id: "hy4-preview", label: "Hy4 Preview 🔮", provider: "opencode", model: "hy4-preview", tag: "Deep Think" },
  { id: "hy3", label: "Hy3", provider: "opencode", model: "hy3", tag: "Deep Think" },
  { id: "minimax-m3", label: "MiniMax M3", provider: "opencode", model: "minimax-m3", tag: "Deep Think" },
  { id: "minimax-m2-7", label: "MiniMax M2.7", provider: "opencode", model: "minimax-m2.7", tag: "Deep Think" },
  { id: "longcat-2-0", label: "LongCat 2.0 🐱", provider: "opencode", model: "longcat-2.0", tag: "Deep Think" },
  { id: "qwen-3-7-plus", label: "Qwen 3.7 Plus", provider: "opencode", model: "qwen3.7-plus", tag: "Deep Think" },
  { id: "muse-spark-1-3", label: "Muse Spark 1.3 ⚡", provider: "opencode", model: "muse-spark-1.3-contributor", tag: "Deep Think" },
  { id: "deepseek-v4-vision", label: "DeepSeek V4 Vision 👁️", provider: "opencode", model: "deepseek-v4-flash-vision-exp", tag: "Vision" },

  // Direct Providers
  { id: "gpt-4o-mini", label: "GPT-4o Mini 🚀", provider: "openai", model: "gpt-4o-mini", tag: "OpenAI" },
  { id: "claude-haiku", label: "Claude 3.5 Haiku 🧠", provider: "anthropic", model: "claude-3-5-haiku-20241022", tag: "Anthropic" },
];

export const DEFAULT_MODEL_ID = "glm-5-3-flash";

// Modelos OpenCode multimodales para visión (los más estables con imágenes en vivo).
// Única fuente: lo usan streamOpenCode y el modo vision_coding de /api/answer.
export const OPENCODE_VISION_MODELS = ["mimo-v2.5", "kimi-k3", "glm-5.3-flash"];

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

// Allowlist por proveedor: catálogo de la UI + defaults + fallbacks + env vars del operador.
// Un `model` arbitrario del body permitiría forzar modelos caros (abuso de costo) o
// inyectar segments en la URL de Gemini (streamGemini interpola el modelo en el path).
function allowedModelsFor(provider: Provider): Set<string> {
  const envModel =
    provider === "anthropic"
      ? process.env.ANTHROPIC_MODEL
      : provider === "openai"
        ? process.env.OPENAI_MODEL
        : provider === "gemini"
          ? process.env.GEMINI_MODEL
          : process.env.OPENCODE_MODEL || process.env.OPENROUTER_MODEL;
  return new Set([
    ...MODELS.filter((m) => m.provider === provider).map((m) => m.model),
    DEFAULT_MODELS[provider],
    ...FALLBACK_MODELS[provider],
    ...(envModel ? [envModel] : []),
  ]);
}

export function resolveModel(provider: Provider, requested?: string): string {
  const req = (requested || "").trim();
  if (req) {
    if (allowedModelsFor(provider).has(req)) return req;
    console.warn(`[llm] Modelo '${req}' fuera de la allowlist de '${provider}'; se usa el modelo por defecto.`);
  }
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
  streamTimeoutMs = 60_000,
  onFlush?: () => string | null
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
            if (onFlush) {
              const flushed = onFlush();
              if (flushed) {
                controller.enqueue(encoder.encode(flushed));
              }
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

  const maxTokens = options.maxTokens ?? 8192;
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
    return new Response("Falta ANTHROPIC_API_KEY en .env.local para usar Claude.", { status: 500 });
  }

  const maxTokens = options.maxTokens ?? 8192;
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
    return new Response("Falta OPENAI_API_KEY en .env.local para usar GPT.", { status: 500 });
  }

  let detail = "";
  for (const model of models) {
    if (!model) continue;
    const isReasoning = /^(gpt-5|o[0-9])/.test(model);
    const maxTokens = options.maxTokens ?? 8192;

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
      reqBody.max_completion_tokens = maxTokens;
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
        ...(options.image && isOpenCodeHost ? OPENCODE_VISION_MODELS : []),
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
    const maxTokens = options.maxTokens ?? 8192;

    const imageMime =
      options.image?.mimeType === "image/webp" && isOpenCodeHost
        ? "image/jpeg"
        : options.image?.mimeType || "image/jpeg";

    const userMessageContent = options.image
      ? [
          { type: "text", text: userContent },
          {
            type: "image_url",
            image_url: {
              url: `data:${imageMime};base64,${options.image.data}`,
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
      reqBody.max_completion_tokens = maxTokens;
      reqBody.reasoning_effort = "low";
    } else {
      reqBody.max_tokens = maxTokens;
      reqBody.temperature = options.temperature ?? 0.35;
      if (isOpenCodeHost) {
        reqBody.reasoning_effort = "low";
      }
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
            "x-opencode-session": `loro-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          },
          body: JSON.stringify(reqBody),
        },
        options.timeoutMs ?? 25_000
      );

      const contentType = upstream.headers.get("content-type") || "";

      if (upstream.ok && upstream.body && (contentType.includes("text/event-stream") || contentType.includes("application/x-ndjson"))) {
        let contentReceived = false;
        let reasoningAccumulator = "";
        return textStreamResponse(
          sseTextStream(
            upstream.body,
            (json) => {
              const evt = JSON.parse(json);
              const delta = evt.choices?.[0]?.delta;
              if (delta?.content) {
                contentReceived = true;
                return delta.content;
              }
              if (delta?.reasoning_content || delta?.reasoning) {
                reasoningAccumulator += (delta.reasoning_content || delta.reasoning);
              }
              return null;
            },
            60_000,
            () => {
              // Si el modelo cerró el stream habiendo generado razonamiento pero cero contenido formal,
              // usar el razonamiento como respuesta para evitar que el usuario se quede con tarjeta vacía
              if (!contentReceived && reasoningAccumulator.trim()) {
                return reasoningAccumulator.trim();
              }
              return null;
            }
          )
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

type StreamFn = (
  models: string[],
  userContent: string,
  systemPrompt: string,
  options?: LLMOptions
) => Promise<Response>;

// Dispatch unificado por proveedor: evita el ternario de 4 vías repetido en cada ruta API
export const streamForProvider: Record<Provider, StreamFn> = {
  gemini: streamGemini,
  anthropic: streamAnthropic,
  openai: streamOpenAI,
  opencode: streamOpenCode,
  openrouter: streamOpenRouter,
};

export function buildCandidates(provider: Provider, model: string, limit = 3): string[] {
  return Array.from(new Set([model, ...FALLBACK_MODELS[provider]])).slice(0, limit);
}

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

// ---------- Completación JSON no-streaming ----------
// Dispatch + fallback de proveedores idéntico a los stream*, pero devolviendo el JSON
// ya parseado (feedback del simulador y futuros consumidores). Lanza Error con mensaje
// descriptivo si ningún modelo responde.
export async function completeJsonForProvider(
  provider: Provider,
  models: string[],
  systemPrompt: string,
  userContent: string,
  options: { temperature?: number; maxTokens?: number; timeoutMs?: number } = {}
): Promise<unknown> {
  const temperature = options.temperature ?? 0.2;
  const maxTokens = options.maxTokens ?? 4096;
  const timeoutMs = options.timeoutMs ?? 25_000;
  let lastError = "";

  if (provider === "openai" || provider === "opencode" || provider === "openrouter") {
    const isOpencode = provider === "opencode" || provider === "openrouter";
    const apiKey = isOpencode
      ? process.env.OPENCODE_API_KEY || process.env.OPENROUTER_API_KEY
      : process.env.OPENAI_API_KEY;
    const rawBaseUrl = isOpencode
      ? process.env.OPENCODE_BASE_URL || process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1"
      : "https://api.openai.com/v1";
    const baseUrl = rawBaseUrl.replace(/\/$/, "");

    if (!apiKey) throw new Error(`Falta API key para ${provider}.`);

    for (const model of models) {
      if (!model) continue;
      try {
        const res = await fetchWithTimeout(`${baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            ...(isOpencode ? { "x-opencode-session": "loro-simulador-session" } : {}),
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userContent },
            ],
            temperature,
            max_tokens: maxTokens,
            response_format: { type: "json_object" },
          }),
        }, timeoutMs);

        if (res.ok) {
          const j = await res.json();
          const content = j.choices?.[0]?.message?.content;
          if (content) return parseModelJson(content);
        }
        lastError = await res.text().catch(() => "");
      } catch (err: unknown) {
        lastError = err instanceof Error ? err.message : String(err);
      }
    }
  }

  if (provider === "anthropic") {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("Falta ANTHROPIC_API_KEY.");

    for (const model of models) {
      if (!model) continue;
      try {
        const res = await fetchWithTimeout("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model,
            max_tokens: maxTokens,
            system: systemPrompt,
            messages: [{ role: "user", content: userContent }],
            temperature,
          }),
        }, timeoutMs);

        if (res.ok) {
          const j = await res.json();
          const text = j.content?.[0]?.text;
          if (text) return parseModelJson(text);
        }
        lastError = await res.text().catch(() => "");
      } catch (err: unknown) {
        lastError = err instanceof Error ? err.message : String(err);
      }
    }
  }

  // Gemini como último recurso (mismo comportamiento que el dispatch streaming)
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    throw new Error(`Error generando JSON (${provider}): ${lastError || "No se pudo obtener respuesta del modelo."}`);
  }

  const geminiModels = provider === "gemini" ? models : FALLBACK_MODELS.gemini;
  for (const model of geminiModels) {
    if (!model) continue;
    try {
      const res = await fetchWithTimeout(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": geminiKey,
          },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: userContent }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: {
              temperature,
              maxOutputTokens: maxTokens,
              responseMimeType: "application/json",
            },
          }),
        },
        timeoutMs
      );

      if (res.ok) {
        const j = await res.json();
        const text = j.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return parseModelJson(text);
      }
      lastError = await res.text().catch(() => "");
    } catch (err: unknown) {
      lastError = err instanceof Error ? err.message : String(err);
    }
  }

  throw new Error(`Error generando JSON: ${lastError || "Sin respuesta del modelo."}`);
}
