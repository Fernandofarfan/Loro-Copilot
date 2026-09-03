/**
 * app/lib/antiSlopFilter.ts
 *
 * Filtro de estilo y limpiador de patrones formuláicos ("AI Slop").
 * Remueve muletillas de asistentes conversacionales (ChatGPT, Claude),
 * asegurando que la respuesta inicie de forma directa y técnica.
 */

// Lista de prefijos y frases formuláicas habituales en modelos de lenguaje
const SLOP_PREFIX_REGEXES = [
  /^(?:certainly|sure thing|absolutely|of course|great question)[!,.]?\s*(?:let'?s\s+(?:delve|dive|look)\s+into\s+this[!,.]?\s*)?/i,
  /^(?:in today'?s\s+(?:fast-paced|modern|rapidly evolving)\s+(?:world|tech landscape|industry)[,.]?\s*)/i,
  /^(?:it'?s?\s+(?:crucial|important|worth noting|essential)\s+to\s+(?:remember|note|consider|keep in mind)\s+that\s*)/i,
  /^(?:as a(?:n)?\s+(?:software engineer|tech lead|architect|developer)[,.]?\s*)/i,
  /^(?:first and foremost|to begin with|first of all)[,.]?\s*/i,
  /^(?:here is (?:how|a breakdown of how|what|the way) (?:we|you|I) (?:can|would|should)[,.]?\s*)/i,
  /^(?:¡?por supuesto|¡?claro que sí|¡?excelente pregunta|¡?sin duda)?[!,.]?\s*(?:vamos a (?:profundizar|analizar|ver)[,.]?\s*)?/i,
  /^(?:en el mundo actual|en la actualidad|hoy en día)[,.]?\s*/i,
  /^(?:es (?:crucial|fundamental|importante|clave) (?:destacar|recordar|tener en cuenta|mencionar) que\s*)/i,
  /^(?:como (?:ingeniero|desarrollador|tech lead|arquitecto)[,.]?\s*)/i,
];

// Reemplazos de frases académicas blandas por tono de producción directo
const PHRASE_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\b(?:delve into|dive deep into)\b/gi, "examine"],
  [/\b(?:it is crucial to|it is essential to)\b/gi, "we need to"],
  [/\b(?:in order to achieve this)\b/gi, "to do this"],
  [/\b(?:profundizar en|adentrarnos en)\b/gi, "analizar"],
  [/\b(?:es menester|resulta imperativo)\b/gi, "tenemos que"],
];

/**
 * Limpia el texto eliminando prefijos formuláicos y humanizando el tono inicial
 */
export function cleanAiSlop(text: string): string {
  if (!text) return "";

  let cleaned = text.trim();

  // 1. Limpieza de prefijos formuláicos al inicio del texto
  let matched = true;
  while (matched) {
    matched = false;
    for (const regex of SLOP_PREFIX_REGEXES) {
      if (regex.test(cleaned)) {
        cleaned = cleaned.replace(regex, "").trim();
        matched = true;
      }
    }
  }

  // 2. Si el texto resultante empieza con minúscula tras remover el prefijo, capitalizar
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  // 3. Reemplazo de modismos preachy por modismos directos
  for (const [pattern, replacement] of PHRASE_REPLACEMENTS) {
    cleaned = cleaned.replace(pattern, replacement);
  }

  return cleaned;
}

/**
 * Evalúa si una respuesta contiene indicadores de tono artificial / AI Slop
 */
export function detectAiSlopScore(text: string): { score: number; flaggedPhrases: string[] } {
  if (!text) return { score: 0, flaggedPhrases: [] };

  const flagged: string[] = [];
  const testPhrases = [
    "certainly",
    "delve",
    "fast-paced world",
    "it is crucial to",
    "first and foremost",
    "por supuesto",
    "es crucial destacar",
    "en el mundo actual",
  ];

  const lower = text.toLowerCase();
  for (const phrase of testPhrases) {
    if (lower.includes(phrase)) {
      flagged.push(phrase);
    }
  }

  // Score normalizado de 0 a 1 (1 = muy formuláico)
  const score = Math.min(1, flagged.length * 0.25);
  return { score, flaggedPhrases: flagged };
}
