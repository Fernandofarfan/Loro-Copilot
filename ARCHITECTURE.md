# 🏗️ Arquitectura Técnica de Loro Copilot

Este documento detalla el diseño de sistemas, el flujo de datos y los componentes clave que hacen posible el funcionamiento en tiempo real de **Loro Copilot**.

---

## 🧭 Diagrama de Flujo General

```
[ Entrevistador habla ]
       │
       ▼
[ Captura de Audio: Micrófono / Pestaña ]
       │
       ▼ (AudioContext + AudioWorklet)
[ Conversión: Float32 -> Int16 @ 16kHz ]
       │
       ▼ (WebSocket binario continuo)
[ Deepgram Nova-2 STT (multi-lang) ]
       │
       ▼ (JSON Results & UtteranceEnd)
[ Cliente Next.js (app/page.tsx) ]
       │
       ├──► Sincronización en vivo con Teleprompter (BroadcastChannel / LocalStorage)
       │
       ▼ (Disparo manual o fin de turno)
[ Edge API (/api/answer) ]
       │
       ▼ (SSE Streaming con Fallbacks)
[ Modelos LLM: OpenCode / Gemini / OpenAI / Anthropic ]
       │
       ▼ (Streaming de texto + Parser de bloques)
[ Renderizado en UI: Respuesta + Fonética [PHO] + [ES] ]
```

---

## 🎙️ 1. Pipeline de Audio en Tiempo Real

### Captura
- **Micrófono:** Adquirido con `navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } })`.
- **Pestaña (Meet/Zoom):** Adquirido con `navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })`. Los tracks de video se detienen inmediatamente para liberar recursos de CPU/GPU sin disparar desconexión de sesión (`stop()` no dispara `disconnect`); el cierre de la captura queda vinculado exclusivamente al evento `audioTrack.onended`.

### Procesamiento y Remuestreo (`public/pcm-worklet.js`)
- Los navegadores ejecutan el `AudioContext` a frecuencias nativas (habitualmente 44.1kHz o 48kHz).
- Deepgram requiere PCM16 lineal a 16kHz para maximizar la precisión de reconocimiento y minimizar el ancho de banda.
- El `AudioWorkletProcessor` realiza downsampling mediante promediado de ventana móvil y empaqueta en buffers `Int16Array` que se envían directamente al socket binario.

---

## 📡 2. Conexión WebSocket y STT (Deepgram Nova-2)

### Emisión de Credenciales Seguras (`/api/deepgram-token`)
- El cliente nunca tiene acceso a la `DEEPGRAM_API_KEY` permanente.
- El endpoint `/api/deepgram-token` solicita un grant temporal (TTL 60 segundos) a Deepgram (`https://api.deepgram.com/v1/auth/grant`).
- El cliente abre el WebSocket con el esquema `bearer` y el token efímero. Si el socket cae durante la llamada, un mecanismo de reconexión exponencial (hasta 3 intentos) restablece el flujo sin perder el contexto ni pedir permisos de nuevo.

### Detección de Turnos y Lenguaje
- Configurado con `endpointing: 500` y `utterance_end_ms: 3000`.
- Soporte para detección automática de idioma (`language: "multi"`), discriminando entre Español (`es`) e Inglés (`en`).

---

## ⚡ 3. Motor de Generación y Streaming en Edge (`/api/answer`)

### Edge Runtime
- Los endpoints de backend corren en **Vercel Edge Network** (`export const runtime = "edge"`), reduciendo el Time-to-First-Token (TTFT) a menos de 400ms.

### Sistema de Fallbacks Multi-Proveedor
En caso de saturación, error de cuota o indisponibilidad de un modelo, el backend conmuta instantáneamente al siguiente candidato en la lista de reserva sin interrumpir el stream:

```typescript
const FALLBACK = {
  opencode: ["deepseek/deepseek-chat", "gpt-4o-mini"],
  openrouter: ["deepseek/deepseek-chat"],
  openai: ["gpt-4o-mini", "gpt-4o"],
  anthropic: ["claude-3-5-haiku-20241022", "claude-3-5-sonnet-20241022"],
  gemini: ["gemini-2.5-flash", "gemini-1.5-flash"],
};
```

### Motor Bilingüe y Transcripción Fonética
Cuando el sistema detecta que la pregunta fue en inglés, el LLM estructura la salida en 3 bloques delimitados:
1. **`[EN]`**: Respuesta técnica directa en inglés para perfiles Senior (8 a 14 palabras por viñeta, vocabulario técnico preciso).
2. **`[PHO]`**: Transcripción fonética simplificada en español con sílabas acentuadas en mayúsculas (ej. *asyncio* ➔ `"ei-SINK-ai-o"`, *decorator* ➔ `"DE-ko-rei-ter"`).
3. **`[ES]`**: Resumen conceptual en español de 1-2 oraciones.

---

## 🪟 4. Teleprompter HUD Pop-out (`/teleprompter`)

- Diseñado para abrirse en una ventana emergente compacta y ubicarse justo debajo de la cámara del usuario.
- **Canal de comunicación:** Utiliza `BroadcastChannel("loro_teleprompter_channel")` para transmitir cada chunk de texto generado en cero milisegundos, con fallback a eventos de `storage`.
- Soporta auto-scroll suave, ajuste de tamaño tipográfico (`A+` / `A-`) y vista de fonética destacada.

---

## 🛡️ 5. Capa de Seguridad y Resiliencia (`app/lib/security.ts`)

- **Verificación de Origen (`verifyOrigin`):** Bloquea peticiones de dominios cruzados no autorizados o scripts externos maliciosos, restringiendo estrictamente a dominios de producción (`loro-copilot.vercel.app`, `lorocopilot.com`, `NEXT_PUBLIC_SITE_URL`) y localhost en desarrollo.
- **Rate Limiter en Memoria (`checkRateLimit`):** Ventanas deslizantes con limpieza perezosa (lazy cleanup) apta para Edge Isolates.
- **Kill Switch de Capacidad (`checkCapacity`):** Apagado inmediato con HTTP 503 ante picos de demanda imprevistos mediante `CAPACITY_CLOSED=1`.
- **Rate Limiter en Memoria (`checkRateLimit`):** Ventana deslizante por IP (ej. 40 req/min para respuestas) con limpieza periódica de buckets cada 5 minutos para prevenir fugas de memoria.
- **Control de Abortos (`AbortController`):** Cada nuevo turno de respuesta cancela inmediatamente cualquier petición previa aún en curso para evitar consumo innecesario de tokens.

---

## 🧠 6. Banco de Memoria Inteligente y Caché Local (<50ms)

El sistema integra un motor de búsqueda y recuperación en memoria local diseñado para eliminar por completo la latencia del LLM en preguntas típicas, de screening o de presentación personal.

### Algoritmo de Búsqueda Semántica (`app/lib/interviewHelpers.ts`)
1. **Normalización y Sinónimos Canónicos:**
   - La función `tokenize()` remueve acentos (NFD), caracteres especiales y stop-words en español e inglés.
   - `CANONICAL_SYNONYMS` mapea variantes lingüísticas a un único identificador conceptual (ej. `dogs`, `cats`, `pets`, `mascotas` ➔ `pet_concept`; `salary`, `rate`, `hourly`, `sueldo` ➔ `salary_concept`; `weekend`, `saturday`, `finde` ➔ `weekend_concept`).
2. **Scoring Multidimensional con Ponderación de Longitud:**
   - Combina Jaccard (25%), Sørensen-Dice (35%) y Cobertura Efectiva (40%).
   - Para consultas cortas (1-3 tokens clave como *"What about salary?"*), la cobertura de la consulta pondera al 70%, evitando penalizar preguntas guardadas con títulos descriptivos.
   - Bonus de inclusión de frase (+0.15) y bonus por tags (+0.08).
   - Umbral calibrado en `0.65` para permitir variaciones conversacionales naturales sin falsos positivos.

### Aislamiento de Procesos y Perfiles (Multi-CV)
Para candidatos que aplican a distintos perfiles profesionales (ej. Cloud Architect, DBA, Python Backend, SAP, Full Stack), el motor previene la contaminación cruzada mediante dos filtros determinísticos:
- **Aislamiento por Empresa (`matchesCompany`):** Si una memoria pertenece a una empresa específica (`Acme Inc`), no se utiliza cuando la entrevista activa es otra (`Globant`), salvo que sea de naturaleza `General`.
- **Aislamiento por Rol / Puesto (`matchesRole`):** Compara el dominio técnico del rol guardado contra el puesto activo configurado en el Copiloto. Si el usuario está en una entrevista de `GCP Cloud Engineer`, el sistema descarta memorias etiquetadas como `[Rol: DBA & Data Engineer]` o `[Rol: SAP Basis]` y selecciona exclusivamente la de Cloud, garantizando respuestas precisas y consistentes con el CV presentado.

