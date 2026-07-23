export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://lorocopilot.com";
export const APP_NAME = "Loro Copilot";

export function textStreamResponse(stream: ReadableStream) {
  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

export function sseTextStream(
  upstream: ReadableStream<Uint8Array>,
  extract: (json: string) => string | null
): ReadableStream {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const reader = upstream.getReader();
  let buffer = "";
  return new ReadableStream({
    async pull(controller) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
          return;
        }
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        let enqueuedAny = false;
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const json = trimmed.slice(5).trim();
          if (!json || json === "[DONE]") continue;
          try {
            const text = extract(json);
            if (text) {
              controller.enqueue(encoder.encode(text));
              enqueuedAny = true;
            }
          } catch {}
        }
        if (enqueuedAny) return;
      }
    },
    cancel() {
      reader.cancel();
    },
  });
}

export async function streamGemini(models: string[], userContent: string, systemPrompt: string): Promise<Response> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response("Falta GEMINI_API_KEY en las variables de entorno.", { status: 500 });
  }
  const maxTokens = systemPrompt.includes("[ES]") ? 1024 : 512;
  const payload = {
    contents: [{ role: "user", parts: [{ text: userContent }] }],
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: maxTokens,
      thinkingConfig: { thinkingBudget: 0 },
    },
  };
  let detail = "";
  for (const model of models) {
    if (!model) continue;
    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
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
  }
  return new Response(`Gemini error: ${detail}`, { status: 502 });
}

export async function streamAnthropic(models: string[], userContent: string, systemPrompt: string): Promise<Response> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response("Falta ANTHROPIC_API_KEY en Vercel para usar Claude.", { status: 500 });
  }
  let detail = "";
  for (const model of models) {
    if (!model) continue;
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 512,
        system: systemPrompt,
        messages: [{ role: "user", content: userContent }],
        stream: true,
      }),
    });
    if (upstream.ok && upstream.body) {
      return textStreamResponse(
        sseTextStream(upstream.body, (json) => {
          const evt = JSON.parse(json);
          if (evt.type === "content_block_delta" && evt.delta?.text) {
            return evt.delta.text;
          }
          return null;
        })
      );
    }
    detail = await upstream.text().catch(() => "");
  }
  return new Response(`Claude error: ${detail}`, { status: 502 });
}

export async function streamOpenAI(models: string[], userContent: string, systemPrompt: string): Promise<Response> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response("Falta OPENAI_API_KEY en Vercel para usar GPT.", { status: 500 });
  }
  let detail = "";
  for (const model of models) {
    if (!model) continue;
    const isReasoning = /^(gpt-5|o[0-9])/.test(model);
    const maxTokens = systemPrompt.includes("[ES]") ? 1024 : 512;
    const reqBody: Record<string, unknown> = {
      model,
      stream: true,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
    };
    if (isReasoning) {
      reqBody.max_completion_tokens = systemPrompt.includes("[ES]") ? 1800 : 900;
      reqBody.reasoning_effort = "low";
    } else {
      reqBody.max_tokens = maxTokens;
      reqBody.temperature = 0.4;
    }
    const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(reqBody),
    });
    if (upstream.ok && upstream.body) {
      return textStreamResponse(
        sseTextStream(upstream.body, (json) => {
          const evt = JSON.parse(json);
          return evt.choices?.[0]?.delta?.content ?? null;
        })
      );
    }
    detail = await upstream.text().catch(() => "");
  }
  return new Response(`GPT error: ${detail}`, { status: 502 });
}

export async function streamOpenRouter(models: string[], userContent: string, systemPrompt: string): Promise<Response> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return new Response("Falta OPENROUTER_API_KEY en Vercel.", { status: 500 });
  }
  let detail = "";
  for (const model of models) {
    if (!model) continue;
    const isReasoning = /^(gpt-5|o[0-9])/.test(model);
    const maxTokens = systemPrompt.includes("[ES]") ? 1024 : 512;
    const reqBody: Record<string, unknown> = {
      model,
      stream: true,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
    };
    if (isReasoning) {
      reqBody.max_completion_tokens = systemPrompt.includes("[ES]") ? 1800 : 900;
      reqBody.reasoning_effort = "low";
    } else {
      reqBody.max_tokens = maxTokens;
      reqBody.temperature = 0.4;
    }
    const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": SITE_URL,
        "X-Title": APP_NAME,
      },
      body: JSON.stringify(reqBody),
    });
    if (upstream.ok && upstream.body) {
      return textStreamResponse(
        sseTextStream(upstream.body, (json) => {
          const evt = JSON.parse(json);
          return evt.choices?.[0]?.delta?.content ?? null;
        })
      );
    }
    detail = await upstream.text().catch(() => "");
  }
  return new Response(`OpenRouter error: ${detail}`, { status: 502 });
}
