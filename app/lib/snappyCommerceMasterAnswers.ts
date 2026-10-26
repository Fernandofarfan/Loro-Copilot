import { MasterAnswer } from "./interviewHelpers";

/**
 * Banco maestro Snappy Commerce — Charla Técnica & Founder (Full Stack Developer).
 * Participantes: Patricio (Owner/Founder de Snappy Commerce) y Nick (Tech Lead).
 * Horario: Martes 17:30 hs.
 * Enfoque dual:
 * - Patricio: Visión de negocio, producto eCommerce, soporte a clientes (CX), impacto de la IA en conversión.
 * - Nick: Arquitectura profunda Vue.js/React, TypeScript, Node.js, consistencia de stock en ventas masivas,
 *   idempotencia de pagos, webhooks, PostgreSQL/MongoDB/Redis, pgvector/LLMs y CI/CD.
 *
 * Directivas estrictas:
 * - Zero-Bullet Mandate: exactamente 2 oraciones (25-45 palabras), punchline primero + justificación técnica.
 * - Sin viñetas ni listas.
 * - Anclado 100% al perfil real de Guillermo Fernando Farfán Romero (Salta / Almagro CABA).
 */
const BASE = {
  company: "SnappyCommerce",
  role: "Full Stack Developer (Vue.js / Node.js / AI)",
  favorite: true,
  createdAt: 1789660000000,
} as const;

export const SNAPPY_COMMERCE_MASTER_ANSWERS: MasterAnswer[] = [
  // ─────────────────────────────────────────────────────────
  // SECCIÓN 1: PRESENTACIÓN & FIT CON PATRICIO Y NICK
  // ─────────────────────────────────────────────────────────
  {
    id: "snappy_tell_me_about_yourself_tech",
    question: "Contanos sobre vos y tu recorrido profesional construyendo productos web.",
    enText: "I'm Fernando, a Senior Full Stack Developer with over eight years architecting scalable web applications across modern frontend frameworks and distributed Node.js backends. I combine reactive UI engineering in TypeScript with transactional database design and applied AI to deliver fast, high-converting platforms.",
    esText: "Soy Fernando, desarrollador Full Stack Senior con más de ocho años diseñando aplicaciones web escalables sobre frameworks frontend reactivos y backends distribuidos en Node.js. Combino ingeniería de interfaces en TypeScript con persistencia transaccional e inteligencia artificial aplicada para crear plataformas rápidas y de alta conversión.",
    category: "Screening & Perfil",
    tags: ["presentacion", "contame", "cv", "trayectoria", "about yourself", "background", "full stack"],
    ...BASE,
  },
  {
    id: "snappy_years_experience",
    question: "¿Cuántos años de experiencia tenés en desarrollo de software y arquitecturas web?",
    enText: "I have over eight years in software engineering across backend systems, databases and frontend development. Over the last four years, I've focused heavily on modern TypeScript, full-stack microservices and deploying AI-enhanced applications to production.",
    esText: "Cuento con más de ocho años de experiencia en ingeniería de software cubriendo backend, bases de datos y desarrollo frontend. Durante los últimos cuatro años me enfoqué fuertemente en TypeScript moderno, microservicios full stack y despliegue de aplicaciones con IA en producción.",
    category: "Screening & Perfil",
    tags: ["años", "experiencia", "seniority", "years", "trayectoria"],
    ...BASE,
  },
  {
    id: "snappy_why_snappy_founder",
    question: "¿Por qué te entusiasma sumarte a Snappy Commerce y qué valor podés aportar al producto?",
    enText: "Snappy Commerce solves the real-world friction of eCommerce by embedding artificial intelligence directly into the customer buying journey. My experience optimizing conversion funnels and scaling transactional APIs will help accelerate new product features while keeping the platform rock-solid.",
    esText: "Snappy Commerce resuelve la fricción real del comercio electrónico integrando inteligencia artificial directamente en el proceso de compra de los usuarios. Mi experiencia optimizando embudos de conversión y escalando APIs transaccionales permitirá acelerar nuevas funcionalidades manteniendo la plataforma sumamente sólida.",
    category: "Negocio & Producto",
    tags: ["por que snappy", "motivacion", "patricio", "ecommerce", "valor", "producto"],
    ...BASE,
  },
  {
    id: "snappy_location_and_caba_meetups",
    question: "¿Cómo te organizarías con la modalidad remota y los encuentros quincenales en CABA o Zona Norte?",
    enText: "I live in Salta with my rescued dog Luna where I work remotely with zero friction, and I own an apartment in Almagro, Buenos Aires. Traveling for the bi-weekly collaborative sessions in CABA or San Isidro fits seamlessly into my personal routine.",
    esText: "Vivo en Salta con mi perra rescatada Luna donde trabajo en remoto con total fluidez, y dispongo de casa propia en Almagro, Buenos Aires. Viajar para los encuentros colaborativos quincenales en CABA o Zona Norte se integra a la perfección con mi rutina personal.",
    category: "Logística",
    tags: ["donde vivis", "ubicacion", "salta", "buenos aires", "almagro", "presencial", "caba", "zona norte", "san isidro"],
    ...BASE,
  },
  {
    id: "snappy_cross_functional_cx",
    question: "¿Cómo manejás la interacción transversal con equipos de Producto, Customer Experience (CX) y clientes?",
    enText: "I treat CX feedback as the most valuable telemetry for identifying hidden UI bugs or checkout drop-offs before they impact revenue. When talking to clients or non-technical stakeholders, I translate complex systems decisions into plain business impact to ensure total alignment.",
    esText: "Considero el feedback de CX como la telemetría más valiosa para detectar fricciones en el checkout o errores antes de que afecten la facturación. Al interactuar con clientes o áreas no técnicas, traduzco decisiones complejas de arquitectura a impacto de negocio claro para asegurar alineación total.",
    category: "Negocio & Producto",
    tags: ["cx", "customer experience", "producto", "clientes", "stakeholders", "soporte", "comunicacion"],
    ...BASE,
  },

  // ─────────────────────────────────────────────────────────
  // SECCIÓN 2: FRONTEND & VUE.JS / REACT (NICK)
  // ─────────────────────────────────────────────────────────
  {
    id: "snappy_vue_reactivity_ref_reactive",
    question: "¿Cómo funciona la reactividad en Vue 3 y cuál es la diferencia técnica entre `ref` y `reactive`?",
    enText: "Vue 3 tracks reactivity through JavaScript Proxies intercepting property access and mutations via dependency tracking. I prefer using `ref` for primitive values and consistent `.value` destructuring, whereas `reactive` is ideal for complex nested state objects that require deep observation.",
    esText: "Vue 3 gestiona la reactividad mediante Proxies de JavaScript que interceptan lecturas y mutaciones mediante seguimiento de dependencias. Prefiero utilizar `ref` para valores primitivos y consistencia al destructurar con `.value`, mientras que `reactive` es ideal para objetos de estado complejos con observación profunda.",
    category: "Frontend & Vue",
    tags: ["vue", "reactividad", "ref", "reactive", "proxy", "vue3", "nick"],
    ...BASE,
  },
  {
    id: "snappy_vue_composition_api_composables",
    question: "¿Por qué elegís la Composition API sobre la Options API y cómo organizás la lógica compartida?",
    enText: "The Composition API groups component logic by business feature rather than lifecycle hooks, dramatically reducing boilerplate and cognitive overhead. I extract shared asynchronous logic into custom Composables, ensuring full TypeScript type inference and isolated unit testability.",
    esText: "La Composition API agrupa la lógica por funcionalidad de negocio en lugar de fragmentarla por métodos del ciclo de vida, reduciendo drásticamente la duplicación de código. Extraigo la lógica asíncrona compartida en Composables personalizados, garantizando inferencia estricta de TypeScript y facilidad de testing unitario.",
    category: "Frontend & Vue",
    tags: ["composition api", "composables", "options api", "custom hooks", "reusabilidad", "vue3"],
    ...BASE,
  },
  {
    id: "snappy_vue_pinia_state_management",
    question: "¿Cómo estructurás la gestión de estado global en Vue con Pinia para un eCommerce?",
    enText: "I separate Pinia stores into modular domains such as `useCartStore`, `useUserStore` and `useCatalogStore` to avoid a monolithic state. State mutations are restricted to actions with optimistic UI updates, syncing cart totals directly to local storage and backend sessions.",
    esText: "Divido los stores de Pinia en dominios modulares como `useCartStore`, `useUserStore` y `useCatalogStore` para evitar estados monolíticos. Las mutaciones se canalizan a través de acciones con actualizaciones optimistas en la UI, sincronizando el carrito con almacenamiento local y la sesión del backend.",
    category: "Frontend & Vue",
    tags: ["pinia", "estado global", "cart store", "vuex", "store", "ecommerce state"],
    ...BASE,
  },
  {
    id: "snappy_ecommerce_core_web_vitals",
    question: "¿Cómo optimizás los Core Web Vitals en páginas de productos y en el embudo de checkout?",
    enText: "I keep Largest Contentful Paint under 1.2 seconds by serving responsive WebP or AVIF images with priority fetch hints and static width reservations to eliminate layout shift. For checkout, I dynamically import heavy third-party payment scripts only when the user reaches the payment step.",
    esText: "Mantengo el Largest Contentful Paint por debajo de 1.2 segundos sirviendo imágenes WebP o AVIF con etiquetas de prioridad y dimensiones fijas para evitar el Cumulative Layout Shift. En el checkout cargo dinámicamente los scripts pesados de pasarelas de pago únicamente cuando el usuario llega al paso de pago.",
    category: "Frontend & Performance",
    tags: ["core web vitals", "lcp", "cls", "checkout", "optimizacion", "lighthouse", "performance"],
    ...BASE,
  },
  {
    id: "snappy_virtualized_product_catalog",
    question: "¿Cómo renderizás un catálogo con miles de productos sin degradar la memoria del navegador?",
    enText: "I implement virtualized scrolling using libraries like Vue Virtual Scroller to render only the items currently visible in the user's viewport. This keeps the DOM lightweight with less than fifty nodes active at any time, preserving sixty frames per second smooth scrolling.",
    esText: "Implemento listas virtualizadas mediante librerías como Vue Virtual Scroller para renderizar únicamente los productos visibles en el viewport del navegador. Esto mantiene el DOM liviano con menos de cincuenta nodos activos simultáneos, garantizando un scroll fluido a sesenta cuadros por segundo.",
    category: "Frontend & Performance",
    tags: ["virtualizacion", "catalogo", "virtual scroll", "dom", "memoria", "rendimiento"],
    ...BASE,
  },

  // ─────────────────────────────────────────────────────────
  // SECCIÓN 3: BACKEND, APIS & CONCURRENCIA (NICK)
  // ─────────────────────────────────────────────────────────
  {
    id: "snappy_stock_concurrency_race_conditions",
    question: "¿Cómo manejás la consistencia de inventario en ventas flash masivas evitando sobreventas (overselling)?",
    enText: "In PostgreSQL, I wrap the stock deduction inside an isolated database transaction using `SELECT stock FROM products WHERE id = $1 FOR UPDATE` to lock the row during confirmation. For extreme traffic bursts, I use Redis atomic decrement commands (`DECR`) as a high-speed gate before persisting to the relational database.",
    esText: "En PostgreSQL encapsulo el descuento de inventario en una transacción con `SELECT stock FROM products WHERE id = $1 FOR UPDATE` para bloquear la fila durante la compra. Para picos extremos de tráfico utilizo decrementos atómicos en Redis (`DECR`) como barrera previa antes de persistir en la base relacional.",
    category: "Backend & Concurrencia",
    tags: ["stock", "concurrencia", "race conditions", "overselling", "select for update", "redis decr", "ventas flash"],
    ...BASE,
  },
  {
    id: "snappy_api_idempotency_payments",
    question: "¿Cómo implementás idempotencia en APIs de cobro para evitar cargos duplicados?",
    enText: "I require client requests to send a unique `Idempotency-Key` header which is stored in Redis with an automatic expiration time during initial processing. If a duplicate request arrives while processing or completed, the API intercepts it and returns the cached outcome without re-executing the payment charge.",
    esText: "Exijo que las peticiones de cobro incluyan un encabezado `Idempotency-Key` único que registro en Redis con tiempo de expiración durante el procesamiento inicial. Si ingresa un reintento duplicado, la API intercepta la clave y responde con el resultado previo sin reejecutar el cargo en la pasarela.",
    category: "Backend & APIs",
    tags: ["idempotencia", "idempotency key", "pagos duplicados", "redis lock", "transacciones", "apis"],
    ...BASE,
  },
  {
    id: "snappy_payment_webhooks_security",
    question: "¿Cómo gestionás los webhooks de pasarelas como Stripe o Mercado Pago de forma segura y tolerante a fallos?",
    enText: "I validate the raw incoming payload against the provider's HMAC-SHA256 signature header to reject fraudulent requests immediately. Once verified, I push the event into an asynchronous queue like BullMQ to return a fast HTTP 200 to the provider and process business fulfillment safely.",
    esText: "Valido el payload crudo entrante contra la firma criptográfica HMAC-SHA256 del proveedor para rechazar de inmediato cualquier intento fraudulento. Una vez verificado, encolo el evento en BullMQ para responder con HTTP 200 rápido a la pasarela y procesar la orden en segundo plano.",
    category: "Backend & APIs",
    tags: ["webhooks", "stripe", "mercadopago", "hmac", "bullmq", "seguridad", "colas"],
    ...BASE,
  },
  {
    id: "snappy_sql_vs_nosql_architecture",
    question: "¿Cómo decidís qué datos van en PostgreSQL, cuáles en MongoDB y cuáles en Redis?",
    enText: "PostgreSQL handles financial transactions, orders and relational user accounts where strict ACID guarantees are non-negotiable. I use MongoDB for flexible product catalogs with dynamic vendor attributes, and Redis for volatile shopping carts, sessions and distributed locks.",
    esText: "PostgreSQL gestiona transacciones financieras, órdenes y usuarios donde las garantías ACID son innegociables. Utilizo MongoDB para catálogos con atributos dinámicos de diferentes proveedores, y Redis para carritos de compra volátiles, sesiones y locks distribuidos.",
    category: "Bases de Datos",
    tags: ["postgresql", "mongodb", "redis", "acid", "arquitectura datos", "nosql vs sql"],
    ...BASE,
  },
  {
    id: "snappy_nodejs_microservices_async",
    question: "¿Cómo evitás bloquear el event loop de Node.js en microservicios con operaciones pesadas?",
    enText: "I offload CPU-intensive operations like image compression, PDF receipt generation or bulk catalog exports to worker threads or external BullMQ worker processes. This keeps Node.js's single-threaded event loop completely free to accept and route concurrent HTTP requests with sub-50 millisecond latency.",
    esText: "Delego tareas intensivas de CPU como compresión de imágenes, generación de facturas o exportaciones masivas a worker threads o procesos externos en BullMQ. Esto mantiene el event loop de Node.js totalmente liberado para atender peticiones HTTP con latencias inferiores a cincuenta milisegundos.",
    category: "Backend & Arquitectura",
    tags: ["event loop", "node", "microservicios", "worker threads", "bullmq", "concurrencia"],
    ...BASE,
  },

  // ─────────────────────────────────────────────────────────
  // SECCIÓN 4: INTELIGENCIA ARTIFICIAL APLICADA AL ECOMMERCE
  // ─────────────────────────────────────────────────────────
  {
    id: "snappy_ai_semantic_search_embeddings",
    question: "¿Cómo construirías un buscador semántico de productos con IA para mejorar la tasa de conversión?",
    enText: "I generate vector embeddings of product titles, attributes and reviews using text-embedding models and index them in PostgreSQL with `pgvector` via HNSW indexes. When users search using colloquial phrases like 'comfortable waterproof jacket', cosine similarity matches relevant items even with zero exact keyword overlap.",
    esText: "Genero embeddings vectoriales de títulos, atributos y descripciones de productos indexándolos en PostgreSQL con `pgvector` mediante índices HNSW. Cuando el usuario busca frases naturales como 'campera impermeable para lluvia', la similitud de coseno encuentra los productos correctos aun sin coincidencia textual exacta.",
    category: "AI & Innovación",
    tags: ["buscador semantico", "embeddings", "pgvector", "hnsw", "busqueda vectorial", "conversion"],
    ...BASE,
  },
  {
    id: "snappy_ai_rag_support_cx",
    question: "¿Cómo implementarías un agente de IA para atención al cliente y recomendaciones sin que alucine información de stock?",
    enText: "I implement Retrieval-Augmented Generation (RAG) using OpenAI Function Calling connected directly to our real-time inventory API. The LLM only receives verified context and structured tool outputs, strictly forbidding it from inventing stock availability, pricing or return policies.",
    esText: "Implemento Retrieval-Augmented Generation (RAG) combinado con Function Calling de OpenAI conectado directamente a nuestra API de inventario en tiempo real. El modelo únicamente responde con datos verificados de la base, prohibiendo por diseño que invente disponibilidad de stock, precios o políticas de devolución.",
    category: "AI & Innovación",
    tags: ["rag", "function calling", "alucinaciones", "chatbot cx", "openai api", "agentes ia"],
    ...BASE,
  },
  {
    id: "snappy_ai_pair_programming_workflow",
    question: "¿Cómo integrás herramientas de IA (Copilot, Cursor, ChatGPT) en tu desarrollo cotidiano?",
    enText: "I use GitHub Copilot to auto-complete repetitive unit tests, regex patterns and TypeScript type definitions at 2x velocity. I use conversational LLMs for architectural rubber-ducking and auditing security edge cases, always thoroughly verifying generated code before committing.",
    esText: "Utilizo GitHub Copilot para autocompletar tests unitarios, patrones de regex y definiciones de tipos en TypeScript duplicando mi velocidad de entrega. Empleo LLMs para debatir decisiones de arquitectura y auditar casos límite de seguridad, validando siempre minuciosamente cada línea generada antes del commit.",
    category: "AI & Productividad",
    tags: ["copilot", "chatgpt", "productividad", "pair programming", "testing ai"],
    ...BASE,
  },

  // ─────────────────────────────────────────────────────────
  // SECCIÓN 5: TESTING, CI/CD & CALIDAD
  // ─────────────────────────────────────────────────────────
  {
    id: "snappy_testing_pyramid_ecommerce",
    question: "¿Cómo definís la pirámide de testing para una plataforma de eCommerce en constante cambio?",
    enText: "I write fast Vitest unit tests for business logic and state reducers, paired with Vue Testing Library for critical UI interactions. For the core money-making paths—cart addition and checkout flow—I enforce automated end-to-end regression tests using Playwright in our CI/CD pipeline.",
    esText: "Escribo pruebas unitarias en Vitest para lógica de negocio y reducers de estado, junto con Vue Testing Library para componentes interactivos clave. Para el flujo crítico de ingresos—agregado al carrito y checkout—ejecuto pruebas end-to-end automáticas con Playwright en el pipeline de CI/CD.",
    category: "DevOps & Testing",
    tags: ["vitest", "playwright", "testing", "vue testing library", "checkout test", "e2e"],
    ...BASE,
  },
  {
    id: "snappy_cicd_zero_downtime",
    question: "¿Cómo estructurás los pipelines de despliegue en GitHub Actions para asegurar zero-downtime?",
    enText: "The workflow triggers automated linting, type-checking and tests on every pull request, gating merges behind strict branch protection rules. In staging and production, we build immutable Docker images and deploy with rolling updates or blue-green strategy to eliminate maintenance downtime.",
    esText: "El workflow ejecuta linting, chequeo de tipos y pruebas automáticas en cada pull request, bloqueando merges ante cualquier falla. En producción generamos imágenes Docker inmutables y desplegamos con rolling updates o estrategia blue-green para erradicar cualquier caída del servicio.",
    category: "DevOps & Testing",
    tags: ["github actions", "docker", "zero downtime", "blue green", "rolling update", "ci/cd"],
    ...BASE,
  },

  // ─────────────────────────────────────────────────────────
  // SECCIÓN 6: ARQUITECTURA DE ECOMMERCE AVANZADA, RESILIENCIA & SEGURIDAD
  // ─────────────────────────────────────────────────────────
  {
    id: "snappy_abandoned_cart_recovery_arch",
    question: "¿Cómo diseñarías el backend para el checkout y la recuperación de carritos abandonados con WhatsApp y Email?",
    enText: "I decouple the checkout state in Redis with a time-to-live expiration and trigger an event via BullMQ whenever an order remains unfinalized after twenty minutes. A serverless worker then queries our customer communication service to send personalized WhatsApp or email recovery links without degrading checkout API latency.",
    esText: "Desacoplo el estado del checkout en Redis con tiempo de expiración y disparo un evento en BullMQ si una orden queda incompleta tras veinte minutos. Un worker en segundo plano consume ese evento para enviar recordatorios por WhatsApp o correo con links de recuperación sin afectar la latencia del checkout.",
    category: "Backend & eCommerce",
    tags: ["carritos abandonados", "checkout", "whatsapp", "notificaciones", "bullmq", "redis ttl"],
    ...BASE,
  },
  {
    id: "snappy_catalog_caching_invalidation",
    question: "¿Cómo resolvés el balance entre cachear el catálogo para alta velocidad y reflejar cambios de precio o stock de inmediato?",
    enText: "I implement a Cache-Aside pattern in Redis with tagged cache keys like `product:id` and short time-to-live intervals combined with HTTP `stale-while-revalidate` headers. Whenever a merchant updates price or stock, our backend issues an atomic cache invalidation event across our Redis cluster so shoppers never view outdated checkout values.",
    esText: "Implemento el patrón Cache-Aside en Redis con claves taggeadas por producto y tiempos de vida cortos junto con encabezados HTTP `stale-while-revalidate`. Cuando un comerciante actualiza precios o inventario, el backend emite una invalidación atómica en Redis para que ningún comprador vea precios desactualizados.",
    category: "Bases de Datos & Cache",
    tags: ["caching", "cache invalidation", "redis", "stale while revalidate", "catalogo", "precios"],
    ...BASE,
  },
  {
    id: "snappy_critical_production_incident_star",
    question: "Contanos sobre un incidente crítico o bug de concurrencia que hayas resuelto en producción bajo presión.",
    enText: "During a peak sales spike, concurrent requests created deadlocks in PostgreSQL while updating the inventory balance table simultaneously. I resolved the issue immediately by ordering lock acquisitions by product ID and implementing Redis atomic distributed locks, restoring normal checkout latency within fifteen minutes.",
    esText: "Durante un pico masivo de ventas, peticiones concurrentes generaron deadlocks en PostgreSQL al actualizar el balance de inventario en simultáneo. Resolví el problema ordenando la adquisición de locks por ID de producto e implementando locks distribuidos en Redis, normalizando el checkout en menos de quince minutos.",
    category: "Resolución de Problemas (STAR)",
    tags: ["incidente", "bug produccion", "deadlock", "star", "concurrencia", "presion", "troubleshooting"],
    ...BASE,
  },
  {
    id: "snappy_velocity_vs_tech_debt",
    question: "¿Cómo balanceás la velocidad para entregar funcionalidades de negocio rápido versus la deuda técnica y calidad de código?",
    enText: "I prioritize shipping minimum viable features with strict TypeScript types and comprehensive end-to-end checkout coverage to unlock commercial feedback fast. Then, I reserve ten to fifteen percent of each sprint specifically to refactor and optimize performance before technical debt compounds into delivery blockers.",
    esText: "Priorizo lanzar funcionalidades mínimas viables con tipado estricto en TypeScript y tests end-to-end del checkout para validar rápido con el negocio. Luego destino entre un diez y quince por ciento de cada sprint a refactorizar y optimizar cuellos de botella antes de que la deuda técnica bloquee el roadmap.",
    category: "Liderazgo & Producto",
    tags: ["deuda tecnica", "velocidad", "patricio vs nick", "priorizacion", "calidad", "refactor"],
    ...BASE,
  },
  {
    id: "snappy_pci_dss_security_payments",
    question: "¿Cómo garantizás la seguridad de datos de pago y tarjetas bajo estándares PCI-DSS en el stack frontend y backend?",
    enText: "We tokenize credit card details directly inside client-side iframes provided by Stripe or Mercado Pago so sensitive PAN numbers never touch our servers. On our Node.js backend, we enforce strict Content Security Policies, payload sanitization and encrypt all transactional customer identifiers at rest.",
    esText: "Tokenizamos los datos de tarjeta directamente en el frontend mediante iframes seguros del proveedor de pagos para que ningún número de tarjeta toque nuestros servidores. En el backend de Node.js aplicamos políticas estrictas de Content Security Policy, sanitización de payloads y cifrado en reposo de todos los identificadores del cliente.",
    category: "Seguridad & Pagos",
    tags: ["pci dss", "seguridad", "pagos", "tokenizacion", "stripe", "mercadopago", "pan"],
    ...BASE,
  },

  // ─────────────────────────────────────────────────────────
  // SECCIÓN 7: PREGUNTAS AL CIERRE PARA PATRICIO Y NICK
  // ─────────────────────────────────────────────────────────
  {
    id: "snappy_questions_for_patricio_and_nick",
    question: "¿Tenés alguna pregunta técnica o de negocio para nosotros?",
    enText: "Yes: for Nick, what is currently the biggest architectural bottleneck in your checkout and event pipelines? And for Patricio, which AI-driven eCommerce capability on your roadmap do you see creating the greatest commercial advantage over competitors in the next six months?",
    esText: "Sí: para Nick, ¿cuál es hoy el mayor cuello de botella de arquitectura en el checkout o en los pipelines de eventos? Y para Patricio, ¿cuál es la funcionalidad con IA de su roadmap que proyectan que generará la mayor ventaja competitiva para las tiendas en los próximos seis meses?",
    category: "Cierre Técnico",
    tags: ["preguntas para patricio y nick", "cierre", "roadmap", "founder questions", "tech lead questions"],
    ...BASE,
  },
];
