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
  phoText: string;
  cleanText: string;
  alert: string;
  cheats: string[];
  snippet: string;
}

export function parseBlocks(raw: string): ParsedBlocks {
  const enMatch = raw.match(/\[EN\]([\s\S]*?)(?=\[(?:PHO|ES|ALERT|CHEATS|SNIPPET)\]|$)/i);
  const phoMatch = raw.match(/\[PHO\]([\s\S]*?)(?=\[(?:EN|ES|ALERT|CHEATS|SNIPPET)\]|$)/i);
  const esMatch = raw.match(/\[ES\]([\s\S]*?)(?=\[(?:EN|PHO|ALERT|CHEATS|SNIPPET)\]|$)/i);

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
  const phoText = cleanBlock(phoMatch);
  const esText = cleanBlock(esMatch);

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

