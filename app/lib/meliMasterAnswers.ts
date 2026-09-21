import { MasterAnswer } from "./interviewHelpers";

/**
 * Banco Mercado Libre — NoSQL Service Team
 * Alineado a la JD: Sr Software Engineer - NoSQL Service Team (ID 126318)
 * y a la evaluación automatizada con Valeria (Agente de IA en Eightfold.ai).
 *
 * Directivas de audio/IA:
 * - Respuestas con alta densidad de palabras clave técnicas (DocumentDB, Firestore, Sharding, Proxy, Istio, Latencia P99, IA).
 * - Estructura STAR tácita y concisa.
 * - Discriminar +8 años IT total vs ~4 años Cloud/GCP/Kubernetes.
 */
export const MELI_NOSQL_MASTER_ANSWERS: MasterAnswer[] = [
  // ─────────────────────────────────────────────
  // PRESENTACIÓN — Adaptada a NoSQL Service Team
  // ─────────────────────────────────────────────
  {
    id: "meli_tell_me_about_yourself",
    question: "Tell me about yourself or walk me through your background and experience.",
    enText: "I'm Fernando, a Software and Cloud Infrastructure Engineer based in Argentina. Over the last eight years in software engineering and four years focused on cloud, Kubernetes, and database reliability, I've designed resilient data layers, optimized connection pooling, and built automated multi-cloud platforms. I'm especially interested in Mercado Libre's NoSQL platform challenge because designing multi-cloud database proxies and sharding architectures at LATAM scale is the exact intersection of systems engineering and high-throughput reliability where I thrive.",
    esText: "Soy Fernando, Ingeniero de Software e Infraestructura Cloud. Cuento con más de ocho años en ingeniería de software y unos cuatro años dedicados a arquitecturas cloud, Kubernetes y confiabilidad de bases de datos, diseñando capas de datos resilientes, optimizando pooling de conexiones y automatizando plataformas. Me entusiasma el desafío del equipo de NoSQL de Mercado Libre porque diseñar proxies multi-nube y arquitecturas de sharding a escala de LATAM combina exactamente sistemas distribuidos y alta disponibilidad.",
    category: "Screening",
    tags: ["presentation", "background", "about me", "introduction", "cv", "trayectoria"],
    company: "MercadoLibre",
    role: "Sr Software Engineer - NoSQL Service Team",
    favorite: true,
    createdAt: 1789572000000,
  },
  // ─────────────────────────────────────────────
  // AÑOS DE EXPERIENCIA — Regla estricta (+8 IT / ~4 Cloud)
  // ─────────────────────────────────────────────
  {
    id: "meli_experience_strict",
    question: "¿Cuántos años de experiencia tienes en ingeniería de software y arquitecturas en la nube?",
    enText: "I have over eight years of total experience in IT and software development across backend systems and databases, and around four years dedicated specifically to cloud platforms, Kubernetes, and infrastructure automation. This balance gives me strong software design foundations alongside deep cloud reliability expertise.",
    esText: "Tengo más de ocho años de experiencia total en desarrollo de software y sistemas backend, y unos cuatro años enfocados específicamente en plataformas cloud, Kubernetes y automatización de infraestructura. Este balance me permite diseñar soluciones de software robustas con conocimiento profundo de confiabilidad en la nube.",
    category: "Screening",
    tags: ["experience", "years", "años", "seniority"],
    company: "MercadoLibre",
    role: "Sr Software Engineer - NoSQL Service Team",
    favorite: true,
    createdAt: 1789572000000,
  },
  // ─────────────────────────────────────────────
  // MULTI-CLOUD NOSQL — AWS DocumentDB vs GCP Firestore / MongoDB
  // ─────────────────────────────────────────────
  {
    id: "meli_multicloud_nosql",
    question: "¿Cómo evaluarías e implementarías soporte multi-nube para bases de datos NoSQL más allá de AWS DocumentDB, considerando alternativas como GCP Firestore o MongoDB?",
    enText: "When architecting multi-cloud NoSQL support beyond AWS DocumentDB, I evaluate consistency models, read and write latency profiles, API wire-compatibility, and operational cost. In GCP, Firestore provides great managed scale and flexible document modeling, while MongoDB Atlas offers seamless protocol parity with DocumentDB. The key is creating a vendor-agnostic abstraction layer or database proxy that translates query primitives and normalizes telemetry across cloud providers without breaking client contracts.",
    esText: "Al diseñar soporte multi-nube más allá de AWS DocumentDB, evalúo modelos de consistencia, perfiles de latencia en lectura y escritura, compatibilidad de protocolos y costos operativos. En GCP, Firestore ofrece gran escalabilidad gestionada y modelado flexible de documentos, mientras que MongoDB Atlas mantiene paridad nativa de protocolo con DocumentDB. La clave es construir una capa de abstracción o proxy de base de datos que desacople a las aplicaciones y normalice la telemetría entre proveedores sin romper contratos existentes.",
    category: "Technical",
    tags: ["nosql", "multicloud", "documentdb", "firestore", "mongodb", "aws", "gcp", "database"],
    company: "MercadoLibre",
    role: "Sr Software Engineer - NoSQL Service Team",
    favorite: true,
    createdAt: 1789572000000,
  },
  // ─────────────────────────────────────────────
  // SEGMENTACIÓN Y SHARDING DE BASES DE DATOS
  // ─────────────────────────────────────────────
  {
    id: "meli_database_sharding_segmentation",
    question: "¿Qué estrategias utilizas para la segmentación de bases de datos y sharding en sistemas de alto tráfico?",
    enText: "To prevent hot spots and scale throughput, I design sharding strategies based on high-cardinality shard keys combined with consistent hashing. I isolate large enterprise tenants onto dedicated physical partitions while packing smaller tenants into virtual shards. Pairing this with distributed caching in Redis and local circuit breaking keeps P99 latency stable during seasonal traffic surges.",
    esText: "Para evitar cuellos de botella y escalar el throughput, diseño estrategias de sharding basadas en claves de alta cardinalidad combinadas con hashing consistente. Separo tenants o dominios de alto volumen en particiones físicas dedicadas mientras agrupo entidades menores en shards virtuales. Complementar esto con caching distribuido en Redis y circuit breaking local mantiene estable la latencia P99 durante picos masivos de tráfico.",
    category: "Technical",
    tags: ["sharding", "segmentación", "partitioning", "hotspots", "scaling", "latency"],
    company: "MercadoLibre",
    role: "Sr Software Engineer - NoSQL Service Team",
    favorite: true,
    createdAt: 1789572000000,
  },
  // ─────────────────────────────────────────────
  // GESTIÓN CENTRALIZADA DE CONSULTAS / DATABASE PROXY
  // ─────────────────────────────────────────────
  {
    id: "meli_centralized_query_gateway",
    question: "¿Cómo diseñarías un mecanismo de gestión centralizada de consultas y proxy para bases de datos NoSQL?",
    enText: "A centralized query gateway acts as an intelligent proxy between microservices and backend database clusters. It handles transparent connection pooling, dynamically routes queries based on partition keys, enforces rate limits on abusive queries, and injects distributed tracing. This shields the storage engines from connection exhaustion and enables seamless live cluster migrations with zero application downtime.",
    esText: "Un gateway centralizado de consultas funciona como un proxy inteligente entre los microservicios y los clusters de base de datos. Se encarga del pooling transparente de conexiones, enruta dinámicamente según claves de partición, aplica rate limiting sobre consultas costosas e inyecta trazabilidad distribuida. Esto protege los motores de datos contra agotamiento de sockets y permite migraciones en caliente con cero downtime para las aplicaciones.",
    category: "Technical",
    tags: ["proxy", "query gateway", "connection pooling", "routing", "throttling", "downtime"],
    company: "MercadoLibre",
    role: "Sr Software Engineer - NoSQL Service Team",
    favorite: true,
    createdAt: 1789572000000,
  },
  // ─────────────────────────────────────────────
  // MODERNIZACIÓN A ISTIO Y ARQUITECTURAS SERVERLESS
  // ─────────────────────────────────────────────
  {
    id: "meli_istio_modernization",
    question: "¿Cómo abordarías la migración de arquitecturas heredadas hacia Istio o arquitecturas de despliegue modernas en Kubernetes?",
    enText: "Migrating towards Istio allows offloading mTLS encryption, traffic shifting, and observability directly to Envoy sidecars without changing business logic. I adopt a phased canary migration, progressively injecting sidecars and validating service-to-service latency with Prometheus and Jaeger before enforcing strict mutual TLS and authorization policies. This guarantees zero impact on platform traffic during the rollout.",
    esText: "Migrar hacia Istio permite delegar el cifrado mTLS, el ruteo de tráfico y la observabilidad directamente a sidecars de Envoy sin modificar la lógica de negocio. Abordo la transición con un despliegue canary progresivo, inyectando sidecars por namespace y validando latencias con Prometheus y Jaeger antes de activar políticas estrictas de mTLS y RBAC. Esto asegura cero impacto en el tráfico productivo durante la adopción.",
    category: "Technical",
    tags: ["istio", "kubernetes", "service mesh", "envoy", "mtls", "canary", "serverless"],
    company: "MercadoLibre",
    role: "Sr Software Engineer - NoSQL Service Team",
    favorite: true,
    createdAt: 1789572000000,
  },
  // ─────────────────────────────────────────────
  // RESOLUCIÓN DE INCIDENTES / TROUBLESHOOTING EN VIVO (STAR)
  // ─────────────────────────────────────────────
  {
    id: "meli_troubleshooting_incident_star",
    question: "Cuéntame sobre una situación crítica de degradación de rendimiento o saturación de base de datos que hayas resuelto.",
    enText: "During a peak enrollment surge, our database cluster suffered severe connection pool exhaustion and query latency spikes. I inspected live session states, identified leaked idle transactions from an asynchronous worker, and quickly deployed connection pooling in transaction mode alongside Redis caching. This dropped active connections by over eighty percent and restored sub-twenty millisecond P95 response times immediately.",
    esText: "Durante un pico masivo de inscripciones, nuestro cluster de base de datos sufrió saturación crítica del pool de conexiones y picos de latencia. Inspeccioné las sesiones activas, identifiqué transacciones ociosas retenidas por un proceso asíncrono y desplegué de urgencia pooling en modo transacción complementado con Redis. Esto redujo las conexiones activas en más de un 80% y normalizó de inmediato la latencia P95 por debajo de veinte milisegundos.",
    category: "Behavioral",
    tags: ["star", "incident", "troubleshooting", "latency", "pooling", "redis", "resilience"],
    company: "MercadoLibre",
    role: "Sr Software Engineer - NoSQL Service Team",
    favorite: true,
    createdAt: 1789572000000,
  },
  // ─────────────────────────────────────────────
  // USO DE IA EN EL FLUJO DIARIO DE INGENIERÍA
  // ─────────────────────────────────────────────
  {
    id: "meli_ai_daily_workflow",
    question: "¿Cómo incorporas herramientas de inteligencia artificial en tu flujo de trabajo diario de ingeniería de software?",
    enText: "I use AI tools every single day to accelerate delivery and elevate engineering quality. Beyond code autocompletion, I leverage LLMs for generating edge-case unit tests, stress-testing complex regular expressions and queries, validating Terraform and Kubernetes security policies, and synthesizing performance profiling reports. It allows me to automate boilerplate tasks and spend more focus on high-impact distributed systems architecture.",
    esText: "Incorporo herramientas de IA todos los días para acelerar el delivery y elevar el estándar de calidad de ingeniería. Más allá del autocompletado de código, utilizo LLMs para generar tests unitarios con casos de borde, realizar benchmarking de consultas complejas, auditar manifiestos de Terraform y Kubernetes contra vulnerabilidades y sintetizar reportes de profiling. Me permite automatizar tareas repetitivas y concentrarme en la arquitectura de sistemas distribuidos.",
    category: "Technical",
    tags: ["ai", "inteligencia artificial", "copilot", "workflow", "productivity", "testing"],
    company: "MercadoLibre",
    role: "Sr Software Engineer - NoSQL Service Team",
    favorite: true,
    createdAt: 1789572000000,
  },
  // ─────────────────────────────────────────────
  // SEGURIDAD Y CONTROL DE ACCESO EN PLATAFORMAS DE DATOS
  // ─────────────────────────────────────────────
  {
    id: "meli_security_encryption_rbac",
    question: "¿Cómo implementas seguridad, cifrado y controles de acceso en plataformas de bases de datos críticas?",
    enText: "I implement defense in depth by enforcing encryption at rest using envelope encryption with customer-managed keys, and encryption in transit via enforced TLS 1.3 or Istio mTLS. Access control relies on strictly scoped IAM roles and Kubernetes Workload Identity, avoiding hardcoded credentials and rotating secrets automatically with automated audit logging for compliance.",
    esText: "Implemento seguridad en capas exigiendo cifrado en reposo con gestión de claves KMS y cifrado en tránsito mediante TLS 1.3 o mTLS de Istio. El control de accesos se basa en roles de menor privilegio e identidades federadas con Kubernetes Workload Identity, eliminando credenciales estáticas y automatizando la rotación de secretos junto con auditoría continua de accesos.",
    category: "Technical",
    tags: ["security", "encryption", "rbac", "iam", "kms", "compliance", "seguridad"],
    company: "MercadoLibre",
    role: "Sr Software Engineer - NoSQL Service Team",
    favorite: true,
    createdAt: 1789572000000,
  },
  // ─────────────────────────────────────────────
  // CULTURA MERCADO LIBRE: BETA CONTINUO Y EMPRENDER
  // ─────────────────────────────────────────────
  {
    id: "meli_culture_fit",
    question: "¿Por qué te interesa sumarte a Mercado Libre y cómo te identificas con principios como Beta Continuo?",
    enText: "Mercado Libre's culture of continuous beta and calculated risk-taking perfectly matches how I build software: shipping high-velocity iterations with feature toggles, automated rollbacks, and proactive telemetry. I thrive in environments where engineering teams take genuine ownership of their platforms and compete collaboratively to create real economic impact across Latin America.",
    esText: "La cultura de Beta Continuo y emprender tomando riesgos de Mercado Libre coincide plenamente con mi forma de trabajar: iterar rápido con feature toggles, rollbacks automatizados y telemetría proactiva. Me motiva trabajar en equipos donde los ingenieros asumimos verdadero ownership de nuestras plataformas y competimos en equipo para generar impacto real en millones de personas en América Latina.",
    category: "Behavioral",
    tags: ["culture", "beta continuo", "mercadolibre", "ownership", "valores"],
    company: "MercadoLibre",
    role: "Sr Software Engineer - NoSQL Service Team",
    favorite: true,
    createdAt: 1789572000000,
  },
];
