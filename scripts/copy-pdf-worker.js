// Copia el worker de pdf.js instalado a public/ para servirlo sin CDN ni asset de webpack.
const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "..", "node_modules", "pdfjs-dist", "build", "pdf.worker.min.mjs");
const dest = path.join(__dirname, "..", "public", "pdf.worker.min.mjs");

if (!fs.existsSync(src)) {
  console.warn("[copy-pdf-worker] pdfjs-dist no está instalado; se omite la copia.");
  process.exit(0);
}

fs.copyFileSync(src, dest);
console.log(`[copy-pdf-worker] ${path.basename(src)} copiado a public/.`);
