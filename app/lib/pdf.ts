export async function extractTextFromPdf(file: File): Promise<string> {
  // Importación dinámica para evitar issues de SSR en Next.js
  const pdfjsLib = await import("pdfjs-dist");

  // Worker CDN fijado con protocolo seguro https
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str || "").join(" ");
    fullText += pageText + "\n";
  }

  return fullText.trim();
}
