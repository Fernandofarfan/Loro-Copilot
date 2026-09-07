# Informe de Entrevista — EPAM (Puesto: Python Backend Engineer & Technical Lead)

## CAPÍTULO 1: INTRODUCCIÓN, ELEVATOR PITCH Y MOTIVACIÓN

### 1. Pregunta: Tell me about yourself and your background.
[KEY]
Senior Python Backend Engineer & Tech Lead with 8+ years designing scalable microservices, async APIs, and cloud-native AI pipelines.

[EN]
I'm a Senior Python Backend Engineer and Technical Lead with over eight years of experience building high-throughput, distributed systems and enterprise microservices.

My core expertise is Python 3.10+—specifically using FastAPI, Asyncio, uvloop, SQLAlchemy 2.0, and Pydantic v2 for high-concurrency architectures. Over the past couple of years, I've integrated Generative AI into backend architectures, building production RAG pipelines, vector search with pgvector, and LLM agent workflows using LangChain.

Most recently, as Tech Lead at Reforest Latam, I spearheaded the adoption of Clean Architecture and Domain-Driven Design across our engineering team, establishing automated CI/CD and Pytest suites with over 85% coverage. Prior to that, I served as Senior Software Engineer & DBA at the University of Buenos Aires, optimizing async pipelines for over 50,000 active users, and consulting on enterprise ERP/SAP transactional integrations.

I bridge deep hands-on backend engineering—including AWS, Kubernetes, and database optimization—with engineering leadership and mentoring.

[PHO]
(ˈsinjər ˈpaɪθɑn ˈbækˌɛnd ˌɛnʤəˈnɪr ænd ˈtɛknɪkəl lid wɪð eɪt jɪrz ʌv ɪkˈspɪriəns ˈbɪldɪŋ ˈskələbəl ˈmaɪkroʊˌsɜrvəsəz)

[ES]
Senior Python Backend Engineer y Tech Lead con más de 8 años de experiencia en microservicios distribuidos, FastAPI, Asyncio, SQLAlchemy 2.0 y cloud. En los últimos años me especialicé en RAG, pgvector y LangChain para arquitecturas de IA aplicada. Lideré equipos con Clean Architecture y DDD en Reforest Latam, y optimicé sistemas de alta concurrencia en la UBA y consultoría internacional.

---

### 2. Pregunta: Why are you interested in joining EPAM Systems?
[KEY]
EPAM's world-class engineering standards, complex global enterprise architectures, and massive focus on AI-driven development.

[EN]
I've been following EPAM's engineering culture for a long time. What excites me most is the scale and engineering rigor of your projects. EPAM works with global industry leaders solving complex, mission-critical architectural challenges, especially in modernizing backends, cloud-native deployments, and operationalizing Generative AI at enterprise scale.

Looking at your open Python positions—especially the focus on AWS, LangChain, and high-performance REST APIs—it aligns 100% with what I enjoy and build daily: production-grade microservices, robust system design, and AI automation that delivers real business value.

Furthermore, coming from a background where I've led technical teams and established ADRs and testing standards, I know I can bring immediate value to EPAM's distributed teams while continuing to grow alongside world-class engineers.

[PHO]
(ˈiːpæmz wɜrld-klæs ˌɛnʤəˈnɪrɪŋ ˈstændərdz ænd kəmˈplɛks ˈɛntərˌpraɪz ˌɑrkəˈtɛkʧərz)

[ES]
Me atrae el rigor de ingeniería y la escala global de EPAM. La posición combina exactamente mis fortalezas: arquitecturas en AWS, microservicios REST de alto rendimiento en Python y pipelines de IA con LangChain a escala empresarial.

---

### 3. Pregunta: Walk me through your experience as a Technical Lead at Reforest Latam.
[KEY]
Led 6 engineers adopting Clean Architecture and DDD, instituted ADRs, and achieved >85% test coverage and 35% faster feature delivery.

[EN]
At Reforest Latam, I stepped in as Technical Lead and Senior Systems Engineer for our environmental telemetry platforms. We had a team of six engineers and needed to transition from a monolithic prototype to a scalable, decoupled microservices architecture.

I led three key transformations:
First, architecture and domain modeling: I introduced Clean Architecture and Domain-Driven Design (DDD), separating core domain logic from FastAPI transport and database layers. We formalized all major technical decisions using Architecture Decision Records (ADRs), which eliminated bikeshedding and accelerated modular feature delivery by 35%.

Second, engineering reliability: I mandated Test-Driven Development practices with Pytest and Factory Boy, raising our automated test coverage from under 40% to over 85%.

Third, asynchronous scalability: We decoupled heavy telemetry ingestion using Celery, Redis, and Cloud Pub/Sub, while deploying containerized workloads to Kubernetes and Cloud Run via automated GitHub Actions CI/CD pipelines.

[PHO]
(lɛd sɪks ˌɛnʤəˈnɪrz əˈdɑptɪŋ klin ˌɑrkəˈtɛkʧər ænd di-di-di wɪð eɪ-di-ɑrz ænd ˈpaɪˌtɛst)

[ES]
Lideré un equipo de 6 ingenieros pasando a Clean Architecture y DDD, documentando decisiones con ADRs y acelerando las entregas un 35%. Subí la cobertura de tests al 85% con Pytest y desacoplé la ingestión con Celery, Redis y Pub/Sub sobre Kubernetes.

---

## CAPÍTULO 2: PYTHON CORE INTERNALS & CONCURRENCY

### 4. Pregunta: How does Python manage memory, and how do reference counting and cyclic garbage collection work?
[KEY]
Reference counting handles immediate deallocation; the cyclic generational GC (Gen 0, 1, 2) detects and breaks circular references.

[EN]
Python utilizes a hybrid memory management model governed by reference counting and a cyclic generational garbage collector.

Every Python object has an internal `ob_refcnt` header. Whenever an object is referenced or assigned, this counter increments; when a reference goes out of scope or is deleted via `del`, it decrements. Once `ob_refcnt` reaches zero, the memory is immediately deallocated back to Python's internal memory allocator, PyMalloc.

However, reference counting alone cannot handle reference cycles—for instance, if object A references B and B references A. To solve this, Python's GC module implements a generational garbage collector based on three generations: 0, 1, and 2. Generation 0 contains newly allocated objects and is inspected frequently. Surviving objects are promoted to Generation 1, and eventually to Generation 2, which is scanned least often. The cyclic GC uses a heuristic tracking algorithm that detects isolated subgraphs of objects whose reference counts only originate internally within the cycle, safely freeing that memory.

[PHO]
(ˈrɛfərəns ˈkaʊntɪŋ fɔr ɪˈmidiət ˌdiˌæləˈkeɪʃən ænd ˌʤɛnəˈreɪʃənəl ˈgɑrbɪʤ kəˈlɛktər fɔr ˈsaɪklz)

[ES]
Python usa conteo de referencias como mecanismo primario (liberación inmediata al llegar a 0). Para ciclos circulares donde A apunta a B y B a A, entra el Garbage Collector generacional (Gen 0, 1 y 2), que corre algoritmos de detección de grafos aislados para evitar fugas de memoria.

[EDGE_CASES]
Objects with custom `__del__` methods in older Python versions could block the cyclic GC from determining the safe order of destruction. Modern Python 3.4+ (PEP 442) resolved this, but keeping objects cycle-free or using `weakref` remains a best practice.

---

### 5. Pregunta: What is the Python GIL (Global Interpreter Lock), and how do you handle CPU-bound vs I/O-bound tasks?
[KEY]
The GIL is a mutex ensuring single-thread execution in CPython bytecode. Use Asyncio/Threading for I/O-bound, and Multiprocessing/ProcessPool for CPU-bound tasks.

[EN]
The GIL is a mutual exclusion lock used by the CPython interpreter to prevent multiple native OS threads from executing Python bytecode simultaneously. It exists primarily because CPython's memory management is not thread-safe regarding reference count increments and decrements.

For I/O-bound tasks—such as waiting on network calls, database queries, disk operations, or third-party APIs—threads and Asyncio release the GIL while waiting for the OS kernel to complete the I/O event. Therefore, Asyncio or `ThreadPoolExecutor` provides massive concurrency with minimal overhead.

For CPU-bound tasks—such as image processing, cryptographic hashing, matrix multiplication, or heavy data transformations—the GIL restricts execution to a single core, meaning multi-threading actually degrades performance due to context-switching overhead. To bypass the GIL for CPU-bound work, we use `multiprocessing` or `concurrent.futures.ProcessPoolExecutor`, which spawns isolated OS processes with distinct memory spaces and separate Python interpreters. In production, we offload these CPU-bound tasks to Celery workers.

[PHO]
(ðə ʤi-aɪ-ɛl ɪz ə ˈmjuːtɛks ɪn si-ˈpaɪθɑn; juz əˈsɪŋkioʊ fɔr aɪ-oʊ baʊnd ænd ˌmʌltiˈprɑˌsɛsɪŋ fɔr si-pi-ju baʊnd)

[ES]
El GIL es un mutex que evita que múltiples hilos nativos ejecuten bytecode de Python a la vez en CPython. Para I/O-bound (APIs, DBs, red), Asyncio o hilos son ideales porque liberan el GIL en la espera. Para CPU-bound (cálculos pesados), el GIL ahoga los hilos, por lo que se usa `multiprocessing`, `ProcessPoolExecutor` o workers de Celery dedicados.

[WHY_NOT]
Why not rely on multi-threading for CPU calculations in Python? Because thread switching overhead plus GIL lock contention makes multi-threaded CPU code slower than single-threaded execution.

---

### 6. Pregunta: How does Asyncio work under the hood, and what happens if you put a blocking call in a coroutine?
[KEY]
Asyncio runs on a single-threaded cooperative event loop using epoll/kqueue. A blocking call freezes the entire loop for all concurrent requests.

[EN]
Asyncio is built around a single-threaded cooperative multitasking event loop. Under the hood, it registers non-blocking socket file descriptors with the OS multiplexing system call—such as `epoll` on Linux or `kqueue` on macOS. In Python, using `uvloop` replaces the default loop with an ultra-fast libuv implementation written in Cython.

When a coroutine executes `await`, it suspends its state and yields control back to the event loop, allowing the loop to poll other pending tasks and resume them when their I/O is ready.

If someone introduces a blocking synchronous call—such as `time.sleep()`, synchronous `requests.get()`, or a blocking database driver—inside an `async def` function, it does not yield control. The entire OS thread is blocked, freezing the event loop. Consequently, all other concurrent coroutines, health checks, and incoming HTTP requests are stalled.

To safely execute blocking or legacy synchronous code inside an async application, we delegate the call to an executor thread via `loop.run_in_executor()` or `anyio.to_thread.run_sync()`.

[PHO]
(əˈsɪŋkioʊ juzəz ə ˈsɪŋgəl-ˈθrɛdəd ɪˈvɛnt lup; ˈblɑkɪŋ kɔlz friːz ðə lup ænd mʌst bi ˈɒfloʊdəd tu æn ˈɛksəˌkjutər)

[ES]
Asyncio funciona sobre un event loop cooperativo monohilo usando `epoll`/`kqueue` (o `uvloop`). Si metés un llamado bloqueante sincrónico (`time.sleep` o `requests`), frenás el hilo entero y todas las demás peticiones concurrentes quedan congeladas. La solución es usar `loop.run_in_executor` o `anyio.to_thread.run_sync`.

---

### 7. Pregunta: What are Generators and Iterators in Python? When and why do you use `yield`?
[KEY]
Generators implement lazy evaluation via `yield`, producing items on demand with O(1) memory footprint instead of allocating full lists in RAM.

[EN]
An iterator in Python is any object that implements the iterator protocol: `__iter__()`, which returns the iterator itself, and `__next__()`, which returns the next item or raises `StopIteration`.

A generator is a specialized function that simplifies writing iterators using the `yield` keyword. When a generator encounters `yield`, it pauses execution, preserves its local stack and variables, and produces a value to the caller. When resumed, execution continues immediately after the `yield` statement.

The primary benefit is lazy evaluation and O(1) memory complexity. If I need to process a 5-gigabyte CSV file, stream millions of database records from PostgreSQL, or process token streams from an LLM API, materializing a complete list in memory will cause an Out-Of-Memory (OOM) crash. By using generators or generator expressions, we stream records one by one, keeping memory footprint constant regardless of dataset size.

[PHO]
(ˈʤɛnəˌreɪtərz juz jild fɔr ˈleɪzi ɪˌvæljuˈeɪʃən wɪð ˈkɑnstənt ˈmɛməri ˈkɑst)

[ES]
Un generador usa `yield` para producir valores bajo demanda (evaluación perezosa) manteniendo el estado suspendido. Permite procesar archivos de gigabytes o streams de base de datos/LLM con consumo de memoria O(1), evitando cargar listas gigantes en RAM que provoquen OOM.

---

### 8. Pregunta: How do Python Decorators work under the hood? Why is `functools.wraps` essential?
[KEY]
Decorators are higher-order functions wrapping callables. `functools.wraps` preserves the original function's name, docstring, and annotations.

[EN]
In Python, functions are first-class citizens. A decorator is essentially a higher-order function that takes a callable as an argument, wraps it with additional behavior, and returns a new callable. The `@decorator` syntax is syntactic sugar for `func = decorator(func)`.

When you wrap a function, the wrapper function replaces the original function object. By default, this causes the original metadata—such as `__name__`, `__doc__`, `__module__`, and type annotations—to be overwritten by the wrapper's metadata.

This is why `functools.wraps(func)` is mandatory in production code. It copies over the introspection attributes from the original function. If you omit `@wraps`, tools that rely on introspection—such as FastAPI dependency injection, Sphinx documentation generators, Pytest fixtures, or Sentry error tracking—will report the wrapper's name instead of the original endpoint, breaking route handlers and debugging traces.

[PHO]
(ˈdɛkəˌreɪtərz ɑr ˈhaɪər-ˈɔrdər ˈfʌŋkʃənz; fʌŋk-tulz ræps prɪˈzɜrvz ˈmɛtəˌdeɪtə ænd ænəˈteɪʃənz)

[ES]
Un decorador es una función de orden superior que envuelve a otra función para agregarle comportamiento. `functools.wraps` es crucial porque copia los metadatos (`__name__`, docstring, firmas y tipos). Si no lo ponés, FastAPI o los sistemas de logging/tracing ven el wrapper y se rompe la inyección de dependencias y el debug.

---

## CAPÍTULO 3: FASTAPI & REST API ARCHITECTURE

### 9. Pregunta: Why do you choose FastAPI over Flask or Django for microservices?
[KEY]
Native async ASGI performance, automatic OpenAPI documentation, and high-speed data validation powered by Pydantic v2 in Rust.

[EN]
For modern microservices and API-first architectures, FastAPI provides distinct advantages over Flask and Django:

First, native ASGI and Asynchronous I/O: FastAPI runs on ASGI servers like Uvicorn and uvloop. It supports asynchronous coroutines natively, handling thousands of concurrent non-blocking I/O connections per worker process without the thread exhaustion issues common in WSGI frameworks like Flask.

Second, robust contract-first validation with Pydantic: Request validation, serialization, and typing are declarative. In Pydantic v2, validation is implemented in Rust (`pydantic-core`), delivering a 5x to 15x performance increase over Python-based validation.

Third, automated documentation: It automatically generates OpenAPI (Swagger) and Redoc specifications directly from code signatures and Pydantic schemas, eliminating documentation drift between frontend and backend teams.

Fourth, modular Dependency Injection: FastAPI's `Depends` system provides clean, testable injection for database sessions, authentication, and service repositories, making unit testing and mocking straightforward without monkey patching.

[PHO]
(fɑst-eɪ-pi-aɪ ˈɔfərz ˈneɪtɪv eɪ-ɛs-ʤi-aɪ spid, pɪˈdæntɪk vi-tu ˌvælɪˈdeɪʃən, ænd ˌoʊpən-eɪ-pi-aɪ dɑkjəmənˈteɪʃən)

[ES]
Elijo FastAPI por su arquitectura nativa ASGI con Asyncio, validación ultrarrápida con Pydantic v2 compilado en Rust, documentación OpenAPI automática y un sistema de inyección de dependencias (`Depends`) limpio y desacoplado, ideal para microservicios.

---

### 10. Pregunta: How do you design idempotent REST APIs and handle idempotency keys in distributed environments?
[KEY]
Idempotency ensures repeated requests produce the same state. For non-idempotent POSTs, use an `Idempotency-Key` header stored atomically in Redis with SETNX.

[EN]
In REST architecture, GET, PUT, and DELETE are inherently idempotent according to HTTP specs, meaning repeated requests leave the system in the same state. POST requests—such as payments or order creation—are not idempotent by default.

To guarantee idempotency for critical POST operations in a distributed system, I implement an Idempotency-Key pattern:
1. The client generates a unique UUID `Idempotency-Key` in the request header.
2. The API middleware intercepts the request and queries a distributed Redis cluster using an atomic `SET key lock_value NX EX 30` (Set if Not Exists with TTL).
3. If the key already exists and the cached response is complete, we immediately return the cached payload with an `Idempotent-Replayed: true` header, bypassing business execution.
4. If the key exists with a status of `PROCESSING`, we return `409 Conflict` or poll briefly to prevent concurrent double-submissions.
5. If the key is new, the request executes through the service layer, the final response payload and HTTP status are written to Redis under that key with a defined TTL (e.g., 24 hours), and the response is returned to the client.

[PHO]
(aɪˈdɛmpətənt rɛst eɪ-pi-aɪz juz æn aɪˈdɛmpətənsi ki ɪn ˈrɛdɪs wɪð æˈtɑmɪk sɛt-ɛn-ɛks)

[ES]
Los POST no son idempotentes de por sí. Usamos un header `Idempotency-Key` (UUID). El middleware hace un `SET ... NX` atómico en Redis con TTL. Si ya existe, devuelve la respuesta cacheada sin re-ejecutar; si está en proceso, rechaza con 409; y si es nuevo, procesa, guarda la respuesta y la retorna.

---

### 11. Pregunta: How do you implement rate limiting in a distributed FastAPI microservice?
[KEY]
Use the Token Bucket or Leaky Bucket algorithm backed by Redis with atomic Lua scripts to prevent race conditions across horizontal replicas.

[EN]
In a distributed microservice architecture with multiple horizontal container replicas behind a load balancer, in-memory rate limiting is ineffective because client requests hit different pods.

I implement rate limiting at two levels:
1. Edge layer: On the API Gateway or Nginx/Cloudflare, shielding services from volumetric DDoS attacks.
2. Application layer: In FastAPI using Redis as the centralized state store. We implement either the Sliding Window Log or Token Bucket algorithm.

To avoid race conditions between checking the current request count and incrementing it, we execute the operation using an atomic Redis Lua script. The script checks the window timestamp and count, drops expired tokens, increments the counter, and sets the TTL atomically in a single round-trip. If the client exceeds their allowed rate, we return an HTTP `429 Too Many Requests` status with standard `Retry-After`, `X-RateLimit-Limit`, and `X-RateLimit-Remaining` headers.

[PHO]
(ˌdɪstrɪˈbjuːtɪd reɪt ˈlɪmɪtɪŋ juzɪŋ ˈslʌɪdɪŋ ˈwɪndoʊz ɪn ˈrɛdɪs wɪð æˈtɑmɪk ˈluːə skrɪpts)

[ES]
En microservicios replicados, el rate limit en memoria local no sirve. Se usa Redis centralizado con el algoritmo de Token Bucket o Ventana Deslizante ejecutado mediante scripts atómicos en Lua para evitar race conditions, respondiendo HTTP 429 con headers `Retry-After` cuando se excede.

---

### 12. Pregunta: What pagination strategy do you recommend for large datasets: Offset vs Cursor-based?
[KEY]
Offset pagination degrades to O(N) at high page numbers; Cursor-based pagination maintains O(1) index lookup and prevents missed/duplicate items.

[EN]
Offset pagination using `LIMIT x OFFSET y` is simple to implement, but it has severe limitations on large datasets. First, performance degrades linearly: when you execute `OFFSET 1000000`, the database engine must scan and discard one million rows before returning the requested batch. Second, data drift occurs: if records are inserted or deleted while a user is paginating, items shift across page boundaries, resulting in duplicate or skipped records.

Cursor-based pagination (also known as keyset pagination) is the production standard for high-volume APIs. Instead of passing an offset number, the client receives an opaque cursor (typically a base64-encoded composite of a unique indexed attribute, such as `(created_at, id)`). The query translates to:
`SELECT * FROM orders WHERE (created_at, id) < (:cursor_timestamp, :cursor_id) ORDER BY created_at DESC, id DESC LIMIT 50;`

Because this query leverages a composite B-Tree index, execution time remains O(1) regardless of depth into the dataset, and concurrent inserts do not cause data shifts.

[PHO]
(ˈkɜrsər-beɪst ˌpæʤəˈneɪʃən ˈjuːzəz kəmˈpɑzɪt ˈɪndɛksəz fɔr ˈkɑnstənt oʊ-wʌn ˈkwɪri spid)

[ES]
Offset-limit (`OFFSET 1000000`) escanea y descarta un millón de filas en disco, degradando el rendimiento y generando duplicados si hay inserts. Paginación por cursor usa un índice B-Tree sobre `(created_at, id)` logrando lookup O(1) constante sin importar qué tan profundo pagines.

---

## CAPÍTULO 4: DATABASES, SQLALCHEMY 2.0 & REDIS

### 13. Pregunta: How do you prevent and resolve N+1 query problems in SQLAlchemy 2.0 async?
[KEY]
Avoid lazy loading in loops; use explicit eager loading with `selectinload` for 1-to-many/many-to-many and `joinedload` for 1-to-1 relationships.

[EN]
The N+1 problem occurs when an application executes 1 query to fetch a parent entity, and then executes N separate sub-queries inside a loop to fetch related child entities, causing massive latency and database connection pool exhaustion.

In SQLAlchemy 2.0 with the `AsyncSession`, lazy loading actually raises a `MissingGreenlet` error because async code cannot perform implicit synchronous database I/O on attribute access. This design intentionally forces developers to be explicit about relationship loading.

We solve this using eager loading strategies:
1. `selectinload`: Best for one-to-many and many-to-many relationships. It fires two queries: one for the primary records, and a second query using `WHERE parent_id IN (...)`. This avoids the massive Cartesian product explosion that happens with SQL joins.
2. `joinedload`: Best for many-to-one or one-to-one relationships, where performing a SQL `LEFT OUTER JOIN` in a single query is optimal and doesn't duplicate parent columns.

Additionally, we enable SQL logging in development and use tools like OpenTelemetry to detect anomalous query counts per endpoint.

[PHO]
(rɪˈzɑlv ɛn-plʌs-wʌn wɪð ɪkˈsplɪsɪt ˈsɪlɛkt-ɪn-loʊd ænd ʤɔɪnd-loʊd ɪn ˌɛskjuːɛl-ˈælkəmi tuː)

[ES]
El problema N+1 se soluciona con carga ansiosa explícita. En SQLAlchemy 2.0 async, el lazy load implícito dispara error por diseño. Usamos `selectinload` para relaciones uno-a-muchos (hace un segundo query con `IN (...)` evitando productos cartesianos) y `joinedload` para relaciones uno-a-uno (haciendo un `LEFT JOIN`).

---

### 14. Pregunta: How do you handle database migrations with Alembic in zero-downtime environments?
[KEY]
Decouple schema changes from code deployments using expand-and-contract migrations, ensuring backward and forward schema compatibility.

[EN]
Zero-downtime database migrations require separating schema changes from application logic so that both the running version and the newly deploying version can operate concurrently on the same database.

We follow the Expand and Contract pattern:
1. Expand phase: If we need to rename a column or change a constraint, we don't do it destructively. We add the new nullable column via Alembic migration, deploy the code that writes to both old and new columns, and backfill existing data asynchronously.
2. Contract phase: Once all running pods are updated and reading from the new column, we deploy a subsequent migration that removes the old column and applies strict non-null constraints.

Furthermore, we ensure all Alembic migrations avoid table-locking operations. For example, in PostgreSQL, adding an index is done using `CREATE INDEX CONCURRENTLY`, and adding columns with default values in modern PostgreSQL versions is metadata-only to avoid rewriting the entire table.

[PHO]
(ˈæləmbɪk maɪˈgreɪʃənz fɔr ˈzɪroʊ-ˈdaʊnˌtaɪm juzɪŋ ɪkˈspænd-ænd-kənˈtrækt ˈpætərnz)

[ES]
Para cero downtime aplicamos el patrón Expand & Contract. Primero agregás la columna nueva sin romper la vieja, deployás código que escribe en ambas, hacés backfill asíncrono, y luego en otra migración eliminás la columna vieja. Usamos `CREATE INDEX CONCURRENTLY` para no bloquear tablas en producción.

---

### 15. Pregunta: What caching strategies do you implement with Redis, and how do you handle cache invalidation and stampedes?
[KEY]
Implement Cache-Aside with TTLs. Mitigate cache stampedes using probabilistic early expiration (XFetch) or distributed mutex locks with Redis.

[EN]
The primary caching pattern I implement is Cache-Aside (Lazy Loading):
1. The application checks Redis for the key.
2. On a cache hit, it returns the deserialized data.
3. On a cache miss, it fetches from PostgreSQL, populates Redis with an appropriate TTL, and returns the result.

For cache invalidation, write operations emit domain events that actively invalidate or update the specific Redis key, while every key maintains a sensible TTL to guarantee eventual consistency.

To prevent Cache Stampedes (Dogpiling)—where a popular cached key expires and hundreds of concurrent requests simultaneously hammer the database:
1. Probabilistic early expiration (the XFetch algorithm): As the key approaches expiration, incoming requests probabilistically compute whether to refresh the cache in the background before it actually expires.
2. Distributed locking (`SETNX`): The first request that encounters a miss acquires a short 2-second lock to compute and write the cache, while other requests either wait briefly or receive slightly stale cached data.

[PHO]
(kæʃ-əˈsaɪd wɪð ˈrɛdɪs; prɪˈvɛnt kæʃ stæmˈpiːdz juzɪŋ dɪsˈtrɪbjutəd lɑks ɔr ˈɛks-fɛtʃ)

[ES]
Uso Cache-Aside con TTLs estrictos e invalidación orientada a eventos. Para evitar el Cache Stampede (cuando vence una clave caliente y miles de requests saturan la base al mismo tiempo), uso locks distribuidos (`SETNX`) para que solo un worker recalcule o expiración probabilística temprana (XFetch).

---

## CAPÍTULO 5: LANGCHAIN, GENERATIVE AI & RAG ARCHITECTURES (CORE FOR POSITION 4)

### 16. Pregunta: What is LangChain / LangGraph, and when should you use it versus direct LLM API calls?
[KEY]
LangChain provides modular abstractions for RAG, vector retrieval, and prompt chaining; LangGraph provides cyclical state machines for multi-agent workflows.

[EN]
Direct API calls using the official OpenAI, Anthropic, or Gemini SDKs are great for simple, single-turn completions. However, when building complex, enterprise AI systems, LangChain and LangGraph provide essential architectural scaffolding.

LangChain provides standardized abstractions for:
1. Document loaders and text splitters for ingestion pipelines.
2. Vector store interfaces that let you switch between pgvector, Pinecone, and Qdrant without rewriting retrieval logic.
3. Chains and Expression Language (LCEL) for streaming, asynchronous execution, and fallback models.

LangGraph builds on this by providing a cyclical, stateful graph framework. Standard LLM chains are Directed Acyclic Graphs (DAGs), meaning they run sequentially from start to finish. In real-world enterprise applications, agentic workflows require loops—such as generating code, executing tests, evaluating errors, and self-correcting in a loop until criteria are met. LangGraph models these workflows as state machines with human-in-the-loop checkpoints, persistence, and deterministic routing.

[PHO]
(ˈlæŋˌʧeɪn ˈɔfərz ˌkɒmpəˈzɪʃənəl ˈpwalɪns, waɪl ˈlæŋgræf ˈmɒdɪlz ˈsteɪtfʊl ˈeɪʤənt lupz)

[ES]
Llamar al SDK directo sirve para prompts simples. LangChain estandariza la carga de documentos, chunking, retrieval y chains con streaming. LangGraph añade máquinas de estado con ciclos y persistencia, imprescindible para agentes que necesitan reflexionar, ejecutar herramientas y auto-corregirse en bucle.

---

### 17. Pregunta: How do you design and architect a production-grade RAG (Retrieval-Augmented Generation) pipeline?
[KEY]
Ingest, chunk, embed with dense vectors, store in pgvector/Pinecone, retrieve via hybrid search (vector + BM25), rerank with Cross-Encoders, and synthesize with LLM.

[EN]
A production RAG architecture consists of two pipelines: the Ingestion Pipeline and the Query/Retrieval Pipeline.

Ingestion Pipeline:
1. Extraction: Ingest PDFs, Markdown, and DB records, cleaning whitespace and stripping boilerplate.
2. Chunking: Use semantic chunking or `RecursiveCharacterTextSplitter` with token awareness (e.g., 500 tokens with 10% overlap) to preserve context boundaries.
3. Embedding: Generate dense vector representations using models like `text-embedding-3-large`.
4. Storage: Persist vectors alongside metadata in PostgreSQL with `pgvector` or dedicated stores like Qdrant/Pinecone, indexed via HNSW.

Query & Retrieval Pipeline:
1. Query Transformation: Re-phrase or expand the user's raw prompt to optimize retrieval semantic match.
2. Hybrid Search: Query both dense vector embeddings (cosine similarity) and sparse keyword indices (BM25 or PostgreSQL `tsvector`) using Reciprocal Rank Fusion (RRF) to combine results.
3. Reranking: Pass the top 20 candidates through a Cross-Encoder reranker (such as Cohere Rerank) to select the top 4 most relevant chunks.
4. Prompt Augmentation & Guardrails: Inject retrieved context into a strict system prompt instructing the model to cite sources and explicitly refuse to hallucinate if context is insufficient.

[PHO]
(prəˈdʌkʃən ræg ˈpwalɪn: ˈtʃʌŋkɪŋ, ˈvɛktər ɪmˈbɛdɪŋz, ˈhaɪbrɪd sɜːrtʃ, ri-ˈræŋkɪŋ, ænd sɪsˈtɛmɪk ˈgɑːrdˌreɪlz)

[ES]
Una arquitectura RAG de producción tiene dos fases: Ingestión (parseo, chunking semántico de ~500 tokens con overlap, embeddings e indexación HNSW) y Recuperación (reescritura de query, búsqueda híbrida vector + BM25 con RRF, re-ranking con Cross-Encoder y prompt con guardrails estrictos contra alucinaciones).

---

### 18. Pregunta: What are the differences between HNSW and IVFFlat indexes in vector databases like pgvector?
[KEY]
IVFFlat is clustering-based and faster to build but slower at query time and requires warm-up; HNSW creates a multi-layer graph with superior query speed and recall.

[EN]
In vector search with `pgvector`, choosing the right Approximate Nearest Neighbor (ANN) indexing algorithm is critical for balancing query latency, build time, and RAM:

IVFFlat (Inverted File Flat):
- Partitions vector space into Voronoi cells using k-means clustering (`lists` parameter).
- Searches only the closest clusters (`probes` parameter).
- Pros: Fast index creation and low memory footprint.
- Cons: Slower query latency at scale, lower recall, and it requires pre-populating the table with representative data before building the index; otherwise, cluster centroids become unbalanced.

HNSW (Hierarchical Navigable Small World):
- Builds a multi-layer graph structure where upper layers have long-range links for fast traversals and bottom layers have dense local links for fine-grained accuracy.
- Parameters: `m` (maximum connections per node) and `ef_search` (size of dynamic candidate list during query).
- Pros: Extremely high query throughput, sub-10ms latency, and high recall (>95%) even on millions of vectors.
- Cons: Higher memory consumption and slower index build times.

In production microservices where user-facing p95 latency is paramount, HNSW is the preferred choice.

[PHO]
(eɪʧ-ɛn-ɛs-dʌblju ɪz ə ˈmʌlti-ˈleɪər græf wɪð ˈhaɪər rɪˈkɔːl ænd ˈloʊər ˈleɪtənsi kəmˈpɛərd tu aɪ-vi-ɛf-flæt)

[ES]
IVFFlat divide en clusters Voronoi; es rápido para indexar y usa poca RAM, pero requiere datos previos y pierde recall. HNSW crea un grafo multicapa navegable: consume más RAM al construir, pero ofrece latencias sub-10ms y recall superior al 95%, siendo el estándar para producción.

---

### 19. Pregunta: How do you mitigate hallucinations and ensure deterministic, structured outputs from LLMs?
[KEY]
Enforce Pydantic schema validation using OpenAI/Anthropic Tool Calling / Structured Outputs, strict prompt constraints, and citation verification.

[EN]
To make LLMs viable in mission-critical backend systems, we must eliminate unpredictability and hallucinations:

1. Structured Outputs with Pydantic: Instead of asking the model to return raw text or unverified JSON strings, we use OpenAI's `Structured Outputs` (JSON Schema enforcement with context-free grammars) or LangChain's `.with_structured_output(MyPydanticModel)`. The model's sampling engine is constrained at the token generation level to only emit tokens conforming to the schema.
2. Grounded System Prompts: We instruct the model: "Answer strictly based on the provided context. If the answer cannot be deduced from the text, reply 'I do not have sufficient information.' Do not extrapolate."
3. Citation & Attribution: We require the LLM to return source chunk IDs alongside each claim in its Pydantic output.
4. Programmatic Verification: Before persisting or returning data to the user, we validate domain invariants programmatically in Python. If validation fails, we trigger automated self-correction loops using LangGraph.

[PHO]
(ˈmɪtəˌgeɪt həˌluːsəˈneɪʃənz wɪð strʌkˈʧɜrd ˈaʊtpʊts, pɪˈdæntɪk ˈskiːməz, ænd ˌsɛlf-kəˈrɛkʃən lupz)

[ES]
Eliminamos alucinaciones forzando Structured Outputs con esquemas estrictos de Pydantic validados a nivel de logits/tokens, prompts de anclaje estricto que exigen citar chunks de origen, y validadores programáticos en Python que disparan reintentos automáticos si se violan reglas de negocio.

---

### 20. Pregunta: How do you build autonomous AI Agents with LangChain and the ReAct framework?
[KEY]
Agents loop through Reason (Thought) -> Act (Tool Call) -> Observe (Tool Output) until reaching the final answer, governed by strict timeouts.

[EN]
The ReAct pattern (Reasoning + Acting) enables an LLM to interact with dynamic environments through tools—such as querying a SQL database, invoking an internal REST API, or running Python calculation scripts.

The agent operates in an iterative loop:
1. Thought: The LLM analyzes the user prompt and previous conversation state to decide what action to take.
2. Action: The LLM invokes a registered tool by emitting a structured function call with arguments (e.g., `get_user_account_balance(user_id=123)`).
3. Observation: The application executes the Python function and injects the runtime return value back into the LLM's context window.
4. Reflection / Completion: The LLM observes the result. If more data is needed, it calls another tool; otherwise, it formulates the final answer.

In production, agents require strict safeguards: maximum iteration limits (`max_iterations=5`), execution timeouts, and sandboxed tool environments to prevent infinite loops, runaway API costs, or unintended database modifications.

[PHO]
(ri-ˈækt ˈeɪʤənts lup θruː θɔːt, ˈækʃən, ænd ˌɑbzərˈveɪʃən wɪð ˈstrɪkt ˈtaɪmˌaʊts)

[ES]
El patrón ReAct combina Razonamiento y Acción. El LLM genera un pensamiento, emite un llamado a una herramienta (función Python, API o DB), el backend la ejecuta y le devuelve la observación. El ciclo se repite hasta llegar a la respuesta final, protegido con límites de iteraciones (`max_iterations`) y timeouts para evitar bucles infinitos.

---

### 21. Pregunta: How do you optimize latency and cost when serving LLM-powered backend features?
[KEY]
Prompt Caching at the provider level, Semantic Caching in Redis, Model Cascading (router model -> heavy model), and token streaming via SSE.

[EN]
Optimizing production GenAI backends requires engineering for both low latency and cost efficiency:

1. Prompt Caching: Providers like Anthropic, Gemini, and OpenAI offer KV-cache reuse. By structuring prompts with static system instructions and documentation at the prefix, repeated calls reuse cached tokens, slashing cost by up to 90% and reducing time-to-first-token (TTFT) by 80%.
2. Semantic Caching with Redis / GPTCache: Instead of sending every question to the LLM, we embed incoming queries and check a vector index in Redis. If a previous identical or highly similar query (cosine similarity > 0.95) exists, we return the cached response in under 20ms.
3. Model Cascading (Tiered Routing): We deploy a fast, lightweight model (such as GPT-4o-mini, Haiku, or Gemini Flash) as an intent classifier or triage layer. If the query is simple, the small model answers directly; only complex reasoning tasks are escalated to frontier models.
4. Streaming with Server-Sent Events (SSE): We stream tokens directly to the client as they are generated using FastAPI's `StreamingResponse`, improving perceived latency to under 500ms.

[PHO]
(ˈɑptəˌmaɪz ˈleɪtənsi wɪð prɑmpt ˈkæʃɪŋ, sɪˈmæntɪk ˈkæʃɪŋ ɪn ˈrɛdɪs, ˈmɑdəl kæsˈkeɪdɪŋ, ænd ˈstriːmɪŋ)

[ES]
Optimizamos costos y latencia usando Prompt Caching (reutilización de KV-cache en el prefijo estático con -90% de costo), Caché Semántico en Redis para preguntas similares (<20ms), Cascada de Modelos (un modelo chico rutea y solo escala lo complejo) y Streaming de tokens vía SSE en FastAPI.

---

## CAPÍTULO 6: AWS & CLOUD ARCHITECTURE (POSITIONS 3 & 4)

### 22. Pregunta: How do you deploy containerized Python microservices on AWS (ECS Fargate vs EKS)?
[KEY]
ECS Fargate provides serverless container simplicity without cluster management; EKS provides enterprise-grade Kubernetes orchestration and GitOps portability.

[EN]
When deploying containerized FastAPI microservices to AWS, the choice depends on architectural complexity and team operational overhead:

AWS ECS with Fargate:
- Ideal for standalone microservices and event-driven worker tasks.
- Serverless: AWS manages the underlying EC2 instances, OS patching, and scaling.
- Seamless native integration with Application Load Balancers (ALB), AWS Secrets Manager, CloudWatch, and IAM roles for tasks.
- Low operational maintenance for development teams.

AWS EKS (Elastic Kubernetes Service):
- Ideal when the organization requires unified multi-cloud portability, complex microservices mesh (Istio/Linkerd), advanced Helm charts, and GitOps workflows (ArgoCD).
- Provides granular control over autoscaling (Horizontal Pod Autoscaler + Karpenter for node provisioning), ingress routing, and network policies.

In my work, I write cloud-agnostic Terraform modules to provision infrastructure as code, ensuring our containerized Docker workloads run seamlessly whether deployed on AWS EKS/ECS or GCP GKE/Cloud Run.

[PHO]
(i-si-ɛs ˈfɑːrˌgeɪt fɔr ˈsɜrvərləs kənˈteɪnərz; i-keɪ-ɛs fɔr ˌkjuːbərˈnɛtiːz ˈɔːrkɪˌstreɪʃən ænd ˈgɪtˌɑps)

[ES]
Para microservicios sin sobrecarga operativa, ECS Fargate es excelente porque abstrae los nodos EC2 y se integra directo con ALB e IAM. Para plataformas grandes con mallas de servicios y GitOps, EKS (Kubernetes) ofrece control total, HPA y portabilidad entre clouds mediante Terraform.

---

### 23. Pregunta: How do you design an asynchronous, decoupled event-driven architecture using AWS SQS and SNS?
[KEY]
Fan-out pattern: SNS topics broadcast events to multiple subscribing SQS queues, guaranteeing decoupled, reliable consumer processing with DLQs.

[EN]
The standard pattern for decoupled distributed communication in AWS is the SNS + SQS Fan-Out pattern:

1. Publisher: A Python microservice completes a business transaction (e.g., `OrderPlaced`) and publishes an event message to an Amazon SNS topic.
2. Fan-out: The SNS topic immediately broadcasts the message to multiple subscribing SQS queues—for example, one queue for the Inventory Service, another for Billing, and another for Email Notifications.
3. Decoupling & Durability: Each service consumes from its dedicated SQS queue at its own pace. If the Billing service undergoes maintenance or experiences a traffic spike, messages safely buffer in its SQS queue without dropping.
4. Error Handling & Dead Letter Queues (DLQ): We configure redrive policies on each SQS queue. If a worker fails to process a message after 3 retries, the message moves to an SQS Dead Letter Queue (DLQ). CloudWatch alarms notify the team, and we can inspect the failure, fix the issue, and replay messages safely without data loss.

[PHO]
(ɛs-ɛn-ɛs tu ɛs-kjuː-ɛs fæn-aʊt ˈpætərn fɔr ˌdiːˈkʌpəld ɪˈvɛnt-ˈdrɪvən ˌɑːrkəˈtɛkʧər wɪð dɛd ˈlɛtər kjuz)

[ES]
Usamos el patrón Fan-Out: el microservicio publica el evento en un topic de SNS, y SNS lo replica a múltiples colas SQS independientes (Facturación, Notificaciones, etc.). Cada consumidor procesa a su ritmo. Si un mensaje falla tras varios reintentos, va a una Dead Letter Queue (DLQ) para análisis y reprocesamiento seguro.

---

### 24. Pregunta: When would you use AWS Lambda (Serverless) versus containerized microservices on ECS/EKS?
[KEY]
Lambda for sporadic, event-driven, or bursty background tasks; ECS/EKS for sustained high-throughput APIs requiring low latency and avoiding cold starts.

[EN]
The architectural trade-off between AWS Lambda and containerized services (ECS/EKS) centers on traffic consistency, latency requirements, and execution lifecycles:

Use AWS Lambda when:
- Workloads are event-driven and intermittent (e.g., S3 file upload triggers, SQS message processing, scheduled cron jobs via EventBridge).
- Rapid auto-scaling from zero to thousands of instances is required without managing server capacity.
- Cost optimization: You only pay per millisecond of actual execution.

Use ECS / EKS Containers when:
- Serving high-traffic, continuous REST APIs where predictable sub-50ms latency is mandatory, avoiding Python cold starts (loading heavy libraries like PyTorch, Pandas, or LangChain takes seconds on Lambda).
- Workloads require long execution times (Lambda has a hard 15-minute execution limit).
- Complex shared in-memory state or background persistent WebSockets/SSE connections are required.

[PHO]
(juz ˈlæmdə fɔr spəˈrædɪk ɪˈvɛnt-ˈdrɪvən tæsks; juz ˌkjuːbərˈnɛtiːz fɔr səsˈteɪnd haɪ-ˈθruːˌpʊt eɪ-pi-aɪz)

[ES]
Lambda es ideal para cargas esporádicas orientadas a eventos (triggers de S3, crons, colas SQS) donde escalás a cero y pagás por milisegundo. Para APIs principales de alto tráfico, ECS/EKS es superior porque evita el Cold Start de librerías pesadas en Python y permite conexiones persistentes (WebSockets/SSE).

---

## CAPÍTULO 7: DEVOPS, DOCKER & KUBERNETES (CORE FOR POSITION 3)

### 25. Pregunta: How do you build production-ready Docker images for Python applications?
[KEY]
Multi-stage builds, non-root user, slim/distroless base images, `.dockerignore`, and pinning dependency hashes for security and caching.

[EN]
Creating production Docker images for Python requires optimizing for image size, build speed, and security:

1. Multi-Stage Builds: We use a `builder` stage with compilation tools (`gcc`, `build-essential`) to install wheels and dependencies into a Python virtual environment. In the final runtime stage, we copy only the compiled virtual environment into a lightweight `python:3.11-slim` or `distroless` image, discarding build dependencies and compiler toolchains.
2. Security & Non-Root Execution: Never run containers as root. We create an explicit system user and group (`appuser`), change ownership of the application directory, and switch to `USER appuser`.
3. Layer Caching: We copy `requirements.txt` or `pyproject.toml` and run `pip install` before copying application source code. This ensures Docker reuses the cached dependency layer when only code changes occur.
4. Minimal Attack Surface: We use `.dockerignore` to exclude `.git`, `__pycache__`, `.env`, tests, and local artifacts.
5. Signal Handling: We ensure the process runner properly responds to `SIGTERM` and `SIGINT` for graceful shutdowns in Kubernetes.

[PHO]
(ˈmʌlti-steɪʤ ˈdɑkər bɪldz wɪð nɑn-rut ˈjuːzər ænd slɪm ˈbeɪs ˈɪmɪʤəz)

[ES]
Usamos multi-stage builds: una etapa para compilar dependencias con herramientas de build y una etapa final limpia basada en `python:3.11-slim`. Corremos bajo un usuario sin privilegios (`appuser`, nunca root), aprovechamos el caché de capas copiando requerimientos antes del código, y aseguramos graceful shutdown con señales `SIGTERM`.

---

### 26. Pregunta: Explain Kubernetes core primitives: Pods, Deployments, Services, and Ingress.
[KEY]
Pods encapsulate containers; Deployments manage replica sets and rollouts; Services provide stable networking; Ingress manages external HTTP routing and TLS.

[EN]
These four primitives form the foundation of Kubernetes application management:

1. Pod: The smallest deployable unit in Kubernetes, wrapping one or more tightly coupled containers sharing network namespaces and storage volumes.
2. Deployment: A declarative controller that manages the desired state of Pods. It handles rolling updates, rollbacks, and self-healing (recreating crashed pods) via underlying ReplicaSets.
3. Service: An abstraction that defines a logical set of Pods and a policy to access them. Because Pod IPs are ephemeral, a Service provides a stable virtual IP and DNS name. Types include:
   - `ClusterIP`: Internal cluster-only communication (default).
   - `NodePort`: Exposes the service on each node's IP at a static port.
   - `LoadBalancer`: Provisions an external cloud load balancer (e.g., AWS Network/Application Load Balancer).
4. Ingress: Manages external HTTP/HTTPS access to services, providing SSL/TLS termination, name-based virtual hosting, and path-based routing (e.g., routing `/api/v1` to the backend service).

[PHO]
(pɑdz rʌn kənˈteɪnərz, dɪˈplɔɪmənts ˈmænɪʤ ˈroʊlaʊts, ˈsɜrvəsəz prəˈvaɪd ˈsteɪbəl aɪ-piːz, ænd ˈɪngrɛs ˈruts ˈtræfɪk)

[ES]
Un Pod aloja los contenedores; el Deployment gestiona réplicas, rollouts y auto-recuperación; el Service brinda una IP virtual interna estable con balanceo entre pods; y el Ingress gestiona la entrada externa HTTP/S con certificados TLS y ruteo por path o subdominio.

---

### 27. Pregunta: How do you configure Liveness and Readiness probes in Kubernetes for a FastAPI app?
[KEY]
Readiness probe checks dependencies (DB, Redis) before receiving traffic; Liveness probe checks basic app responsiveness without cascading failures.

[EN]
Configuring health probes correctly is vital for preventing cascading outages during high load or database hiccups:

1. Readiness Probe (`/health/ready`):
   - Determines whether the pod is ready to accept user traffic.
   - It checks vital external dependencies: Can we reach PostgreSQL? Can we ping Redis?
   - If the database is temporarily saturated, the readiness probe fails, and Kubernetes immediately removes the pod from the Service load balancer endpoints, stopping traffic to that instance without killing it.
2. Liveness Probe (`/health/live`):
   - Determines if the container process is alive or deadlocked.
   - It should be a lightweight endpoint that returns `200 OK` if the Python event loop is running.
   - CRITICAL RULE: Never check downstream databases or external services in a liveness probe! If the database slows down and liveness fails, Kubernetes will restart all your pods simultaneously, causing a catastrophic cluster-wide cascading failure (thundering herd).

[PHO]
(ˈrɛdinəs proʊb tʃɛks dɪˈpɛndənsiz fɔr ˈtræfɪk; ˈlaɪvnəs proʊb tʃɛks ɪf ðə lup ɪz əˈlaɪv wɪθˈaʊt ˈkæskeɪdɪŋ)

[ES]
La Readiness probe (`/health/ready`) valida que la app y sus dependencias (DB, Redis) estén listas antes de recibir tráfico. La Liveness probe (`/health/live`) solo valida que el proceso de Python no esté colgado; NUNCA debe consultar la base de datos externa, porque si la DB se cae, Kubernetes reiniciaría todos los pods a la vez causando un colapso total.

---

## CAPÍTULO 8: CLEAN ARCHITECTURE, DDD & SYSTEM DESIGN

### 28. Pregunta: How do you implement Clean Architecture and Domain-Driven Design (DDD) in Python?
[KEY]
Isolate pure domain entities and business rules from frameworks (FastAPI) and databases (SQLAlchemy) using ports and adapters.

[EN]
Clean Architecture (Hexagonal Architecture / Ports and Adapters) ensures the core business logic remains independent of UI, database, third-party libraries, and frameworks.

In our Python projects, we structure the application into distinct concentric layers:
1. Domain Layer: Pure Python containing Domain Entities, Value Objects, and Domain Exceptions. It has zero external dependencies—no FastAPI, no SQLAlchemy, no Pydantic. It enforces business invariants.
2. Application Layer (Use Cases): Orchestrates application workflows (e.g., `RegisterUserUseCase`). It defines "Ports"—abstract interfaces (using Python `abc.ABC` or `typing.Protocol`) for repositories and external services (e.g., `UserRepositoryProtocol`).
3. Infrastructure Layer (Adapters): Concrete implementations of ports. Here lives the SQLAlchemy `PostgresUserRepository`, Redis cache implementations, SendGrid email adapters, and AWS S3 storage adapters.
4. Presentation / API Layer: FastAPI routers and Pydantic schemas that receive HTTP requests, validate input, call Application Use Cases, and serialize outputs.

This architecture enables 100% fast unit testing of business logic without spinning up databases or mock HTTP servers.

[PHO]
(klin ˌɑrkəˈtɛkʧər ˈaɪsəleɪts ˈbɪznɪs ˈlɑʤɪk ɪn ðə doʊˈmeɪn ˈleɪər juzɪŋ pɔrts ænd əˈdæptərz)

[ES]
Clean Architecture separa la lógica de negocio pura del framework y la base de datos. El Dominio tiene entidades puras en Python sin dependencias; la capa de Aplicación define los casos de uso y los "Ports" (interfaces abstractas); y la Infraestructura implementa los adaptadores concretos (SQLAlchemy, Redis, AWS). Permite testear toda la lógica sin depender de la DB ni de FastAPI.

---

### 29. Pregunta: How do you handle distributed transactions and consistency across microservices (Saga Pattern)?
[KEY]
Two-Phase Commit doesn't scale; use the Saga Pattern (Choreography for simple, Orchestration for complex workflows) with compensating actions.

[EN]
In distributed microservices with private databases per service, traditional ACID transactions across network boundaries (like Two-Phase Commit / 2PC) fail because they introduce tight coupling, single points of failure, and lock contention.

Instead, we use the Saga Pattern—a sequence of local transactions where each service updates its own database and publishes an event or message.

There are two implementation models:
1. Choreography: Each service executes its local transaction and publishes domain events. Other services listen and react. Best for simple workflows (2-3 services).
2. Orchestration: A centralized orchestrator microservice coordinates the saga steps, sending commands to services and listening to replies. Best for complex enterprise business logic.

Compensating Transactions: If a step fails (e.g., payment fails after inventory was reserved), the Saga executes compensating transactions in reverse order (e.g., `CancelInventoryReservation`), restoring the system to a consistent state (Eventual Consistency).

[PHO]
(ðə ˈsɑːgə ˈpætərn juzɪz ˈloʊkəl trænˈzækʃənz ænd kəmˈpɛnseɪtɪŋ ˈækʃənz fɔr ɪˈvɛnʧuəl kənˈsɪstənsi)

[ES]
En microservicios no se usa 2PC por bloqueos de red. Usamos el patrón Saga: una serie de transacciones locales coordinadas por eventos (Coreografía) o por un orquestador central (Orquestación). Si un paso falla a mitad de camino, se disparan transacciones compensatorias en reversa para garantizar consistencia eventual.

---

### 30. Pregunta: How do you implement distributed tracing and observability with OpenTelemetry (OTel)?
[KEY]
Inject W3C TraceContext headers across HTTP/messaging boundaries, capturing spans with correlation IDs to track requests end-to-end.

[EN]
In microservices architectures, debugging latency bottlenecks or errors requires distributed observability across all hops. We implement OpenTelemetry (OTel) across three pillars:

1. Tracing & Context Propagation: Every incoming request receives or generates a unique `TraceID` and `SpanID` complying with W3C TraceContext standards. When FastAPI makes an outgoing HTTP request (via `httpx`) or sends an SQS message, OTel middleware injects the trace headers into the payload. Downstream consumers extract this header, continuing the trace.
2. Metrics: We export RED metrics (Rate, Errors, Duration) to Prometheus or Datadog, tracking p95/p99 endpoint latencies and database query durations.
3. Structured Logging: We format logs in JSON with embedded `trace_id` and `span_id`. When an exception occurs, engineers can take the Trace ID from Sentry or logs and visualize the exact waterfall graph in Jaeger, Instana, or AWS X-Ray, identifying whether latency occurred in our service, a database lock, or an external API call.

[PHO]
(ˌoʊpən-təˈlɛmətri prəˈvaɪdz ˈtreɪs kɑnˈtɛkst ˌprɑpəˈgeɪʃən, ˈmɛtrɪks, ænd ˈstrʌkʧɜrd ˈlɔgɪŋ)

[ES]
Implementamos OpenTelemetry propagando cabeceras W3C TraceContext en cada salto HTTP o cola de mensajería. Esto genera un `trace_id` único que viaja entre servicios y se inyecta en los logs estructurados JSON, permitiendo ver el waterfall de latencias exacto en Jaeger, Instana o AWS X-Ray cuando hay demoras o errores.

---

## CAPÍTULO 9: TESTING & QUALITY ASSURANCE

### 31. Pregunta: How do you structure test suites in Pytest to achieve high reliability and >85% coverage?
[KEY]
Follow the Testing Pyramid: fast unit tests for domain/use cases, integration tests with Testcontainers for DB/Redis, and contract tests for APIs.

[EN]
To achieve high coverage without making the test suite slow or brittle, I structure tests following the Testing Pyramid:

1. Unit Tests (70%): Pure, lightning-fast tests targeting domain entities and application use cases. We use Pytest fixtures and mock external boundaries (repositories, HTTP clients) using `unittest.mock` or `pytest-mock`. These run in seconds.
2. Integration Tests (20%): Verifying adapters against real infrastructure. Instead of mocking PostgreSQL or Redis—which often conceals syntax errors or subtle driver behavior—we use Testcontainers to spin up ephemeral Docker containers for PostgreSQL and Redis during the test run. We use `pytest-asyncio` for async session testing.
3. API Contract Tests (10%): Using FastAPI's `TestClient` (backed by `httpx.AsyncClient`) to test HTTP status codes, schema validation, and middleware behavior.
4. Fixture Governance: We define scoped fixtures in `conftest.py` (`scope="session"` for database engine setup, `scope="function"` for database rollback transactions), ensuring complete test isolation without residue.

[PHO]
(ˈstrʌkʧər ˈpaɪˌtɛst wɪð ˈjʊnɪt tɛsts, ɪntəˈgreɪʃən tɛsts juzɪŋ tɛst-kənˈteɪnərz, ænd eɪ-pi-aɪ ˈkɑntrækt tɛsts)

[ES]
Aplico la Pirámide de Testing: 70% tests unitarios puros para dominio y casos de uso (rápidos con mocks), 20% de integración probando contra PostgreSQL y Redis reales levantados en Docker con Testcontainers (`pytest-asyncio`), y 10% de contrato de API con `AsyncClient`. Aislamiento con fixtures transaccionales en `conftest.py`.

---

## CAPÍTULO 10: LEADERSHIP, BEHAVIORAL (STAR) & CIERRE

### 32. Pregunta: Tell me about a time you had a technical disagreement with a team member and how you resolved it.
[KEY]
SITUATION: Team debated microservices vs modular monolith. ACTION: Ran a timeboxed POC, documented trade-offs in an ADR, and aligned on measurable data.

[EN]
At Reforest Latam, during our architecture redesign, a senior engineer strongly advocated for immediately splitting our backend into seven independent microservices, whereas I believed that premature distribution would introduce excessive network complexity and CI/CD overhead for our six-person team.

Rather than letting it become an ideological argument, I applied the "Have Backbone; Disagree and Commit" principle anchored in data:
1. I proposed a timeboxed two-day Spike/POC where we mapped the latency overhead, inter-service contracts, and deployment complexity.
2. I authored an Architecture Decision Record (ADR) detailing the trade-offs: operational cost, team cognitive load, and network latency vs modular separation.
3. We agreed on a pragmatic middle ground: a Hexagonal Modular Monolith with strict boundary enforcement, designed so any module could be extracted into an independent microservice in under two days when scaling thresholds demanded it.

The engineer appreciated the objective, respectful evaluation, and the team shipped our core platform three weeks ahead of schedule.

[PHO]
(ˈdɪsəˌgriː ænd kəˈmɪt; juz taɪm-bɑkst pruːf ʌv ˈkɑnsɛpts ænd eɪ-di-ɑrz tu dɪˈsaɪd ɑn ˈdædə)

[ES]
Un colega quería dividir en 7 microservicios de inmediato y yo proponía modular monolith para no saturar al equipo de 6. Hicimos una POC de 2 días, documentamos los trade-offs en un ADR y acordamos un monolito modular hexagonal desacoplado, listo para extraer microservicios cuando el tráfico lo justifique. Entregamos 3 semanas antes.

---

### 33. Pregunta: Tell me about a critical production incident you resolved under pressure.
[KEY]
SITUATION: DB connection pool exhaustion during traffic spike. ACTION: Identified missing asyncpg pool tuning and rogue transactions; stabilized with PgBouncer.

[EN]
At the University of Buenos Aires, during an annual student enrollment peak with over 50,000 concurrent users, our backend API began throwing HTTP 500 errors, and database CPU spiked to 100%.

Situation: PostgreSQL was hitting its maximum connection limit (`max_connections=500`), leading to connection pool exhaustion and stalling all worker processes.

Action:
1. Immediate triage: I checked connection states in `pg_stat_activity` and identified dozens of idle-in-transaction connections caused by a background ETL script holding locks while waiting for third-party responses.
2. Immediate relief: I safely terminated the blocking idle backends using `pg_terminate_backend()` and temporarily scaled our API instances to drop failing connection attempts.
3. Root cause resolution: That same afternoon, I placed PgBouncer in transaction pooling mode between our FastAPI services and PostgreSQL, reducing active database server connections from 500 down to 40 reusable connections. Furthermore, I set strict `statement_timeout` and `idle_in_transaction_session_timeout` limits.

Result: We eliminated database saturation, p95 query latency dropped by 65%, and the enrollment process completed without further downtime.

[PHO]
(kəˈnɛkʃən pul ɪgˈzɔːstʃən rɪˈzɑlvd baɪ ˈkɪlɪŋ aɪdl bæk-ɛndz ænd ˌɪmpləˈmɛntɪŋ pi-ʤi-ˈbaʊnsər)

[ES]
Durante un pico de 50.000 usuarios en la UBA, la base saturó conexiones al 100%. Identifiqué conexiones "idle in transaction" de un ETL con `pg_stat_activity`, las terminé con `pg_terminate_backend()` y monté PgBouncer en transaction pooling, bajando de 500 a 40 conexiones reales con caída del 65% en latencia p95.

---

### 34. Pregunta: What are your salary expectations and availability?
[KEY]
$4,000 USD gross per month; availability is immediate or within standard two weeks.

[EN]
My target gross salary expectation is around $4,000 USD per month, which matches what I discussed with Angélica Rodríguez during the initial talent screening. I am open to discussing the complete compensation and benefits package offered by EPAM.

Regarding availability, I can start immediately or accommodate a standard two-week transition to ensure smooth handover of my ongoing consulting commitments.

[PHO]
(maɪ ˈtɑːrgɪt ˈsæləri ɪz fɔːr ˈθaʊzənd ˈdɑlərz gros pər mʌnθ, wɪð ɪˈmidiət əˌveɪləˈbɪləti)

[ES]
Mi pretensión salarial bruta es de 4.000 USD al mes, tal como conversé con Angélica en el screening inicial. En cuanto a disponibilidad, puedo comenzar de inmediato o con una transición estándar de dos semanas.

---

### 35. Pregunta: Do you have any questions for me? (Great Reverse Questions for Darío)
[KEY]
Ask about EPAM's architectural patterns for LLMs, deployment pipeline maturity, and engineering autonomy.

[EN]
Yes, Darío, I have a few questions about your technical roadmap and engineering practices at EPAM:

1. Regarding the Python and AI positions: Are your teams building proprietary RAG and agent architectures using custom frameworks on AWS, or is there a standardized EPAM enterprise accelerator for LLM deployment and observability?
2. How does EPAM handle technical governance and architectural decision-making between client engineering teams and EPAM's internal technical leads?
3. In this specific project, what does the CI/CD deployment cadence look like, and what are the main technical hurdles the team is aiming to solve in the next quarter?

[PHO]
(kwestʃənz əˈbaʊt i-pæmz ræg ˌɑːrkəˈtɛkʧər, ˌeɪ-aɪ ˌækˈsɛləˌreɪtərz, ænd dɪˈplɔɪmənt ˈkeɪdəns)

[ES]
Preguntas inteligentes para cerrar:
1. "¿En los proyectos de Python con IA en EPAM, desarrollan pipelines de RAG y agentes sobre frameworks propios en AWS o usan algún accelerator estandarizado?"
2. "¿Cómo gestiona EPAM la autonomía técnica y los ADRs entre el equipo de ingeniería y el cliente?"
3. "¿Cuál es la cadencia de despliegue en CI/CD del equipo y el mayor desafío técnico para el próximo trimestre?"

---

### 36. Pregunta: How have you applied LLMs and AI to software development workflows, such as code generation or automated PR reviews?
[KEY]
Built automated CI/CD review agents using LangChain and AST parsing to audit PR diffs for security, linting, and test generation.

[EN]
Beyond user-facing AI products, I actively leverage LLMs to optimize our engineering lifecycle. At Reforest Latam and in my consulting work, I engineered an automated GitHub Actions PR review agent:
1. Diff Extraction: When a PR is opened, the action extracts the git diff along with modified AST nodes.
2. Static Analysis Guard: We first run Ruff, MyPy, and Bandit so the LLM doesn't waste tokens on basic formatting or obvious linting errors.
3. LLM Audit with Strict Context: We feed the remaining diff alongside our internal ADR guidelines and Pydantic schemas into an LLM using few-shot prompt templates.
4. Targeted Feedback: The model comments directly on GitHub lines, flagging anti-patterns (such as missing index hints, unhandled edge cases, or SQL injection vectors) and automatically drafting Pytest test cases. This reduced code review cycle time by 40%.

[PHO]
(eɪ-aɪ fɔːr koʊd ˌd͡ʒɛnəˈreɪʃən ænd pi-ɑːr rɪˈvjuːz)

[ES]
Creé agentes de CI/CD en GitHub Actions que auditan diffs de PRs combinando análisis estático (Ruff/Bandit) con LLMs para detectar vulnerabilidades, validar ADRs y auto-generar tests en Pytest, acelerando las revisiones un 40%.

---

### 37. Pregunta: How do Python Context Managers work under the hood, and how do you implement asynchronous context managers?
[KEY]
Context managers implement `__enter__` and `__exit__` (or `__aenter__`/`__aexit__`) to guarantee deterministic resource cleanup even on unhandled exceptions.

[EN]
Context managers govern runtime resource allocation and deallocation through the `with` statement. Under the hood, entering the block calls `__enter__()` and assigns its return value to the `as` variable. Exiting the block invokes `__exit__(exc_type, exc_val, exc_tb)`. If an exception occurred inside the block, `__exit__` receives the traceback information; if it returns `True`, it swallows the exception; otherwise, the exception propagates.
For asynchronous workflows—such as acquiring an `asyncpg` database connection, a Redis distributed lock, or an `httpx.AsyncClient` session—we implement the asynchronous context manager protocol: `__aenter__()` and `__aexit__()`, or use `@contextlib.asynccontextmanager`. This guarantees that socket connections and transactions are cleanly rolled back or returned to the connection pool even if a network timeout occurs mid-request.

[PHO]
(ˈkɑntɛkst ˈmænəʤərz ˈgærənˌtiː rɪˈsɔrs ˈklinʌp vaɪə ˈɛntər ænd ˈɛgzɪt)

[ES]
Los context managers gestionan recursos garantizando cierre seguro con `__enter__` y `__exit__`. En entornos asíncronos usamos `__aenter__` y `__aexit__` o `@asynccontextmanager` para asegurar que conexiones a PostgreSQL o locks en Redis se liberen siempre, aun ante errores no controlados.

---

### 38. Pregunta: What is the "mutable default arguments" gotcha in Python, and how do you prevent it?
[KEY]
Default arguments are evaluated once at function definition time, not runtime. Mutable defaults (`[]`, `{}`) persist state across invocations. Use `None` as sentinel.

[EN]
In Python, default parameter expressions are evaluated once when the function definition is executed (at compile/module load time), not each time the function is called.
If you define `def add_item(item, target_list=[])`, the list is instantiated in memory once. Subsequent calls without passing `target_list` mutate that exact same shared list object across requests, creating severe concurrency bugs and memory leakage.
The standard idiom is to use `None` as a sentinel default value:
`def add_item(item, target_list: list | None = None):`
`    if target_list is None: target_list = []`
In Pydantic v2 and FastAPI, we enforce `Field(default_factory=list)` to guarantee a fresh instance is constructed for every incoming validation cycle.

[PHO]
(ˈmjuːtəbəl ˈdɪfɔlt ˈɑrgjəmənts ɑr ˌɪnstænʃiˈeɪtɪd wʌns æt dɛfɪˈnɪʃən taɪm; juz nʌn æz ə ˈsɛntɪnəl)

[ES]
Los argumentos por defecto mutables (`[]` o `{}`) se evalúan una sola vez al cargar la función, compartiendo estado entre llamadas. La solución estándar es usar `None` como centinela (`target_list = None`) e inicializar dentro, o usar `default_factory=list` en Pydantic.

---

### 39. Pregunta: How is Python's `dict` implemented internally, and how does it achieve O(1) lookups and memory compaction?
[KEY]
Hash table with open addressing and perturbation probing. Since Python 3.7, it uses a compact array layout preserving insertion order with ~30% less RAM.

[EN]
Python dictionaries are hash tables optimized for speed and memory efficiency.
When a key is inserted, Python computes its hash using `hash(key)` and maps it to an index in a sparse table. To resolve collisions, Python uses open addressing with a perturbation pseudo-random probing sequence: `j = ((5*j) + 1 + perturb) % size`.
Since Python 3.6 (and guaranteed in 3.7+), dicts use a split compact layout:
1. A dense array storing `[hash, key_ptr, value_ptr]` consecutively in the order inserted.
2. A sparse hash table containing small integer indices pointing into the dense array.
This design reduced memory consumption by roughly 30% to 40% while preserving insertion order by default. Lookup, insertion, and deletion maintain amortized O(1) time complexity.

[PHO]
(dɪkts juz hæʃ ˈteɪbəlz wɪð ˈoʊpən əˈdrɛsɪŋ ænd kəmˈpækt ˈmɛməri ˈleɪaʊt)

[ES]
Los diccionarios usan tablas hash con direccionamiento abierto y resolución de colisiones por perturbación. Desde Python 3.7 tienen un diseño compacto (tabla densa ordenada + tabla dispersa de índices) que ahorra 30-40% de RAM y preserva el orden de inserción con complejidad O(1) amortizada.

---

### 40. Pregunta: How does Python resolve multiple inheritance, and what is MRO (Method Resolution Order)?
[KEY]
Python uses the C3 Linearization algorithm to determine method resolution order (`cls.mro()`), preventing the diamond problem.

[EN]
Python supports multiple inheritance. When a class inherits from multiple parents and an attribute or method is called, Python determines the search path using Method Resolution Order (MRO), accessible via `ClassName.mro()` or `__mro__`.
Since Python 2.3, Python employs the C3 Linearization algorithm. C3 guarantees three critical properties:
1. Consistency: Subclasses appear before parents.
2. Monotonicity: The relative order of parent classes in the inheritance definition is preserved.
3. Deterministic resolution of the classic "Diamond Problem" (where class D inherits from B and C, both inheriting from A).
Always use `super().__init__()` instead of calling `BaseClass.__init__(self)` explicitly, ensuring cooperative multi-inheritance where every class in the MRO chain is invoked exactly once.

[PHO]
(ɛm-ɑr-oʊ juzəz si-θriː ˌlɪniəraɪˈzeɪʃən tu rɪˈzɑlv ˈdɑɪəmənd ˌmʌlti-ɪnˈhɛrɪtəns)

[ES]
Python resuelve herencia múltiple usando el algoritmo de linealización C3, que define el orden de búsqueda (`__mro__`) y evita el problema del diamante. Siempre se debe invocar `super()` para que la cadena de herencia cooperativa se ejecute ordenadamente una sola vez.

---

### 41. Pregunta: How do you implement secure authentication and authorization in FastAPI microservices?
[KEY]
Stateless short-lived JWT access tokens (15m) + rotating refresh tokens stored in HTTP-only Secure SameSite cookies with Redis blacklist.

[EN]
In distributed FastAPI microservices, we implement OAuth2 with Password Grant or OpenID Connect (OIDC):
1. Access Tokens: Short-lived (15 minutes), signed using asymmetric RS256 (private key signs on auth service, public keys verify on API microservices without database lookups). The token payload contains user identity and RBAC roles/scopes.
2. Refresh Tokens: Long-lived (7 to 30 days), stored in an `HttpOnly`, `Secure`, `SameSite=Strict` cookie to prevent Cross-Site Scripting (XSS) exfiltration.
3. Token Rotation & Revocation: Every time a refresh token is used, it is invalidated and replaced with a new one. We maintain a Redis blacklist/revocation set so users can log out immediately across all active devices.
4. Authorization: FastAPI dependencies (`Security(check_permissions)`) enforce Role-Based Access Control (RBAC) declaratively before entering the endpoint handler.

[PHO]
(sɪˈkjʊr ˌɔːθən-tɪˈkeɪʃən juzɪŋ ˈæksɛs ˈtoʊkənz, rɪˈteɪtɪŋ ˈrifrɛʃ ˈtoʊkənz, ænd ˌeɪʧ-ti-ti-pi ˈoʊnli ˈkʊkiz)

[ES]
Implementamos OAuth2 con JWT asimétrico (RS256) de vida corta (15 min) para verificación stateless entre microservicios, más refresh tokens rotativos guardados en cookies `HttpOnly`, `Secure` y `SameSite=Strict`. Para revocación inmediata mantenemos listas de revocación en Redis y validamos RBAC con `Security()` en FastAPI.

---

### 42. Pregunta: How do you integrate a FastAPI backend with a modern React frontend in high-performance applications?
[KEY]
Strict OpenAPI TypeScript contract generation, SSE/WebSockets for real-time streaming, CORS origin whitelisting, and optimistic UI updates.

[EN]
Integrating FastAPI with a modern React frontend requires optimizing for contract consistency and latency:
1. Type Safety & API Contracts: We export FastAPI's OpenAPI schema into TypeScript types using `openapi-typescript` or `orval`. This guarantees complete end-to-end type safety: if a backend schema changes, TypeScript flags compilation errors in React before runtime.
2. Real-Time Streaming: For AI generation, chat, and live telemetry, we avoid polling. We stream data using Server-Sent Events (SSE) via FastAPI's `StreamingResponse`, consumed in React via native `EventSource` or `fetch-event-source` into custom hooks.
3. Security & CORS: We configure FastAPI's `CORSMiddleware` with explicit origin whitelists (never `allow_origins=["*"]` when `allow_credentials=True`), ensuring secure cookie transport.
4. State & Caching: We use TanStack Query (React Query) in React to handle client-side caching, background revalidation, and optimistic updates.

[PHO]
(fɑst-eɪ-pi-aɪ tu riˈækt ˌɪntəˈgreɪʃən wɪð taɪp-skrɪpt ˈkɑntrækts ænd ɛs-ɛs-i ˈstriːmɪŋ)

[ES]
Integramos FastAPI con React generando tipos de TypeScript automáticamente desde OpenAPI para sincronización de contratos. Para IA y telemetría usamos streaming por Server-Sent Events (SSE) con hooks de React, configuramos `CORSMiddleware` con orígenes explícitos seguros y gestionamos caché cliente con TanStack Query.

---

### 43. Pregunta: How would you design a scalable document processing and RAG pipeline on AWS handling 100,000 documents per day?
[KEY]
Event-driven architecture: S3 upload -> SQS -> Celery/ECS worker -> Chunk & Embed -> pgvector/OpenSearch -> CloudWatch observability.

[EN]
To ingest and index 100,000 documents daily on AWS without latency spikes:
1. Ingestion Layer: Documents upload directly to Amazon S3 via presigned URLs. S3 triggers an event notification to an Amazon SQS queue.
2. Scalable Workers: Worker instances running on AWS ECS Fargate or EKS consume tasks from SQS. We use Celery or native async workers with auto-scaling triggered by SQS queue depth (AWS CloudWatch metric `ApproximateNumberOfMessagesVisible`).
3. Processing & Chunking: Workers extract text (using pdfplumber or OCR), run semantic chunking (500 tokens with 10% overlap), and generate batch embeddings using OpenAI or AWS Bedrock.
4. Storage & Indexing: Embeddings are written in batches to Amazon Aurora PostgreSQL (with `pgvector` and HNSW index) or Amazon OpenSearch Service.
5. Error Handling & DLQ: Failed documents are retried with exponential backoff and sent to an SQS Dead Letter Queue (DLQ) for alerting.
6. Query API: A FastAPI microservice handles user questions using hybrid search (vector + BM25) and returns answers in <2 seconds.

[PHO]
(sɪsˈtɛm dɪˈzaɪn: ɛs-θriː, ɛs-kjuː-ɛs, i-si-ɛs ˈwɜrkərz, ænd ˈɔːrərə pi-ʤi-ˈvɛktər)

[ES]
Subida directa a S3 con URLs prefirmadas -> evento a cola SQS -> autoscaling de workers en ECS Fargate según volumen de SQS -> chunking semántico y embeddings en lote -> almacenamiento en Aurora PostgreSQL con `pgvector` (HNSW) o OpenSearch. Manejo de fallas con DLQ y API de consulta en FastAPI con búsqueda híbrida.
