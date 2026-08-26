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
 * Reconoce saludos y small talk de apertura para responder en <10ms sin llamar al LLM
 */
export function checkInstantGreeting(q: string, company = ""): { enText: string; esText: string; cleanText: string } | null {
  const lower = (q || "").trim().toLowerCase();
  // Validar si es saludo o pregunta de bienestar corta (<50 chars)
  const isGreeting = /^(hola|buenas|buenos d[ií]as|buenas tardes|buenas noches|c[oó]mo est[aá]s?|qu[eé] tal|todo bien|qu[eé] onda|hi|hello|hey|how are you|how is it going|how are you doing|can you hear me|me escuchas|me escuch[aá]s)\b/i.test(lower) && lower.length < 60;

  if (!isGreeting) return null;

  const comp = company ? `el equipo de ${company}` : "ustedes";
  const compEn = company ? `the team at ${company}` : "everyone";

  const es = `¡Hola! Muy bien, gracias por preguntar. Un gusto enorme estar acá charlando con ${comp} hoy, listo para arrancar.`;
  const en = `Hi! I'm doing great, thank you for asking. It's a pleasure to be here and I'm really excited to chat with ${compEn} today.`;

  return {
    enText: en,
    esText: es,
    cleanText: es,
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

export const DEFAULT_EPAM_MASTER_ANSWERS: MasterAnswer[] = [
  {
    id: "epam_intro_1",
    question: "Contame sobre tu experiencia y stack en Python Backend",
    enText: "I'm a Senior Python Backend Engineer and Technical Lead with over 8 years of experience. At Reforest Latam, I lead a team of 6 developers building an environmental telemetry platform with FastAPI, Clean Architecture, and DDD. We accelerated feature delivery by 35% and maintain over 85% test coverage with Pytest and TDD.",
    esText: "Soy Senior Python Backend Engineer y Tech Lead con más de 8 años de experiencia. Lidero un equipo de 6 desarrolladores en Reforest Latam construyendo una plataforma de telemetría con FastAPI, Clean Architecture y DDD, acelerando la entrega un 35% con +85% de test coverage con Pytest.",
    category: "Experiencia / Intro",
    tags: ["intro", "experience", "python", "fastapi", "clean architecture", "leadership", "telemetry"],
    company: "EPAM Systems",
    role: "Senior Python Engineer",
    favorite: true,
    createdAt: 1787669714761,
  },
  {
    id: "epam_project_2",
    question: "What is your experience or your most recent project where you use Python?",
    enText: "My most recent project is at Reforest Latam, where I'm the Technical Lead for an environmental telemetry platform built entirely in Python with FastAPI, Celery, and PostgreSQL. We run async workers with Celery and Redis, integrated with Cloud Pub/Sub for event-driven processing. Previously, as a consultant, I optimized high-concurrency APIs with SQLAlchemy 2.0 and Redis, cutting p95 latency by over 60%.",
    esText: "Mi proyecto más reciente es en Reforest Latam como Tech Lead en una plataforma de telemetría en Python con FastAPI, Celery y PostgreSQL. Corremos workers asíncronos con Celery/Redis y Cloud Pub/Sub. En consultoría optimicé APIs con SQLAlchemy 2.0 y Redis reduciendo la latencia p95 más del 60%.",
    category: "🛠️ Pregunta Técnica",
    tags: ["recent project", "python", "fastapi", "celery", "sqlalchemy", "redis", "performance"],
    company: "EPAM Systems",
    role: "Senior Python Engineer",
    favorite: true,
    createdAt: 1787669714761,
  },
  {
    id: "epam_ai_3",
    question: "¿Cuál ha sido tu experiencia trabajando con Inteligencia Artificial, LLMs y RAG?",
    enText: "I have hands-on experience integrating LLMs with OpenAI API and Google Vertex AI, building RAG pipelines on PostgreSQL using pgvector for semantic search. In Reforest Latam, we store embeddings in pgvector and query them asynchronously via FastAPI to ground LLM responses with real telemetry data, preventing hallucinations.",
    esText: "Tengo experiencia práctica integrando LLMs con OpenAI y Vertex AI, armando pipelines de RAG sobre PostgreSQL con pgvector para búsqueda semántica asíncrona en FastAPI. Esto nos permite alimentar al LLM con datos propios de la plataforma en tiempo real y evitar alucinaciones.",
    category: "🧠 Inteligencia Artificial",
    tags: ["ai", "llm", "rag", "pgvector", "vertex ai", "embeddings", "openai"],
    company: "EPAM Systems",
    role: "Senior Python Engineer",
    favorite: true,
    createdAt: 1787669714761,
  },
  {
    id: "epam_cloud_4",
    question: "What tools about cloud do you use (AWS, GCP, Azure) and what is your recent experience?",
    enText: "My primary cloud platform is Google Cloud Platform. At Reforest Latam, I run our backend services on Cloud Run and GKE, using Cloud Storage, Secret Manager, and Cloud Pub/Sub. I use Terraform for Infrastructure as Code and automated CI/CD with Docker multi-stage builds and GitHub Actions for zero-downtime deployments. These architectural patterns are fully transferable to AWS or Azure.",
    esText: "Mi plataforma cloud principal es GCP (Cloud Run, GKE, Cloud Storage, Secret Manager y Cloud Pub/Sub). Uso Terraform para infraestructura como código y CI/CD con GitHub Actions y Docker para deploys sin downtime. Son prácticas totalmente transferibles a AWS o Azure.",
    category: "☁️ Cloud & DevOps",
    tags: ["cloud", "gcp", "aws", "terraform", "docker", "gke", "cloud run", "ci/cd"],
    company: "EPAM Systems",
    role: "Senior Python Engineer",
    favorite: true,
    createdAt: 1787669714761,
  },
  {
    id: "epam_react_5",
    question: "Can you tell me about your experience or development where you worked with React or Frontend?",
    enText: "My core expertise is on backend engineering with Python and FastAPI. However, I have a solid understanding of frontend through my full-stack certifications and work closely with frontend teams designing clean API contracts (OpenAPI/Swagger, structured error handling). I understand the full request lifecycle from browser to database.",
    esText: "Mi foco principal es Python backend y FastAPI. Tengo una base sólida de frontend por certificaciones full-stack y trabajo codo a codo con equipos de frontend definiendo contratos de API claros (OpenAPI/Swagger) y entendiendo el ciclo completo de la petición.",
    category: "💻 Frontend & Integración",
    tags: ["react", "frontend", "openapi", "swagger", "api contracts"],
    company: "EPAM Systems",
    role: "Senior Python Engineer",
    favorite: true,
    createdAt: 1787669714761,
  },
  {
    id: "epam_company_6",
    question: "¿Conocés a EPAM y cuál es tu interés en modalidad de trabajo?",
    enText: "I know EPAM as a global leader in digital transformation and software engineering, particularly admiring your strong focus on AI innovation. My preference is 100% remote work, where I've been highly productive coordinating with distributed teams across multiple timezones.",
    esText: "Conozco a EPAM como referente global en transformación digital y desarrollo de software, especialmente por su fuerte foco en innovación en IA. Mi preferencia es 100% remoto, donde rindo al máximo coordinando con equipos distribuidos en diversos husos horarios.",
    category: "🏢 Empresa & Fit Cultural",
    tags: ["epam", "remote", "company", "culture"],
    company: "EPAM Systems",
    role: "Senior Python Engineer",
    favorite: true,
    createdAt: 1787669714761,
  },
];

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


