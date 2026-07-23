# Loro Copilot

Loro Copilot es un asistente de IA para entrevistas de trabajo que combina transcripción en tiempo real, contexto del candidato y generación de respuestas sugeridas durante la conversación.

El producto está diseñado para ayudar a profesionales a prepararse mejor, responder con más seguridad y reducir la presión en entrevistas reales.

## Características principales

- Transcripción en tiempo real desde micrófono o pestaña
- Generación de respuestas sugeridas basadas en el contexto del usuario
- Soporte para entrevistas en vivo y simulaciones de práctica
- Experiencia optimizada para navegadores modernos y despliegue en Vercel

## Tecnologías

- Next.js 14
- React 18
- TypeScript
- Vercel AI / APIs de IA
- Deepgram para transcripción en streaming
- Gemini para generación de respuestas

## Requisitos

- Node.js 18 o superior
- npm
- Claves de API de Deepgram y Gemini

## Configuración local

1. Instala dependencias:

```bash
npm install
```

2. Copia el archivo de ejemplo de variables de entorno:

```bash
cp .env.example .env.local
```

3. Completa las variables necesarias en `.env.local`.

4. Inicia el proyecto:

```bash
npm run dev
```

La aplicación quedará disponible en:

```text
http://localhost:3000
```

## Variables de entorno

Las variables principales del proyecto son:

| Variable | Requerida | Descripción |
|---|---:|---|
| `DEEPGRAM_API_KEY` | Sí | Clave para la transcripción en streaming |
| `GEMINI_API_KEY` | Sí | Clave para la generación de respuestas con Gemini |
| `OPENROUTER_API_KEY` | No | Clave privada para usar OpenRouter desde el backend |
| `OPENROUTER_MODEL` | No | Modelo de OpenRouter a usar, por ejemplo `openai/gpt-4o-mini` |
| `LLM_PROVIDER` | No | Proveedor por defecto del backend (`gemini`, `openai`, `anthropic` u `openrouter`) |
| `GEMINI_MODEL` | No | Modelo alternativo de Gemini |
| `CAPACITY_CLOSED` | No | Activa el modo de capacidad cerrada |
| `NEXT_PUBLIC_POSTHOG_KEY` | No | Analytics de PostHog |
| `NEXT_PUBLIC_POSTHOG_HOST` | No | Host de PostHog |

## Despliegue en Vercel

1. Conecta este repositorio a Vercel.
2. Selecciona el proyecto como una app Next.js.
3. Agrega las variables de entorno desde la pestaña de configuración.
4. Haz deploy.

## Estructura del proyecto

```text
app/                 # páginas, layouts y vistas principales
app/api/             # rutas de API para transcripción y respuestas
app/lib/             # utilidades compartidas y lógica de marca
public/              # assets estáticos
```

## Notas importantes

Este proyecto sigue un enfoque de MVP y está pensado para demostración, validación y evolución iterativa.

## Licencia

Este proyecto está en desarrollo y se comparte con fines de aprendizaje y demostración.
