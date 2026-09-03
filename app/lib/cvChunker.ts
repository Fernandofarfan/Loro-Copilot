/**
 * cvChunker.ts — Grafo Temporal y Segmentación Semántica del CV.
 * Divide el CV en bloques con información cronológica, nivel de seniority y métricas clave,
 * permitiendo recuperación quirúrgica (Timeline Knowledge RAG) según la pregunta de la entrevista.
 */

export interface CvChunk {
  id: string;
  title: string;
  category: "experience" | "project" | "skills" | "summary" | "education";
  content: string;
  keywords: string[];
  seniority?: "Junior" | "Mid" | "Senior" | "Lead" | "Staff" | "Architect";
  startYear?: number;
  endYear?: number;
  isCurrent?: boolean;
  metrics?: string[];
  company?: string;
}

function extractKeywords(text: string): string[] {
  const clean = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, " ");

  const stopWords = new Set([
    "de", "la", "el", "en", "y", "a", "los", "del", "se", "las", "por", "un", "para",
    "con", "no", "una", "su", "al", "lo", "como", "mas", "pero", "sus", "le", "ya",
    "the", "and", "in", "to", "of", "a", "with", "for", "on", "as", "at", "by", "from",
    "an", "be", "is", "was", "are", "that", "this", "it", "i", "we", "my", "our", "all"
  ]);

  const tokens = clean
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  return Array.from(new Set(tokens));
}

/**
 * Extrae años y temporalidad del bloque
 */
function extractYears(text: string): { startYear?: number; endYear?: number; isCurrent?: boolean } {
  const yearMatches = text.match(/\b(20[0-2][0-9]|199[0-9])\b/g);
  const isCurrent = /presente|actual|current|present|now|a la fecha/i.test(text);

  if (!yearMatches || yearMatches.length === 0) {
    return { isCurrent };
  }

  const years = yearMatches.map((y) => parseInt(y, 10)).sort((a, b) => a - b);
  return {
    startYear: years[0],
    endYear: isCurrent ? new Date().getFullYear() : years[years.length - 1],
    isCurrent,
  };
}

/**
 * Infiere nivel de seniority priorizando el título del rol sobre el contenido del cuerpo
 */
function inferSeniority(title: string, content?: string): CvChunk["seniority"] {
  const check = (text: string): CvChunk["seniority"] => {
    const lower = text.toLowerCase();
    if (/\b(?:tech lead|team lead|lead|lider|engineering manager|manager)\b/i.test(lower)) return "Lead";
    if (/\b(?:architect|arquitecto|arquitecta|arquitectura)\b/i.test(lower)) return "Architect";
    if (/\b(?:staff|principal)\b/i.test(lower)) return "Staff";
    if (/\b(?:senior|sr\b|sr\.)/i.test(lower)) return "Senior";
    if (/\b(?:semi-senior|ssr\b|mid\b|mid-level)/i.test(lower)) return "Mid";
    if (/\b(?:junior|jr\b|trainee|intern)/i.test(lower)) return "Junior";
    return undefined;
  };

  const fromTitle = check(title);
  if (fromTitle) return fromTitle;
  if (content) return check(content);
  return undefined;
}

/**
 * Extrae métricas e impacto numérico ($ / % / latencias / escalabilidad)
 */
function extractMetrics(text: string): string[] {
  const metricRegex = /(?:\$)?(?:\+|-)?\d+(?:\.\d+)?(?:\s?(?:%|k|qps|ms|m|x|users|usuarios|req\/s|usd))+(?:\s?usd)?|\$\d+(?:\.\d+)?(?:\s?[km])?/gi;
  const matches = text.match(metricRegex);
  return matches ? Array.from(new Set(matches.map((m) => m.trim()))) : [];
}

/**
 * Parsea el texto del CV dividiéndolo por secciones o roles de empleo
 */
export function chunkCv(cvText: string): CvChunk[] {
  if (!cvText || !cvText.trim()) return [];

  const lines = cvText.split("\n");
  const chunks: CvChunk[] = [];

  let currentTitle = "Resumen Profesional";
  let currentCategory: CvChunk["category"] = "summary";
  let currentLines: string[] = [];
  let chunkIdx = 0;

  const flush = () => {
    const content = currentLines.join("\n").trim();
    if (content.length > 30) {
      const fullText = currentTitle + "\n" + content;
      const { startYear, endYear, isCurrent } = extractYears(fullText);
      const seniority = inferSeniority(currentTitle, content);
      const metrics = extractMetrics(fullText);

      // Extracción de empresa si tiene formato "Rol at Empresa" o "Rol @ Empresa" o "Empresa - Rol"
      let company: string | undefined;
      const compMatch = currentTitle.match(/(?:at|@|en|-)\s*([A-Za-z0-9\s&]{2,25})/i);
      if (compMatch) {
        company = compMatch[1].trim();
      }

      chunks.push({
        id: `cv_chunk_${chunkIdx++}`,
        title: currentTitle,
        category: currentCategory,
        content,
        keywords: extractKeywords(fullText),
        startYear,
        endYear,
        isCurrent,
        seniority,
        metrics,
        company,
      });
    }
    currentLines = [];
  };

  const headerRegex = /^(#{1,4}\s+|[A-ZÁÉÍÓÚ\s]{4,}:|\*\*[^\*]+\*\*:?)/;

  for (const line of lines) {
    const trimmed = line.trim();
    if (headerRegex.test(trimmed) && trimmed.length < 80) {
      flush();
      currentTitle = trimmed.replace(/^#{1,4}\s+/, "").replace(/^\*\*|\*\*$/g, "").trim();

      const lower = currentTitle.toLowerCase();
      if (/skill|habilidad|tecnolog|stack|lenguaje/i.test(lower)) {
        currentCategory = "skills";
      } else if (/proyect|project/i.test(lower)) {
        currentCategory = "project";
      } else if (/educa|certifi|degree|universidad/i.test(lower)) {
        currentCategory = "education";
      } else if (/experi|laboral|work|empleo|senior|lead|engineer|developer|architect/i.test(lower)) {
        currentCategory = "experience";
      } else {
        currentCategory = "summary";
      }
    } else {
      currentLines.push(line);
    }
  }

  flush();

  // Si no se detectaron encabezados, devolver como único chunk
  if (chunks.length === 0 && cvText.trim().length > 0) {
    const full = cvText.trim();
    const { startYear, endYear, isCurrent } = extractYears(full);
    chunks.push({
      id: "cv_chunk_single",
      title: "Perfil General",
      category: "summary",
      content: full,
      keywords: extractKeywords(full),
      startYear,
      endYear,
      isCurrent,
      seniority: inferSeniority(full),
      metrics: extractMetrics(full),
    });
  }

  return chunks;
}

/**
 * Selecciona los chunks de CV más relevantes para la pregunta técnica activa,
 * con ponderación temporal y de seniority.
 */
export function selectRelevantCvChunks(
  question: string,
  chunks: CvChunk[],
  maxChars = 3000
): string {
  if (!chunks || chunks.length === 0) return "";
  if (chunks.length <= 2) {
    return chunks.map((c) => `### ${c.title}\n${c.content}`).join("\n\n");
  }

  const qKeywords = extractKeywords(question);
  const lowerQ = question.toLowerCase();

  // Ponderaciones temporales y de contexto
  const asksRecent = /reciente|recent|actual|current|ultimo|último|latest/i.test(lowerQ);
  const asksLead = /lider|lead|leadership|arquitect|architect|staff|equipo/i.test(lowerQ);
  const asksMetrics = /metrica|métrica|metric|impacto|impact|escalabilidad|kpi/i.test(lowerQ);

  // Scoring multidimensional de cada chunk
  const scored = chunks.map((chunk) => {
    let matches = 0;
    for (const qk of qKeywords) {
      if (chunk.keywords.includes(qk)) {
        matches += 2;
      } else if (chunk.keywords.some((ck) => ck.includes(qk) || qk.includes(ck))) {
        matches += 1;
      }
    }

    let bonus = 0;
    // Chunks de habilidades siempre tienen un bono base para no perder el stack
    if (chunk.category === "skills") bonus += 1.5;

    // Bono de actualidad cronológica si preguntan por experiencia reciente
    if (asksRecent && (chunk.isCurrent || (chunk.endYear && chunk.endYear >= 2023))) {
      bonus += 3.0;
    }

    // Bono de seniority si preguntan por liderazgo o arquitectura
    if (asksLead && (chunk.seniority === "Lead" || chunk.seniority === "Staff" || chunk.seniority === "Architect")) {
      bonus += 3.0;
    }

    // Bono si preguntan por métricas o impacto y el chunk contiene datos cuantitativos
    if (asksMetrics && chunk.metrics && chunk.metrics.length > 0) {
      bonus += 2.0;
    }

    return { chunk, score: matches + bonus };
  });

  // Ordenar por score descendente
  scored.sort((a, b) => b.score - a.score);

  let accumulated = "";
  for (const item of scored) {
    const metaParts: string[] = [];
    if (item.chunk.seniority) metaParts.push(`Nivel: ${item.chunk.seniority}`);
    if (item.chunk.startYear) metaParts.push(`Periodo: ${item.chunk.startYear} - ${item.chunk.isCurrent ? "Presente" : item.chunk.endYear || ""}`);
    if (item.chunk.metrics && item.chunk.metrics.length > 0) metaParts.push(`Métricas: ${item.chunk.metrics.slice(0, 3).join(", ")}`);

    const header = `### ${item.chunk.title}${metaParts.length > 0 ? ` (${metaParts.join(" | ")})` : ""}\n`;
    const block = `${header}${item.chunk.content}\n\n`;

    if (accumulated.length + block.length <= maxChars) {
      accumulated += block;
    } else if (accumulated.length === 0) {
      accumulated += block.slice(0, maxChars);
      break;
    }
  }

  return accumulated.trim();
}
