// Utilidades para clasificación y análisis de preguntas de entrevista

export function classifyQuestion(q: string): { label: string; color: string } {
  const lower = (q || "").toLowerCase();
  if (/salario|sueldo|pretensi|cu[aá]nto quer|cu[aá]nto gan/i.test(lower)) {
    return { label: "💰 Pretensión Salarial", color: "#f59e0b" };
  }
  if (/contame|cu[eé]ntame|alguna vez|situaci[oó]n|conflicto|desaf[ií]o|ejemplo|fracaso|logro|compa[nñ]ero|equipo/i.test(lower)) {
    return { label: "🧠 Comportamental · Usar STAR", color: "#8b5cf6" };
  }
  if (/c[oó]digo|arquitectura|base de datos|react|node|sql|aws|diferencia|funciona|api|escalab/i.test(lower)) {
    return { label: "🛠️ Pregunta Técnica", color: "#38bdf8" };
  }
  return { label: "💬 General", color: "#10b981" };
}

export function detectTrickQuestion(q: string): string | null {
  const lower = (q || "").toLowerCase();
  if (/defecto|debilidad|peor|error|fracaso|por qu[eé] dej|motivo de salida|conflict|problema con tu jefe|desacuerdo con manager/i.test(lower)) {
    return "⚠️ Pregunta Delicada: Mantener actitud positiva, enfocar defectos en aprendizaje continuo y evitar hablar mal de empleadores anteriores.";
  }
  return null;
}

export function fmtTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export interface ParsedBlocks {
  bilingual: boolean;
  esText: string;
  enText: string;
  phoText?: string;
  cleanText: string;
  alert: string;
  cheats: string[];
  snippet: string;
}

export function parseBlocks(raw: string): ParsedBlocks {
  const enMatch = raw.match(/\[EN\]([\s\S]*?)(?=\[(?:ES|ALERT|CHEATS|SNIPPET)\]|$)/i);
  const esMatch = raw.match(/\[ES\]([\s\S]*?)(?=\[(?:EN|ALERT|CHEATS|SNIPPET)\]|$)/i);

  let cleanText = raw;

  const alertMatch = cleanText.match(/\[ALERT\]([\s\S]*?)(?:\[\/ALERT\]|$)/i);
  const alert = alertMatch ? alertMatch[1].trim() : "";
  if (alertMatch) cleanText = cleanText.replace(alertMatch[0], "");

  const cheatsMatch = cleanText.match(/\[CHEATS\]([\s\S]*?)(?:\[\/CHEATS\]|$)/i);
  const cheats = cheatsMatch ? cheatsMatch[1].trim().split("|").map(s => s.trim()).filter(Boolean) : [];
  if (cheatsMatch) cleanText = cleanText.replace(cheatsMatch[0], "");

  const snippetMatch = cleanText.match(/\[SNIPPET\]([\s\S]*?)(?:\[\/SNIPPET\]|$)/i);
  let snippet = snippetMatch ? snippetMatch[1].trim() : "";
  if (snippet.startsWith("```") && snippet.endsWith("```")) {
    snippet = snippet.replace(/^```[\w]*\n/, "").replace(/```$/, "").trim();
  }
  if (snippetMatch) cleanText = cleanText.replace(snippetMatch[0], "");

  // Limpiar etiquetas <think>...</think>
  if (cleanText.includes("<think>") && cleanText.includes("</think>")) {
    cleanText = cleanText.replace(/<think>[\s\S]*?<\/think>\s*/gi, "").trim();
  }

  const cleanBlock = (m: RegExpMatchArray | null) =>
    m ? m[1].replace(/\[(ALERT|CHEATS|SNIPPET)\][\s\S]*?(\[\/\1\]|$)/gi, "").trim() : "";

  const enText = cleanBlock(enMatch);
  const esText = cleanBlock(esMatch);

  return {
    bilingual: !!(enMatch || esMatch),
    esText,
    enText,
    phoText: "",
    cleanText: cleanText.trim(),
    alert,
    cheats,
    snippet,
  };
}

// -------------------------------------------------------------
// Banco de Memoria & Búsqueda Semántica Local (<50ms)
// -------------------------------------------------------------

export interface MasterAnswer {
  id: string;
  question: string;
  enText: string;
  esText: string;
  category?: string;
  tags?: string[];
  role?: string;
  company?: string;
  favorite?: boolean;
  createdAt: number;
}

const STOP_WORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "as", "at",
  "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "can", "could",
  "de", "del", "la", "el", "los", "las", "un", "una", "unos", "unas", "y", "o", "en", "para", "por",
  "que", "qué", "como", "cómo", "cuando", "cuándo", "donde", "dónde", "quien", "quién", "con", "sin",
  "sobre", "entre", "hasta", "desde", "tu", "tus", "mi", "mis", "su", "sus", "te", "me", "se", "nos",
  "did", "do", "does", "doing", "down", "during", "each", "few", "for", "from", "further", "had", "has",
  "have", "having", "he", "her", "here", "hers", "herself", "him", "himself", "his", "how", "i", "if",
  "in", "into", "is", "it", "its", "itself", "just", "me", "more", "most", "my", "myself", "no", "nor",
  "not", "now", "of", "off", "on", "once", "only", "or", "other", "our", "ours", "ourselves", "out",
  "over", "own", "same", "she", "should", "so", "some", "such", "than", "that", "the", "their", "theirs",
  "them", "themselves", "then", "there", "these", "they", "this", "those", "through", "to", "too", "under",
  "until", "up", "very", "was", "we", "were", "what", "when", "where", "which", "while", "who", "whom",
  "why", "with", "would", "you", "your", "yours", "yourself", "yourselves", "tell", "contame", "cuentame",
  "explicame", "explain", "describe", "hablame"
]);

export function tokenize(text: string): string[] {
  return (text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remover acentos
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

/**
 * Busca coincidencias en el banco de memoria local usando similitud de Jaccard ponderada
 * y coincidencia de términos técnicos clave.
 */
export function findMatchingAnswer(
  query: string,
  answers: MasterAnswer[],
  threshold = 0.35
): { match: MasterAnswer; score: number } | null {
  if (!query || !answers || answers.length === 0) return null;

  const queryTokens = Array.from(new Set(tokenize(query)));
  if (queryTokens.length === 0) return null;

  let bestMatch: MasterAnswer | null = null;
  let highestScore = 0;

  for (const item of answers) {
    const itemTokens = Array.from(new Set(tokenize(item.question)));
    if (itemTokens.length === 0) continue;

    // 1. Intersección de tokens
    let intersection = 0;
    queryTokens.forEach((qToken) => {
      // Coincidencia exacta o raíz común (>3 caracteres)
      for (let i = 0; i < itemTokens.length; i++) {
        const iToken = itemTokens[i];
        if (qToken === iToken || (qToken.length > 3 && iToken.length > 3 && (qToken.startsWith(iToken) || iToken.startsWith(qToken)))) {
          intersection += 1;
          break;
        }
      }
    });

    const unionCount = new Set(queryTokens.concat(itemTokens)).size;
    const jaccardScore = unionCount > 0 ? intersection / unionCount : 0;
    const minSize = Math.min(queryTokens.length, itemTokens.length);
    const overlapScore = minSize > 0 ? intersection / minSize : 0;

    let score = (jaccardScore * 0.3) + (overlapScore * 0.7);

    // 2. Bonus por coincidencia de tags
    if (item.tags && item.tags.length > 0) {
      item.tags.forEach((tag) => {
        const cleanTag = tag.toLowerCase().trim();
        if (cleanTag && query.toLowerCase().includes(cleanTag)) {
          score += 0.2;
        }
      });
    }

    // 3. Bonus por coincidencia de frase o inclusión
    const cleanQ = query.toLowerCase().trim();
    const cleanItemQ = item.question.toLowerCase().trim();
    if (cleanQ.includes(cleanItemQ) || cleanItemQ.includes(cleanQ)) {
      score += 0.3;
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = item;
    }
  }

  if (bestMatch && highestScore >= threshold) {
    return { match: bestMatch, score: Math.min(1, highestScore) };
  }

  return null;
}


