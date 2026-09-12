import { describe, it, expect } from "vitest";
import { findMatchingAnswer } from "../app/lib/interviewHelpers";
import { getValentinaMasterAnswers } from "../app/lib/valentinaPreset";

describe("Valentina Lopez Salinas (COMPANY86 / US Enterprise) Master Answers", () => {
  it("matches all 28 questions correctly via getValentinaMasterAnswers()", () => {
    const answers = getValentinaMasterAnswers();

    expect(answers.length).toBe(28);
    expect(answers[0].company).toBe("COMPANY86 / US Enterprise Client");
    expect(answers[0].role).toBe("Senior Python Backend Engineer & Technical Lead");

    // Match pets / animales
    const matchPets = findMatchingAnswer(
      "Do you have any pets or dogs at home?",
      answers,
      0.45,
      "COMPANY86 / US Enterprise Client",
      "Senior Python Backend Engineer & Technical Lead"
    );
    expect(matchPets).not.toBeNull();
    expect(matchPets?.match.enText).toContain("Luna");

    // Match hobbies / pasatiempos
    const matchHobbies = findMatchingAnswer(
      "What are your hobbies and free time activities?",
      answers,
      0.45,
      "COMPANY86 / US Enterprise Client",
      "Senior Python Backend Engineer & Technical Lead"
    );
    expect(matchHobbies).not.toBeNull();
    expect(matchHobbies?.match.enText).toContain("cycling");

    // Match location / favorite place
    const matchLocation = findMatchingAnswer(
      "Where do you live and what is your favorite place?",
      answers,
      0.45,
      "COMPANY86 / US Enterprise Client",
      "Senior Python Backend Engineer & Technical Lead"
    );
    expect(matchLocation).not.toBeNull();
    expect(matchLocation?.match.enText).toContain("Salta");

    // Match intro question
    const matchIntro = findMatchingAnswer(
      "Tell me about yourself and your background",
      answers,
      0.55,
      "COMPANY86 / US Enterprise Client",
      "Senior Python Backend Engineer & Technical Lead"
    );
    expect(matchIntro).not.toBeNull();
    expect(matchIntro?.match.enText).toContain("Senior Python Backend Engineer");

    // Match Python & FastAPI question
    const matchPython = findMatchingAnswer(
      "What is your experience with Python and FastAPI?",
      answers,
      0.50,
      "COMPANY86 / US Enterprise Client",
      "Senior Python Backend Engineer & Technical Lead"
    );
    expect(matchPython).not.toBeNull();
    expect(matchPython?.match.enText).toContain("FastAPI");

    // Match GenAI / RAG / Vertex AI question
    const matchGenAi = findMatchingAnswer(
      "How have you built Generative AI solutions with Vertex AI and RAG?",
      answers,
      0.45,
      "COMPANY86 / US Enterprise Client",
      "Senior Python Backend Engineer & Technical Lead"
    );
    expect(matchGenAi).not.toBeNull();
    expect(matchGenAi?.match.enText).toContain("Vertex AI");

    // Match Hybrid Puerto Madero question
    const matchHybrid = findMatchingAnswer(
      "Are you willing to work in Puerto Madero two days a week?",
      answers,
      0.45,
      "COMPANY86 / US Enterprise Client",
      "Senior Python Backend Engineer & Technical Lead"
    );
    expect(matchHybrid).not.toBeNull();
    expect(matchHybrid?.match.enText).toContain("Puerto Madero");
  });

  it("matches common Spanish questions accurately", () => {
    const answers = getValentinaMasterAnswers();

    // Spanish: Mascotas
    const petsEs = findMatchingAnswer("Tenes mascotas o animales en tu casa?", answers, 0.45, "COMPANY86 / US Enterprise Client", "Senior Python Backend Engineer & Technical Lead");
    expect(petsEs).not.toBeNull();
    expect(petsEs?.match.esText).toContain("Luna");

    // Spanish: Hobbies
    const hobbiesEs = findMatchingAnswer("Que haces en tu tiempo libre o que pasatiempos tenes?", answers, 0.45, "COMPANY86 / US Enterprise Client", "Senior Python Backend Engineer & Technical Lead");
    expect(hobbiesEs).not.toBeNull();

    // Spanish: Salario
    const salaryEs = findMatchingAnswer("Cual es tu remuneracion o sueldo pretendido?", answers, 0.45, "COMPANY86 / US Enterprise Client", "Senior Python Backend Engineer & Technical Lead");
    expect(salaryEs).not.toBeNull();
    expect(salaryEs?.match.esText).toContain("4.000 USD");

    // Spanish: Híbrido Puerto Madero
    const hybridEs = findMatchingAnswer("Como te sienta trabajar hibrido dos dias en Puerto Madero?", answers, 0.40, "COMPANY86 / US Enterprise Client", "Senior Python Backend Engineer & Technical Lead");
    expect(hybridEs).not.toBeNull();
    expect(hybridEs?.match.esText).toContain("Puerto Madero");

    // Spanish: Python & FastAPI
    const pythonEs = findMatchingAnswer("Cual es tu experiencia con Python y FastAPI?", answers, 0.40, "COMPANY86 / US Enterprise Client", "Senior Python Backend Engineer & Technical Lead");
    expect(pythonEs).not.toBeNull();
    expect(pythonEs?.match.esText).toContain("FastAPI");

    // Spanish: Google Cloud
    const gcpEs = findMatchingAnswer("Como disenias y desplegas microservicios en Google Cloud?", answers, 0.40, "COMPANY86 / US Enterprise Client", "Senior Python Backend Engineer & Technical Lead");
    expect(gcpEs).not.toBeNull();
    expect(gcpEs?.match.esText).toContain("Google Cloud");

    // Spanish: GenAI & Vertex AI & RAG
    const aiEs = findMatchingAnswer("Como integraste soluciones de inteligencia artificial con Vertex AI y RAG?", answers, 0.40, "COMPANY86 / US Enterprise Client", "Senior Python Backend Engineer & Technical Lead");
    expect(aiEs).not.toBeNull();
    expect(aiEs?.match.esText).toContain("Vertex AI");

    // Spanish: PostgreSQL & pgvector
    const dbEs = findMatchingAnswer("Como manejas la persistencia y optimizacion en PostgreSQL con pgvector?", answers, 0.40, "COMPANY86 / US Enterprise Client", "Senior Python Backend Engineer & Technical Lead");
    expect(dbEs).not.toBeNull();
    expect(dbEs?.match.esText).toContain("pgvector");

    // Spanish: Tech Lead & Liderazgo
    const leadEs = findMatchingAnswer("Contame sobre tu experiencia liderando equipos como Tech Lead", answers, 0.40, "COMPANY86 / US Enterprise Client", "Senior Python Backend Engineer & Technical Lead");
    expect(leadEs).not.toBeNull();
    expect(leadEs?.match.esText).toContain("Technical Lead");

    // Spanish: STAR Bottleneck N+1
    const bottleneckEs = findMatchingAnswer("Contame sobre un cuello de botella complejo de rendimiento que hayas resuelto", answers, 0.40, "COMPANY86 / US Enterprise Client", "Senior Python Backend Engineer & Technical Lead");
    expect(bottleneckEs).not.toBeNull();
    expect(bottleneckEs?.match.esText).toContain("N+1");

    // Spanish: Incidente en producción
    const incidentEs = findMatchingAnswer("Tuviste algun error o incidente critico en produccion y que aprendiste?", answers, 0.40, "COMPANY86 / US Enterprise Client", "Senior Python Backend Engineer & Technical Lead");
    expect(incidentEs).not.toBeNull();
    expect(incidentEs?.match.esText).toContain("postmortem");

    // Spanish: Preguntas para el entrevistador
    const reverseEs = findMatchingAnswer("Tenes alguna pregunta para nosotros sobre el equipo o el puesto?", answers, 0.40, "COMPANY86 / US Enterprise Client", "Senior Python Backend Engineer & Technical Lead");
    expect(reverseEs).not.toBeNull();
    expect(reverseEs?.match.esText).toContain("preguntas");

    // Spanish: Clientes y equipos de Estados Unidos (Inglés)
    const usClientsEs = findMatchingAnswer("Tenes experiencia trabajando con clientes o equipos de Estados Unidos en ingles?", answers, 0.40, "COMPANY86 / US Enterprise Client", "Senior Python Backend Engineer & Technical Lead");
    expect(usClientsEs).not.toBeNull();
    expect(usClientsEs?.match.esText).toContain("Estados Unidos");

    // Spanish: Trabajo bajo presión y plazos
    const pressureEs = findMatchingAnswer("Como te manejas bajo presion o con plazos cambiantes y prioridades?", answers, 0.40, "COMPANY86 / US Enterprise Client", "Senior Python Backend Engineer & Technical Lead");
    expect(pressureEs).not.toBeNull();
    expect(pressureEs?.match.esText).toContain("priorización");

    // Spanish: Comunicación con perfiles no técnicos
    const commEs = findMatchingAnswer("Como comunicas restricciones tecnicas a perfiles no tecnicos o Product Managers?", answers, 0.40, "COMPANY86 / US Enterprise Client", "Senior Python Backend Engineer & Technical Lead");
    expect(commEs).not.toBeNull();
    expect(commEs?.match.esText).toContain("Product Managers");

    // Spanish: Otros procesos de selección
    const offersEs = findMatchingAnswer("Estas en otros procesos de seleccion o evaluando otras propuestas actualmente?", answers, 0.40, "COMPANY86 / US Enterprise Client", "Senior Python Backend Engineer & Technical Lead");
    expect(offersEs).not.toBeNull();
    expect(offersEs?.match.esText).toContain("prioridad número uno");

    // Spanish: Conectividad y setup remoto en Salta
    const remoteEs = findMatchingAnswer("Como es tu espacio y conexion a internet de trabajo remoto en Salta?", answers, 0.40, "COMPANY86 / US Enterprise Client", "Senior Python Backend Engineer & Technical Lead");
    expect(remoteEs).not.toBeNull();
    expect(remoteEs?.match.esText).toContain("fibra óptica");
  });

  it("loads all 28 preset answers via getValentinaMasterAnswers()", () => {
    const presetAnswers = getValentinaMasterAnswers();
    expect(presetAnswers.length).toBe(28);
  });
});
