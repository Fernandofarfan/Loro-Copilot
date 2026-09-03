/**
 * app/lib/factLedger.ts
 *
 * Fact Ledger & Session Memory Graph:
 * Registra y consolida hechos, decisiones técnicas y métricas mencionadas
 * por el candidato a lo largo de la sesión para garantizar coherencia
 * estricta en las repreguntas e impedir contradicciones.
 */

export interface SessionFact {
  id: string;
  category: "technology" | "metric" | "architecture" | "decision";
  statement: string;
  timestamp: number;
}

const COMMON_TECH_REGEX = /\b(PostgreSQL|Postgres|MySQL|MongoDB|Redis|Kafka|RabbitMQ|Elasticsearch|Docker|Kubernetes|AWS|GCP|Azure|Golang|Go\b|TypeScript|JavaScript|Python|Java|Rust|GraphQL|gRPC|DynamoDB|Cassandra|Snowflake|BigQuery)\b/gi;

const COMMON_ARCH_PATTERNS = [
  /\b(?:microservicios|monolito modular|event-driven|arquitectura de eventos|cqrs|serverless|sharding|replicación|read replicas|cdc|outbox pattern)\b/gi,
  /\b(?:microservices|modular monolith|event-driven architecture|distributed systems|pub\/sub)\b/gi,
];

const METRIC_PATTERN = /(?:\$)?(?:\+|-)?\d+(?:\.\d+)?(?:\s?(?:%|k|qps|ms|m|x|users|usuarios|req\/s|usd))+(?:\s?usd)?|\$\d+(?:\.\d+)?(?:\s?[km])?/gi;

/**
 * Extrae hechos clave a partir del texto de una respuesta
 */
export function extractFactsFromAnswer(text: string): SessionFact[] {
  if (!text || text.length < 20) return [];

  const facts: SessionFact[] = [];
  const seenStatements = new Set<string>();

  // 1. Detección de tecnologías
  const techMatches = text.match(COMMON_TECH_REGEX);
  if (techMatches) {
    const uniqueTechs = Array.from(new Set(techMatches.map((t) => t.trim())));
    for (const tech of uniqueTechs) {
      const statement = `Stack / Tecnología: ${tech}`;
      if (!seenStatements.has(statement)) {
        seenStatements.add(statement);
        facts.push({
          id: `fact_tech_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          category: "technology",
          statement,
          timestamp: Date.now(),
        });
      }
    }
  }

  // 2. Detección de patrones de arquitectura
  for (const archRegex of COMMON_ARCH_PATTERNS) {
    const archMatches = text.match(archRegex);
    if (archMatches) {
      const uniqueArch = Array.from(new Set(archMatches.map((a) => a.trim().toLowerCase())));
      for (const arch of uniqueArch) {
        const statement = `Patrón de arquitectura: ${arch}`;
        if (!seenStatements.has(statement)) {
          seenStatements.add(statement);
          facts.push({
            id: `fact_arch_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            category: "architecture",
            statement,
            timestamp: Date.now(),
          });
        }
      }
    }
  }

  // 3. Detección de métricas numéricas
  const metricMatches = text.match(METRIC_PATTERN);
  if (metricMatches) {
    const uniqueMetrics = Array.from(new Set(metricMatches.map((m) => m.trim())));
    for (const metric of uniqueMetrics) {
      const statement = `Métrica / Escala cuantitativa: ${metric}`;
      if (!seenStatements.has(statement)) {
        seenStatements.add(statement);
        facts.push({
          id: `fact_metric_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          category: "metric",
          statement,
          timestamp: Date.now(),
        });
      }
    }
  }

  return facts;
}

/**
 * Fusiona hechos nuevos en el ledger deduplicando por declaración
 */
export function mergeSessionFacts(existing: SessionFact[], incoming: SessionFact[]): SessionFact[] {
  const map = new Map<string, SessionFact>();

  for (const f of existing) {
    map.set(f.statement.toLowerCase(), f);
  }

  for (const f of incoming) {
    const key = f.statement.toLowerCase();
    if (!map.has(key)) {
      map.set(key, f);
    }
  }

  return Array.from(map.values());
}

/**
 * Formatea los hechos acumulados para ser inyectados en el prompt del LLM
 */
export function formatFactsForPrompt(facts: SessionFact[]): string {
  if (!facts || facts.length === 0) return "";

  const lines = facts.slice(-12).map((f) => `- [${f.category}] ${f.statement}`);
  return `HECHOS YA ESTABLECIDOS EN ESTA SESIÓN (PROHIBIDO CONTRADECIR O CAMBIAR):\n${lines.join("\n")}`;
}
