/**
 * cvChunker.ts — Divide el CV en bloques semánticos de experiencia y proyectos,
 * permitiendo recuperación quirúrgica (RAG dinámico local) según la pregunta de la entrevista.
 */

export interface CvChunk {
  id: string;
  title: string;
  category: "experience" | "project" | "skills" | "summary" | "education";
  content: string;
  keywords: string[];
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
      chunks.push({
        id: `cv_chunk_${chunkIdx++}`,
        title: currentTitle,
        category: currentCategory,
        content,
        keywords: extractKeywords(currentTitle + " " + content),
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
    chunks.push({
      id: "cv_chunk_single",
      title: "Perfil General",
      category: "summary",
      content: cvText.trim(),
      keywords: extractKeywords(cvText),
    });
  }

  return chunks;
}

/**
 * Selecciona los chunks de CV más relevantes para la pregunta técnica activa
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
  if (qKeywords.length === 0) {
    // Si la pregunta es corta o abstracta, incluir primeros chunks (más recientes)
    return chunks
      .slice(0, 3)
      .map((c) => `### ${c.title}\n${c.content}`)
      .join("\n\n");
  }

  // Scoring de cada chunk
  const scored = chunks.map((chunk) => {
    let matches = 0;
    for (const qk of qKeywords) {
      if (chunk.keywords.includes(qk)) {
        matches += 2;
      } else if (chunk.keywords.some((ck) => ck.includes(qk) || qk.includes(ck))) {
        matches += 1;
      }
    }
    // Chunks de habilidades siempre tienen un bono base para no perder el stack
    const bonus = chunk.category === "skills" ? 1.5 : 0;
    return { chunk, score: matches + bonus };
  });

  // Ordenar por score descendente
  scored.sort((a, b) => b.score - a.score);

  let accumulated = "";
  for (const item of scored) {
    const block = `### ${item.chunk.title}\n${item.chunk.content}\n\n`;
    if (accumulated.length + block.length <= maxChars) {
      accumulated += block;
    } else if (accumulated.length === 0) {
      accumulated += block.slice(0, maxChars);
      break;
    }
  }

  return accumulated.trim();
}
