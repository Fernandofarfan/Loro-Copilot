export const runtime = "edge";



// ---------- Modelos disponibles ----------
// El cliente manda { provider, model }. Cada provider usa su propia API key
// (env var) y su propio endpoint de streaming. Si falta la key, se devuelve un
// error claro. El backend soporta los tres providers aunque la UI hoy muestre
// solo Gemini.
type Provider = "gemini" | "anthropic" | "openai" | "openrouter";

// Override por env SOLO si está explícitamente seteada (string vacío = no seteada).
// Si no, manda el `model` que pide el cliente (el elegido en el selector).
const GEMINI_MODEL_OVERRIDE = process.env.GEMINI_MODEL || "";
const ANTHROPIC_MODEL_OVERRIDE = process.env.ANTHROPIC_MODEL || "";
const OPENAI_MODEL_OVERRIDE = process.env.OPENAI_MODEL || "";
const OPENROUTER_MODEL_OVERRIDE = process.env.OPENROUTER_MODEL || "";
const DEFAULT_PROVIDER_OVERRIDE = (process.env.LLM_PROVIDER || "").toLowerCase();
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://loro-copilot.vercel.app";
const APP_NAME = "Loro Copilot";

const SYSTEM_PROMPT = `Sos EL ENTREVISTADO. No sos un asistente que aconseja: sos la persona que está en la llamada respondiendo en primera persona, en vivo, ahora mismo.

Recibís:
1. EMPRESA y DESCRIPCIÓN DEL PUESTO al que se está postulando (el contexto de la entrevista).
2. El PERFIL de la persona (su CV, experiencia, logros, notas).
3. La transcripción reciente de la conversación.
4. La última pregunta detectada, marcada como [PREGUNTA].

Tu tarea: responder esa pregunta como si fueras vos el candidato, de la mejor forma posible para ESE puesto en ESA empresa. El entrevistador evalúa tres cosas: evidencia concreta de que sabés hacer el trabajo (señal), por qué encajás con esta empresa y rol (fit), y qué tan claro te expresás (comunicación). Apuntá a las tres. Anclá todo en hechos reales del perfil (proyectos, resultados, números, tecnologías).

## La [PREGUNTA] viene de transcripción en vivo — leela con criterio
El texto de [PREGUNTA] es la salida de un reconocedor de voz automático: puede tener palabras mal transcritas, tildes faltantes, homófonos ("haber/a ver"), cortes o ruido. NO respondas al texto literal si está claramente mal: primero inferí qué preguntó REALMENTE el entrevistador, usando la TRANSCRIPCIÓN reciente y el contexto de empresa/puesto para desambiguar. Si de verdad es imposible saber qué preguntó, respondé al sentido más probable dado el contexto, sin pedir que repita.

## Cómo responder según el tipo de pregunta
Detectá el arquetipo y respondé con su mejor forma:
- "Contame de vos" / preséntate: pitch de 3 movimientos — quién sos hoy (rol + años), 1-2 logros que importan para ESTE puesto, y por qué estás acá. No recites el CV cronológico.
- Técnica ("¿sabés X?", "cómo harías Y"): foco técnico, concreto, con una decisión o trade-off real que hayas tomado. Si es sí/no, contestá y respaldá con un ejemplo breve.
- Comportamiento ("contame una vez que..."): estructura STAR contada como anécdota fluida (situación breve → qué hiciste vos → resultado con número si hay), nunca como checklist.
- "Por qué esta empresa / este rol": conectá algo real del perfil con lo que la empresa hace o el problema del rol. Específico de la empresa, no genérico.
- Debilidad / error: una real y acotada, + qué cambiaste concretamente por ella. Nada de debilidad-fortaleza disfrazada ("soy muy perfeccionista").
- Por qué te fuiste / gap en el CV: honesto, breve, hacia adelante — sin hablar mal de nadie.
- Pretensión salarial: si el perfil trae un número o rango, usalo con seguridad; si no, da un rango razonable o devolvé la pregunta al rango del puesto, sin quedar rígido.
- "¿Tenés preguntas para nosotros?": 1-2 preguntas agudas sobre el rol, el equipo o los desafíos — que muestren que investigaste, no sobre sueldo/vacaciones.

## Honestidad y Anti-Alucinación (CRÍTICO)
Nunca inventes datos, títulos, empresas, herramientas, números ni experiencia que no estén en el perfil. Si te preguntan por una tecnología, herramienta o habilidad que NO tenés en el CV, NO bluffees ni asumas que la sabés. Reconocelo elegantemente y puenteá a lo adyacente real que sí tenés ("No trabajé con X puntual, pero sí tengo mucha experiencia con Y que es similar...") o a tu capacidad de aprender rápido con ejemplos reales. Un bluff que te cazan es la peor respuesta posible.

## Continuidad
Usá la TRANSCRIPCIÓN para sonar como una conversación real: no repitas algo que ya dijiste antes, y si viene al caso referenciá un punto anterior ("como te mencionaba con el proyecto de..."). Leé el tono y la seniority del entrevistador y espejalo.

## Tono — tan importante como el contenido
- Hablado, no escrito. Sonás como una persona real pensando en voz alta con confianza, no como un mail de RRHH ni un CV leído en voz alta.
- Cero clichés ("soy proactivo", "jugador de equipo", "mi mayor fortaleza es..."). Si querés decir eso, mostralo con el hecho concreto en vez de la etiqueta.
- Conectores naturales de habla ("igual...", "de hecho...", "lo que más me sirvió ahí fue...", "y eso me llevó a...") para que fluya como un solo discurso hablado.
- Profesional pero cercano, seguro sin sonar ensayado ni sobreactuado.

## Formato de salida (CLAVE: el candidato lee mientras habla y la respuesta va apareciendo de a poco)
- Arrancá con UNA frase de apertura completa y auto-suficiente (1-2 oraciones, SIN viñeta) que YA contesta el núcleo de la pregunta y se puede decir sola tal cual. Es lo primero que el candidato empieza a leer en voz alta, así que tiene que ser una respuesta directa, no un preámbulo. Nunca empieces con relleno tipo "Bueno, primero..." o "Es una buena pregunta".
- Después de esa apertura, dejá una línea en blanco y seguí con viñetas (cada una arranca con "- ") que desarrollan y cierran: una o dos frases por viñeta, continuando la idea como un único discurso cortado en pedazos fáciles de leer de un vistazo.
- Largo VARIABLE según la pregunta: una factual se contesta con la apertura y 1 viñeta; una de comportamiento pide el arco completo (hasta 4-5 viñetas). Nunca infles con relleno para llegar a un largo. Nunca te quedes a medias.
- Todo en primera persona, listo para decir en voz alta tal cual — no son "ideas para desarrollar", son la respuesta misma ya hablada.
- Sin preámbulo, sin "Podrías decir", sin "aquí está tu respuesta": arrancá directo con la frase de apertura.
- Respondé en el idioma indicado en "## IDIOMA DE LA RESPUESTA" (puede diferir del idioma de la pregunta). Dentro de ese idioma, espejá el registro (tú/vos/usted) del entrevistador.

## Regla de oro sobre [PREGUNTA]
Si ese campo tiene CUALQUIER texto —por corto, informal, mal transcrito o inesperado que sea, incluso si el PERFIL o la EMPRESA están vacíos— RESPONDÉLO IGUAL con lo que tengas. Nunca evalúes si "es lo bastante clara". El ÚNICO caso en que devolvés "(esperando pregunta)" es cuando [PREGUNTA] dice literalmente "(ninguna aún)" porque no llegó nada. Nunca lo uses por dudar del contenido.`;

// Sufijo para Detección Automática de Idioma
const AUTO_LANGUAGE_SUFFIX = `

## DETECCIÓN AUTOMÁTICA DE IDIOMA Y MODO BILINGÜE
Tu respuesta se va a adaptar automáticamente al idioma en el que habló el entrevistador en su última pregunta.

Si el entrevistador te habló en **ESPAÑOL**:
- Respondé SOLO en español rioplatense. No uses bloques especiales.

Si el entrevistador te habló en **INGLÉS** (o de repente cambia a inglés):
- El candidato necesita leer la traducción. Tu respuesta DEBE tener EXACTAMENTE este formato — dos bloques, sin texto fuera de ellos:

[ES]
<Respuesta completa en español rioplatense, para que el candidato ENTIENDA qué tiene que decir.>

[EN]
<Traducción natural al inglés de la respuesta anterior. Lista para leer en voz alta tal cual.>

- Mantenés el mismo largo y estructura en ambos bloques.`;

const ICEBREAKER_PROMPT = `Sos un candidato en los minutos finales de una entrevista de trabajo. El entrevistador acaba de preguntar si tenés alguna duda para ellos.

Tu tarea: Generar 2 o 3 preguntas incisivas, estratégicas y muy bien pensadas para hacerles, basándote en la información que se charló durante la entrevista (TRANSCRIPCIÓN), la EMPRESA y el ROL.

Reglas para las preguntas:
1. No preguntes banalidades (sueldo, vacaciones, horarios).
2. Preguntá sobre el mayor desafío técnico o de negocio que enfrentan, métricas de éxito del rol, la cultura real del equipo, o por qué la persona anterior dejó el puesto.
3. Si en la transcripción mencionaron un proyecto, problema o tecnología específica, hacé una pregunta de seguimiento sobre eso.
4. Formateá la respuesta como una lista con viñetas (- ), donde cada viñeta es una opción distinta de pregunta que el candidato puede elegir hacer.
5. Lenguaje hablado, rioplatense, profesional pero suelto.
6. Respondé en el idioma indicado en "## IDIOMA DE LA RESPUESTA".
7. (Aplica también la regla del MODO BILINGÜE si se indica).`;

function resolveModel(provider: Provider, requested: string): string {
  if (provider === "anthropic") return ANTHROPIC_MODEL_OVERRIDE || requested || "claude-haiku-4-5";
  if (provider === "openai") return OPENAI_MODEL_OVERRIDE || requested || "gpt-4o-mini";
  if (provider === "openrouter") return OPENROUTER_MODEL_OVERRIDE || requested || "openai/gpt-4o-mini";
  return GEMINI_MODEL_OVERRIDE || requested || "gemini-2.5-flash";
}

function resolveProvider(requested?: string): Provider {
  const envProvider = DEFAULT_PROVIDER_OVERRIDE as Provider;
  if (envProvider === "gemini" || envProvider === "anthropic" || envProvider === "openai" || envProvider === "openrouter") {
    return envProvider;
  }
  if (requested === "anthropic" || requested === "openai" || requested === "openrouter") return requested;
  return "gemini";
}

export async function POST(req: Request) {
  // No rate limits nor origin checks for local instance

  let body: {
    profile?: string;
    company?: string;
    role?: string;
    answerLang?: string;
    transcript?: string;
    question?: string;
    provider?: string;
    model?: string;
    bilingualMode?: boolean;
    type?: "answer" | "icebreaker";
    extraInstructions?: string;
    previousAnswers?: { q: string; a: string }[];
  };
  try {
    body = await req.json();
  } catch {
    return new Response("Body inválido.", { status: 400 });
  }

  const provider: Provider = resolveProvider(body.provider);
  const model = resolveModel(provider, (body.model || "").slice(0, 100));

  const profile = (body.profile || "").slice(0, 8000);
  const company = (body.company || "").slice(0, 200);
  const role = (body.role || "").slice(0, 2000);
  const transcript = (body.transcript || "").slice(0, 6000);
  const question = (body.question || "").slice(0, 1000);
  const bilingualMode = body.bilingualMode === true;

  // El modo bilingüe ahora es automático. Le indicamos al LLM que detecte
  // el idioma del entrevistador y actúe en consecuencia.
  const answerLangLabel = `
DETECTÁ AUTOMÁTICAMENTE el idioma en el que está hablando el [Entrevistador] basándote en la última [PREGUNTA] y la transcripción reciente.
- Si el entrevistador pregunta en INGLÉS: Respondé usando el formato BILINGÜE (ver sección "DETECCIÓN AUTOMÁTICA DE IDIOMA Y MODO BILINGÜE" más abajo).
- Si el entrevistador pregunta en ESPAÑOL: Respondé SIEMPRE en Español rioplatense.
- Si el entrevistador pregunta en otro idioma, adaptate a ese idioma o usá formato bilingüe.

Preferencias de la interfaz del candidato: ${body.answerLang === "en" ? "Inglés" : "Español"}.`;

  const basePrompt = body.type === "icebreaker" ? ICEBREAKER_PROMPT : SYSTEM_PROMPT;
  // Siempre agregamos el sufijo para que el LLM sepa cómo comportarse si detecta inglés.
  const effectiveSystemPrompt = basePrompt + AUTO_LANGUAGE_SUFFIX;

  const extraInstructions = (body.extraInstructions || "").slice(0, 1000);
  const previousAnswers = body.previousAnswers || [];
  
  let historySection = "";
  if (previousAnswers.length > 0) {
    historySection = `## MEMORIA DE LA SESIÓN (RESPUESTAS PREVIAS)\n`;
    historySection += `Ya le sugeriste al candidato las siguientes respuestas durante esta entrevista. NO repitas las mismas anécdotas o ideas a menos que sea necesario:\n`;
    previousAnswers.forEach((pa, i) => {
      historySection += `Q: ${pa.q}\nA: ${pa.a}\n\n`;
    });
  }

  const userContent = `## EMPRESA
${company || "(sin especificar)"}

## DESCRIPCIÓN DEL PUESTO
${role || "(sin especificar)"}

## PERFIL DEL CANDIDATO
${profile || "(sin perfil cargado)"}

${extraInstructions ? `## INSTRUCCIONES EXTRA DEL USUARIO (REGLA ESTRICTA)\n${extraInstructions}\n` : ""}
## IDIOMA DE LA RESPUESTA
${answerLangLabel}

${body.type === "icebreaker" ? "## ESTÁS EN MODO PREGUNTAS AL ENTREVISTADOR (ICEBREAKER)\nIgnorá la [PREGUNTA] si no aplica." : ""}
${historySection}
## TRANSCRIPCIÓN RECIENTE
${transcript || "(vacío)"}

## ÚLTIMO PUNTO DETECTADO
[PREGUNTA] ${question || "(ninguna aún)"}`;

  // Fallbacks: si el modelo pedido fallara (ID inválido, no habilitado en la
  // cuenta, etc.), se reintenta con uno estable para no quedar sin respuesta
  // en plena entrevista.
  const FALLBACK: Record<Provider, string[]> = {
    openrouter: ["openai/gpt-4o-mini", "openai/gpt-4.1-mini"],
    openai: ["gpt-4.1-mini", "gpt-4o-mini"],
    anthropic: ["claude-haiku-4-5"],
    gemini: ["gemini-2.5-flash"],
  };
  const candidates = [model, ...FALLBACK[provider].filter((m) => m !== model)];

  try {
    if (provider === "anthropic") return await streamAnthropic(candidates, userContent, effectiveSystemPrompt);
    if (provider === "openrouter") return await streamOpenRouter(candidates, userContent, effectiveSystemPrompt);
    if (provider === "openai") return await streamOpenAI(candidates, userContent, effectiveSystemPrompt);
    return await streamGemini(candidates, userContent, effectiveSystemPrompt);
  } catch (err: any) {
    return new Response(`Error del modelo: ${err?.message || "desconocido"}`, { status: 502 });
  }
}

// Envuelve un ReadableStream de texto plano con los headers correctos.
function textStreamResponse(stream: ReadableStream) {
  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

// Parser SSE genérico: lee el body upstream, parte por líneas "data:", y por
// cada JSON extrae el texto con `extract`. Reenvía solo texto plano al cliente.
function sseTextStream(
  upstream: ReadableStream<Uint8Array>,
  extract: (json: string) => string | null
): ReadableStream {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const reader = upstream.getReader();
  let buffer = "";
  return new ReadableStream({
    // El pull loopea hasta encolar datos reales: si resuelve sin encolar,
    // Vercel Edge puede pausar el stream (fix redescubierto del historial viejo).
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
          } catch {
            // ignora fragmentos incompletos
          }
        }
        if (enqueuedAny) return;
      }
    },
    cancel() {
      reader.cancel();
    },
  });
}

// ---------- Gemini ----------
async function streamGemini(models: string[], userContent: string, systemPrompt = SYSTEM_PROMPT): Promise<Response> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response("Falta GEMINI_API_KEY en las variables de entorno.", { status: 500 });
  }
  // En modo bilingüe las respuestas son más largas (dos bloques completos).
  const maxTokens = systemPrompt.includes("[ES]") ? 1024 : 512;
  const payload = {
    contents: [{ role: "user", parts: [{ text: userContent }] }],
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: maxTokens,
      // Desactiva el "thinking" extendido: sin esto piensa varios cientos de ms
      // antes del primer token, y en vivo eso se nota.
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

// ---------- Anthropic (Claude) ----------
async function streamAnthropic(models: string[], userContent: string, systemPrompt = SYSTEM_PROMPT): Promise<Response> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      "Falta ANTHROPIC_API_KEY en Vercel para usar Claude. Cargá el token o elegí otro modelo.",
      { status: 500 }
    );
  }
  const maxTokens = systemPrompt.includes("[ES]") ? 1024 : 512;
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
        max_tokens: maxTokens,
        temperature: 0.4,
        system: systemPrompt,
        messages: [{ role: "user", content: userContent }],
        stream: true,
      }),
    });
    if (upstream.ok && upstream.body) {
      return textStreamResponse(
        sseTextStream(upstream.body, (json) => {
          const evt = JSON.parse(json);
          // Solo nos interesan los deltas de texto del bloque de contenido.
          if (evt.type === "content_block_delta" && evt.delta?.type === "text_delta") {
            return evt.delta.text ?? null;
          }
          return null;
        })
      );
    }
    detail = await upstream.text().catch(() => "");
  }
  return new Response(`Claude error: ${detail}`, { status: 502 });
}

// ---------- OpenAI (GPT) ----------
async function streamOpenAI(models: string[], userContent: string, systemPrompt = SYSTEM_PROMPT): Promise<Response> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(
      "Falta OPENAI_API_KEY en Vercel para usar GPT. Cargá el token o elegí otro modelo.",
      { status: 500 }
    );
  }
  let detail = "";
  for (const model of models) {
    if (!model) continue;
    // Los modelos "reasoning" (GPT-5, o-series) usan max_completion_tokens,
    // rechazan temperature custom y permiten bajar el esfuerzo de razonamiento
    // (clave para latencia en vivo). Los clásicos (gpt-4.x) usan max_tokens.
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

// OpenRouter es compatible con la API de OpenAI, pero mantiene la clave del lado del servidor.
async function streamOpenRouter(models: string[], userContent: string, systemPrompt = SYSTEM_PROMPT): Promise<Response> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return new Response(
      "Falta OPENROUTER_API_KEY en Vercel para usar OpenRouter. Cargá el token o elegí otro modelo.",
      { status: 500 }
    );
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
