import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Loro Copilot — Acceso beta",
  description: "Asistente profesional de entrevistas con IA. Acceso beta cerrado.",
  alternates: { canonical: "/copiloto" },
};

export default function Copiloto() {
  return (
    <div className="landing">
      <main className="landing-main">
        <h1 className="landing-title">
          Tu copiloto de entrevistas, preparado para los momentos clave.
        </h1>

        <Image
          src="/toby.gif"
          alt="Toby de RRHH"
          width={320}
          height={240}
          unoptimized
          className="landing-sticker"
        />

        <h2 className="landing-sub">Acceso beta cerrado.</h2>

        <div className="landing-btn-wrap">
          <div className="landing-glow" aria-hidden="true" />
          <Link href="/app" className="landing-btn">
            Usar en mi Entrevista
          </Link>
        </div>

        <p className="landing-btn-sub">Indetectable. Funciona en Google Meet y Zoom.</p>

        <p className="landing-warn">
          ⚠️ Estamos experimentando una demanda excepcionalmente alta. Por favor, tené
          paciencia mientras trabajamos en escalar nuestros sistemas.
        </p>
      </main>
    </div>
  );
}
