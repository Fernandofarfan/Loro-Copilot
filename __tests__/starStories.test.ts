// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useInterviewContext, STARStory } from "../app/hooks/useInterviewContext";

describe("useInterviewContext - STAR Stories Vault", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("permite guardar una nueva historia STAR y persistirla en localStorage", () => {
    const { result } = renderHook(() => useInterviewContext());

    const story: Omit<STARStory, "id"> = {
      title: "Optimización de Latencia en Postgres",
      situation: "La base de datos se saturaba durante los picos de las 14:00.",
      task: "Reducir el tiempo p95 de 450ms a menos de 50ms sin migrar de motor.",
      action: "Implementé pooling de conexiones con PgBouncer e indexación compuesta BRIN/B-Tree.",
      result: "Latencia p95 bajó a 18ms y ahorramos $2,400 USD mensuales en instancias RDS.",
      tags: ["PostgreSQL", "Performance", "DBA"],
    };

    act(() => {
      result.current.saveSTARStory(story);
    });

    expect(result.current.starStories.length).toBe(1);
    expect(result.current.starStories[0].title).toBe("Optimización de Latencia en Postgres");
    expect(result.current.starStories[0].id).toBeDefined();

    const stored = localStorage.getItem("loro-star-stories:v1");
    expect(stored).toContain("Optimización de Latencia en Postgres");
  });

  it("permite eliminar una historia STAR", () => {
    const { result } = renderHook(() => useInterviewContext());

    act(() => {
      result.current.saveSTARStory({
        id: "star_123",
        title: "Migración a Kafka",
        situation: "Monolito síncrono",
        task: "Desacoplar pagos",
        action: "Event-driven architecture con Kafka",
        result: "Zero data loss",
      });
    });

    expect(result.current.starStories.length).toBe(1);

    act(() => {
      result.current.deleteSTARStory("star_123");
    });

    expect(result.current.starStories.length).toBe(0);
  });
});
