/**
 * app/lib/companyDossier.ts
 *
 * Base de conocimiento con stacks de ingeniería reales, librerías open-source,
 * patrones de arquitectura internos y cultura de las empresas de tecnología líderes.
 */

export interface CompanyDossier {
  canonicalName: string;
  aliases: string[];
  techStack: string[];
  notableTools: string[];
  architectureStyle: string;
  culturePrinciples: string[];
  interviewTips: string[];
}

export const COMPANY_DOSSIERS: Record<string, CompanyDossier> = {
  mercadolibre: {
    canonicalName: "MercadoLibre",
    aliases: ["meli", "mercado libre", "mercadopago", "mercado pago"],
    techStack: ["Go (Golang)", "Java", "Python", "Kubernetes", "MySQL/Percona", "Redis", "Kafka", "AWS"],
    notableTools: ["Fury (PaaS interno y protocolo de serialización)", "BigQueue", "Melictl"],
    architectureStyle: "Microservicios de alta concurrencia, APIs REST, event-driven, bajo acoplamiento y resiliencia",
    culturePrinciples: ["Beta continuo", "Emprendedurismo", "Dar el máximo compitiendo en equipo", "Ejecutar con excelencia"],
    interviewTips: [
      "Mencionar métricas de escala en pagos o e-commerce de LATAM",
      "Demostrar experiencia en APIs idempotentes y transacciones distribuidas",
      "Resaltar agilidad y ownership sin parálisis por análisis",
    ],
  },
  uber: {
    canonicalName: "Uber",
    aliases: ["uber", "uber eats", "ubereats"],
    techStack: ["Go", "Java", "Python", "Apache Kafka", "Apache Pinot", "MySQL", "AresDB", "H3"],
    notableTools: ["Schemaless (storage sobre MySQL)", "Jaeger (tracing)", "Cadence/Temporal (workflows)", "M3 (métricas)"],
    architectureStyle: "Microservicios a hiperescala, dispatch geolocalizado en tiempo real, consistencia eventual",
    culturePrinciples: ["Go get it", "Trip obsessively", "Build with heart", "Stand for safety"],
    interviewTips: [
      "Enfatizar manejo de datos geoespaciales (indexación espacial H3)",
      "Destacar tolerancia a fallos en redes móviles y reconciliación de estados",
    ],
  },
  stripe: {
    canonicalName: "Stripe",
    aliases: ["stripe"],
    techStack: ["Ruby (Sorbet typed)", "Go", "Java", "Envoy", "Kubernetes", "PostgreSQL", "Kafka"],
    notableTools: ["Sorbet", "Monorepo tooling", "Idempotency-Key headers nativos"],
    architectureStyle: "Fiabilidad financiera de 5 nueves (99.999%), transacciones ACID, double-entry bookkeeping",
    culturePrinciples: ["Users first", "Move meticulously", "Think rigorously", "Trust and transparency"],
    interviewTips: [
      "Priorizar exactitud numérica y consistencia transaccional sobre velocidad ciega",
      "Mencionar idempotencia, deadlocks de base de datos y diseño retrocompatible de APIs",
    ],
  },
  netflix: {
    canonicalName: "Netflix",
    aliases: ["netflix"],
    techStack: ["Java", "Spring Boot", "Node.js", "Cassandra", "Kafka", "AWS", "gRPC", "GraphQL"],
    notableTools: ["Spinnaker", "Conductor", "Zuul/Eureka", "Chaos Monkey / Simian Army"],
    architectureStyle: "Cloud-native en AWS, arquitectura dirigida por eventos, microservicios descentralizados",
    culturePrinciples: ["Freedom and Responsibility", "Context not Control", "Highly Aligned, Loosely Coupled"],
    interviewTips: [
      "Hablar de resiliencia y Chaos Engineering (asumir que los servicios van a fallar)",
      "Demostrar madurez de autonomía personal y toma de decisiones fundada en datos",
    ],
  },
  amazon: {
    canonicalName: "Amazon / AWS",
    aliases: ["amazon", "aws", "amazon web services"],
    techStack: ["Java", "C++", "Python", "Rust", "DynamoDB", "SQS/SNS", "Aurora", "S3", "CDK"],
    notableTools: ["Apollo deployment engine", "Bionic pipelines", "Coral service framework"],
    architectureStyle: "Sistemas orientados a servicios (SOA) a escala global, particionado estricto y multi-AZ",
    culturePrinciples: ["Customer Obsession", "Ownership", "Bias for Action", "Frugality", "Dive Deep", "Invent and Simplify"],
    interviewTips: [
      "Estructurar respuestas con el formato STAR (Situation, Task, Action, Result)",
      "Citar principios de liderazgo de Amazon explícitamente",
    ],
  },
  google: {
    canonicalName: "Google",
    aliases: ["google", "alphabet", "youtube"],
    techStack: ["C++", "Go", "Java", "Python", "Borg", "Spanner", "Bigtable", "Protobuf", "gRPC"],
    notableTools: ["Bazel", "Piper (Monorepo)", "Stubby", "Colossus"],
    architectureStyle: "Infraestructura global distribuida, consensus Raft/Paxos (Spanner TrueTime), multi-region",
    culturePrinciples: ["Focus on the user", "Think 10x", "Blameless post-mortems", "Engineering excellence"],
    interviewTips: [
      "Dominio implacable de estructuras de datos y complejidad Big-O",
      "Diseñar para 100x del volumen actual considerando particionamiento y bottlenecks de red",
    ],
  },
  meta: {
    canonicalName: "Meta",
    aliases: ["meta", "facebook", "instagram", "whatsapp"],
    techStack: ["C++", "Python", "Hack/PHP", "Rust", "GraphQL", "RocksDB", "Cassandra", "Memcached"],
    notableTools: ["TAO (Graph Cache)", "Tupperware", "Mercurial scale extensions", "Presto/Trino"],
    architectureStyle: "Grafo social distribuido masivo, lectura intensiva con caché en capas, Edge compute",
    culturePrinciples: ["Move fast", "Focus on long-term impact", "Build awesome things", "Live in the future"],
    interviewTips: [
      "Priorizar impacto medible en usuarios y métricas de engagement o performance",
      "Ser pragmático: mover rápido código funcional antes de buscar la perfección teórica",
    ],
  },
  globant: {
    canonicalName: "Globant",
    aliases: ["globant"],
    techStack: ["Java", "TypeScript/Node.js", ".NET", "React", "Python", "AWS", "Azure"],
    notableTools: ["Agile Pods", "StarMeUp", "Augmented Coding tools"],
    architectureStyle: "Arquitecturas cloud empresariales, modernización de monolitos a microservicios",
    culturePrinciples: ["Think Big", "Constantly Innovate", "Team Player", "Have Fun"],
    interviewTips: [
      "Destacar adaptabilidad a distintos clientes corporativos y comunicación bilingüe fluida",
      "Mencionar metodologías ágiles y delivery continuo",
    ],
  },
  nubank: {
    canonicalName: "Nubank",
    aliases: ["nubank", "nu"],
    techStack: ["Clojure", "Datomic", "Apache Kafka", "Flutter", "AWS", "Docker", "Kubernetes"],
    notableTools: ["Functional Core / Imperative Shell", "Sharding por cliente"],
    architectureStyle: "Programación funcional inmutable, event sourcing, base de datos temporal Datomic",
    culturePrinciples: ["We want our customers to love us fanatically", "Think like an owner", "Challenge status quo"],
    interviewTips: [
      "Valorar inmutabilidad y modelado de datos sin efectos secundarios",
      "Hablar de sistemas bancarios sin downtime y conciliación de saldos",
    ],
  },
};

/**
 * Busca y retorna el dossier correspondiente al nombre de una empresa
 */
export function getCompanyDossier(companyQuery: string): CompanyDossier | undefined {
  if (!companyQuery || !companyQuery.trim()) return undefined;

  const normalized = companyQuery.toLowerCase().trim();

  // Búsqueda por key directa
  if (COMPANY_DOSSIERS[normalized]) {
    return COMPANY_DOSSIERS[normalized];
  }

  // Búsqueda por alias o coincidencia parcial
  for (const dossier of Object.values(COMPANY_DOSSIERS)) {
    if (dossier.canonicalName.toLowerCase() === normalized) {
      return dossier;
    }
    for (const alias of dossier.aliases) {
      if (normalized.includes(alias) || alias.includes(normalized)) {
        return dossier;
      }
    }
  }

  return undefined;
}

/**
 * Genera el fragmento de contexto enriquecido para inyectar en el prompt
 */
export function formatCompanyDossierPrompt(dossier?: CompanyDossier): string {
  if (!dossier) return "";

  return `CONTEXTO Y STACK DE LA EMPRESA (${dossier.canonicalName.toUpperCase()}):
- Stack principal: ${dossier.techStack.join(", ")}
- Herramientas / Sistemas notables: ${dossier.notableTools.join(", ")}
- Estilo de arquitectura: ${dossier.architectureStyle}
- Principios culturales clave: ${dossier.culturePrinciples.join(" | ")}
- Tips específicos para la entrevista:
${dossier.interviewTips.map((t) => `  * ${t}`).join("\n")}
Directiva: Utilizá la terminología y soluciones afines a esta empresa de forma orgánica.`;
}
