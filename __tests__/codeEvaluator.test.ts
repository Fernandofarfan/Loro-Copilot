import { describe, it, expect } from "vitest";
import { extractAndEvaluateCode } from "../app/lib/codeEvaluator";

describe("codeEvaluator", () => {
  it("extrae bloques de código Markdown correctamente", () => {
    const md = `
Aquí está la solución en TypeScript:
\`\`\`typescript
function twoSum(nums: number[], target: number): number[] {
  const map = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement)!, i];
    }
    map.set(nums[i], i);
  }
  return [];
}
\`\`\`
Complejidad: O(N) en tiempo y O(N) en espacio.
`;

    const evals = extractAndEvaluateCode(md);
    expect(evals).toHaveLength(1);
    expect(evals[0].language).toBe("typescript");
    expect(evals[0].isValid).toBe(true);
    expect(evals[0].lineCount).toBeGreaterThan(5);
    expect(evals[0].complexity?.time).toBeDefined();
  });

  it("detecta delimitadores desbalanceados en JavaScript", () => {
    const md = `
\`\`\`javascript
function badCode() {
  if (true) {
    console.log("Falta cerrar llave");
}
\`\`\`
`;
    const evals = extractAndEvaluateCode(md);
    expect(evals).toHaveLength(1);
    expect(evals[0].isValid).toBe(false);
    expect(evals[0].error).toMatch(/delimitador/i);
  });

  it("valida indentación tras dos puntos en Python", () => {
    const validPy = `
\`\`\`python
def find_max(arr):
    if not arr:
        return None
    return max(arr)
\`\`\`
`;
    const evals = extractAndEvaluateCode(validPy);
    expect(evals[0].isValid).toBe(true);

    const invalidPy = `
\`\`\`python
def bad_func():
return 42
\`\`\`
`;
    const badEvals = extractAndEvaluateCode(invalidPy);
    expect(badEvals[0].isValid).toBe(false);
    expect(badEvals[0].error).toMatch(/indentación/i);
  });

  it("extrae complejidades Big-O correctamente", () => {
    const md = `
[KEY] Hash Map | O(N) tiempo | O(1) espacio [/KEY]
\`\`\`go
func solve() {}
\`\`\`
`;
    const evals = extractAndEvaluateCode(md);
    expect(evals[0].complexity?.time).toMatch(/O\(N\)/i);
    expect(evals[0].complexity?.space).toMatch(/O\(1\)/i);
  });
});
