# Informe de Entrevista — EPAM Systems (Puesto: Senior Python Engineer)

### 1. Pregunta: When would you use asyncio vs threading vs multiprocessing in Python?

[EN]
I select the concurrency model based on whether the bottleneck is I/O-bound or CPU-bound, keeping Python's GIL in mind.
- **Asyncio:** My default for I/O-bound microservices and REST APIs (like FastAPI). It uses a single-threaded cooperative event loop with zero thread context-switching overhead, easily handling thousands of concurrent connections.
- **Threading:** Used for legacy I/O-bound tasks or blocking C-extensions that release the GIL. However, preemptive context-switching introduces race conditions that require explicit locking mechanisms.
- **Multiprocessing / Celery:** For CPU-bound workloads (such as cryptographic operations, heavy data transformations, or ML inference). It spawns separate OS processes with dedicated Python interpreters and distinct memory spaces, fully bypassing the GIL.

[PHO]
(aɪ tʃuz ðə kənˈkɜrənsi ˈmɑdəl beɪst ɑn ˈwɛðər ðə ˈbɑtəlˌnɛk ɪz aɪ-oʊ baʊnd ɔr si-pi-ju baʊnd)

[ES]
Asyncio para APIs y alto I/O concurrente en un solo hilo; Threading para I/O con librerías legacy; Multiprocessing/Celery para tareas pesadas de CPU evadiendo el GIL mediante procesos independientes.

---

### 2. Pregunta: What is the GIL, why does it matter, and how do you handle it in production?

[EN]
The GIL (Global Interpreter Lock) is a mutex in CPython that prevents multiple native threads from executing Python bytecode simultaneously, ensuring thread-safe reference counting.
- **Impact:** It means pure Python CPU-intensive tasks gain no speedup from multithreading on multi-core CPUs.
- **Production Workarounds:** In production at Reforest Latam and enterprise APIs, we bypass the GIL by scaling horizontally with multiple worker processes via Gunicorn/Uvicorn, offloading heavy processing to Celery workers, or leveraging C-accelerated extensions like NumPy and uvloop.

[PHO]
(ðə dʒi-aɪ-ɛl ɪz ə ˈmjuˌtɛks ɪn si-ˈpaɪˌθɑn ðæt priˈvɛnts ˈmʌltəpəl ˈneɪtɪv θrɛdz frəm ɛksəˈkjutɪŋ baɪtkoʊd saɪməlˈteɪniəsli)

[ES]
El GIL es un mutex en CPython que asegura que solo un hilo ejecute bytecode a la vez. En producción lo resolvemos usando múltiples workers con Gunicorn/Uvicorn y colas Celery en procesos separados.

---

### 3. Pregunta: Can you explain the difference between shallow copy and deep copy with a nested example?

[EN]
The fundamental difference lies in how nested compound objects are stored in memory.
- **Shallow Copy (`copy.copy()` or slicing):** Constructs a new container object, but inserts references to the original nested elements. Modifying a nested mutable object (like a list inside a dict) affects both copies.
- **Deep Copy (`copy.deepcopy()`):** Recursively creates completely independent copies of both the outer container and all nested objects, preventing side effects.
- **Production Tip:** In APIs, I prefer immutable structures or Pydantic `model_copy(deep=True)` to avoid accidental state mutation across async handlers.

[PHO]
(ðə ˌfʌndəˈmɛntəl ˈdɪfərəns laɪz ɪn haʊ ˈnɛstəd kɑmˈpaʊnd ˈɑbdʒɛkts ɑr ˈhændəld ɪn ˈmɛməri)

[ES]
Shallow copy crea un nuevo contenedor pero copia las referencias de los objetos anidados; Deep copy clona recursivamente toda la jerarquía en posiciones de memoria independientes.

---

### 4. Pregunta: What are common pitfalls with mutable default arguments and late binding in closures?

[EN]
Both issues stem from Python evaluating expressions at definition time rather than execution time.
- **Mutable Defaults:** Default arguments like `def append_to(item, target=[])` are evaluated once when the function is defined. That same list instance is shared across all subsequent invocations. The fix is using `target=None` and assigning `target = []` inside the function.
- **Late Binding in Closures:** In loops creating lambdas or closures, variables are looked up by name at call time, not definition time. To freeze the current value, we bind it immediately as a default argument: `lambda x, i=i: x + i`.

[PHO]
(boʊθ ˈɪʃuz stɛm frəm ˈpaɪˌθɑn ɪˈvæljuˌeɪtɪŋ ɪkˈsprɛʃənz æt ˌdɛfəˈnɪʃən taɪm)

[ES]
Los argumentos mutables por defecto se evalúan una sola vez al definir la función; se soluciona usando `None`. En closures y lambdas dentro de loops, las variables se buscan al ejecutarse; se congela el valor usando argumentos por defecto.

---

### 5. Pregunta: What is the difference between list comprehensions and generator expressions, and when would you choose each?

[EN]
The key trade-off is memory footprint versus random access and execution speed.
- **List Comprehension (`[...]`):** Evaluates eagerly, creating the entire list in memory immediately. Ideal when data is small, when you need indexing, len(), or multiple iterations over the dataset.
- **Generator Expression (`(...)`):** Evaluates lazily using the iterator protocol (`__iter__`, `__next__`), yielding one item at a time. Essential for streaming large datasets, file ingestion, or database cursor streams to maintain an $O(1)$ memory footprint.

[PHO]
(ðə ki treɪd-ɔf ɪz ˈmɛməri ˈfʊtˌprɪnt ˈvɜrsəs ˈrændəm ˈækˌsɛs ænd ˌɛksəˈkjuʃən spid)

[ES]
List comprehension evalúa todo en memoria de forma inmediata; Generators evalúan perezosamente elemento por elemento ($O(1)$ memoria), ideal para streaming de datos y grandes volúmenes.

---

### 6. Pregunta: How do context managers work and how do you write a custom one for timing or DB sessions?

[EN]
Context managers ensure deterministic resource acquisition and release via the context management protocol (`__enter__` and `__exit__`), guaranteeing cleanup even if exceptions occur.
- **Class Implementation:** Define `__enter__` to allocate resources (or start timers) and `__exit__(exc_type, exc_val, exc_tb)` to guarantee cleanup, return True if suppressing exceptions.
- **Generator Approach (`@contextmanager`):** In `contextlib`, write a generator where code before `yield` acts as `__enter__`, and code in `finally` acts as `__exit__`. We use this extensively for database transaction scopes and profiling blocks.

[PHO]
(ˈkɑntɛkst ˈmænədʒərz ɛnˈʃʊr ˌdɪˌtɜrməˈnɪstɪk riˈsɔrs əˌkwɪˈzɪʃən ænd rɪˈlis)

[ES]
Manejan recursos garantizando limpieza determinística con `__enter__` y `__exit__` o `@contextmanager` con bloques `try...finally`. Lo uso para sesiones de SQLAlchemy y medición de tiempos.

---

### 7. Pregunta: How do Python decorators work under the hood and why is functools.wraps essential?

[EN]
A decorator is a higher-order function that accepts a callable as an argument and returns a modified wrapper function without altering the original source code.
- **Execution:** `@my_decorator` syntax is syntactic sugar for `func = my_decorator(func)`.
- **`@functools.wraps`:** Essential in production because wrapper functions overwrite the original function's metadata (`__name__`, `__doc__`, `__annotations__`). `wraps` preserves introspection, docstrings, and debugging stack traces, which is critical for OpenAPI generation and APM tools.

[PHO]
(eɪ ˈdɛkəˌreɪtər ɪz eɪ ˈhaɪər-ˈɔrdər ˈfʌŋkʃən ðæt ækˈsɛpts eɪ ˈkɔləbəl æz ən ˈɑrgjəmənt)

[ES]
Un decorador toma una función y devuelve un wrapper enriquecido (`func = dec(func)`). `@functools.wraps` es indispensable para no perder los metadatos originales (`__name__`, `__doc__`) en APIs y APMs.

---

### 8. Pregunta: What is the LEGB rule in Python and how do closures work?

[EN]
LEGB defines Python's exact scope resolution order: **Local → Enclosing → Global → Built-in**.
- **Local:** Names assigned inside the current function.
- **Enclosing:** Names in the local scope of any enclosing functions (outer functions in nested definitions).
- **Global:** Names assigned at the top-level of the module.
- **Built-in:** Pre-assigned built-in names (`len`, `range`, `ValueError`).
- **Closures:** A closure occurs when an inner function retains access to variables from its enclosing scope even after the outer function has finished execution. We use `nonlocal` if we need to rebind an enclosing variable.

[PHO]
(ɛl-i-dʒi-bi dɪˈfaɪnz ˈpaɪˌθɑnz ɪgˈzækt skoʊp ˌrɛzəˈluʃən ˈɔrdər: ˈloʊkəl, ɛnˈkloʊzɪŋ, ˈgloʊbəl, ænd ˈbɪlt-ɪn)

[ES]
LEGB es el orden de resolución de variables en Python (Local, Enclosing, Global, Built-in). Un closure permite a una función interna recordar variables de su ámbito envolvente aun cuando la función externa ya retornó.

---

### 9. Pregunta: How do you design custom exception hierarchies and when should you catch vs propagate?

[EN]
I structure exception handling around predictability, domain boundaries, and actionable error reporting.
- **Custom Hierarchy:** Always inherit from a single base domain exception (`class DomainError(Exception): pass`) to allow callers to catch all service-specific errors in a single except clause.
- **Catch vs Propagate:** Only catch exceptions if you can handle them, enrich them with context, or translate low-level technical errors into domain exceptions using exception chaining (`raise CustomDomainError(...) from err`).
- **Antipatterns:** Never use bare `except:` or catch `BaseException`, as it catches `KeyboardInterrupt` and `SystemExit`. Always log full stack traces with structured context.

[PHO]
(aɪ ˈstrʌktʃər ɪkˈsɛpʃən ˈhændlɪŋ əˈraʊnd prɪˌdɪktəˈbɪləti, doʊˈmeɪn ˈbaʊndəriz, ænd ˈækʃənəbəl ˈɛrər rɪˈpɔrtɪŋ)

[ES]
Crear una clase base de error para el dominio (`DomainError`). Solo capturar si se puede recuperar o enriquecer con `raise DomainError from err`. Nunca usar `except:` genérico ni atrapar `BaseException`.

---

### 10. Pregunta: What are the trade-offs between list, deque, set, dict, and tuple in Python?

[EN]
Choosing the optimal data structure depends on access patterns, mutability, and Big-O time complexity.
- **`list`:** Dynamic array with $O(1)$ amortized append and index lookup, but $O(N)$ for insertions or deletions at the beginning.
- **`collections.deque`:** Doubly-linked list with $O(1)$ fast appends and pops from both ends, ideal for queues and sliding windows.
- **`set` & `dict`:** Hash tables with $O(1)$ average lookup, insert, and delete. Requires hashable elements and has higher memory overhead.
- **`tuple`:** Immutable sequence with lower memory overhead and fixed size, used for data integrity and as dictionary keys.

[PHO]
(ˈtʃuzɪŋ ðə ˈɑptəməl ˈdeɪtə ˈstrʌktʃər dɪˈpɛndz ɑn ˈækˌsɛs ˈpætərnz ænd bɪg-oʊ taɪm kəmˈplɛksəti)

[ES]
`list` tiene $O(1)$ al final pero $O(N)$ al inicio; `deque` ofrece $O(1)$ en ambos extremos; `set`/`dict` dan $O(1)$ promedio para búsquedas por hash; `tuple` es inmutable y liviana en memoria.

---

### 11. Pregunta: Which utilities from collections, itertools, and functools do you use most in production?

[EN]
I leverage Python's standard library to write clean, idiomatic, and high-performance code:
- **`collections`:** `defaultdict` (eliminates key existence checks), `Counter` (frequency analysis in $O(N)$), and `deque` (fixed-length buffer with `maxlen`).
- **`itertools`:** `chain.from_iterable()` (flattening nested iterables without memory copy), `groupby()` (batch processing sorted streams), and `islice()` (slicing generators).
- **`functools`:** `lru_cache` / `cache` (memoization with $O(1)$ lookup for deterministic pure functions), and `partial` (freezing arguments for callback interfaces).

[PHO]
(aɪ ˈlɛvərɪdʒ ˈpaɪˌθɑnz ˈstændərd ˈlaɪˌbrɛri tu raɪt klin, ˌɪdiəˈmætɪk, ænd haɪ-pərˈfɔrməns koʊd)

[ES]
Uso `defaultdict` y `Counter` de `collections`; `chain` y `groupby` de `itertools` para procesar streams sin cargarlos en memoria; y `lru_cache` y `partial` de `functools` para caching y callbacks.

---

### 12. Pregunta: When would you choose dataclasses vs Pydantic v2 vs plain classes in Python?

[EN]
I select the data representation based on validation requirements and architectural boundaries:
- **Pydantic v2 (Rust-backed core):** My primary choice at system boundaries (REST request/response payloads, configuration loading, environment variables) where strict type parsing, coercion, and validation errors are required.
- **Dataclasses (`@dataclass`):** For internal domain models, DTOs, and clean architecture value objects where data is already trusted and zero external dependencies is desired.
- **Plain Classes:** Reserved for behavioral domain entities with complex custom encapsulation, lifecycle methods, or ORM mapped tables (like SQLAlchemy 2.0 DeclarativeBase).

[PHO]
(aɪ səˈlɛkt ðə ˈdeɪtə ˌrɛprɪzɛnˈteɪʃən beɪst ɑn ˌvæləˈdeɪʃən rɪˈkwaɪərmənts ænd ˌɛksəˈkjuʃən ˈbaʊndəriz)

[ES]
Pydantic v2 en las fronteras de entrada/salida de la API para validación estricta; dataclasses para DTOs y value objects internos con datos ya confiables; plain classes para entidades de dominio con comportamiento.

---

### 13. Pregunta: How do you design your test suites with Pytest and what are your guidelines for mocking?

[EN]
I follow the Testing Pyramid with a strong emphasis on integration confidence and deterministic test suites under TDD.
- **Fixtures & Scope:** Use modular fixtures (`session`, `module`, `function`) for reusable test setups (e.g., async test database containers with testcontainers).
- **Parametrization:** Leverage `@pytest.mark.parametrize` to exhaustively test edge cases and boundary inputs without repeating boilerplate.
- **Mocking Boundaries:** I only mock external network boundaries (payment gateways, third-party APIs) using `respx` or `pytest-mock`. I avoid mocking internal domain logic and database layers to ensure real integration fidelity.

[PHO]
(aɪ ˈfɑloʊ ðə ˈtɛstɪŋ ˈpɪrəmɪd wɪð eɪ strɔŋ ˈɛmfəsəs ɑn ˌɪntəˈgreɪʃən ˈkɑnfədəns)

[ES]
Uso fixtures modulares con scope controlado, parametrizo casos límite con `@pytest.mark.parametrize` y solo mockeo límites externos (HTTP/APIs de terceros) evitando mockear la lógica de dominio interna.

---

### 14. Pregunta: How do you investigate and resolve a performance bottleneck or memory leak in production Python?

[EN]
I follow a structured methodology: **Reproduce → Measure → Isolate → Optimize → Prevent Regressions**.
- **1. Telemetry & Observability:** Check distributed traces in OpenTelemetry/APM and structured logs with correlation IDs to locate high p95/p99 latency spans.
- **2. Profiling:** Use `cProfile` and `py-spy` for CPU bottlenecks, or `tracemalloc` and `memray` for memory leaks and uncollected object references.
- **3. Root Cause:** In backend services, 80% of issues stem from database N+1 queries, unindexed filters, or blocking sync calls inside async event loops.
- **4. Prevention:** Add regression tests in Pytest and benchmark assertions in CI before deploying.

[PHO]
(aɪ ˈfɑloʊ eɪ ˈstrʌktʃərd ˌmɛθəˈdɑlədʒi: ˌriprəˈdus, ˈmɛʒər, ˈaɪsəˌleɪt, ˈɑptəˌmaɪz, ænd ˈvɛrəˌfaɪ)

[ES]
Metodología estructurada: Observabilidad con OpenTelemetry, profiling con `py-spy`/`cProfile`, detección de N+1 queries en base de datos o llamadas bloqueantes en async, y tests de regresión con Pytest.

---

### 15. Pregunta: What are the main pitfalls in async Python and how do you handle timeouts and cancellation?

[EN]
Writing robust asynchronous Python requires understanding event loop non-blocking mechanics and cancellation semantics:
- **Never Block the Event Loop:** Running sync CPU-heavy or blocking I/O calls (`time.sleep`, `requests.get`) freezes the entire event loop. Offload them to threads using `asyncio.to_thread()`.
- **Timeouts & Cancellation:** Always wrap remote calls in `asyncio.wait_for()` or `asyncio.timeout()` (Python 3.11+).
- **Graceful Cleanup:** When a task is cancelled, it raises `asyncio.CancelledError`. Always ensure resource release using `try...finally` blocks or `async with` context managers.

[PHO]
(ˈraɪtɪŋ roʊˈbʌst eɪˈsɪŋkrənəs ˈpaɪˌθɑn rɪˈkwaɪərz ˌʌndərˈstændɪŋ ɪˈvɛnt lup nɑn-ˈblɑkɪŋ mɪˈkænɪks)

[ES]
Nunca bloquear el event loop con llamadas sincrónicas (usar `asyncio.to_thread`). Envolver llamadas remotas en `asyncio.timeout()` y capturar `asyncio.CancelledError` con `try...finally` para limpieza segura de recursos.

---

### 16. Pregunta: How do you structure a production-grade Python microservice using Clean Architecture?

[EN]
I structure services using Clean / Hexagonal Architecture with unidirectional dependency flow inward:
- **Domain Layer:** Pure Python business entities, value objects, and domain exceptions with zero external framework dependencies.
- **Application Layer (Use Cases):** Service orchestration, business rules, and interface ports (abstract base classes / protocols for repositories).
- **Infrastructure Layer (Adapters):** Concrete implementations of ports: SQLAlchemy 2.0 async repositories, Redis caches, Cloud Pub/Sub publishers, and external HTTP clients.
- **Presentation Layer:** FastAPI routers, Pydantic v2 request/response schemas, middleware, and dependency injection.
- **Benefits:** Complete decoupling, fast unit testing without spin-up of infrastructure, and easy technology swappability.

[PHO]
(aɪ ˈstrʌktʃər ˈsɜrvəsəz ˈjuzɪŋ klin ɔr hɛkˈsægənəl ˈɑrkəˌtɛktʃər wɪð ˌjunədəˈrɛkʃənəl dɪˈpɛndənsi floʊ ˈɪnwərd)

[ES]
Arquitectura Limpia / Hexagonal: Dominio puro sin dependencias externas; Casos de uso con interfaces (Protocol/ABC); Infraestructura con adaptadores (SQLAlchemy, Redis); y capa de presentación con FastAPI y Pydantic v2.

---

### 17. Pregunta: How do you eliminate N+1 query bottlenecks and manage connection pooling in SQLAlchemy 2.0 async?

[EN]
In SQLAlchemy 2.0 with `asyncpg`, N+1 queries occur when relationships are lazy-loaded across multiple rows in an async context.
- **Eager Loading Strategies:** I use `selectinload()` for 1-to-many relationships (issues a single secondary `WHERE IN` query) and `joinedload()` for many-to-1 relationships (generates an explicit `LEFT OUTER JOIN`).
- **Connection Pooling:** We configure `create_async_engine` with `pool_size=20`, `max_overflow=10`, `pool_pre_ping=True` (to drop stale connections), and place PgBouncer in transaction mode in front of PostgreSQL for horizontal microservice scaling.
- **Async Session Lifecycle:** Scoped per HTTP request via FastAPI dependency injection with automatic commit/rollback in an `async with` block.

[PHO]
(ɪn ˌɛskjuˌɛl-ˈælkəmi tu-pɔɪnt-oʊ wɪð eɪ-sɪŋk-pi-dʒi, ɛn-plʌs-wʌn ˈkwɪriz əˈkɜr wɛn riˈleɪʃənˌʃɪps ɑr ˈleɪzi-ˈloʊdəd)

[ES]
Uso `selectinload` para relaciones 1-a-N y `joinedload` para N-a-1. Configuro connection pooling con `pool_pre_ping=True`, PgBouncer y sesiones asíncronas acotadas por request en FastAPI.

---

### 18. Pregunta: How do you design event-driven microservices on Google Cloud Platform with Cloud Run and Pub/Sub?

[EN]
At Reforest Latam and enterprise systems, I design event-driven architectures around loose coupling and idempotency:
- **Ingestion & Publishing:** FastAPI microservices on Cloud Run authenticate via IAM Workload Identity and publish telemetry events to GCP Cloud Pub/Sub topics with message attributes.
- **Asynchronous Consumption:** Background worker microservices or Celery workers subscribe with Dead Letter Queues (DLQs) and exponential backoff retry policies.
- **Idempotency:** Every message carries a unique `idempotency_key` (UUID v4) stored with TTL in Redis to prevent duplicate processing during network retries.

[PHO]
(aɪ dɪˈzaɪn ɪˈvɛnt-ˈdrɪvən ˈɑrkəˌtɛktʃərz əˈraʊnd lus ˈkʌplɪŋ ænd aɪˈdɛmpoʊtənsi)

[ES]
Microservicios en Cloud Run publican eventos a Cloud Pub/Sub; workers asíncronos consumen con Dead Letter Queues y control de idempotencia mediante claves únicas almacenadas en Redis con TTL.

---

### 19. Pregunta: How do you implement Vector Search and RAG with Python, pgvector, and Vertex AI / Bedrock?

[EN]
For GenAI and retrieval-augmented generation (RAG) platforms:
- **Embeddings Pipeline:** Ingest documents, chunk them using semantic text splitters, generate embeddings via Vertex AI / OpenAI embeddings API, and store vector representations directly in PostgreSQL using `pgvector`.
- **Similarity Search:** Query using cosine distance (`<=>`) or inner product (`<#>`) with HNSW (Hierarchical Navigable Small World) indexes for $O(\log N)$ sub-millisecond similarity retrieval.
- **RAG Generation:** Pass the top-$k$ context chunks into the LLM system prompt with strict grounding constraints and source attribution to eliminate hallucinations.

[PHO]
(fɔr dʒɛn-eɪ-aɪ ænd ræg ˈplætˌfɔrmz, aɪ ˈdʒɛnəˌreɪt ɛmˈbɛdɪŋz ænd stɔr ðɛm ɪn poʊst-grɛs-ɛskju-ɛl ˈjuzɪŋ pi-dʒi-ˈvɛktər)

[ES]
Pipeline RAG: Fragmentación semántica, generación de embeddings con Vertex AI, persistencia e indexación HNSW en PostgreSQL con `pgvector`, y generación anclada en el contexto top-k recuperado.

---

### 20. Pregunta: How would you implement a custom retry decorator with exponential backoff in Python?

[EN]
A production retry decorator must handle transient failures, wrap async/sync callables cleanly, and preserve function metadata:
```python
import functools, time, asyncio

def retry(max_attempts=3, backoff=2.0, exceptions=(Exception,)):
    def decorator(func):
        @functools.wraps(func)
        async def async_wrapper(*args, **kwargs):
            delay = 1.0
            for attempt in range(1, max_attempts + 1):
                try:
                    return await func(*args, **kwargs)
                except exceptions as e:
                    if attempt == max_attempts: raise
                    await asyncio.sleep(delay)
                    delay *= backoff
        return async_wrapper
    return decorator
```
- **Trade-offs:** We add random jitter to the delay to prevent the thundering herd problem when downstream databases recover.

[PHO]
(eɪ prəˈdʌkʃən ˈritraɪ ˈdɛkəˌreɪtər məst ˈhændəl ˈtrænziənt ˈfeɪljərz ænd priˈzɜrv ˈmɛtəˌdeɪtə)

[ES]
Implemento un decorador parametrizado con `@functools.wraps`, bucle de intentos, delay multiplicado por factor de backoff y jitter aleatorio para no saturar servicios en recuperación.

---

### 21. Pregunta: Tell me about a time you resolved a critical production incident or technical disagreement.

[EN]
At Reforest Latam, during a high-traffic environmental telemetry sync, our API p95 latency spiked from 180ms to over 4 seconds, causing connection timeouts.
- **Action:** I initiated incident triage by inspecting OpenTelemetry distributed traces in our APM, pinpointing an unindexed foreign key query on a 15-million-row telemetry table combined with an async N+1 query inside an ORM loop.
- **Resolution:** I refactored the query to use `selectinload()`, created a concurrent composite B-tree index in PostgreSQL using zero-downtime Alembic migrations, and implemented a Redis caching layer for read-heavy statistics.
- **Outcome:** Latency dropped by 85% to under 60ms, system throughput tripled, and I documented the post-mortem in an Architecture Decision Record (ADR).

[PHO]
(aɪ ɪˈnɪʃiˌeɪtəd ˈɪnsədənt triˈɑʒ baɪ ɪnˈspɛktɪŋ oʊpən-təˈlɛmɪtri dɪˈstrɪbjutəd ˈtreɪsəz)

[ES]
En Reforest Latam la latencia p95 subió a 4s por N+1 queries y falta de índice en tabla de 15M filas. Lo resolví con `selectinload()`, índice compuesto concurrente con Alembic y cache en Redis, bajando la latencia en 85% a <60ms.

---

### 22. Pregunta: What questions do you have for the EPAM technical team and engineering leads?

[EN]
I have three strategic technical questions about EPAM's engineering practices:
1. **AI & Modernization:** With EPAM's focus on GenAI platforms like **EPAM DIAL** and **EliteA**, how are engineering teams currently integrating LLM orchestration and AI agents into client backend architectures?
2. **Architecture & Standards:** How does EPAM foster cross-project architectural consistency and knowledge sharing across distributed teams in Latin America and the US?
3. **Engineering Growth:** What does the career path from Senior Python Engineer to Lead or Solution Architect look like on enterprise cloud engagements?

[PHO]
(aɪ hæv θri strəˈtidʒɪk tɛkˈnɪkəl ˈkwɛstʃənz əˈbaʊt i-pæmz ˌɛndʒəˈnɪrɪŋ ˈpræktəsəz)

[ES]
Preguntas estratégicas: Integración de EPAM DIAL y GenAI en arquitecturas backend; estándares arquitectónicos entre equipos distribuidos; y el camino de crecimiento hacia Solution Architect.
