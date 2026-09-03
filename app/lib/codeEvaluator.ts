/**
 * codeEvaluator.ts — Extractor y evaluador estático de código generado por el LLM en vivo.
 * Valida balance sintáctico, complejidad Big-O y compatibilidad en <50ms en el navegador.
 */

export interface CodeEvaluation {
  language: string;
  code: string;
  isValid: boolean;
  error?: string;
  lineCount: number;
  complexity?: {
    time?: string;
    space?: string;
  };
}

/**
 * Verifica balance de delimitadores () [] {} en cualquier snippet
 */
function checkDelimiterBalance(code: string): { balanced: boolean; error?: string } {
  const stack: string[] = [];
  const pairs: Record<string, string> = { ")": "(", "]": "[", "}": "{" };

  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inBacktick = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = 0; i < code.length; i++) {
    const char = code[i];
    const prev = i > 0 ? code[i - 1] : "";
    const next = i < code.length - 1 ? code[i + 1] : "";

    // Manejo de comentarios
    if (inLineComment) {
      if (char === "\n") inLineComment = false;
      continue;
    }
    if (inBlockComment) {
      if (char === "*" && next === "/") {
        inBlockComment = false;
        i++;
      }
      continue;
    }

    // Inicio de comentarios
    if (!inSingleQuote && !inDoubleQuote && !inBacktick) {
      if (char === "/" && next === "/") {
        inLineComment = true;
        i++;
        continue;
      }
      if (char === "/" && next === "*") {
        inBlockComment = true;
        i++;
        continue;
      }
      if (char === "#") {
        // Comentario de Python
        inLineComment = true;
        continue;
      }
    }

    // Manejo de strings
    if (char === "'" && prev !== "\\" && !inDoubleQuote && !inBacktick) {
      inSingleQuote = !inSingleQuote;
      continue;
    }
    if (char === '"' && prev !== "\\" && !inSingleQuote && !inBacktick) {
      inDoubleQuote = !inDoubleQuote;
      continue;
    }
    if (char === "`" && prev !== "\\" && !inSingleQuote && !inDoubleQuote) {
      inBacktick = !inBacktick;
      continue;
    }

    if (inSingleQuote || inDoubleQuote || inBacktick) continue;

    // Conteo de delimitadores
    if (char === "(" || char === "[" || char === "{") {
      stack.push(char);
    } else if (char === ")" || char === "]" || char === "}") {
      if (stack.length === 0 || stack[stack.length - 1] !== pairs[char]) {
        return { balanced: false, error: `Delimitador inesperado o desbalanceado: '${char}'` };
      }
      stack.pop();
    }
  }

  if (stack.length > 0) {
    return { balanced: false, error: `Delimitador sin cerrar: '${stack[stack.length - 1]}'` };
  }

  return { balanced: true };
}

/**
 * Evalúa estáticamente snippets en JS/TS
 */
function evaluateJavaScriptSyntax(code: string): { isValid: boolean; error?: string } {
  const balance = checkDelimiterBalance(code);
  if (!balance.balanced) return { isValid: false, error: balance.error };

  // Verificación sintáctica segura sin ejecutar código
  try {
    // Usar el constructor Function solo para verificar parsing sintáctico si no contiene TypeScript types
    const hasTsTypes = /:\s*(string|number|boolean|any|void|unknown|never|Record<|Array<|[A-Z][a-zA-Z0-9]+(\[\])?)/.test(code);
    if (!hasTsTypes) {
      new Function(code);
    }
    return { isValid: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { isValid: false, error: msg };
  }
}

/**
 * Evalúa estáticamente indentación y estructura en Python
 */
function evaluatePythonSyntax(code: string): { isValid: boolean; error?: string } {
  const balance = checkDelimiterBalance(code);
  if (!balance.balanced) return { isValid: false, error: balance.error };

  const lines = code.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    // Comprobar si una sentencia termina en : y la siguiente línea está indentada
    if (trimmed.endsWith(":") && i < lines.length - 1) {
      const nextNonEmpty = lines.slice(i + 1).find((l) => l.trim() && !l.trim().startsWith("#"));
      if (nextNonEmpty) {
        const currentIndent = line.search(/\S/);
        const nextIndent = nextNonEmpty.search(/\S/);
        if (nextIndent <= currentIndent) {
          return {
            isValid: false,
            error: `Error de indentación en línea ${i + 2}: esperaba bloque indentado tras ':'`,
          };
        }
      }
    }
  }

  return { isValid: true };
}

/**
 * Detecta complejidades Big-O en el texto
 */
function extractBigO(text: string): { time?: string; space?: string } | undefined {
  const timeMatch = text.match(/O\([^)]+\)\s*(?:(?:en\s*)?tiempo|temporal|time)/i)
    || text.match(/(?:tiempo|temporal|time):\s*O\([^)]+\)/i)
    || text.match(/O\([^)]+\)/i);

  const spaceMatch = text.match(/O\([^)]+\)\s*(?:(?:en\s*)?espacio|espacial|space)/i)
    || text.match(/(?:espacio|espacial|space):\s*O\([^)]+\)/i);

  if (timeMatch || spaceMatch) {
    return {
      time: timeMatch ? timeMatch[0].trim() : undefined,
      space: spaceMatch ? spaceMatch[0].trim() : undefined,
    };
  }
  return undefined;
}

/**
 * Extrae y valida todos los bloques de código en un texto Markdown
 */
export function extractAndEvaluateCode(markdownText: string): CodeEvaluation[] {
  if (!markdownText) return [];

  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  const evaluations: CodeEvaluation[] = [];

  let match: RegExpExecArray | null;
  while ((match = codeBlockRegex.exec(markdownText)) !== null) {
    const lang = (match[1] || "text").toLowerCase().trim();
    const code = match[2].trim();
    const lineCount = code.split("\n").length;

    let evalResult: { isValid: boolean; error?: string } = { isValid: true };

    if (lang === "js" || lang === "javascript" || lang === "ts" || lang === "typescript") {
      evalResult = evaluateJavaScriptSyntax(code);
    } else if (lang === "py" || lang === "python") {
      evalResult = evaluatePythonSyntax(code);
    } else {
      const res = checkDelimiterBalance(code);
      evalResult = { isValid: res.balanced, error: res.error };
    }

    evaluations.push({
      language: lang,
      code,
      isValid: evalResult.isValid,
      error: evalResult.error,
      lineCount,
      complexity: extractBigO(markdownText),
    });
  }

  return evaluations;
}
