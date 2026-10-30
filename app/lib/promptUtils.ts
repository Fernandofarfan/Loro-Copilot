// Escapa caracteres XML de delimitación para evitar inyección de prompt via inputs de usuario
export function sanitizeForPrompt(text: string): string {
  return text
    .replace(/</g, "‹")   // reemplazar < por guillemet izquierdo (similar visual, no interpretable como tag)
    .replace(/>/g, "›");  // reemplazar > por guillemet derecho
}
