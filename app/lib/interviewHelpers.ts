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

/**
 * Detecta dinámicamente si una pregunta o fragmento de audio está en inglés o español.
 * Analiza caracteres propios del español, palabras de apertura interrogativa y stopwords comunes.
 */
export function detectQuestionLanguage(text: string): "en" | "es" {
  const clean = (text || "").trim().toLowerCase();
  if (!clean) return "es";

  // Caracteres inequívocos del español
  if (/[áéíóúüñ¿¡]/.test(clean)) {
    return "es";
  }

  // Patrones y palabras muy frecuentes en inglés
  const englishMatches =
    clean.match(
      /\b(what|where|when|why|how|who|which|can|could|would|should|tell|describe|explain|are|is|do|does|did|have|has|from|about|yourself|your|you|with|the|and|for|in|on|to|my|i|we|they|their|this|that|experience|background|project|team|challenge|stack|salary|role|company|join|work|working|worked|built|building|build|hello|hi|hey|good|morning|afternoon|great|please|thank|thanks)\b/gi
    ) || [];

  // Patrones y palabras muy frecuentes en español
  const spanishMatches =
    clean.match(
      /\b(que|como|cuando|donde|por que|porque|cual|cuales|quien|quienes|contame|cuentame|explicame|explica|describi|describe|tenes|tienes|sos|eres|estas|esta|de donde|tu|tus|experiencia|proyecto|equipo|desafio|para|con|en|por|un|una|los|las|el|la|sobre|acerca|sueldo|salario|puesto|empresa|trabajo|trabajando|trabajaste|hiciste|hacer|hola|buenas|buenos|dias|tardes|noches|gracias|por favor)\b/gi
    ) || [];

  if (englishMatches.length > spanishMatches.length) {
    return "en";
  }
  if (spanishMatches.length > englishMatches.length) {
    return "es";
  }

  // Verificación de patrones de inicio de pregunta en inglés
  if (
    /^(where|what|how|why|when|who|which|can you|could you|would you|tell me|describe|do you|are you|have you|is there|let's talk about)\b/i.test(
      clean
    )
  ) {
    return "en";
  }

  return "es";
}

/**
 * Detecta si una frase o pregunta parece incompleta (pausa para respirar, conector o puntuación abierta).
 */
export function isIncompleteQuestion(text: string): boolean {
  const clean = (text || "").trim().toLowerCase();
  if (!clean) return false;

  // Frases muy cortas de 1 o 2 palabras que no son saludos son pausas intermedias
  const words = clean.split(/\s+/).filter(Boolean);
  if (
    words.length < 3 &&
    !/^(hola|buenas|hi|hello|hey|qu[eé] tal|todo bien|how are you|how is it going)\b/i.test(clean)
  ) {
    return true;
  }

  // Termina en conectores típicos de continuidad en español o inglés
  const trailingConnectorRegex =
    /\b(y|o|pero|que|con|para|de|a|en|como|entonces|porque|por qu[eé]|o sea|es decir|sobre|adem[aá]s|donde|cuando|tambi[eé]n|del|al|las siguientes:?|los siguientes:?|and|or|but|with|for|to|in|at|by|that|which|then|because|like|about|also|such as|following:?|between|among|from|into|onto|regarding|including)\s*[:,\-\.]*$/i;

  if (trailingConnectorRegex.test(clean)) {
    return true;
  }

  // Termina en signos de puntuación de continuación abierta (dos puntos, coma, puntos suspensivos, guion)
  if (/([,:\-–—]|\.\.\.)$/.test(clean.replace(/\s+$/, ""))) {
    return true;
  }

  return false;
}

/**
 * Extrae de forma limpia y aislada el texto de la pregunta del turno actual del entrevistador,
 * evitando mezclar texto de preguntas anteriores.
 */
export function extractCurrentTurnQuestion(
  lines: Array<{ id: number | string; text: string; speaker: number; final: boolean; timestamp?: number }>,
  lastProcessedId: number | string | null
): { text: string; newLastId: number | string | null; isIncomplete: boolean } {
  if (!lines || lines.length === 0) {
    return { text: "", newLastId: null, isIncomplete: false };
  }

  // 1. Filtrar solo las líneas posteriores a la última que ya fue respondida
  let unhandledLines = lines;
  if (lastProcessedId !== null && lastProcessedId !== undefined) {
    const idx = lines.findIndex((l) => l.id === lastProcessedId);
    if (idx >= 0) {
      unhandledLines = lines.slice(idx + 1);
    }
  }

  // 2. Filtrar únicamente las líneas finales del entrevistador (speaker === 0)
  const interviewerLines = unhandledLines.filter((l) => l.speaker === 0 && l.final);
  if (interviewerLines.length === 0) {
    return { text: "", newLastId: null, isIncomplete: false };
  }

  const text = interviewerLines
    .map((l) => l.text.trim())
    .filter(Boolean)
    .join(" ")
    .trim();

  const newLastId = interviewerLines[interviewerLines.length - 1].id;
  const incomplete = isIncompleteQuestion(text);

  return {
    text,
    newLastId,
    isIncomplete: incomplete,
  };
}

/**
 * Reconoce saludos y small talk de apertura para responder en <10ms sin llamar al LLM
 */
export function checkInstantGreeting(q: string, company = ""): { enText: string; esText: string; cleanText: string } | null {
  const lower = (q || "").trim().toLowerCase();
  // Límite de 80 chars: los saludos reales de apertura de entrevista raramente superan esta longitud.
  // Evita tratar como saludo preguntas cortas que empiecen con "hola" pero contengan contenido técnico.
  const isGreeting = /^(hola|buenas|buenos d[ií]as|buenas tardes|buenas noches|c[oó]mo est[aá]s?|qu[eé] tal|todo bien|qu[eé] onda|hi|hello|hey|how are you|how is it going|how are you doing|can you hear me|me escuchas|me escuch[aá]s)\b/i.test(lower) && lower.length < 80;

  if (!isGreeting) return null;

  const isEnGreeting = /^(hi|hello|hey|how are you|how is it going|how are you doing|can you hear me)\b/i.test(lower);

  const comp = company ? `el equipo de ${company}` : "ustedes";
  const compEn = company ? `the team at ${company}` : "everyone";

  const es = `¡Hola! Muy bien, gracias por preguntar. Un gusto enorme estar acá charlando con ${comp} hoy, listo para arrancar.`;
  const en = `Hi! I'm doing great, thank you for asking. It's a pleasure to be here and I'm really excited to chat with ${compEn} today.`;

  return {
    enText: en,
    esText: es,
    cleanText: isEnGreeting ? en : es,
  };
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
  const phoMatch = raw.match(/\[PHO\]([\s\S]*?)(?=\[(?:EN|ES|ALERT|CHEATS|SNIPPET)\]|$)/i);
  const enMatch = raw.match(/\[EN\]([\s\S]*?)(?=\[(?:ES|PHO|ALERT|CHEATS|SNIPPET)\]|$)/i);
  const esMatch = raw.match(/\[ES\]([\s\S]*?)(?=\[(?:EN|PHO|ALERT|CHEATS|SNIPPET)\]|$)/i);

  let cleanText = raw;

  // Solo extraer ALERT, CHEATS, SNIPPET si tienen tag de cierre explícito
  // para no tragar texto en streaming parcial antes de que el modelo termine el bloque.
  const alertMatch = cleanText.match(/\[ALERT\]([\s\S]*?)\[\/ALERT\]/i);
  const alert = alertMatch ? alertMatch[1].trim() : "";
  if (alertMatch) cleanText = cleanText.replace(alertMatch[0], "");

  const cheatsMatch = cleanText.match(/\[CHEATS\]([\s\S]*?)\[\/CHEATS\]/i);
  const cheats = cheatsMatch
    ? cheatsMatch[1]
        .trim()
        .split("|")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
  if (cheatsMatch) cleanText = cleanText.replace(cheatsMatch[0], "");

  const snippetMatch = cleanText.match(/\[SNIPPET\]([\s\S]*?)\[\/SNIPPET\]/i);
  let snippet = snippetMatch ? snippetMatch[1].trim() : "";
  if (snippet.startsWith("```") && snippet.endsWith("```")) {
    snippet = snippet.replace(/^```[\w]*\n/, "").replace(/```$/, "").trim();
  }
  if (snippetMatch) cleanText = cleanText.replace(snippetMatch[0], "");

  // Limpiar etiquetas <think>...</think> o <think> en curso en streaming
  if (cleanText.includes("<think>")) {
    if (cleanText.includes("</think>")) {
      cleanText = cleanText.replace(/<think>[\s\S]*?<\/think>\s*/gi, "").trim();
    } else {
      cleanText = cleanText.replace(/<think>[\s\S]*/gi, "").trim();
    }
  }

  // Remover marcas de bloques de cleanText
  cleanText = cleanText
    .replace(/\[(?:EN|ES|PHO)\]/gi, "")
    .replace(/\[\/(?:ALERT|CHEATS|SNIPPET)\]/gi, "")
    .trim();

  const cleanBlock = (m: RegExpMatchArray | null) =>
    m ? m[1].replace(/\[(ALERT|CHEATS|SNIPPET)\][\s\S]*?\[\/\1\]/gi, "").trim() : "";

  const enText = cleanBlock(enMatch);
  const esText = cleanBlock(esMatch);
  const phoText = cleanBlock(phoMatch);

  return {
    bilingual: !!(enMatch || esMatch),
    esText,
    enText,
    phoText,
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

/**
 * Parsea un informe o transcripción de entrevista en Markdown exportado por Loro Copilot
 * y lo convierte en un array de MasterAnswer listo para ingestar en el Banco de Memoria.
 */
export function parseInterviewMarkdownToMasterAnswers(
  mdText: string,
  defaultCompany: string = "",
  defaultRole: string = ""
): MasterAnswer[] {
  if (!mdText || !mdText.trim()) return [];

  let company = defaultCompany;
  let role = defaultRole;

  const headerMatch = mdText.match(/# Informe de Entrevista — ([^\(\n]+)/i);
  if (headerMatch && !company) {
    company = headerMatch[1].trim();
  }

  const roleMatch = mdText.match(/Puesto:\s*([^\n\)]+)/i);
  if (roleMatch && !role) {
    role = roleMatch[1].trim();
  }

  const results: MasterAnswer[] = [];
  const qSections = mdText.split(/###\s+(?:\d+[\.\)]\s*)?(?:Pregunta|Question|Q):\s*/i);

  for (let i = 1; i < qSections.length; i++) {
    const rawSection = qSections[i];
    const lines = rawSection.split("\n");
    const question = (lines[0] || "").trim();
    if (!question) continue;

    let body = lines.slice(1).join("\n");
    body = body.replace(/🧠\s*\*Analizando respuesta\.\.\.\*/gi, "");
    body = body.replace(/\*Latencia de generación:[\s\S]*$/gi, "").trim();

    if (!body) continue;

    const parsed = parseBlocks(body);
    let enText = parsed.enText;
    let esText = parsed.esText;

    if (!enText && !esText) {
      esText = body;
      enText = body;
    } else if (enText && !esText) {
      esText = enText;
    } else if (esText && !enText) {
      enText = esText;
    }

    const category = classifyQuestion(question).label;
    const tokens = tokenize(question);
    const tags = Array.from(new Set(tokens)).slice(0, 7);

    // Extraer rol específico si la pregunta o sección lo define (ej: "[Rol: Cloud & DevOps Architect]" o "(Rol: DBA)")
    let itemRole = role;
    const roleInQuestion = question.match(/[\(\[](?:Rol|Role|Puesto):\s*([^\]\)]+)[\)\]]/i);
    if (roleInQuestion) {
      itemRole = roleInQuestion[1].trim();
    }

    results.push({
      id: `imported_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 6)}`,
      question,
      enText: enText || body,
      esText: esText || body,
      category,
      tags,
      company: company || "General",
      role: itemRole || "",
      favorite: true,
      createdAt: Date.now(),
    });
  }

  return results;
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
  "explicame", "explain", "describe", "hablame", "buenisimo", "bueno", "gracias", "favor", "posicion",
  "trabajando", "tenes", "principal", "foco", "hola", "buenas", "decime"
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

export function matchesCompany(itemCompany?: string, targetCompany?: string): boolean {
  const ic = (itemCompany || "").toLowerCase().trim();
  const tc = (targetCompany || "").toLowerCase().trim();

  // Si el ítem no tiene empresa asignada o es general, es transferible
  if (!ic || ic === "general") return true;

  // Si el ítem pertenece a una empresa específica pero el contexto actual está vacío, NO cruzar
  if (!tc) return false;

  if (ic === tc) return true;
  if (ic.includes(tc) || tc.includes(ic)) return true;
  const icWords = ic.split(/\s+/).filter(w => w.length > 2);
  const tcWords = tc.split(/\s+/).filter(w => w.length > 2);
  return icWords.some(w => tcWords.includes(w));
}

const GENERIC_ROLE_WORDS = new Set([
  "engineer", "ingeniero", "developer", "desarrollador", "architect", "arquitecto",
  "senior", "lead", "specialist", "especialista", "tech", "technical", "general",
  "multi", "role", "puesto", "consultant", "analyst"
]);

export function matchesRole(itemRole?: string, targetRole?: string): boolean {
  const ir = (itemRole || "").toLowerCase().trim();
  const tr = (targetRole || "").toLowerCase().trim();

  // Si el ítem no tiene rol asignado o es general / multi-role, es universal para cualquier puesto
  if (!ir || ir === "general" || ir.includes("multi-role") || ir === "all") return true;

  // Si la entrevista activa no tiene puesto definido, permitimos el ítem
  if (!tr) return true;

  if (ir === tr || ir.includes(tr) || tr.includes(ir)) return true;

  // Comparar palabras clave de dominio técnico (ignorando términos genéricos de cargo)
  const irDomainWords = tokenize(ir).filter(w => !GENERIC_ROLE_WORDS.has(w));
  const trDomainWords = tokenize(tr).filter(w => !GENERIC_ROLE_WORDS.has(w));

  if (irDomainWords.length === 0 || trDomainWords.length === 0) return true;

  return irDomainWords.some(w => trDomainWords.includes(w));
}

const CANONICAL_SYNONYMS: Record<string, string> = {
  // Mascotas / Pets / Animals
  pets: "pet_concept", pet: "pet_concept", animals: "pet_concept", animal: "pet_concept",
  mascota: "pet_concept", mascotas: "pet_concept", perro: "pet_concept", perros: "pet_concept",
  gato: "pet_concept", gatos: "pet_concept", dog: "pet_concept", dogs: "pet_concept",
  cat: "pet_concept", cats: "pet_concept",

  // Fin de semana / Weekend
  weekend: "weekend_concept", weekends: "weekend_concept", saturday: "weekend_concept",
  sunday: "weekend_concept", finde: "weekend_concept", sabado: "weekend_concept", domingo: "weekend_concept",

  // Salario / Remuneración / Rate
  salary: "salary_concept", salario: "salary_concept", sueldo: "salary_concept",
  tarifa: "salary_concept", rate: "salary_concept", hourly: "salary_concept",
  compensation: "salary_concept", remuneracion: "salary_concept", pretension: "salary_concept",
  pretensiones: "salary_concept", cobrar: "salary_concept",

  // Jefe / Manager / Leader
  boss: "boss_concept", jefe: "boss_concept", manager: "boss_concept",
  leader: "boss_concept", lider: "boss_concept", superior: "boss_concept",

  // Ubicación / Clima / Salta
  weather: "location_concept", clima: "location_concept", city: "location_concept",
  ciudad: "location_concept", salta: "location_concept", live: "location_concept",
  living: "location_concept", vives: "location_concept", viviendo: "location_concept",

  // Hobbies / Tiempo libre
  hobby: "hobby_concept", hobbies: "hobby_concept", freetime: "hobby_concept",
  pasatiempo: "hobby_concept", pasatiempos: "hobby_concept",

  // Debilidades / Defectos / Mejora
  weakness: "weakness_concept", weaknesses: "weakness_concept", debilidad: "weakness_concept",
  debilidades: "weakness_concept", defect: "weakness_concept", defecto: "weakness_concept",
  defectos: "weakness_concept", improvement: "weakness_concept", mejora: "weakness_concept",

  // Fortalezas / Virtudes / Strengths
  strength: "strength_concept", strengths: "strength_concept", fortaleza: "strength_concept",
  fortalezas: "strength_concept", virtud: "strength_concept", virtudes: "strength_concept",
};

function canonicalizeToken(token: string): string {
  return CANONICAL_SYNONYMS[token.toLowerCase()] || token;
}

/**
 * Busca coincidencias en el banco de memoria local con alta precisión semántica y balance de longitud.
 * Aísla automáticamente las memorias por empresa y por rol/puesto sin borrar el aprendizaje de otras entrevistas.
 */
export function findMatchingAnswer(
  query: string,
  answers: MasterAnswer[],
  threshold = 0.65,
  currentCompany?: string,
  currentRole?: string
): { match: MasterAnswer; score: number } | null {
  if (!query || !answers || answers.length === 0) return null;

  const rawQueryTokens = tokenize(query);
  const queryTokens = Array.from(new Set(rawQueryTokens.map(canonicalizeToken)));
  if (queryTokens.length === 0) return null;

  let bestMatch: MasterAnswer | null = null;
  let highestScore = 0;

  for (const item of answers) {
    // 1. Aislamiento por empresa
    if (!matchesCompany(item.company, currentCompany)) {
      continue;
    }

    // 2. Aislamiento por rol/puesto (para evitar que respuestas de DBA aparezcan en entrevistas de Cloud)
    if (!matchesRole(item.role, currentRole)) {
      continue;
    }

    const rawItemTokens = tokenize(item.question);
    const itemTokens = Array.from(new Set(rawItemTokens.map(canonicalizeToken)));
    if (itemTokens.length === 0) continue;

    // 1. Intersección de tokens significativos exactos y canónicos
    let intersection = 0;
    queryTokens.forEach((qToken) => {
      if (itemTokens.includes(qToken)) {
        intersection += 1;
      }
    });

    if (intersection === 0) continue;

    const unionCount = new Set(queryTokens.concat(itemTokens)).size;
    const jaccardScore = unionCount > 0 ? intersection / unionCount : 0;
    const diceScore = (2 * intersection) / (queryTokens.length + itemTokens.length);
    const queryCoverage = intersection / queryTokens.length;
    const itemCoverage = intersection / itemTokens.length;

    // Ponderación balanceada: consultas cortas (1-3 tokens) no se penalizan si su cobertura es alta
    const effectiveCoverage = queryTokens.length <= 3
      ? (queryCoverage * 0.7 + itemCoverage * 0.3)
      : Math.min(queryCoverage, itemCoverage);

    let score = (jaccardScore * 0.25) + (diceScore * 0.35) + (effectiveCoverage * 0.4);

    // 2. Bonus por coincidencia de frase o inclusión completa
    const cleanQ = query.toLowerCase().trim();
    const cleanItemQ = item.question.toLowerCase().trim();
    if (cleanQ.includes(cleanItemQ) || cleanItemQ.includes(cleanQ)) {
      score += 0.15;
    }

    // 3. Bonus por tags SOLO si el score base ya es alto (>= 0.50) para evitar falsos positivos
    if (score >= 0.50 && item.tags && item.tags.length > 0) {
      let tagMatches = 0;
      item.tags.forEach((tag) => {
        const cleanTag = tag.toLowerCase().trim();
        const canonicalTag = canonicalizeToken(cleanTag);
        if (cleanTag && (query.toLowerCase().includes(cleanTag) || queryTokens.includes(canonicalTag))) {
          tagMatches++;
        }
      });
      score += Math.min(0.08, tagMatches * 0.02);
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


