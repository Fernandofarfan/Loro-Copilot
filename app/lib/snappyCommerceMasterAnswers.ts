import { MasterAnswer } from "./interviewHelpers";

/**
 * Banco maestro Snappy Commerce — Full Stack Developer (Semi Senior / Senior).
 * Reclutadora: María Laura (Lopez HR SOLUTIONS).
 * Plataforma: Snappy Commerce (IA aplicada a eCommerce, miles de usuarios, integraciones).
 * Modalidad: Remoto full-time con encuentros opcionales cada 15 días en CABA / Zona Norte.
 * Anclado a ES_Full_Stack_Developer.pdf: TypeScript, Node.js, React/Vue.js, APIs REST,
 * PostgreSQL, MongoDB, Redis, CI/CD con GitHub Actions, Testing y herramientas de IA (Copilot).
 *
 * Directiva estricta:
 * - Cumplimiento del Zero-Bullet Mandate: exactamente 2 oraciones concisas y directas sin viñetas.
 * - Discriminar +8 años en IT / desarrollo de software.
 * - Salta (actual) con casa en Almagro (CABA) disponible para encuentros quincenales.
 */
const BASE = {
  company: "SnappyCommerce",
  role: "Full Stack Developer (Vue.js / Node.js / AI)",
  favorite: true,
  createdAt: 1789650000000,
} as const;

export const SNAPPY_COMMERCE_MASTER_ANSWERS: MasterAnswer[] = [
  // ── SECCIÓN 1: SCREENING & PRESENTACIÓN ──────────────────
  {
    id: "snappy_tell_me_about_yourself",
    question: "Contame sobre vos / recorré tu experiencia como Full Stack.",
    enText: "I'm Fernando, a Senior Full Stack Developer with over eight years building scalable web applications across modern frontend architectures and backend microservices. I specialize in TypeScript, Node.js, reactive frameworks like React and Vue, and integrating AI models into user-facing products.",
    esText: "Soy Fernando, desarrollador Full Stack Senior con más de ocho años construyendo aplicaciones web escalables combinando frontend reactivo con microservicios backend. Me especializo en TypeScript, Node.js, frameworks como React y Vue, y en la integración de modelos de inteligencia artificial en productos de alto impacto.",
    category: "Screening",
    tags: ["presentacion", "contame", "cv", "trayectoria", "about yourself", "background", "full stack"],
    ...BASE,
  },
  {
    id: "snappy_years_experience",
    question: "¿Cuántos años de experiencia tenés desarrollando aplicaciones web?",
    enText: "I bring over eight years of software development experience building comprehensive web applications, APIs and databases. The last four years have been deeply focused on modern TypeScript, full-stack microservices and cloud deployments.",
    esText: "Cuento con más de ocho años de experiencia en desarrollo de software construyendo aplicaciones web completas, APIs y bases de datos. Los últimos cuatro años han estado fuertemente enfocados en TypeScript moderno, microservicios full stack y despliegues en la nube.",
    category: "Screening",
    tags: ["años", "experiencia", "seniority", "years", "trayectoria"],
    ...BASE,
  },
  {
    id: "snappy_why_snappy",
    question: "¿Por qué te interesa sumarte a Snappy Commerce?",
    enText: "Snappy Commerce operates right at the intersection of eCommerce and applied Artificial Intelligence, which matches my passion for building high-conversion platforms. I want to build features that directly impact thousands of active shoppers using generative tech.",
    esText: "Snappy Commerce opera en la intersección exacta entre eCommerce e Inteligencia Artificial aplicada, lo cual encaja con mi pasión por construir plataformas de alta conversión. Me motiva desarrollar funcionalidades que impacten directamente en miles de compradores utilizando tecnologías inteligentes.",
    category: "Screening",
    tags: ["por que", "interes", "motivacion", "snappy", "ecommerce", "ai"],
    ...BASE,
  },
  {
    id: "snappy_location_and_optional_meetups",
    question: "¿Dónde vivís? La vacante es remota con encuentros opcionales cada 15 días en CABA o Zona Norte.",
    enText: "I currently work remotely from Salta, but I own a home in Almagro, Buenos Aires, and travel regularly. Attending the optional bi-weekly meetups in CABA or Zona Norte fits my schedule without any issue.",
    esText: "Actualmente trabajo de forma remota desde Salta, pero tengo casa propia en Almagro, Buenos Aires, y viajo con frecuencia. Sumarme a los encuentros presenciales opcionales cada quince días en CABA o Zona Norte encaja perfecto con mi rutina.",
    category: "Logística",
    tags: ["donde vivis", "ubicacion", "salta", "buenos aires", "almagro", "presencial", "caba", "zona norte", "hibrido"],
    ...BASE,
  },
  {
    id: "snappy_availability",
    question: "¿Cuál es tu disponibilidad de incorporación?",
    enText: "I can coordinate a clean handover with my current commitments within a standard two-week notice window. I have full availability to start immediately after that.",
    esText: "Puedo coordinar un traspaso ordenado de mis compromisos actuales en un plazo estándar de dos semanas de preaviso. Cuento con total disponibilidad para incorporarme inmediatamente después.",
    category: "Logística",
    tags: ["disponibilidad", "incorporacion", "preaviso", "cuando podes", "start date"],
    ...BASE,
  },
  {
    id: "snappy_salary_expectations",
    question: "¿Cuál es tu remuneración pretendida o expectativa salarial?",
    enText: "I am targeting around 3.8 to 4.2 million gross pesos monthly, or roughly 2,800 to 3,200 USD depending on the compensation structure. I value the flexibility of the role and the product challenge, so I am very open to align with your salary band.",
    esText: "Mi expectativa ronda entre 3.8 y 4.2 millones de pesos brutos mensuales, o alrededor de 3.000 USD según el esquema de contratación. Valoro la flexibilidad del puesto y el desafío del producto, así que estoy abierto a alinearme a la banda presupuestada.",
    category: "Compensación",
    tags: ["salario", "pretension", "sueldo", "banda", "expectativa salarial", "compensacion"],
    ...BASE,
  },
  {
    id: "snappy_english_level",
    question: "¿Cómo evaluás tu nivel de inglés?",
    enText: "Professional working level, around B2. I read technical documentation, write clean API specifications and collaborate comfortably in English within agile teams.",
    esText: "Nivel profesional de trabajo, alrededor de B2. Leo documentación técnica, redacto especificaciones de APIs y colaboro fluidamente en inglés en ceremonias ágiles.",
    category: "Screening",
    tags: ["ingles", "english", "idioma", "b2", "fluency"],
    ...BASE,
  },

  // ── SECCIÓN 2: STACK FRONTEND & VUE.JS / REACT ───────────
  {
    id: "snappy_vue_and_react",
    question: "La JD menciona Vue.js y frameworks de frontend. ¿Qué experiencia tenés con Vue y React?",
    enText: "I build enterprise frontend applications primarily with React and TypeScript, and I understand Vue's reactivity, Composition API and component lifecycle thoroughly. Transferring state patterns and routing between Vue and React is second nature for me given my strong JavaScript foundations.",
    esText: "Construyo aplicaciones frontend empresariales principalmente con React y TypeScript, y domino a fondo la reactividad de Vue, su Composition API y el ciclo de vida de componentes. El traslado de patrones de estado y ruteo entre Vue y React es inmediato para mí gracias a mi sólida base en JavaScript.",
    category: "Frontend",
    tags: ["vue", "vue.js", "react", "frontend", "composition api", "reactividad"],
    ...BASE,
  },
  {
    id: "snappy_typescript_javascript",
    question: "¿Cómo trabajás con TypeScript y JavaScript en el día a día?",
    enText: "I use TypeScript in Strict Mode with explicit interfaces and generic types to prevent runtime defects before code hits staging. I pair that with modern ES6+ features like async/await, optional chaining and immutable data structures.",
    esText: "Utilizo TypeScript en modo estricto con interfaces explícitas y tipos genéricos para evitar errores en tiempo de ejecución antes de llegar a staging. Combino eso con características modernas de ES6+ como async/await, optional chaining y estructuras de datos inmutables.",
    category: "Frontend",
    tags: ["typescript", "javascript", "strict mode", "tipos", "es6"],
    ...BASE,
  },
  {
    id: "snappy_ecommerce_ux_performance",
    question: "¿Cómo optimizás el rendimiento y la experiencia de usuario en plataformas de eCommerce?",
    enText: "In eCommerce, every millisecond impacts conversion, so I optimize Core Web Vitals through code splitting, dynamic imports and aggressive image caching. I ensure Largest Contentful Paint stays under 1.2 seconds to minimize bounce rates on product and checkout pages.",
    esText: "En eCommerce cada milisegundo impacta en la conversión, por lo que optimizo Core Web Vitals mediante code splitting, dynamic imports y caché agresivo de imágenes. Me aseguro de mantener el Largest Contentful Paint por debajo de 1.2 segundos para minimizar la tasa de rebote en carritos y checkout.",
    category: "Frontend",
    tags: ["ecommerce", "performance", "core web vitals", "lcp", "checkout", "conversion"],
    ...BASE,
  },

  // ── SECCIÓN 3: BACKEND & NODE.JS, APIS Y DATOS ───────────
  {
    id: "snappy_nodejs_and_apis",
    question: "¿Qué experiencia tenés desarrollando APIs en Node.js?",
    enText: "I have built high-throughput REST APIs and middleware services with Node.js and Express, enforcing request validation through libraries like Zod. I design modular service layers with clean error handling and automated OpenAPI/Swagger documentation.",
    esText: "He desarrollado APIs REST y microservicios de alto throughput con Node.js y Express, aplicando validación estricta de payloads mediante librerías como Zod. Diseño capas modulares de servicio con manejo centralizado de errores y contratos documentados en OpenAPI/Swagger.",
    category: "Backend",
    tags: ["node", "node.js", "express", "apis", "rest", "zod", "swagger"],
    ...BASE,
  },
  {
    id: "snappy_sql_vs_nosql",
    question: "¿Cómo manejás bases de datos SQL y NoSQL como PostgreSQL, MySQL y MongoDB?",
    enText: "I use PostgreSQL and MySQL for relational transactional data requiring ACID compliance, such as orders, inventory and user billing. For flexible product catalogs and high-speed telemetry, I leverage MongoDB or Redis caching to ensure sub-millisecond query responses.",
    esText: "Utilizo PostgreSQL o MySQL para datos transaccionales con cumplimiento ACID, como órdenes de compra, inventario y facturación. Para catálogos flexibles de productos y lectura veloz, utilizo MongoDB o caché en Redis garantizando respuestas en milisegundos.",
    category: "Bases de Datos",
    tags: ["sql", "nosql", "postgresql", "mongodb", "mysql", "redis", "database"],
    ...BASE,
  },
  {
    id: "snappy_integrations_third_party",
    question: "¿Qué experiencia tenés conectando APIs de terceros e integraciones de eCommerce?",
    enText: "I frequently integrate payment gateways, shipping providers and CRM webhooks with idempotent request patterns and exponential retry strategies. This prevents duplicate transactions or lost webhooks during network timeouts.",
    esText: "Integro pasarelas de pago, operadores logísticos y webhooks con patrones idempotentes y reintentos exponenciales. Esto garantiza que no existan cobros duplicados ni eventos perdidos ante interrupciones de red.",
    category: "Backend",
    tags: ["integraciones", "apis", "pagos", "webhooks", "terceros", "idempotencia"],
    ...BASE,
  },

  // ── SECCIÓN 4: INTELIGENCIA ARTIFICIAL & TESTING ──────────
  {
    id: "snappy_ai_tools_copilot_chatgpt",
    question: "La JD valora el uso de IA (Copilot, ChatGPT). ¿Cómo usás herramientas de inteligencia artificial en tu flujo de trabajo?",
    enText: "I use GitHub Copilot and LLMs daily as pair-programming assistants to accelerate unit testing, write regexes and scaffold repetitive boilerplate. I focus my human time on high-level architecture, security and edge cases while AI handles the typing speed.",
    esText: "Utilizo GitHub Copilot y modelos de IA a diario como copilotos de pair-programming para acelerar tests unitarios, regexes y estructuras repetitivas de código. Enfoco mi energía en la arquitectura de alto nivel, la seguridad y los casos límite mientras la IA optimiza la velocidad de entrega.",
    category: "AI & Innovación",
    tags: ["ia", "copilot", "chatgpt", "ai", "productividad", "prompts"],
    ...BASE,
  },
  {
    id: "snappy_ai_applied_to_ecommerce",
    question: "¿Tenés experiencia integrando Inteligencia Artificial en productos o aplicaciones?",
    enText: "Yes, I have integrated LLMs and vector embeddings using APIs like OpenAI and Google Vertex AI to build smart search and contextual recommendation engines. Applying AI to eCommerce personalizes user journeys and dramatically boosts product discovery.",
    esText: "Sí, he integrado modelos de lenguaje y embeddings vectoriales mediante APIs de OpenAI y Google Vertex AI para construir motores de búsqueda inteligente y recomendaciones contextuales. Aplicar IA al eCommerce personaliza la experiencia y potencia drásticamente el descubrimiento de productos.",
    category: "AI & Innovación",
    tags: ["ia aplicada", "ecommerce ai", "embeddings", "openai", "recomendaciones", "busqueda"],
    ...BASE,
  },
  {
    id: "snappy_testing_ci_cd",
    question: "¿Cómo manejás el testing automatizado y CI/CD?",
    enText: "I write automated tests using Jest and React Testing Library for frontend components and integration tests for API endpoints. I automate validation inside GitHub Actions pipelines with linting and test execution before merging into main.",
    esText: "Escribo pruebas automatizadas con Jest y React Testing Library para componentes de interfaz y tests de integración para endpoints de API. Automatizo la validación en pipelines de GitHub Actions con chequeos de calidad y cobertura antes de fusionar a la rama principal.",
    category: "DevOps & Testing",
    tags: ["testing", "jest", "react testing library", "ci/cd", "github actions", "calidad"],
    ...BASE,
  },

  // ── SECCIÓN 5: CIERRE & PREGUNTAS AL RECRUITER ───────────
  {
    id: "snappy_questions_for_recruiter",
    question: "¿Tenés alguna pregunta sobre la posición o Snappy Commerce?",
    enText: "Yes: what is the current composition of the tech team, and what is the main feature on the product roadmap for the next quarter? Also, could you walk me through the next steps in the interview process?",
    esText: "Sí: ¿cómo está conformado hoy el equipo técnico y cuál es el principal desafío en el roadmap de producto para el próximo trimestre? Además, ¿cómo continúan las siguientes etapas del proceso de selección?",
    category: "Cierre",
    tags: ["preguntas", "cierre", "roadmap", "equipo", "preguntas para maria laura"],
    ...BASE,
  },
];
