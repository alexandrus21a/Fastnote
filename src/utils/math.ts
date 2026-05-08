export function evaluateMathExpression(expr: string): number | null {
  const clean = expr.replace(/\s/g, '');

  // Only allow digits, operators, decimals, parentheses
  if (!/^[\d+\-*/%.()]+$/.test(clean)) return null;

  // Reject consecutive operators and empty parens
  if (/[+\-*/%]{2,}/.test(clean)) return null;
  if (/\(\)/.test(clean)) return null;
  if (/^[*/%]/.test(clean)) return null;
  if (/[+\-*/%]$/.test(clean)) return null;

  // Balanced parentheses check
  let depth = 0;
  for (const ch of clean) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (depth < 0) return null;
  }
  if (depth !== 0) return null;

  try {
    const result = Function('"use strict"; return (' + clean + ')')();
    if (typeof result === 'number' && Number.isFinite(result)) {
      // Clean up floating point artifacts
      return Math.round(result * 1e10) / 1e10;
    }
  } catch {
    /* ignore */
  }
  return null;
}

/**
 * Given text ending with something like "1+1=" or "(2+3)*4=",
 * returns the text with the result appended: "1+1=2" or "(2+3)*4=20".
 * Returns null if no valid math expression is found.
 */
export function autoCalculateLine(line: string): string | null {
  const trimmed = line.trimEnd();
  if (!trimmed.endsWith('=')) return null;

  const expr = trimmed.slice(0, -1).trim();
  if (!expr) return null;

  const result = evaluateMathExpression(expr);
  if (result === null) return null;

  // Format result: avoid trailing zeros for integers
  const formatted = Number.isInteger(result) ? String(result) : String(result);
  return trimmed + formatted;
}
