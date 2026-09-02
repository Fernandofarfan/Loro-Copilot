// @vitest-environment node
import { describe, it, expect } from "vitest";
import {
  classifyQuestion,
  detectTrickQuestion,
  fmtTime,
  findMatchingAnswer,
  checkInstantGreeting,
  parseInterviewMarkdownToMasterAnswers,
  type MasterAnswer,
} from "../app/lib/interviewHelpers";

describe("interviewHelpers", () => {
  describe("classifyQuestion", () => {
    it("debe clasificar preguntas de pretensión salarial", () => {
      const res = classifyQuestion("¿Cuáles son tus pretensiones salariales para este rol?");
      expect(res.label).toContain("Pretensión Salarial");
    });

    it("debe clasificar preguntas comportamentales / STAR", () => {
      const res = classifyQuestion("Contame una situación donde tuviste un conflicto con un compañero de equipo.");
      expect(res.label).toContain("Comportamental");
    });

    it("debe clasificar preguntas técnicas", () => {
      const res = classifyQuestion("¿Cuál es la diferencia entre asyncio y multiprocessing en Python?");
      expect(res.label).toContain("Pregunta Técnica");
    });

    it("debe clasificar preguntas generales como fallback", () => {
      const res = classifyQuestion("¿Cómo estás hoy?");
      expect(res.label).toContain("General");
    });
  });

  describe("checkInstantGreeting", () => {
    it("debe reconocer saludos en español y devolver respuesta inmediata con nombre de empresa", () => {
      const res = checkInstantGreeting("Hola buenas, cómo estás?", "TechCorp");
      expect(res).not.toBeNull();
      expect(res?.esText).toContain("TechCorp");
      expect(res?.enText).toContain("TechCorp");
    });

    it("debe reconocer saludos en inglés", () => {
      const res = checkInstantGreeting("Hi, how is it going?", "Acme Inc");
      expect(res).not.toBeNull();
      expect(res?.enText).toContain("Acme Inc");
    });

    it("debe devolver null para preguntas técnicas o no-saludos", () => {
      const res = checkInstantGreeting("Explicame la arquitectura de microservicios", "TechCorp");
      expect(res).toBeNull();
    });
  });

  describe("detectTrickQuestion", () => {
    it("debe detectar preguntas trampa sobre debilidades o despidos", () => {
      const warning = detectTrickQuestion("¿Cuál es tu mayor defecto o peor error?");
      expect(warning).not.toBeNull();
      expect(warning).toContain("Pregunta Delicada");
    });

    it("debe devolver null para preguntas normales", () => {
      const warning = detectTrickQuestion("Explicame tu experiencia con React y TypeScript");
      expect(warning).toBeNull();
    });
  });

  describe("findMatchingAnswer", () => {
    const memory: MasterAnswer[] = [
      {
        id: "techcorp_python_1",
        question: "Contame sobre tu experiencia y stack en Python Backend",
        enText: "I am a Senior Backend Engineer specializing in Python, FastAPI, and distributed systems with high test coverage.",
        esText: "Soy Ingeniero Backend Senior especializado en Python, FastAPI y sistemas distribuidos con alta cobertura de tests.",
        category: "🛠️ Pregunta Técnica",
        tags: ["python", "fastapi", "backend", "experience"],
        company: "TechCorp",
        role: "Senior Backend Engineer",
        favorite: true,
        createdAt: 1700000000000,
      },
      {
        id: "techcorp_gcp_2",
        question: "¿Qué experiencia tenés trabajando con Google Cloud Platform y Kubernetes?",
        enText: "I have 5+ years building and deploying scalable microservices on GCP using GKE, Cloud Run, and Terraform.",
        esText: "Tengo más de 5 años construyendo y desplegando microservicios escalables en GCP usando GKE, Cloud Run y Terraform.",
        category: "🛠️ Pregunta Técnica",
        tags: ["gcp", "kubernetes", "gke", "terraform", "cloud"],
        company: "TechCorp",
        role: "Senior Backend Engineer",
        favorite: true,
        createdAt: 1700000000000,
      },
      {
        id: "acme_salary_3",
        question: "¿Cuál es tu pretensión salarial y disponibilidad para sumarte a Acme Inc?",
        enText: "My compensation expectation is aligned with senior market rates and I am available within two weeks notice.",
        esText: "Mi pretensión salarial está alineada al mercado senior y cuento con disponibilidad de incorporación en 2 semanas.",
        category: "💰 Pretensión Salarial",
        tags: ["salary", "pretension salarial", "availability", "sueldo"],
        company: "Acme Inc",
        role: "Cloud Architect",
        favorite: true,
        createdAt: 1700000000000,
      },
      {
        id: "general_star_4",
        question: "Tell me about a time you handled a production outage or critical bug",
        enText: "During a critical incident, I led the triage by checking logs in Datadog, isolated the bottleneck, and rolled back safely.",
        esText: "Durante un incidente crítico, lideré el triage revisando logs en Datadog, aislé el cuello de botella y realicé un rollback seguro.",
        category: "🧠 Comportamental · Usar STAR",
        tags: ["outage", "incident", "bug", "production", "star"],
        company: "General",
        favorite: true,
        createdAt: 1700000000000,
      },
    ];

    it("debe encontrar coincidencia casi exacta con alta confianza para TechCorp", () => {
      const res = findMatchingAnswer("Contame sobre tu experiencia y stack en Python Backend", memory, 0.70, "TechCorp");
      expect(res).not.toBeNull();
      expect(res?.match.id).toBe("techcorp_python_1");
      expect(res?.score).toBeGreaterThanOrEqual(0.70);
    });

    it("debe encontrar coincidencia para preguntas de GCP en TechCorp", () => {
      const query = "¿Qué experiencia tenés trabajando con Google Cloud Platform y Kubernetes?";
      const res = findMatchingAnswer(query, memory, 0.70, "TechCorp");
      expect(res).not.toBeNull();
      expect(res?.match.company).toBe("TechCorp");
      expect(res?.match.id).toBe("techcorp_gcp_2");
    });

    it("debe encontrar respuesta para pretensión salarial en Acme Inc", () => {
      const query = "¿Cuál es tu pretensión salarial y disponibilidad para sumarte a Acme Inc?";
      const res = findMatchingAnswer(query, memory, 0.70, "Acme Inc");
      expect(res).not.toBeNull();
      expect(res?.match.id).toBe("acme_salary_3");
    });

    it("NO debe mezclar respuestas de TechCorp cuando la entrevista activa es Acme Inc", () => {
      const query = "Contame sobre tu experiencia y stack en Python Backend";
      const res = findMatchingAnswer(query, memory, 0.70, "Acme Inc");
      expect(res).toBeNull();
    });

    it("NO debe usar memorias de empresas específicas si la empresa activa no está definida", () => {
      const query = "¿Qué experiencia tenés trabajando con Google Cloud Platform y Kubernetes?";
      const res = findMatchingAnswer(query, memory, 0.70, "");
      expect(res).toBeNull();
    });

    it("SÍ debe permitir respuestas generales cuando no hay empresa activa", () => {
      const query = "Tell me about a time you handled a production outage or critical bug";
      const res = findMatchingAnswer(query, memory, 0.70, "");
      expect(res).not.toBeNull();
      expect(res?.match.id).toBe("general_star_4");
    });

    it("NO debe matchear falsos positivos de prefijo como react vs reaction", () => {
      const customMem: MasterAnswer[] = [
        {
          id: "react_hooks",
          question: "How do you manage state using React custom hooks?",
          enText: "I encapsulate state logic in custom hooks.",
          esText: "Encapsulo la lógica de estado en hooks personalizados.",
          company: "General",
          createdAt: Date.now(),
        },
      ];
      const res = findMatchingAnswer("What was your team's reaction to the outage?", customMem, 0.70);
      expect(res).toBeNull();
    });

    it("debe devolver null si la pregunta no tiene relación", () => {
      const res = findMatchingAnswer("¿Cómo cocinarías una receta tradicional?", memory, 0.70);
      expect(res).toBeNull();
    });
  });

  describe("parseInterviewMarkdownToMasterAnswers", () => {
    it("debe parsear un archivo markdown de informe de entrevista a objetos MasterAnswer", () => {
      const sampleMd = `# Informe de Entrevista — Acme Inc (Puesto: Cloud Engineer)

### 1. Pregunta: ¿Qué experiencia tenés con Terraform en GCP?

🧠 *Analizando respuesta...*

Uso Terraform con módulos reutilizables y backend remoto en GCS para automatizar GCP.

*Latencia de generación: 1200 ms | Modelo: Grok 4.5*

### 2. Pregunta: Tell me about your English communication skills.

🧠 *Analizando respuesta...*

[EN]
I communicate fluently with global teams in daily standups and architecture reviews.

[ES]
Me comunico fluidamente con equipos globales en dailies y revisiones de arquitectura.

*Latencia de generación: 1500 ms | Modelo: Grok 4.5*
`;
      const parsed = parseInterviewMarkdownToMasterAnswers(sampleMd);
      expect(parsed.length).toBe(2);
      expect(parsed[0].question).toContain("Terraform");
      expect(parsed[0].company).toContain("Acme Inc");
      expect(parsed[1].question).toContain("English");
      expect(parsed[1].enText).toContain("fluently");
      expect(parsed[1].esText).toContain("fluidamente");
    });
  });

  describe("fmtTime", () => {
    it("debe formatear timestamps correctamente", () => {
      const str = fmtTime(1700000000000);
      expect(str).toMatch(/\d{2}:\d{2}:\d{2}/);
    });
  });
});


