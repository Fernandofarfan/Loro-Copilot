// @vitest-environment node
import { describe, it, expect } from "vitest";
import {
  classifyQuestion,
  detectTrickQuestion,
  detectQuestionLanguage,
  isIncompleteQuestion,
  extractCurrentTurnQuestion,
  fmtTime,
  findMatchingAnswer,
  matchesRole,
  checkInstantGreeting,
  parseInterviewMarkdownToMasterAnswers,
  classifyQuestionType,
  type MasterAnswer,
} from "../app/lib/interviewHelpers";

describe("interviewHelpers", () => {
  describe("isIncompleteQuestion", () => {
    it("debe detectar frases incompletas por conectores finales", () => {
      expect(isIncompleteQuestion("Trabajé una vez con Riak con SQL, MySQL, PHP o con")).toBe(true);
      expect(isIncompleteQuestion("Contame sobre tu experiencia y")).toBe(true);
      expect(isIncompleteQuestion("para responder las siguientes:")).toBe(true);
      expect(isIncompleteQuestion("Tell me about your experience with")).toBe(true);
      expect(isIncompleteQuestion("What are the differences between")).toBe(true);
      expect(isIncompleteQuestion("Hola...")).toBe(true);
    });

    it("debe aceptar preguntas y saludos completos", () => {
      expect(isIncompleteQuestion("¿Qué modelo de Postgres trabajaste?")).toBe(false);
      expect(isIncompleteQuestion("Where are you from?")).toBe(false);
      expect(isIncompleteQuestion("Hola buenas")).toBe(false);
      expect(isIncompleteQuestion("Hi, how are you?")).toBe(false);
    });
  });

  describe("extractCurrentTurnQuestion", () => {
    it("debe extraer solo las líneas del turno actual sin mezclar preguntas anteriores", () => {
      const lines = [
        { id: "1", text: "¿De dónde sos?", speaker: 0, final: true },
        { id: "2", text: "Soy de Buenos Aires", speaker: 1, final: true },
        { id: "3", text: "¿Qué modelo de Postgres", speaker: 0, final: true },
        { id: "4", text: "trabajaste en producción?", speaker: 0, final: true },
      ];

      // Simulamos que la pregunta 1 ya fue respondida (lastProcessedId = "1")
      const result = extractCurrentTurnQuestion(lines, "1");
      expect(result.text).toBe("¿Qué modelo de Postgres trabajaste en producción?");
      expect(result.newLastId).toBe("4");
      expect(result.isIncomplete).toBe(false);
    });

    it("debe retornar vacío si no hay líneas nuevas después del último ID procesado", () => {
      const lines = [
        { id: "1", text: "¿De dónde sos?", speaker: 0, final: true },
      ];

      const result = extractCurrentTurnQuestion(lines, "1");
      expect(result.text).toBe("");
      expect(result.newLastId).toBeNull();
    });
  });

  describe("detectQuestionLanguage", () => {
    it("debe detectar preguntas en inglés correctamente", () => {
      expect(detectQuestionLanguage("where are you from?")).toBe("en");
      expect(detectQuestionLanguage("tell me about yourself and your background")).toBe("en");
      expect(detectQuestionLanguage("what is your experience with React and TypeScript?")).toBe("en");
      expect(detectQuestionLanguage("How do you handle deadlines?")).toBe("en");
    });

    it("debe detectar preguntas en español correctamente", () => {
      expect(detectQuestionLanguage("¿De dónde sos?")).toBe("es");
      expect(detectQuestionLanguage("Contame de tu experiencia previa")).toBe("es");
      expect(detectQuestionLanguage("¿Cuáles son tus pretensiones salariales?")).toBe("es");
      expect(detectQuestionLanguage("Explicame cómo estructurás una base de datos")).toBe("es");
    });
  });
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
      const res = findMatchingAnswer("¿Cómo cocinarías una receta tradicional?", memory, 0.65);
      expect(res).toBeNull();
    });

    it("debe matchear preguntas con sinónimos canónicos (pets vs dogs, weekend vs saturday)", () => {
      const screeningMem: MasterAnswer[] = [
        {
          id: "pets_q",
          question: "Do you have animals or pets in your home?",
          enText: "Yes, I have pets at home.",
          esText: "Sí, tengo mascotas.",
          company: "General",
          createdAt: Date.now(),
        },
        {
          id: "weekend_q",
          question: "What did you do the last weekend or what are your weekend plans?",
          enText: "I went cycling and rested.",
          esText: "Salí a pedalear y descansé.",
          company: "General",
          createdAt: Date.now(),
        },
      ];

      // "dogs" es sinónimo canónico de "pets"
      const resDog = findMatchingAnswer("Do you have any dogs?", screeningMem, 0.65);
      expect(resDog).not.toBeNull();
      expect(resDog?.match.id).toBe("pets_q");

      // Consulta corta sobre weekend
      const resWeekend = findMatchingAnswer("What did you do the last weekend?", screeningMem, 0.65);
      expect(resWeekend).not.toBeNull();
      expect(resWeekend?.match.id).toBe("weekend_q");
    });

    it("NO debe mezclar respuestas de DBA en una entrevista con puesto Cloud Engineer", () => {
      const multiRoleMem: MasterAnswer[] = [
        {
          id: "cloud_pitch",
          question: "Can you introduce yourself or tell me about your background? [Rol: Cloud & DevOps Architect]",
          enText: "I am a Senior Cloud Architect specializing in GCP, GKE, and Terraform.",
          esText: "Soy Cloud Architect especializado en GCP, GKE y Terraform.",
          role: "Cloud & DevOps Architect",
          company: "General",
          createdAt: Date.now(),
        },
        {
          id: "dba_pitch",
          question: "Can you introduce yourself or tell me about your background? [Rol: DBA & Data Engineer]",
          enText: "I am a Senior DBA specializing in PostgreSQL, SQL Server, and BigQuery.",
          esText: "Soy DBA Senior especializado en PostgreSQL, SQL Server y BigQuery.",
          role: "DBA & Data Engineer",
          company: "General",
          createdAt: Date.now(),
        },
        {
          id: "python_pitch",
          question: "Can you introduce yourself or tell me about your background? [Rol: Python Backend Engineer & Tech Lead]",
          enText: "I am a Senior Python Engineer specializing in FastAPI and microservices.",
          esText: "Soy Ingeniero Python especializado en FastAPI y microservicios.",
          role: "Python Backend Engineer & Tech Lead",
          company: "General",
          createdAt: Date.now(),
        },
      ];

      // 1. Cuando la entrevista activa es Cloud Engineer, debe devolver exclusivamente el pitch de Cloud
      const cloudRes = findMatchingAnswer(
        "Can you introduce yourself or tell me about your background?",
        multiRoleMem,
        0.65,
        "Globant",
        "GCP Cloud Engineer"
      );
      expect(cloudRes).not.toBeNull();
      expect(cloudRes?.match.id).toBe("cloud_pitch");
      expect(cloudRes?.match.role).toBe("Cloud & DevOps Architect");

      // 2. Cuando la entrevista activa es DBA, debe devolver el pitch de DBA
      const dbaRes = findMatchingAnswer(
        "Can you introduce yourself or tell me about your background?",
        multiRoleMem,
        0.65,
        "TechCorp",
        "DBA & Data Specialist"
      );
      expect(dbaRes).not.toBeNull();
      expect(dbaRes?.match.id).toBe("dba_pitch");

      // 3. Cuando la entrevista activa es Python Backend, debe devolver el pitch de Python
      const pythonRes = findMatchingAnswer(
        "Can you introduce yourself or tell me about your background?",
        multiRoleMem,
        0.65,
        "EPAM",
        "Python Backend Developer"
      );
      expect(pythonRes).not.toBeNull();
      expect(pythonRes?.match.id).toBe("python_pitch");
    });
  });

  describe("matchesRole", () => {
    it("debe permitir ítems generales en cualquier puesto", () => {
      expect(matchesRole("General", "Cloud Engineer")).toBe(true);
      expect(matchesRole("Multi-Role Senior Specialist", "DBA Engineer")).toBe(true);
      expect(matchesRole("", "Python Backend")).toBe(true);
    });

    it("debe rechazar roles incompatibles (DBA vs Cloud)", () => {
      expect(matchesRole("DBA & Data Engineer", "GCP Cloud Engineer")).toBe(false);
      expect(matchesRole("SAP Basis Specialist", "React Frontend Developer")).toBe(false);
    });

    it("debe aceptar roles compatibles", () => {
      expect(matchesRole("Cloud & DevOps Architect", "Senior GCP Cloud Engineer")).toBe(true);
      expect(matchesRole("Python Backend Engineer", "Lead Python Developer")).toBe(true);
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

  describe("classifyQuestionType", () => {
    it("debe clasificar preguntas de System Design", () => {
      expect(classifyQuestionType("How would you design a scalable rate limiter?")).toBe("system_design");
      expect(classifyQuestionType("¿Cómo diseñarías una arquitectura distribuida con Kafka y microservicios?")).toBe("system_design");
    });

    it("debe clasificar preguntas de Live Coding / Algoritmos", () => {
      expect(classifyQuestionType("Write a function to invert a binary tree and state its time complexity")).toBe("live_coding");
      expect(classifyQuestionType("¿Cuál es la complejidad Big-O de esta función y cómo resolverías el LeetCode?")).toBe("live_coding");
    });

    it("debe clasificar preguntas de comportamiento STAR", () => {
      expect(classifyQuestionType("Tell me about a time you had a conflict with a team member")).toBe("behavioral");
      expect(classifyQuestionType("Contame de una situación donde lideraste bajo mucha presión")).toBe("behavioral");
    });

    it("debe clasificar preguntas de Fit / Screening", () => {
      expect(classifyQuestionType("Tell me about yourself and your background")).toBe("fit");
      expect(classifyQuestionType("¿Por qué querés trabajar en nuestra empresa y cuáles son tus expectativas salariales?")).toBe("fit");
    });

    it("debe clasificar por defecto como technical", () => {
      expect(classifyQuestionType("How does garbage collection work in Python?")).toBe("technical");
      expect(classifyQuestionType("Explicame cómo funciona el Event Loop de Node")).toBe("technical");
    });
  });
});


