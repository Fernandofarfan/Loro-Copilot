import { MasterAnswer, parseInterviewMarkdownToMasterAnswers } from "./interviewHelpers";

export const VALENTINA_PRESET_COMPANY = "COMPANY86 / US Enterprise Client";
export const VALENTINA_PRESET_ROLE = "Senior Python Backend Engineer & Technical Lead";

export const VALENTINA_PRESET_INTERVIEWER_BIO = `Valentina Lopez Salinas — Talent Acquisition Manager at COMPANY86.
Screening for a North American enterprise tech client opening an engineering hub in Puerto Madero, Buenos Aires.
Role: Senior Backend Engineer (Python, GCP, GenAI).
Key evaluation criteria:
1) English communication proficiency (B2 Professional / Fluent, conversational, clear technical vocabulary).
2) Deep hands-on Python experience (FastAPI, Asyncio, uvloop, Pydantic v2, SQLAlchemy 2.0).
3) Cloud & GenAI capabilities on Google Cloud Platform (Cloud Run, GKE, Vertex AI, RAG pipelines, pgvector vector search).
4) Commitment to hybrid model: 2 days/week in-person at Puerto Madero offices (fully accepted and confirmed).
5) Salary expectation: $4,000 USD gross / month in a direct employment relationship (relación de dependencia en dólares).`;

export const VALENTINA_PRESET_EXTRA_INSTRUCTIONS = `Bilingual interview preparation (Spanish and English).
When responding in English: speak with confidence, structure answers Punchline First ([KEY]), technical depth ([EN]), phonetic pronunciation guide ([PHO]), and Spanish recap ([ES]).
Anchor answers in Guillermo's actual CV: Reforest Latam (Tech Lead, Clean Architecture, ADRs, 35% faster delivery), Enterprise Consulting (N+1 query resolution, SQLAlchemy 2.0 async, Redis, >60% latency reduction), and UBA (DBA & Async Python for 50k users).
Reinforce 100% readiness for hybrid work in Puerto Madero and clear compensation alignment ($4,000 USD gross).`;

export const VALENTINA_PRESET_CV = `Guillermo Fernando Farfán Romero
Senior Python Backend Engineer & Technical Lead
Salta, Argentina (UTC-3 · Open to Remote / Relocation) | +54 9 11 2187-1473 | fernando.farfan16@gmail.com
Portfolio: gfarfan.dev | LinkedIn: Guillermo Farfan | Credly

PROFESSIONAL SUMMARY
Senior Python Backend Engineer and Technical Lead with 8+ years of experience designing scalable microservices architectures, high-throughput RESTful APIs, and enterprise integration backends. Specialist in Python 3.10+ (FastAPI, Asyncio, uvloop, Celery, SQLAlchemy 2.0, Pydantic v2), optimized data persistence in PostgreSQL (with pgvector for semantic search and AI/LLM integrations) and Redis, and containerized cloud workloads on Google Cloud Platform (Cloud Run, GKE).
Strong track record leading the adoption of Clean Architecture, Domain-Driven Design (DDD), automated testing suites with Pytest under TDD methodologies, and distributed observability with OpenTelemetry / IBM Instana. Bridges business objectives and technical scalability with strategic team leadership, backed by a background in Information Systems (UTN) and advanced coursework in Labor Relations (UBA).

TECHNICAL SKILLS & COMPETENCIES
- Languages & Backend Core: Python 3.10+ (Asyncio, Strict Type Hints, Concurrency, Generators, uvloop), TypeScript / Node.js, Bash Scripting.
- Python Frameworks & Ecosystem: FastAPI, Pydantic v2, SQLAlchemy 2.0 (Async Engine & ORM), GenAI / LLM Integration (Vertex AI, OpenAI API, RAG, pgvector), Alembic (Zero-Downtime Migrations), Celery, Django / DRF, Flask, httpx, Uvicorn, Gunicorn, Streaming APIs (SSE / WebSockets).
- Databases, Caching & Messaging: PostgreSQL (Advanced Modeling, pgvector, Composite Indexes, JSONB, asyncpg, PgBouncer), Redis (Distributed Caching, Rate Limiting, Pub-Sub, Celery Broker), MySQL, MongoDB, Google Cloud Pub/Sub.
- Cloud & DevOps: Google Cloud Platform (Cloud Run, GKE, Cloud Storage, Secret Manager), Docker (Multi-stage builds), Docker Compose, Terraform, GitHub Actions CI/CD.
- Architecture & Engineering Quality: Microservices, Clean Architecture, Hexagonal Architecture (Ports & Adapters), Domain-Driven Design (DDD), Event-Driven Architecture, Architecture Decision Records (ADRs), REST APIs, OpenAPI/Swagger, TDD/BDD (Pytest, Factory Boy).
- Observability & Reliability: OpenTelemetry (OTel), IBM Instana APM, Sentry, Prometheus, Git, Postman, SonarQube.

PROFESSIONAL EXPERIENCE
- Technical Lead & Senior Systems Engineer | Reforest Latam (May 2026 – Present | Full-time, Remote)
  * Led adoption of Clean Architecture and DDD across 6 engineers, formalizing ADRs and accelerating modular feature delivery by 35%.
  * Established >85% automated test coverage across microservices with Pytest under TDD practices.
  * Orchestrated distributed async workers with Celery and Redis, integrated with FastAPI endpoints and Pub/Sub for decoupled event processing.
  * Engineered cloud-native security and integration layers connecting microservices to GCP resources under JWT/OAuth2 and least-privilege principles.
  * Implemented automated CI/CD workflows in GitHub Actions for zero-downtime container deployments to Cloud Run and GKE.

- Senior Python & Software Consultant | Independent Consulting & Enterprise Projects (Jan 2021 – Present | Remote)
  * Eliminated N+1 query bottlenecks and optimized async persistence with SQLAlchemy 2.0 (selective eager loading), Pydantic v2, and Redis caching (>60% reduction in p95 latency).
  * Architected and built ingestion microservices and transactional sync engines connecting enterprise ERP/SAP platforms for international retail, mining, and healthcare corporations.
  * Designed high-concurrency REST APIs in FastAPI with strict schema validation, async streaming (SSE), and structured exception handling.
  * Standardized reproducible environments via multi-stage Docker builds and automated infrastructure provisioning with Terraform on Google Cloud.

- Senior Software Engineer & Database Administrator | University of Buenos Aires (UBA) (March 2018 – Feb 2024)
  * Engineered concurrent async Python microservices and ETL pipelines (+50,000 users), slashing batch runtimes from hours to minutes.
  * Implemented database schema versioning with Alembic and automated testing suites on PostgreSQL and SQL Server.
  * Optimized complex SQL queries and stored procedures across high-demand transactional database servers.

- Systems Infrastructure & Operations Coordinator | Government of the City of Buenos Aires (GCBA) (Jan 2020 – Dec 2023)
  * Established technical interoperability standards and automated validation in backend services (40% reduction in inconsistencies).
  * Maintained 99.9% operational uptime SLA across municipal platforms through code reviews and strict software release governance.

EDUCATION & CERTIFICATIONS
- Associate Degree in Information Systems | National Technological University (UTN) (In Progress, Expected Dec 2027)
- Bachelor's Studies in Labor Relations & HR | University of Buenos Aires (UBA) (Advanced Coursework in Organizational Leadership & Team Dynamics)
- Meta Back-End Developer | IBM Java Developer | IBM JavaScript Backend Developer | IBM DevOps & Software Engineering | Meta Full-Stack Engineer`;

export const VALENTINA_RAW_MARKDOWN = `# Informe de Entrevista — COMPANY86 / US Enterprise Client
Puesto: Senior Python Backend Engineer & Technical Lead

### 1. Pregunta: Can you tell me about yourself and walk me through your background?
[KEY] Senior Python Backend Engineer & Technical Lead with 8+ years in software engineering and 4+ years dedicated to GCP, FastAPI microservices, and AI integrations.
[EN]
I'm a Senior Python Backend Engineer and Technical Lead with over eight years of experience building high-throughput microservices, distributed architectures, and cloud-native systems. For the past four years, I've specialized in Google Cloud Platform and modern Python ecosystems like FastAPI, Asyncio, and Pydantic v2, while integrating Generative AI solutions using Vertex AI, RAG pipelines, and vector search with pgvector. Most recently at Reforest Latam, I led an engineering team of six, implementing Clean Architecture and cutting modular feature delivery time by thirty-five percent. I'm really excited about this opportunity because it combines enterprise-scale Python, GCP, and AI in a fast-growing team right here in Buenos Aires.
[PHO]
(aɪm ə ˈsinjər ˈpaɪθɑn ˈbækˌɛnd ˈɛndʒəˈnɪr ænd ˈtɛknɪkəl lid wɪð ˈoʊvər eɪt jɪrz əv ɪkˈspɪriəns ˈbɪldɪŋ haɪ-ˈθruˌpʊt ˈmaɪkroʊˌsɜrvəsəz ænd klaʊd-ˈneɪtɪv ˈsɪstəmz.)
[ES]
Soy Senior Python Backend Engineer y Tech Lead con más de 8 años de experiencia en ingeniería de software, arquitectura de microservicios y APIs de alto rendimiento. En los últimos 4 años me especialicé en Google Cloud Platform y el ecosistema moderno de Python (FastAPI, Asyncio, SQLAlchemy 2.0 y Pydantic v2), sumando la integración de soluciones de IA Generativa con Vertex AI, arquitecturas RAG y búsqueda semántica con pgvector. Recientemente en Reforest Latam lideré un equipo de 6 ingenieros bajo Clean Architecture y DDD, acelerando las entregas modulares un 35%. Me entusiasma mucho esta posición porque une Python enterprise, GCP e IA aplicada en un equipo en plena expansión en Buenos Aires.

### 2. Pregunta: What is your experience with Python, FastAPI, and asynchronous backend development?
[KEY] Deep expertise in Python 3.10+ with FastAPI, native Asyncio, non-blocking I/O, Pydantic v2 validation, and SQLAlchemy 2.0 async engine.
[EN]
My core framework is FastAPI because of its native support for Asyncio, uvloop, and strict data validation via Pydantic v2. In high-concurrency systems, blocking I/O is the main enemy. I design endpoints using non-blocking asynchronous database drivers like asyncpg with SQLAlchemy 2.0, connection pooling via PgBouncer, and Redis for distributed caching. For heavy or time-consuming background operations, I decouple tasks using Celery or Google Cloud Pub/Sub workers. In my consulting work, applying async eager loading and strict caching reduced p95 latency by more than sixty percent.
[PHO]
(maɪ kɔr ˈfreɪmˌwɜrk ɪz fæst-eɪ-pi-aɪ bɪˈkɔz əv ɪts ˈneɪtɪv səˈpɔrt fɔr əˈsɪŋk-aɪ-oʊ ænd strɪkt ˈdeɪtə ˌvæləˈdeɪʃən. aɪ dɪˈzaɪn ˈɛndˌpɔɪnts ˈjuzɪŋ nɑn-ˈblɑkɪŋ ˈdraɪvərz laɪk əˈsɪŋk-pi-dʒi wɪð ˌɛs-kju-ɛl-ˈælkəmi tu-pɔɪnt-oʊ ænd ˈrɛdɪs kæʃɪŋ.)
[ES]
Mi framework principal es FastAPI por su soporte nativo de Asyncio, uvloop y validación estricta en Rust con Pydantic v2. Para evitar que el I/O bloquee el event loop en alta concurrencia, utilizo drivers asíncronos puros como asyncpg con SQLAlchemy 2.0, pooling de conexiones con PgBouncer y Redis para caché distribuido. Las tareas pesadas las desacoplo con workers asíncronos en Celery o Google Cloud Pub/Sub. En consultoría, optimizar consultas asíncronas y caching redujo la latencia p95 más de un 60%.

### 3. Pregunta: How do you design and deploy microservices on Google Cloud Platform?
[KEY] Containerized workloads deployed on Cloud Run and GKE, with Pub/Sub event-driven messaging, Secret Manager, and Terraform IaC.
[EN]
On Google Cloud, I deploy microservices using containerized workflows with Docker multi-stage builds. For HTTP APIs and async webhooks, Cloud Run provides zero-management auto-scaling and low idle costs. When complex orchestration, service mesh, or stateful worker pools are required, I use Google Kubernetes Engine (GKE). I secure environments using Secret Manager and IAM with least privilege, decouple services through Cloud Pub/Sub topics, and define all infrastructure as code with Terraform to ensure reproducible environments across staging and production.
[PHO]
(ɑn ˈgugəl klaʊd, aɪ dɪˈplɔɪ ˈmaɪkroʊˌsɜrvəsəz ˈjuzɪŋ klaʊd rʌn fɔr ˈɔtoʊ-ˈskeɪlɪŋ ænd dʒi-keɪ-i fɔr ˈkʌmplɛks ˌɔrkəˈstreɪʃən.)
[ES]
En Google Cloud despliego microservicios contenerizados con Docker multi-stage. Para APIs HTTP y webhooks uso Cloud Run por su autoescalado elástico y bajo costo en reposo. Para orquestación avanzada o grupos de workers con estado empleo GKE. La seguridad la gestiono mediante Secret Manager y roles IAM de mínimo privilegio, desacoplo servicios con tópicos de Cloud Pub/Sub y aprovisiono toda la infraestructura mediante Terraform para garantizar reproducibilidad total.

### 4. Pregunta: How have you built and integrated Generative AI solutions like Vertex AI and RAG?
[KEY] Production RAG pipelines: chunking documents, generating embeddings with Vertex AI, similarity search with pgvector, and SSE streaming.
[EN]
For Generative AI, I build production Retrieval-Augmented Generation (RAG) architectures. We extract and chunk enterprise knowledge, generate dense embeddings using models like Vertex AI text-embeddings or OpenAI, and store them in PostgreSQL with pgvector using HNSW indexes. When a user queries the system, we perform cosine similarity search to retrieve the most relevant chunks, inject them into the system prompt alongside strict guardrails to prevent hallucinations, and stream the LLM response via Server-Sent Events (SSE). This maintains time-to-first-token under two hundred milliseconds.
[PHO]
(fɔr ˈdʒɛnərətɪv eɪ-aɪ, aɪ bɪld prəˈdʌkʃən ræg ˈɑrkəˌtɛktʃərz. wi tʃʌŋk ˈdɑkjəmənts, ˈdʒɛnəˌreɪt ɪmˈbɛdɪŋz wɪð ˈvɜrˌtɛks eɪ-aɪ, ænd stoʊr ðɛm ɪn ˈpoʊstgrɛs wɪð pi-dʒi-ˈvɛktər ˈjuzɪŋ eɪtʃ-ɛn-ɛs-ˈdʌbəl-ju ˈɪndɛksəz.)
[ES]
En IA Generativa desarrollo arquitecturas RAG para producción: extraemos y segmentamos documentos, generamos embeddings densos con Vertex AI o APIs de LLMs, y los indexamos en PostgreSQL usando pgvector con índices HNSW. Ante cada consulta, realizamos búsqueda por similitud de coseno, inyectamos el contexto filtrado al prompt con directivas estrictas anti-alucinación y transmitimos la respuesta por Server-Sent Events (SSE) para mantener la latencia del primer token por debajo de 200 ms.

### 5. Pregunta: How do you handle database persistence, query optimization, and pgvector in PostgreSQL?
[KEY] PostgreSQL optimization via composite indexing, asyncpg connection pooling with PgBouncer, Alembic migrations, and HNSW vector indexing.
[EN]
PostgreSQL is my primary relational and vector datastore. I model schemas with strict foreign keys, composite indexes on high-cardinality search columns, and JSONB where flexible attributes are required. To handle high traffic, I run asyncpg behind PgBouncer to prevent connection exhaustion. For vector search, pgvector with HNSW indexing provides logarithmic search times compared to IVFFlat, ensuring sub-fifty millisecond similarity lookups. All schema mutations are governed by Alembic migration scripts tested in CI/CD pipelines to guarantee zero-downtime releases.
[PHO]
(ˈpoʊstgrɛs ɪz maɪ ˈpraɪˌmɛri ˈdeɪtəˌstoʊr. aɪ mɑdəl ˈskiməz wɪð ˈkɑmpəzət ˈɪndɛksəz ænd dʒeɪ-sɑn-bi. aɪ rʌn əˈsɪŋk-pi-dʒi bɪˈhaɪnd pi-dʒi-ˈbaʊnsər tu prɪˈvɛnt kəˈnɛkʃən ɪgˈzɔstʃən.)
[ES]
PostgreSQL es mi motor principal relacional y vectorial. Diseño esquemas con índices compuestos en columnas de alta cardinalidad y JSONB para atributos semiestructurados. Frente a alta concurrencia, utilizo asyncpg con PgBouncer para evitar la saturación de conexiones. Para búsqueda vectorial, pgvector con índices HNSW ofrece tiempos de búsqueda logarítmicos inferiores a 50 ms. Toda mutación de esquema se gestiona con scripts de migración en Alembic validados en CI/CD para garantizar cero tiempo de inactividad.

### 6. Pregunta: Tell me about your experience leading teams and establishing engineering standards as a Tech Lead.
[KEY] Led an engineering team of 6 at Reforest Latam, introducing Clean Architecture, Architecture Decision Records (ADRs), and Pytest TDD.
[EN]
At Reforest Latam, I stepped in as Technical Lead for an engineering team of six. The codebase had growing technical debt and coupling between business logic and database queries. I introduced Clean Architecture and Domain-Driven Design principles, separating domain entities from framework adapters. We formalized Architecture Decision Records (ADRs) to document trade-offs before writing code. I also instituted Pytest with strict TDD guidelines, bringing automated test coverage above eighty-five percent. This reduced regression bugs in production by forty percent and sped up feature delivery by thirty-five percent.
[PHO]
(æt rɪˈfɔrəst ˈlætæm, aɪ lɛd ən ˌɛndʒəˈnɪrɪŋ tim əv sɪks. aɪ ˌɪntrəˈdust klin ˈɑrkəˌtɛktʃər ænd doʊˈmeɪn-ˈdrɪvən dɪˈzaɪn, ˈsɛpəˌreɪtɪŋ ˈbɪznəs ˈlɑdʒɪk frəm ˈfreɪmˌwɜrk əˈdæptərz.)
[ES]
En Reforest Latam me desempeñé como Technical Lead de un equipo de 6 ingenieros. El sistema presentaba acoplamiento entre la lógica de negocio y las consultas de base de datos. Introduje Clean Architecture y Domain-Driven Design (DDD), separando entidades de dominio de los adaptadores externos. Formalizamos Architecture Decision Records (ADRs) para registrar decisiones técnicas y consensuar trade-offs, e implementé Pytest bajo TDD alcanzando más del 85% de cobertura. Esto disminuyó un 40% los incidentes en producción y aceleró un 35% la velocidad de entrega del equipo.

### 7. Pregunta: How do you approach testing, code quality, and CI/CD pipelines?
[KEY] Pytest with fixtures and mock factories, strict linting (Ruff/Black/MyPy), and automated GitHub Actions CI/CD pipelines.
[EN]
Quality is built into the development workflow, not tested at the end. I use Pytest with Factory Boy for reproducible test fixtures, separating fast unit tests from integration tests that validate real database queries using testcontainers. In CI/CD with GitHub Actions, every pull request triggers automated checks: formatting with Black/Ruff, strict type checking with MyPy, security audits with SonarQube, and automated test execution. Merging is only permitted if all checks pass and test coverage remains above eighty-five percent, followed by automated container deployment to staging.
[PHO]
(ˈkwɑləti ɪz bɪlt ˈɪntu ðə ˈwɜrkˌfloʊ. aɪ juz paɪ-tɛst wɪð ˈfæktəri bɔɪ fɔr ˈfɪkstʃərz, ˈsɛpəˌreɪtɪŋ ˈjunət tɛsts frəm ˌɪntəˈgreɪʃən tɛsts.)
[ES]
La calidad de software se integra en el flujo diario, no al final. Utilizo Pytest junto con Factory Boy para fixtures reproducibles, separando pruebas unitarias rápidas de pruebas de integración con testcontainers sobre bases de datos reales. En pipelines de GitHub Actions, cada pull request ejecuta validaciones automáticas: formateo con Black/Ruff, tipado estricto con MyPy, análisis de seguridad con SonarQube y la suite de tests. Solo se habilita el merge si todos los checks pasan y se mantiene la cobertura mínima del 85%, disparando el despliegue automático a staging.

### 8. Pregunta: Can you describe a challenging technical bottleneck you solved (STAR story)?
[KEY] Solved severe N+1 queries and connection exhaustion in an ERP sync API, reducing p95 response time from 3.2s to 180ms (>60% reduction).
[EN]
In my enterprise consulting work, an international client had a critical catalog and transactional sync endpoint experiencing severe timeouts during peak hours, with p95 response times exceeding three point two seconds. Investigating with APM telemetry and database profiling, I identified two issues: an N+1 query pattern where child records were loaded lazily in a loop, and connection exhaustion on the PostgreSQL server. I refactored the query layer using SQLAlchemy 2.0 with selective joinedload eager loading, reducing one hundred and twenty database round-trips to just two queries. I then added a distributed Redis caching layer with cache-aside pattern and set up PgBouncer for connection pooling. As a result, p95 latency dropped from three point two seconds down to one hundred and eighty milliseconds, and database CPU usage fell from ninety percent to below twenty-five percent.
[PHO]
(ən ˈɛntərˌpraɪz ˈklaɪənt hæd ə ˈkrɪtɪkəl ˈɛndˌpɔɪnt wɪð pi-naɪnti-faɪv ˈleɪtənsi ɪkˈsidɪŋ θri-pɔɪnt-tu ˈsɛkəndz. aɪ aɪˈdɛntəˌfaɪd ən ɛn-plʌs-wʌn ˈkwɪri ˈpætərn ænd kəˈnɛkʃən ɪgˈzɔstʃən. aɪ rɪˈfæktərd ðə ˈleɪər ˈjuzɪŋ ˌɛs-kju-ɛl-ˈælkəmi tu-pɔɪnt-oʊ wɪð ˈidʒər ˈloʊdɪŋ, ædəd ˈrɛdɪs kæʃɪŋ, ænd pi-dʒi-ˈbaʊnsər.)
[ES]
En mi trabajo de consultoría enterprise, un cliente internacional tenía un endpoint crítico de sincronización transaccional con tiempos p95 superiores a 3,2 segundos y timeouts en picos de tráfico. Al analizar con telemetría APM y perfiles de base de datos, detecté un patrón de consultas N+1 en bucle y saturación de conexiones en PostgreSQL. Refactoricé la capa de persistencia con SQLAlchemy 2.0 aplicando joinedload selectivo (eager loading), reduciendo 120 consultas consecutivas a solo 2 queries indexadas. Incorporé un caché distribuido en Redis bajo patrón cache-aside y configuré PgBouncer para connection pooling. Como resultado, la latencia p95 cayó de 3,2s a 180ms y el uso de CPU en la base de datos bajó del 90% a menos del 25%.

### 9. Pregunta: How do you feel about working hybrid two days a week in Puerto Madero?
[KEY] 100% committed and comfortable with the 2-day-a-week hybrid model in Puerto Madero; logistics and relocation/stay fully arranged.
[EN]
I am completely comfortable and committed to the two-day-a-week hybrid schedule in Puerto Madero. I have full flexibility and arrangements in place to be at the office on the designated days—whether that's Tuesdays and Thursdays, or Wednesdays and Thursdays. I actually find in-person collaboration very valuable for architecture whiteboarding, sprint planning, and team alignment.
[PHO]
(aɪ æm kəmˈplitli ˈkʌmfərtəbəl ænd kəˈmɪtəd tu ðə tu-deɪ ˈhaɪbrɪd ˈskɛdʒul ɪn ˈpwɛrtoʊ məˈdɛroʊ. aɪ hæv ful ˌflɛksəˈbɪləti ænd əˈreɪndʒmənts ɪn pleɪs tu bi æt ðə ˈɔfəs ɑn ðə ˈdɛzɪgˌneɪtəd deɪz.)
[ES]
Estoy totalmente comprometido y disponible para el esquema híbrido de dos días presenciales en Puerto Madero. Cuento con plena flexibilidad y la logística resuelta para estar en la oficina en los días designados (martes y jueves o miércoles y jueves). Considero muy valioso el espacio presencial para pizarrón técnico, definición de arquitectura y dinámicas ágiles de equipo.

### 10. Pregunta: What are your salary expectations and availability to start?
[KEY] $4,000 USD gross per month in a direct employment relationship with USD compensation; availability immediate or 2-week notice.
[EN]
My target salary expectation is four thousand USD gross per month in a direct employment relationship. This aligns with the responsibilities of Senior Python backend architecture, Google Cloud platform operations, and Generative AI integration for enterprise North American clients. In terms of availability, I can start immediately or within a two-week transition window.
[PHO]
(maɪ ˈtɑrgət ˈsæləri ɪkˌspɛkˈteɪʃən ɪz fɔr ˈθaʊzənd ju-ɛs-di groʊs pər mʌnθ ɪn ə dɪˈrɛkt ɪmˈplɔɪmənt rɪˈleɪʃənˌʃɪp. aɪ kæn stɑrt ɪˈmidiətli ɔr wɪˈðɪn ə tu-wik trænˈzɪʃən ˈwɪndoʊ.)
[ES]
Mi expectativa salarial de referencia es de 4.000 USD brutos mensuales en relación de dependencia con remuneración en dólares. Es un valor competitivo y alineado con la responsabilidad técnica de diseñar backends escalables en Python, infraestructura en GCP e integración de IA para clientes enterprise. Respecto a mi disponibilidad, es inmediata o con un margen de transición de hasta dos semanas.

### 11. Pregunta: Do you have any questions for us about the role, team, or company?
[KEY] Strategic questions about the enterprise product, engineering hub roadmap, tech stack decisions, and next interview stages.
[EN]
Yes, thank you. I have three questions:
1. Could you tell me more about the core product this Buenos Aires engineering hub is building and what the main technical milestones are for this quarter?
2. How is the engineering team structured between the US headquarters and the new Buenos Aires office—what does the day-to-day collaboration look like?
3. What are the next stages in the interview process after our screening call today?
[PHO]
(jɛs, θæŋk ju. aɪ hæv θri ˈkwɛstʃənz: kʊd ju tɛl mi mɔr əˈbaʊt ðə kɔr ˈprɑdəkt ðɪs ˈbweɪnoʊs ˈaɪrəs hub ɪz ˈbɪldɪŋ? haʊ ɪz ðə tim ˈstrʌktʃərd bɪˈtwin ðə ju-ɛs ænd ˈbweɪnoʊs ˈaɪrəs?)
[ES]
Sí, muchas gracias. Tengo tres preguntas:
1. ¿Podrías contarme más sobre el producto principal que está construyendo este hub de ingeniería en Buenos Aires y cuáles son los hitos técnicos más importantes de este trimestre?
2. ¿Cómo está organizado el equipo entre la sede en Estados Unidos y la nueva oficina de Buenos Aires? ¿Cómo es la interacción cotidiana?
3. ¿Cuáles serían los siguientes pasos del proceso de selección tras nuestra llamada de hoy?
`;

export function getValentinaMasterAnswers(): MasterAnswer[] {
  return parseInterviewMarkdownToMasterAnswers(
    VALENTINA_RAW_MARKDOWN,
    VALENTINA_PRESET_COMPANY,
    VALENTINA_PRESET_ROLE
  );
}
