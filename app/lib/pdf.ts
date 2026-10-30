export async function extractTextFromPdf(file: File): Promise<string> {
  // Importación dinámica para evitar issues de SSR en Next.js
  const pdfjsLib = await import("pdfjs-dist");

  // Worker servido desde public/ (copiado por scripts/copy-pdf-worker.js en postinstall):
  // el asset de webpack no funciona porque el worker usa sintaxis que su parser no acepta
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => ("str" in item && typeof item.str === "string" ? item.str : ""))
      .join(" ");
    fullText += pageText + "\n";
  }

  return fullText.trim();
}
