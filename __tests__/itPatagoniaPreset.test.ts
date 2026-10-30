import { describe, it, expect } from "vitest";
import { IT_PATAGONIA_MASTER_ANSWERS } from "../app/lib/itPatagoniaMasterAnswers";
import { findMatchingAnswer } from "../app/lib/interviewHelpers";
import { getCompanyDossier, formatCompanyDossierPrompt } from "../app/lib/companyDossier";

const ROLE = "DevOps & FinOps Sr (Charla Técnica con el Líder de Infraestructura)";
const COMPANY = "ITPatagonia";

const countSentences = (text: string) => (text.match(/[.!?]+(?=\s|$)/g) || []).length;
const countWords = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

describe("preset IT Patagonia", () => {
  it("mantiene ids únicos y textos bilingües completos", () => {
    const ids = IT_PATAGONIA_MASTER_ANSWERS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const answer of IT_PATAGONIA_MASTER_ANSWERS) {
      expect(answer.company).toBe("ITPatagonia");
      expect(answer.role).toBeTruthy();
      expect(answer.question.trim().length).toBeGreaterThan(5);
      expect(answer.esText.trim().length).toBeGreaterThan(20);
      expect(answer.enText.trim().length).toBeGreaterThan(20);
      expect(answer.tags?.length).toBeGreaterThan(0);
    }
  });

  it("cumple Zero-Bullet: sin viñetas y 2 oraciones por respuesta hablada", () => {
    for (const answer of IT_PATAGONIA_MASTER_ANSWERS) {
      for (const text of [answer.esText, answer.enText]) {
        expect(text).not.toMatch(/•|^\s*[-*]\s/m);
        expect(countSentences(text)).toBe(2);
        expect(countWords(text)).toBeGreaterThanOrEqual(20);
        expect(countWords(text)).toBeLessThanOrEqual(55);
      }
    }
  });

  it("resuelve el dossier con las nubes reales y sin GCP", () => {
    const dossier = getCompanyDossier(COMPANY);
    expect(dossier?.canonicalName).toBe("IT Patagonia");
    expect(dossier?.techStack).toContain("Huawei Cloud");
    expect(dossier?.techStack).toContain("AWS");
    expect(dossier?.techStack).toContain("Azure");
    expect(dossier?.techStack).not.toContain("Google Cloud Platform (GCP)");

    const prompt = formatCompanyDossierPrompt(dossier);
    expect(prompt).toContain("Huawei Cloud");
    expect(prompt).toContain("NO responder por defecto con GCP");
  });

  it("matchea las preguntas reales de la call 28/10", () => {
    const realQuestions = [
      "terraform me dijiste usaste una vez",
      "todos los servicios que te da Google Workspace",
      "infraestructura para proyectos de IA",
      "tuviste gente a cargo con que metodologia trabajaban",
      "trabajaste con algun firewall de algun vendor Sophos Forti Cisco",
      "herramientas de backup cuales manejaste Veeam",
      "que nivel de ingles tenes te defendes en una call con tecnicos de AWS",
      "donde vivis podes ir 2 o 3 veces por semana presencial",
      "tenes disponibilidad para arrancar inmediatamente o tenes que terminar algun proyecto",
      "como administrarias repositorios de GitLab y GitHub y CI/CD",
      "cotizar ambientes lo que vale armar en Azure y AWS",
      "como harias finops en las 3 nubes",
    ];

    const unmatched: string[] = [];
    for (const q of realQuestions) {
      const result = findMatchingAnswer(q, IT_PATAGONIA_MASTER_ANSWERS, 0.48, COMPANY, ROLE);
      if (!result) unmatched.push(`${q} => (sin match)`);
    }

    expect(unmatched).toEqual([]);
  });

  it("no responde con GCP preguntas de on-prem y Windows Server", () => {
    const onPrem = [
      "que experiencia tenes en Windows Server",
      "como organizas el parcheo con WSUS",
      "como diagnosticas un domain controller con problemas de replicacion",
      "como monitoreas redes aisladas con Zabbix",
      "como proteges los backups de Veeam contra ransomware",
    ];

    for (const q of onPrem) {
      const result = findMatchingAnswer(q, IT_PATAGONIA_MASTER_ANSWERS, 0.48, COMPANY, ROLE);
      expect(result, q).not.toBeNull();
      expect(result?.match.esText.toLowerCase()).not.toContain("gcp");
    }
  });
});
