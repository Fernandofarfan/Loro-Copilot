import type { Metadata, Viewport } from "next";
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
  viewportFit: "cover",
  themeColor: "#090a0f",
};

// Datos estructurados (JSON-LD): ayudan a Google (rich results) y a las IA
// (ChatGPT, Perplexity, Gemini) a entender qué es Loro Copilot y citarlo.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Loro Copilot",
      url: SITE_URL,
      logo: `${SITE_URL}/apple-icon`,
      description:
        "Loro Copilot es un asistente de IA para entrevistas de trabajo: un simulador para practicar y un copiloto que sugiere respuestas en tiempo real.",
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Loro Copilot",
      inLanguage: "es",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#app`,
      name: "Loro Copilot",
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
    <html lang="es" className="dark" style={{ colorScheme: "dark", backgroundColor: "#090a0f", color: "#f8fafc" }}>
      <body className="dark bg-[#090a0f] text-[#f8fafc] min-h-screen" style={{ backgroundColor: "#090a0f", color: "#f8fafc" }}>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== "undefined") {
                window.addEventListener("error", function(e) {
                  var isExt = (e.filename && (e.filename.indexOf("chrome-extension://") !== -1 || e.filename.indexOf("moz-extension://") !== -1)) ||
                              (e.error && e.error.stack && (e.error.stack.indexOf("chrome-extension://") !== -1 || e.error.stack.indexOf("moz-extension://") !== -1));
                  if (isExt) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                  }
                }, true);
                window.addEventListener("unhandledrejection", function(e) {
                  var reason = e.reason ? (e.reason.stack || e.reason.message || String(e.reason)) : "";
                  if (reason.indexOf("chrome-extension://") !== -1 || reason.indexOf("moz-extension://") !== -1) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                  }
                }, true);
              }
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
