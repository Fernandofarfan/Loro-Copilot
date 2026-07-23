import type { Metadata } from "next";
import Hub from "./Hub";

export const metadata: Metadata = {
  title: "Loro Copilot — Asistente profesional de entrevistas con IA",
  description:
    "Entrená tu entrevista con un entrevistador de IA y recibí respuestas en tiempo real, alineadas con tu perfil profesional.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return <Hub />;
}
