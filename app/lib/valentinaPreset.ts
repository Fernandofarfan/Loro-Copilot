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

Memoria bilingüe exhaustiva para la entrevista con Valentina Lopez Salinas (Talent Acquisition Manager).
CV de referencia: \`pdf/EN_Python_Backend_Engineer_&_Technical_Lead.pdf\`.
Modalidad: Híbrida (2 días presenciales en Puerto Madero, CABA).
Sueldo pretendido: $4.000 USD brutos / mes en relación de dependencia en dólares.

---

## BLOQUE 1: SMALL TALK, VIDA PERSONAL Y HOBBIES (EL FILTRO DE INGLÉS CASUAL)

### 1. Pregunta: Do you have animals or pets in your home? / ¿Tenés mascotas o animales en tu casa?

[KEY] Yes, I have pets at home; they are great company during remote work and keep me active throughout the day.

[EN]
Yes, I do! I have pets at home, and they are wonderful company, especially since I work remotely. They keep me active, bring great positive energy, and remind me to take quick breaks to step away from the screen, stretch, and reset my focus throughout the day.

[PHO]
(jɛs, aɪ du! aɪ hæv pɛts æt hoʊm, ænd ðeɪ ɑr ˈwʌndərfəl ˈkʌmpəni fɔr rɪˈmoʊt wɜrk. ðeɪ kip mi ˈæktɪv ænd rɪˈmaɪnd mi tu teɪk kwɪk breɪks.)

[ES]
¡Sí, tengo mascotas en casa! Son una compañía bárbara trabajando remoto; me mantienen activo, aportan muy buena energía y me recuerdan despegar un poco la vista del monitor, estirar y renovar el foco a lo largo del día.

---

### 2. Pregunta: What are your hobbies or what do you like to do in your free time? / ¿Cuáles son tus hobbies o qué hacés en tu tiempo libre?

[KEY] Cycling, outdoor sports in nature, listening to lo-fi/electronic music, and experimenting with cloud/AI architectures in my home-lab.

[EN]
In my free time, I really enjoy outdoor activities, especially cycling and exploring nature trails. Being outdoors helps me completely disconnect and recharge. When I'm at home, I love listening to instrumental lo-fi or electronic music, reading about new cloud architectures, and experimenting with personal projects and AI pipelines in my home-lab setup.

[PHO]
(ɪn maɪ fri taɪm, aɪ ˈrɪli ɛnˈdʒɔɪ ˈaʊtˌdɔr ækˈtɪvətiz, ɪˈspɛʃəli ˈsaɪklɪŋ ænd ɪkˈsplɔrɪŋ ˈneɪtʃər treɪlz. aɪ ɔlsoʊ lʌv ˈlɪsənɪŋ tu ˈloʊˌfaɪ ˈmjuzɪk ænd ˈtɪŋkərɪŋ ɪn maɪ hoʊm-læb.)

[ES]
En mi tiempo libre disfruto mucho de las actividades al aire libre, sobre todo salir a pedalear y recorrer senderos en la naturaleza para despejar la mente. En casa me gusta escuchar música lo-fi o electrónica tranquila, leer sobre nuevas arquitecturas en la nube y experimentar con proyectos personales de IA en mi home-lab.

---

### 3. Pregunta: Where do you live and what is your favorite place? / ¿Dónde vivís y cuál es tu lugar favorito?

[KEY] Based in Salta, Argentina; surrounded by mountains and peaceful landscapes, while fully prepared and excited to commute/stay in Buenos Aires.

[EN]
I'm currently based in Salta, in the northwest of Argentina. It's a beautiful city surrounded by mountains, with sunny and mild weather year-round. My favorite spots are the quiet mountain trails just outside the city where you can hike and disconnect. At the same time, I know Buenos Aires very well from my university studies at UBA, and I really enjoy the dynamic cultural and culinary scene in neighborhoods like Puerto Madero and Palermo.

[PHO]
(aɪm ˈkɜrəntli beɪst ɪn ˈsɑltə, ɑrdʒənˈtinə. ɪts ə ˈbjutəfəl ˈsɪti səˈraʊndəd baɪ ˈmaʊntənz. maɪ ˈfeɪvərɪt spɑts ɑr ðə ˈkwaɪət ˈmaʊntən treɪlz, bʌt aɪ ɔlsoʊ lʌv ˈbweɪnoʊs ˈaɪrəs.)

[ES]
Actualmente vivo en Salta, al noroeste de Argentina. Es una ciudad hermosa rodeada de cerros, con clima templado y soleado casi todo el año. Mis lugares favoritos son los senderos de montaña en las afueras donde se puede caminar y desconectar. Al mismo tiempo, conozco muy bien Buenos Aires por mis años de estudio en la UBA y me encanta la energía cultural y gastronómica de zonas como Puerto Madero y Palermo.

---

### 4. Pregunta: What did you do last weekend or what are your weekend plans? / ¿Qué hiciste el fin de semana pasado?

[KEY] Relaxing weekend: bike ride in the countryside, quality time with family, and configuring a small server benchmark in my home-lab.

[EN]
Last weekend was very balanced and refreshing. On Saturday morning, I went for a scenic bike ride, followed by an informal family lunch. On Sunday, I spent a couple of hours reading technical RFCs and running benchmarks on an async worker setup in my home-lab, and then rested to start the week with high focus and energy.

[PHO]
(læst ˈwikˌɛnd wʌz ˈvɛri ˈbælənst ænd rɪˈfrɛʃɪŋ. aɪ wɛnt fɔr ə ˈsaɪklɪŋ raɪd, spɛnt taɪm wɪð ˈfæməli, ænd ˈtɪŋkərd wɪð ə ˈbɛntʃˌmɑrk ɪn maɪ hoʊm-læb.)

[ES]
El fin de semana estuvo muy equilibrado: el sábado salí temprano a pedalear un rato al aire libre y compartí un almuerzo en familia. El domingo le dediqué un par de horas a leer artículos técnicos y correr unas pruebas de rendimiento en mi home-lab, y descansé para arrancar la semana con las pilas recargadas.

---

### 5. Pregunta: What is your morning routine or how do you organize your workday? / ¿Cómo es tu rutina o cómo organizás tu día de trabajo?

[KEY] Early start with coffee, reviewing top 3 daily priorities before opening chats, followed by focused deep-work blocks and agile syncs.

[EN]
I like starting my mornings early with a good cup of black coffee. Before opening Slack or checking emails, I review my top three technical priorities for the day in my planner. Then I dedicate the first ninety minutes to deep work—usually complex coding, architecture design, or code reviews—before jumping into team standups and collaborative syncs. This keeps my day proactive rather than reactive.

[PHO]
(aɪ stɑrt maɪ ˈmɔrnɪŋz ˈɜrli wɪð ə gʊd kʌp əv ˈkɔfi. aɪ rɪˈvju maɪ tɑp θri ˌpraɪˈɔrəˌtiz bɪˈfɔr ˈoʊpənɪŋ slæk, ænd dɛdəkət ðə fɜrst ˈaʊər tu dip wɜrk.)

[ES]
Me gusta arrancar temprano con un buen café. Antes de abrir Slack o el correo, anoto mis tres prioridades técnicas del día. Dedico los primeros 90 minutos a deep-work (diseño de arquitectura, código complejo o code reviews) antes de las standups y reuniones del equipo. Eso me permite ser proactivo y no estar corriendo detrás de las notificaciones.

---

### 6. Pregunta: What kind of music, books, or podcasts do you enjoy? / ¿Qué música o podcasts escuchás para programar?

[KEY] Instrumental lo-fi and electronic for deep focus; tech architecture blogs, High Scalability, and software engineering podcasts.

[EN]
When I need to focus deeply on coding or debugging, I listen to instrumental lo-fi beats, ambient, or melodic electronic music with no lyrics. For reading, I follow architecture engineering blogs like High Scalability, Martin Fowler's articles, and Google Cloud release notes. I also listen to podcasts like Software Engineering Radio and Latent Space for insights on AI and distributed systems.

[PHO]
(waɪl ˈkoʊdɪŋ, aɪ ˈlɪsən tu ˌɪnstrəˈmɛntəl ˈloʊˌfaɪ bɪˈkɔz ɪt hæz noʊ ˈlɪrɪks. aɪ ɔlsoʊ rid ˈmɑrtən ˈfaʊlərz ˈɑrtəkəlz ænd ˈlɪsən tu ˈsɔfˌtwɛr ˌɛndʒəˈnɪrɪŋ ˈreɪdioʊ.)

[ES]
Para programar o hacer debugging escucho lo-fi instrumental o electrónica tranquila sin letras para no dispersarme. Para leer sigo blogs de arquitectura como High Scalability, los artículos de Martin Fowler y novedades de Google Cloud. En podcasts escucho Software Engineering Radio y Latent Space para estar al día con sistemas distribuidos e IA.

---

## BLOQUE 2: CULTURA, BEHAVIORAL Y SOFT SKILLS

### 7. Pregunta: How would you describe your personality or working style? / ¿Cómo describirías tu personalidad o estilo de trabajo?

[KEY] Dependable, analytical, and highly collaborative; combining technical rigor with pragmatism and strong ownership.

[EN]
I would describe myself as dependable, analytical, and pragmatic. Dependable because when I take ownership of a service or a sprint milestone, the team knows it will be delivered with high standards. Analytical because I don't guess—I rely on APM metrics, logs, and benchmarks to identify root causes. And pragmatic because I understand that engineering serves business value, so delivering a clean, working solution on time is always better than chasing over-engineered perfection.

[PHO]
(aɪ wʊd dɪˈskraɪb maɪˈsɛlf æz dɪˈpɛndəbəl, ˌænəˈlɪtɪkəl, ænd prægˈmætɪk. aɪ rɪˈlaɪ ɑn ˈmɛtrɪks rˈæðər ðæn ˈgɛsɪŋ, ænd aɪ teɪk ful ˈoʊnərˌʃɪp.)

[ES]
Me describiría como confiable, analítico y pragmático. Confiable porque cuando asumo la responsabilidad de una entrega o un servicio, el equipo sabe que se cumple con calidad. Analítico porque no adivino: me baso en métricas de APM, logs y benchmarks para encontrar la causa raíz de los problemas. Y pragmático porque la ingeniería existe para crear valor de negocio; prefiero una solución limpia, funcional y a tiempo antes que caer en sobreingeniería.

---

### 8. Pregunta: What are your greatest strengths as an engineer? / ¿Cuáles son tus mayores fortalezas como ingeniero?

[KEY] End-to-end ownership, deep backend & cloud expertise, and staying calm under high-pressure production incidents.

[EN]
My greatest strength is my end-to-end perspective. Having a solid foundation in backend programming, database internals, and cloud infrastructure allows me to see how data flows from the API layer all the way to disk. Another key strength is composure under pressure: during critical production incidents, I don't panic. I isolate the blast radius, roll back if necessary, gather telemetry, and communicate clearly with stakeholders.

[PHO]
(maɪ ˈgreɪtəst strɛŋkθ ɪz maɪ ɛnd-tu-ɛnd pərˈspɛktɪv ænd kəmˈpoʊʒər ˈʌndər ˈprɛʃər. aɪ ˈaɪsəˌleɪt ðə blæst ˈreɪdiəs ænd kəˈmjunəˌkeɪt ˈklɪrli.)

[ES]
Mi mayor fortaleza es la visión integral de punta a punta. Tener bases firmes en backend, motores de bases de datos e infraestructura cloud me permite entender exactamente qué pasa desde la petición HTTP hasta el almacenamiento físico. Otra fortaleza es la calma bajo presión: ante incidentes críticos no me desespero; aíslo el impacto, ejecuto rollback si hace falta, analizo telemetría y mantengo informados a los líderes.

---

### 9. Pregunta: What is an area you are actively working to improve or a weakness? / ¿Cuál es tu mayor debilidad o área de mejora?

[KEY] Tendency toward perfectionism in initial drafts; mitigated by setting strict timeboxes and delivering incremental MVPs.

[EN]
An area I actively work on is managing my natural tendency toward architectural perfectionism. Sometimes I want to design the ideal, bulletproof abstraction right from the start. I've learned that this can slow down early feedback loops. Now, I consciously timebox my design phases, align with the product team on the minimal viable architecture, and iterate incrementally based on real telemetry rather than premature optimization.

[PHO]
(ən ˈɛriə aɪ ˈæktɪvli wɜrk ɑn ɪz ˌmænədʒɪŋ pərˈfɛkʃəˌnɪzəm. naʊ aɪ ˈkɑnʃəsli ˈtaɪmˌbɑks maɪ dɪˈzaɪn ˈfeɪzəz ænd dɪˈlɪvər ˌɪnkrəˈmɛntəli.)

[ES]
Un aspecto en el que trabajo activamente es en moderar mi inclinación hacia el perfeccionismo arquitectónico. A veces quiero que la abstracción inicial sea 100% impecable desde el minuto cero. Aprendí que eso puede demorar el feedback del usuario. Hoy aplico timeboxing estricto: defino una arquitectura mínima viable, la valido rápido con el equipo y la voy iterando sobre datos reales en vez de optimizar prematuramente.

---

### 10. Pregunta: How do you handle technical disagreements with teammates or leads? / ¿Cómo manejás desacuerdos técnicos con el equipo?

[KEY] Decouple opinions from facts; use benchmarks, proofs of concept (PoC), and formalize trade-offs in Architecture Decision Records (ADRs).

[EN]
I always separate technical debates from personal egos. When a disagreement arises, my first step is active listening to fully understand the other engineer's perspective and constraints. Next, we look at objective data: we create quick benchmarks, run a proof of concept, or evaluate latency and cloud costs. Finally, we document the decision in an Architecture Decision Record (ADR), detailing why we chose path A over path B. Once a decision is made, I commit one hundred percent to the team's direction.

[PHO]
(aɪ ˈsɛpəˌreɪt tɛk ˈdɪskəʃənz frəm ˈigoʊz. wi bɪld ə kwɪk pruf əv ˈkɑnsɛpt, kəmˈpɛr ˈbɛntʃˌmɑrks, ænd ˈdɑkjəmɛnt ɪn ən eɪ-di-ɑr.)

[ES]
Separo por completo la discusión técnica de los egos personales. Primero escucho con atención para entender los argumentos y restricciones del otro. Después buscamos datos objetivos: armamos una pequeña prueba de concepto, corremos un benchmark o comparamos costos y latencia. Por último, registramos la decisión en un Architecture Decision Record (ADR). Una vez consensuado, me comprometo al 100% con la decisión del equipo.

---

### 11. Pregunta: Can you tell me about a mistake or production incident and what you learned? / ¿Tuviste algún error o incidente en producción y qué aprendiste?

[KEY] Blameless postmortem after a database lock escalation incident; restored SLA in 12 minutes and added automated CI stress-testing.

[EN]
During a database schema migration on a high-traffic service, an unindexed foreign key lock escalated, causing connection queuing and latency spikes up to ten seconds. I immediately recognized the symptom, coordinated with the team, and executed a clean rollback, restoring normal SLA within twelve minutes. Afterwards, I facilitated a blameless postmortem: we analyzed the lock graph, updated our migration runbooks, and added automated lock-detection stress tests in our staging CI/CD pipeline so this class of issue could never happen in production again.

[PHO]
(aɪ ˈkɔrdəˌneɪtəd ə klin ˈroʊlˌbæk ɪn twɛlv ˈmɪnəts, rɪˈstɔrd ðə ˌɛs-ɛl-ˈeɪ, ænd lɛd ə ˈbleɪmləs poʊst-ˈmɔrtəm wɪð ˌɔtəˈmeɪtəd lɑk tɛsts.)

[ES]
Durante una migración de esquema en un servicio de alto tráfico, un bloqueo en una foreign key sin indexar generó una cola de conexiones y elevó la latencia a 10 segundos. Detecté el síntoma al instante, coordiné con el equipo y ejecuté el rollback, restableciendo el servicio en 12 minutos. Luego lideré un postmortem sin culpas: analizamos el grafo de locks, actualizamos el runbook de migraciones y sumamos tests automáticos de detección de bloqueos en el pipeline de staging para que nunca vuelva a ocurrir.

---

### 12. Pregunta: Why are you looking for a change and why does this role interest you? / ¿Por qué buscás un cambio y por qué te interesa este puesto?

[KEY] Excited by building enterprise-scale GenAI/Vertex AI applications on GCP and joining an expanding US engineering hub in Puerto Madero.

[EN]
I'm at a point in my career where I want to channel my senior backend and cloud engineering experience into building high-impact Generative AI solutions for enterprise North American clients. Google Cloud Platform, FastAPI, and Vertex AI are the technologies I am most passionate about. Joining a company that recently opened its Argentine hub in Puerto Madero offers the ideal environment: cutting-edge engineering standards, direct global impact, and the energy of helping build a strong local team from the ground up.

[PHO]
(aɪ wɑnt tu ˈtʃænəl maɪ ˌɛkspərˈtiz ˈɪntu ˈɛntərˌpraɪz dʒɛn-eɪ-aɪ ɑn dʒi-si-pi. ˈdʒɔɪnɪŋ ə nu hub ɪn ˈpwɛrtoʊ məˈdɛroʊ ɪz ði aɪˈdiəl ˈnɛkst stɛp.)

[ES]
Estoy en un momento profesional donde busco volcar mi experiencia en backend y cloud hacia el desarrollo de soluciones de Inteligencia Artificial enterprise para clientes de Norteamérica. Google Cloud, FastAPI y Vertex AI son las tecnologías donde más valor aporto. Sumarme a una empresa que está abriendo su hub en Puerto Madero me parece una oportunidad fantástica: combina estándares técnicos de primer nivel, impacto global y el entusiasmo de ser parte del equipo fundacional en el país.

---

## BLOQUE 3: PROFUNDIDAD TÉCNICA (PYTHON, GCP, GENAI Y ARQUITECTURA)

### 13. Pregunta: Can you tell me about yourself and walk me through your background? / ¿Contame sobre vos y tu recorrido profesional?

[KEY] Senior Python Backend Engineer & Technical Lead with 8+ years in software engineering and 4+ years dedicated to GCP, FastAPI microservices, and AI integrations.

[EN]
I'm a Senior Python Backend Engineer and Technical Lead with over eight years of experience building high-throughput microservices, distributed architectures, and cloud-native systems. For the past four years, I've specialized in Google Cloud Platform and modern Python ecosystems like FastAPI, Asyncio, and Pydantic v2, while integrating Generative AI solutions using Vertex AI, RAG pipelines, and vector search with pgvector. Most recently at Reforest Latam, I led an engineering team of six, implementing Clean Architecture and cutting modular feature delivery time by thirty-five percent. I'm really excited about this opportunity because it combines enterprise-scale Python, GCP, and AI in a fast-growing team right here in Buenos Aires.

[PHO]
(aɪm ə ˈsinjər ˈpaɪθɑn ˈbækˌɛnd ˈɛndʒəˈnɪr ænd ˈtɛknɪkəl lid wɪð ˈoʊvər eɪt jɪrz əv ɪkˈspɪriəns ˈbɪldɪŋ haɪ-ˈθruˌpʊt ˈmaɪkroʊˌsɜrvəsəz.)

[ES]
Soy Senior Python Backend Engineer y Tech Lead con más de 8 años de experiencia en ingeniería de software, arquitectura de microservicios y APIs de alto rendimiento. En los últimos 4 años me especialicé en Google Cloud Platform y el ecosistema moderno de Python (FastAPI, Asyncio, SQLAlchemy 2.0 y Pydantic v2), sumando la integración de soluciones de IA Generativa con Vertex AI, arquitecturas RAG y búsqueda semántica con pgvector. Recientemente en Reforest Latam lideré un equipo de 6 ingenieros bajo Clean Architecture y DDD, acelerando las entregas modulares un 35%. Me entusiasma mucho esta posición porque une Python enterprise, GCP e IA aplicada en un equipo en plena expansión en Buenos Aires.

---

### 14. Pregunta: What is your experience with Python, FastAPI, and asynchronous backend development? / ¿Cuál es tu experiencia con Python, FastAPI y desarrollo asíncrono?

[KEY] Deep expertise in Python 3.10+ with FastAPI, native Asyncio, non-blocking I/O, Pydantic v2 validation, and SQLAlchemy 2.0 async engine.

[EN]
My core framework is FastAPI because of its native support for Asyncio, uvloop, and strict data validation via Pydantic v2. In high-concurrency systems, blocking I/O is the main enemy. I design endpoints using non-blocking asynchronous database drivers like asyncpg with SQLAlchemy 2.0, connection pooling via PgBouncer, and Redis for distributed caching. For heavy or time-consuming background operations, I decouple tasks using Celery or Google Cloud Pub/Sub workers. In my consulting work, applying async eager loading and strict caching reduced p95 latency by more than sixty percent.

[PHO]
(maɪ kɔr ˈfreɪmˌwɜrk ɪz fæst-eɪ-pi-aɪ bɪˈkɔz əv ɪts ˈneɪtɪv səˈpɔrt fɔr əˈsɪŋk-aɪ-oʊ ænd strɪkt ˈdeɪtə ˌvæləˈdeɪʃən wɪð paɪ-ˈdæntɪk.)

[ES]
Mi framework principal es FastAPI por su soporte nativo de Asyncio, uvloop y validación estricta en Rust con Pydantic v2. Para evitar que el I/O bloquee el event loop en alta concurrencia, utilizo drivers asíncronos puros como asyncpg con SQLAlchemy 2.0, pooling de conexiones con PgBouncer y Redis para caché distribuido. Las tareas pesadas las desacoplo con workers asíncronos en Celery o Google Cloud Pub/Sub. En consultoría, optimizar consultas asíncronas y caching redujo la latencia p95 más de un 60%.

---

### 15. Pregunta: How do you design and deploy microservices on Google Cloud Platform? / ¿Cómo diseñás y desplegás microservicios en Google Cloud Platform?

[KEY] Containerized workloads deployed on Cloud Run and GKE, with Pub/Sub event-driven messaging, Secret Manager, and Terraform IaC.

[EN]
On Google Cloud, I deploy microservices using containerized workflows with Docker multi-stage builds. For HTTP APIs and async webhooks, Cloud Run provides zero-management auto-scaling and low idle costs. When complex orchestration, service mesh, or stateful worker pools are required, I use Google Kubernetes Engine (GKE). I secure environments using Secret Manager and IAM with least privilege, decouple services through Cloud Pub/Sub topics, and define all infrastructure as code with Terraform to ensure reproducible environments across staging and production.

[PHO]
(ɑn ˈgugəl klaʊd, aɪ dɪˈplɔɪ ˈmaɪkroʊˌsɜrvəsəz ˈjuzɪŋ klaʊd rʌn fɔr ˈɔtoʊ-ˈskeɪlɪŋ ænd dʒi-keɪ-i fɔr ˌɔrkəˈstreɪʃən.)

[ES]
En Google Cloud despliego microservicios contenerizados con Docker multi-stage. Para APIs HTTP y webhooks uso Cloud Run por su autoescalado elástico y bajo costo en reposo. Para orquestación avanzada o grupos de workers con estado empleo GKE. La seguridad la gestiono mediante Secret Manager y roles IAM de mínimo privilegio, desacoplo servicios con tópicos de Cloud Pub/Sub y aprovisiono toda la infraestructura mediante Terraform para garantizar reproducibilidad total.

---

### 16. Pregunta: How have you built and integrated Generative AI solutions like Vertex AI and RAG? / ¿Cómo integrás IA Generativa, Vertex AI y arquitecturas RAG?

[KEY] Production RAG pipelines: chunking documents, generating embeddings with Vertex AI, similarity search with pgvector, and SSE streaming.

[EN]
For Generative AI, I build production Retrieval-Augmented Generation (RAG) architectures. We extract and chunk enterprise knowledge, generate dense embeddings using models like Vertex AI text-embeddings or OpenAI, and store them in PostgreSQL with pgvector using HNSW indexes. When a user queries the system, we perform cosine similarity search to retrieve the most relevant chunks, inject them into the system prompt alongside strict guardrails to prevent hallucinations, and stream the LLM response via Server-Sent Events (SSE). This maintains time-to-first-token under two hundred milliseconds.

[PHO]
(fɔr ˈdʒɛnərətɪv eɪ-aɪ, aɪ bɪld prəˈdʌkʃən ræg ˈɑrkəˌtɛktʃərz wɪð ˈvɜrˌtɛks eɪ-aɪ, pi-dʒi-ˈvɛktər ˈjuzɪŋ eɪtʃ-ɛn-ɛs-ˈdʌbəl-ju, ænd ˈsɜrvər-sɛnt ɪˈvɛnts.)

[ES]
En IA Generativa desarrollo arquitecturas RAG para producción: extraemos y segmentamos documentos, generamos embeddings densos con Vertex AI o APIs de LLMs, y los indexamos en PostgreSQL usando pgvector con índices HNSW. Ante cada consulta, realizamos búsqueda por similitud de coseno, inyectamos el contexto filtrado al prompt con directivas estrictas anti-alucinación y transmitimos la respuesta por Server-Sent Events (SSE) para mantener la latencia del primer token por debajo de 200 ms.

---

### 17. Pregunta: How do you handle database persistence, query optimization, and pgvector in PostgreSQL? / ¿Cómo optimizás persistencia y consultas en PostgreSQL con pgvector?

[KEY] PostgreSQL optimization via composite indexing, asyncpg connection pooling with PgBouncer, Alembic migrations, and HNSW vector indexing.

[EN]
PostgreSQL is my primary relational and vector datastore. I model schemas with strict foreign keys, composite indexes on high-cardinality search columns, and JSONB where flexible attributes are required. To handle high traffic, I run asyncpg behind PgBouncer to prevent connection exhaustion. For vector search, pgvector with HNSW indexing provides logarithmic search times compared to IVFFlat, ensuring sub-fifty millisecond similarity lookups. All schema mutations are governed by Alembic migration scripts tested in CI/CD pipelines to guarantee zero-downtime releases.

[PHO]
(ˈpoʊstgrɛs ɪz maɪ ˈpraɪˌmɛri ˈdeɪtəˌstoʊr. aɪ mɑdəl ˈskiməz wɪð ˈkɑmpəzət ˈɪndɛksəz, juz pi-dʒi-ˈbaʊnsər, ænd pi-dʒi-ˈvɛktər wɪð eɪtʃ-ɛn-ɛs-ˈdʌbəl-ju.)

[ES]
PostgreSQL es mi motor principal relacional y vectorial. Diseño esquemas con índices compuestos en columnas de alta cardinalidad y JSONB para atributos semiestructurados. Frente a alta concurrencia, utilizo asyncpg con PgBouncer para evitar la saturación de conexiones. Para búsqueda vectorial, pgvector con índices HNSW ofrece tiempos de búsqueda logarítmicos inferiores a 50 ms. Toda mutación de esquema se gestiona con scripts de migración en Alembic validados en CI/CD para garantizar cero tiempo de inactividad.

---

### 18. Pregunta: Tell me about your experience leading teams and establishing engineering standards as a Tech Lead. / ¿Contame sobre tu experiencia liderando equipos como Tech Lead?

[KEY] Led an engineering team of 6 at Reforest Latam, introducing Clean Architecture, Architecture Decision Records (ADRs), and Pytest TDD.

[EN]
At Reforest Latam, I stepped in as Technical Lead for an engineering team of six. The codebase had growing technical debt and coupling between business logic and database queries. I introduced Clean Architecture and Domain-Driven Design principles, separating domain entities from framework adapters. We formalized Architecture Decision Records (ADRs) to document trade-offs before writing code. I also instituted Pytest with strict TDD guidelines, bringing automated test coverage above eighty-five percent. This reduced regression bugs in production by forty percent and sped up feature delivery by thirty-five percent.

[PHO]
(æt rɪˈfɔrəst ˈlætæm, aɪ lɛd ən ˌɛndʒəˈnɪrɪŋ tim əv sɪks. aɪ ˌɪntrəˈdust klin ˈɑrkəˌtɛktʃər ænd doʊˈmeɪn-ˈdrɪvən dɪˈzaɪn, ˈsɛpəˌreɪtɪŋ doʊˈmeɪn ˈɛntətiz.)

[ES]
En Reforest Latam me desempeñé como Technical Lead de un equipo de 6 ingenieros. El sistema presentaba acoplamiento entre la lógica de negocio y las consultas de base de datos. Introduje Clean Architecture y Domain-Driven Design (DDD), separando entidades de dominio de los adaptadores externos. Formalizamos Architecture Decision Records (ADRs) para registrar decisiones técnicas y consensuar trade-offs, e implementé Pytest bajo TDD alcanzando más del 85% de cobertura. Esto disminuyó un 40% los incidentes en producción y aceleró un 35% la velocidad de entrega del equipo.

---

### 19. Pregunta: How do you approach testing, code quality, and CI/CD pipelines? / ¿Cómo enfocás testing, calidad de código y CI/CD con Pytest?

[KEY] Pytest with fixtures and mock factories, strict linting (Ruff/Black/MyPy), and automated GitHub Actions CI/CD pipelines.

[EN]
Quality is built into the development workflow, not tested at the end. I use Pytest with Factory Boy for reproducible test fixtures, separating fast unit tests from integration tests that validate real database queries using testcontainers. In CI/CD with GitHub Actions, every pull request triggers automated checks: formatting with Black/Ruff, strict type checking with MyPy, security audits with SonarQube, and automated test execution. Merging is only permitted if all checks pass and test coverage remains above eighty-five percent, followed by automated container deployment to staging.

[PHO]
(ˈkwɑləti ɪz bɪlt ˈɪntu ðə ˈwɜrkˌfloʊ. aɪ juz paɪ-tɛst wɪð ˈfæktəri bɔɪ fɔr ˈfɪkstʃərz, ˈsɛpəˌreɪtɪŋ ˈjunət tɛsts frəm ˌɪntəˈgreɪʃən tɛsts.)

[ES]
La calidad de software se integra en el flujo diario, no al final. Utilizo Pytest junto con Factory Boy para fixtures reproducibles, separando pruebas unitarias rápidas de pruebas de integración con testcontainers sobre bases de datos reales. En pipelines de GitHub Actions, cada pull request ejecuta validaciones automáticas: formateo con Black/Ruff, tipado estricto con MyPy, análisis de seguridad con SonarQube y la suite de tests. Solo se habilita el merge si todos los checks pasan y se mantiene la cobertura mínima del 85%, disparando el despliegue automático a staging.

---

### 20. Pregunta: Can you describe a challenging technical bottleneck you solved (STAR story)? / ¿Contame sobre algún cuello de botella complejo que hayas resuelto?

[KEY] Solved severe N+1 queries and connection exhaustion in an ERP sync API, reducing p95 response time from 3.2s to 180ms (>60% reduction).

[EN]
In my enterprise consulting work, an international client had a critical catalog and transactional sync endpoint experiencing severe timeouts during peak hours, with p95 response times exceeding three point two seconds. Investigating with APM telemetry and database profiling, I identified two issues: an N+1 query pattern where child records were loaded lazily in a loop, and connection exhaustion on the PostgreSQL server. I refactored the query layer using SQLAlchemy 2.0 with selective joinedload eager loading, reducing one hundred and twenty database round-trips to just two queries. I then added a distributed Redis caching layer with cache-aside pattern and set up PgBouncer for connection pooling. As a result, p95 latency dropped from three point two seconds down to one hundred and eighty milliseconds, and database CPU usage fell from ninety percent to below twenty-five percent.

[PHO]
(ən ˈɛntərˌpraɪz ˈklaɪənt hæd ə ˈkrɪtɪkəl ˈɛndˌpɔɪnt wɪð pi-naɪnti-faɪv ˈleɪtənsi. aɪ aɪˈdɛntəˌfaɪd ən ɛn-plʌs-wʌn ˈkwɪri ˈpætərn, rɪˈfæktərd wɪð ˈidʒər ˈloʊdɪŋ, ænd ˈleɪtənsi drɑpt tu 180ms.)

[ES]
En mi trabajo de consultoría enterprise, un cliente internacional tenía un endpoint crítico de sincronización transaccional con tiempos p95 superiores a 3,2 segundos y timeouts en picos de tráfico. Al analizar con telemetría APM y perfiles de base de datos, detecté un patrón de consultas N+1 en bucle y saturación de conexiones en PostgreSQL. Refactoricé la capa de persistencia con SQLAlchemy 2.0 aplicando joinedload selectivo (eager loading), reduciendo 120 consultas consecutivas a solo 2 queries indexadas. Incorporé un caché distribuido en Redis bajo patrón cache-aside y configuré PgBouncer para connection pooling. Como resultado, la latencia p95 cayó de 3,2s a 180ms y el uso de CPU en la base de datos bajó del 90% a menos del 25%.

---

## BLOQUE 4: CONDICIONES, LOGÍSTICA Y CIERRE DE ORO

### 21. Pregunta: How do you feel about working hybrid two days a week in Puerto Madero? / ¿Cómo te sentís trabajando híbrido dos días por semana en Puerto Madero?

[KEY] 100% committed and comfortable with the 2-day-a-week hybrid model in Puerto Madero; logistics and relocation/stay fully arranged.

[EN]
I am completely comfortable and committed to the two-day-a-week hybrid schedule in Puerto Madero. I have full flexibility and arrangements in place to be at the office on the designated days—whether that's Tuesdays and Thursdays, or Wednesdays and Thursdays. I actually find in-person collaboration very valuable for architecture whiteboarding, sprint planning, and team alignment.

[PHO]
(aɪ æm kəmˈplitli ˈkʌmfərtəbəl ænd kəˈmɪtəd tu ðə tu-deɪ ˈhaɪbrɪd ˈskɛdʒul ɪn ˈpwɛrtoʊ məˈdɛroʊ. aɪ faɪnd ɪn-ˈpɜrsən kəˌlæbəˈreɪʃən ˈvɛri ˈvæljuəbəl.)

[ES]
Estoy totalmente comprometido y disponible para el esquema híbrido de dos días presenciales en Puerto Madero. Cuento con plena flexibilidad y la logística resuelta para estar en la oficina en los días designados (martes y jueves o miércoles y jueves). Considero muy valioso el espacio presencial para pizarrón técnico, definición de arquitectura y dinámicas ágiles de equipo.

---

### 22. Pregunta: What are your salary expectations and availability to start? / ¿Cuáles son tus expectativas salariales y disponibilidad para comenzar?

[KEY] $4,000 USD gross per month in a direct employment relationship with USD compensation; availability immediate or 2-week notice.

[EN]
My target salary expectation is four thousand USD gross per month in a direct employment relationship. This aligns with the responsibilities of Senior Python backend architecture, Google Cloud platform operations, and Generative AI integration for enterprise North American clients. In terms of availability, I can start immediately or within a two-week transition window.

[PHO]
(maɪ ˈtɑrgət ˈsæləri ɪkˌspɛkˈteɪʃən ɪz fɔr ˈθaʊzənd ju-ɛs-di groʊs pər mʌnθ ɪn ə dɪˈrɛkt ɪmˈplɔɪmənt rɪˈleɪʃənˌʃɪp. aɪ kæn stɑrt ɪˈmidiətli.)

[ES]
Mi expectativa salarial de referencia es de 4.000 USD brutos mensuales en relación de dependencia con remuneración en dólares. Es un valor competitivo y alineado con la responsabilidad técnica de diseñar backends escalables en Python, infraestructura en GCP e integración de IA para clientes enterprise. Respecto a mi disponibilidad, es inmediata o con un margen de transición de hasta dos semanas.

---

### 23. Pregunta: Do you have any questions for us about the role, team, or company? / ¿Tenés alguna pregunta para nosotros sobre el rol o la empresa?

[KEY] Strategic questions about the enterprise product, engineering hub roadmap, tech stack decisions, and next interview stages.

[EN]
Yes, thank you. I have three questions:
1. Could you tell me more about the core product this Buenos Aires engineering hub is building and what the main technical milestones are for this quarter?
2. How is the engineering team structured between the US headquarters and the new Buenos Aires office—what does the day-to-day collaboration look like?
3. What are the next stages in the interview process after our screening call today?

[PHO]
(jɛs, θæŋk ju. aɪ hæv θri ˈkwɛstʃənz: kʊd ju tɛl mi mɔr əˈbaʊt ðə kɔr ˈprɑdəkt ðɪs ˈbweɪnoʊs ˈaɪrəs hub ɪz ˈbɪldɪŋ? haʊ ɪz ðə tim ˈstrʌktʃərd? ænd wʌt ɑr ðə nɛkst ˈsteɪdʒəz?)

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
