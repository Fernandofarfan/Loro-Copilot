import { describe, it, expect } from "vitest";
import { getCompanyDossier, formatCompanyDossierPrompt } from "../app/lib/companyDossier";

describe("companyDossier", () => {
  it("resuelve dossier por nombre canónico o alias", () => {
    const meli1 = getCompanyDossier("MercadoLibre");
    const meli2 = getCompanyDossier("meli");
    const meli3 = getCompanyDossier("Mercado Pago");

    expect(meli1?.canonicalName).toBe("MercadoLibre");
    expect(meli2?.canonicalName).toBe("MercadoLibre");
    expect(meli3?.canonicalName).toBe("MercadoLibre");
    expect(meli1?.techStack).toContain("Go (Golang)");
    expect(meli1?.notableTools.some((t) => t.includes("Fury"))).toBe(true);

    const stripe = getCompanyDossier("Stripe");
    expect(stripe?.canonicalName).toBe("Stripe");
    expect(stripe?.techStack).toContain("Ruby (Sorbet typed)");

    const uber = getCompanyDossier("Uber");
    expect(uber?.canonicalName).toBe("Uber");
    expect(uber?.notableTools.some((t) => t.includes("Schemaless"))).toBe(true);

    const globant = getCompanyDossier("Intermedia");
    expect(globant?.canonicalName).toBe("Globant");
    expect(globant?.techStack).toContain("Google Cloud Platform (GCP)");
    expect(globant?.techStack).toContain("Google Cloud VMware Engine (GCVE)");

    const vairix = getCompanyDossier("VAIRIX");
    expect(vairix?.canonicalName).toBe("VAIRIX");
    expect(vairix?.techStack).toContain("TypeScript");
    expect(vairix?.techStack).toContain("AI / LLM / RAG");
    expect(vairix?.techStack).toContain("pgvector");
    expect(vairix?.notableTools.some((t) => t.includes("Langfuse"))).toBe(true);
  });

  it("devuelve undefined para empresas desconocidas", () => {
    const unknown = getCompanyDossier("EmpresaFicticia123XYZ");
    expect(unknown).toBeUndefined();
  });

  it("formatea el prompt de contexto para la empresa adecuadamente", () => {
    const dossier = getCompanyDossier("Netflix");
    const formatted = formatCompanyDossierPrompt(dossier);

    expect(formatted).toContain("NETFLIX");
    expect(formatted).toContain("Chaos Monkey");
    expect(formatted).toContain("Freedom and Responsibility");
  });
});
