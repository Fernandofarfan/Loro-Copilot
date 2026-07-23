import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interview Copilot — Copiloto de entrevistas en vivo",
  description:
    "El copiloto de IA que sugiere respuestas en tiempo real, alineadas con tu CV, la empresa y el puesto.",
  alternates: { canonical: "/app" },
  keywords: [
    "copiloto de entrevistas",
    "entrevistas en tiempo real",
    "IA para entrevistas de trabajo",
    "asistente de entrevistas",
    "respuestas en la entrevista",
  ],
  openGraph: {
    title: "Loro Copilot — Copiloto de entrevistas en vivo",
    description:
      "Recibí respuestas en tiempo real, alineadas con tu perfil profesional y el contexto de la empresa.",
    url: "/app",
  },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
