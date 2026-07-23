import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { AnalyticsClient } from "./lib/analytics-client";
import "./globals.css";

// Dominio base para resolver OG/Twitter images y URLs absolutas. Se puede
// pisar con NEXT_PUBLIC_SITE_URL en Vercel; default al dominio de producción.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://loro-copilot.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Loro Copilot — Asistente profesional de entrevistas con IA",
  description:
    "Transcribe entrevistas en tiempo real y recibe respuestas alineadas con tu perfil, la empresa y el puesto. Profesional, rápido y listo para usar.",
  applicationName: "Loro Copilot",
  keywords: [
    "copiloto de entrevistas",
    "entrevistas con IA",
    "simulador de entrevistas",
    "IA para entrevistas de trabajo",
    "preparación de entrevistas",
    "entrevista de trabajo",
    "Loro Copilot",
  ],
  authors: [{ name: "Loro Copilot" }],
  creator: "Loro Copilot",
  publisher: "Loro Copilot",
  formatDetection: { telephone: false, email: false, address: false },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Loro Copilot",
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: SITE_URL,
    siteName: "Loro Copilot",
    title: "Asistente profesional de entrevistas con IA.",
    description:
      "Transcribe entrevistas en tiempo real y recibe respuestas alineadas con tu perfil y contexto profesional.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Asistente profesional de entrevistas con IA.",
    description:
      "Transcribe entrevistas en tiempo real y recibe respuestas alineadas con tu perfil, empresa y puesto.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Sin maximumScale: bloquear el pinch-zoom rompe accesibilidad (WCAG 1.4.4).
  viewportFit: "cover",
  themeColor: "#f4f5f7",
};

// Datos estructurados (JSON-LD): ayudan a Google (rich results) y a las IA
// (ChatGPT, Perplexity, Gemini) a entender qué es Loro Copilot y citarlo.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Interview Copilot",
      url: SITE_URL,
      logo: `${SITE_URL}/apple-icon`,
      description:
        "Loro Copilot es un asistente de IA para entrevistas de trabajo: un simulador para practicar y un copiloto que sugiere respuestas en tiempo real.",
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Loreado.IA",
      inLanguage: "es",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#app`,
      name: "Interview Copilot",
      url: SITE_URL,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      inLanguage: "es",
      description:
        "Copiloto y simulador de entrevistas con IA: practicá entrevistas de trabajo con un entrevistador de IA y recibí respuestas en vivo, alineadas con tu perfil profesional.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <Analytics />
        <AnalyticsClient />
      </body>
    </html>
  );
}
