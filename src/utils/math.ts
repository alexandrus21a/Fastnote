// ========== TOKENIZER ==========

type Token =
  | { type: 'number'; value: number }
  | { type: 'variable'; name: string }
  | { type: 'operator'; op: string; precedence: number; rightAssociative: boolean }
  | { type: 'function'; name: string }
  | { type: 'lparen' }
  | { type: 'rparen' }
  | { type: 'comma' };

const FUNCTIONS = new Set([
  'sin', 'cos', 'tan', 'asin', 'acos', 'atan',
  'log', 'ln', 'sqrt', 'abs', 'floor', 'ceil', 'round',
  'pow', 'min', 'max',
]);

const CONSTANTS: Record<string, number> = {
  PI: Math.PI,
  E: Math.E,
};

function getPrecedence(op: string): number {
  switch (op) {
    case '+':
    case '-':
      return 1;
    case '*':
    case '/':
    case '%':
      return 2;
    case '^':
      return 4;
    default:
      return 0;
  }
}

function tokenize(expr: string): Token[] | null {
  const tokens: Token[] = [];
  let i = 0;

  while (i < expr.length) {
    const ch = expr[i];

    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    // Number (integer or decimal)
    if (/\d/.test(ch) || ch === '.') {
      let num = '';
      let dotCount = 0;
      while (i < expr.length && (/\d/.test(expr[i]) || expr[i] === '.')) {
        if (expr[i] === '.') dotCount++;
        if (dotCount > 1) return null;
        num += expr[i++];
      }
      const value = parseFloat(num);
      if (isNaN(value)) return null;
      tokens.push({ type: 'number', value });
      continue;
    }

    // Variable, function, or constant
    if (/[a-zA-Z_]/.test(ch)) {
      let name = '';
      while (i < expr.length && /[a-zA-Z0-9_]/.test(expr[i])) {
        name += expr[i++];
      }
      if (CONSTANTS[name] !== undefined) {
        tokens.push({ type: 'number', value: CONSTANTS[name] });
      } else if (FUNCTIONS.has(name)) {
        tokens.push({ type: 'function', name });
      } else {
        tokens.push({ type: 'variable', name });
      }
      continue;
    }

    // Two-character operators
    if (ch === '*' && expr[i + 1] === '*') {
      tokens.push({ type: 'operator', op: '^', precedence: 4, rightAssociative: true });
      i += 2;
      continue;
    }

    // Single-character operators
    if (ch === '+' || ch === '-' || ch === '*' || ch === '/' || ch === '%') {
      tokens.push({ type: 'operator', op: ch, precedence: getPrecedence(ch), rightAssociative: false });
      i++;
      continue;
    }
    if (ch === '^') {
      tokens.push({ type: 'operator', op: ch, precedence: 4, rightAssociative: true });
      i++;
      continue;
    }

    if (ch === '(') {
      tokens.push({ type: 'lparen' });
      i++;
      continue;
    }
    if (ch === ')') {
      tokens.push({ type: 'rparen' });
      i++;
      continue;
    }
    if (ch === ',') {
      tokens.push({ type: 'comma' });
      i++;
      continue;
    }

    return null; // invalid character
  }

  return tokens;
}

// ========== SHUNTING YARD → RPN ==========

type RPNToken =
  | { type: 'number'; value: number }
  | { type: 'variable'; name: string }
  | { type: 'operator'; op: string }
  | { type: 'function'; name: string; argCount: number };

function toRPN(tokens: Token[]): RPNToken[] | null {
  const output: RPNToken[] = [];
  const opStack: (Token & { type: 'operator' | 'function' | 'lparen' })[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];

    if (tok.type === 'number' || tok.type === 'variable') {
      output.push(tok);
      continue;
    }

    if (tok.type === 'function') {
      opStack.push(tok);
      continue;
    }

    if (tok.type === 'comma') {
      while (opStack.length > 0 && opStack[opStack.length - 1].type !== 'lparen') {
        const top = opStack.pop()!;
        if (top.type === 'operator') output.push({ type: 'operator', op: top.op });
        else if (top.type === 'function') output.push({ type: 'function', name: top.name, argCount: 1 });
      }
      if (opStack.length === 0) return null; // mismatched parens
      continue;
    }

    if (tok.type === 'operator') {
      while (opStack.length > 0) {
        const top = opStack[opStack.length - 1];
        if (top.type !== 'operator') break;
        if (
          (tok.rightAssociative && tok.precedence < top.precedence) ||
          (!tok.rightAssociative && tok.precedence <= top.precedence)
        ) {
          opStack.pop();
          output.push({ type: 'operator', op: top.op });
        } else {
          break;
        }
      }
      opStack.push(tok);
      continue;
    }

    if (tok.type === 'lparen') {
      opStack.push(tok);
      continue;
    }

    if (tok.type === 'rparen') {
      while (opStack.length > 0 && opStack[opStack.length - 1].type !== 'lparen') {
        const top = opStack.pop()!;
        if (top.type === 'operator') output.push({ type: 'operator', op: top.op });
        else if (top.type === 'function') output.push({ type: 'function', name: top.name, argCount: 1 });
      }
      if (opStack.length === 0) return null; // mismatched parens
      opStack.pop(); // pop lparen

      if (opStack.length > 0 && opStack[opStack.length - 1].type === 'function') {
        const fn = opStack.pop()! as Token & { type: 'function' };
        output.push({ type: 'function', name: fn.name, argCount: 1 });
      }
      continue;
    }
  }

  while (opStack.length > 0) {
    const top = opStack.pop()!;
    if (top.type === 'lparen') return null; // mismatched
    if (top.type === 'operator') output.push({ type: 'operator', op: top.op });
    else if (top.type === 'function') output.push({ type: 'function', name: top.name, argCount: 1 });
  }

  return output;
}

// ========== EVALUATE RPN ==========

function applyFunction(name: string, args: number[]): number | null {
  switch (name) {
    case 'sin':
      return args.length === 1 ? Math.sin(args[0]) : null;
    case 'cos':
      return args.length === 1 ? Math.cos(args[0]) : null;
    case 'tan':
      return args.length === 1 ? Math.tan(args[0]) : null;
    case 'asin':
      return args.length === 1 ? Math.asin(args[0]) : null;
    case 'acos':
      return args.length === 1 ? Math.acos(args[0]) : null;
    case 'atan':
      return args.length === 1 ? Math.atan(args[0]) : null;
    case 'log':
      return args.length === 1 ? Math.log10(args[0]) : null;
    case 'ln':
      return args.length === 1 ? Math.log(args[0]) : null;
    case 'sqrt':
      return args.length === 1 ? Math.sqrt(args[0]) : null;
    case 'abs':
      return args.length === 1 ? Math.abs(args[0]) : null;
    case 'floor':
      return args.length === 1 ? Math.floor(args[0]) : null;
    case 'ceil':
      return args.length === 1 ? Math.ceil(args[0]) : null;
    case 'round':
      return args.length === 1 ? Math.round(args[0]) : null;
    case 'pow':
      return args.length === 2 ? Math.pow(args[0], args[1]) : null;
    case 'min':
      return Math.min(...args);
    case 'max':
      return Math.max(...args);
    default:
      return null;
  }
}

function evaluateRPN(rpn: RPNToken[], variables: Record<string, number>): number | null {
  const stack: number[] = [];

  for (const tok of rpn) {
    if (tok.type === 'number') {
      stack.push(tok.value);
      continue;
    }

    if (tok.type === 'variable') {
      const val = variables[tok.name];
      if (val === undefined) return null; // unknown variable
      stack.push(val);
      continue;
    }

    if (tok.type === 'operator') {
      if (stack.length < 2) return null;
      const b = stack.pop()!;
      const a = stack.pop()!;
      let res: number;
      switch (tok.op) {
        case '+':
          res = a + b;
          break;
        case '-':
          res = a - b;
          break;
        case '*':
          res = a * b;
          break;
        case '/':
          if (b === 0) return null;
          res = a / b;
          break;
        case '%':
          if (b === 0) return null;
          res = a % b;
          break;
        case '^':
          res = Math.pow(a, b);
          break;
        default:
          return null;
      }
      stack.push(res);
      continue;
    }

    if (tok.type === 'function') {
      const args: number[] = [];
      // Pop arguments. For multi-arg functions, we need to know how many.
      // Simple heuristic: pop until we hit a sentinel or use argCount.
      // Actually for simplicity, most functions are 1-arg except pow/min/max.
      // We'll pop 1 for standard, 2 for pow, and all remaining for min/max.
      let argCount = 1;
      if (tok.name === 'pow') argCount = 2;
      else if (tok.name === 'min' || tok.name === 'max') {
        // Pop all available arguments (up to stack size)
        argCount = stack.length;
      }

      if (stack.length < argCount) return null;
      for (let i = 0; i < argCount; i++) {
        args.unshift(stack.pop()!);
      }
      const res = applyFunction(tok.name, args);
      if (res === null) return null;
      stack.push(res);
      continue;
    }
  }

  if (stack.length !== 1) return null;
  const final = stack[0];
  if (!Number.isFinite(final)) return null;
  return Math.round(final * 1e10) / 1e10;
}

// ========== VARIABLE EXTRACTION ==========

const VAR_ASSIGN_REGEX = /^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(-?\d+(?:\.\d+)?)\s*$/;

export function extractVariables(content: string): Record<string, number> {
  const vars: Record<string, number> = {};
  const lines = content.split('\n');
  for (const line of lines) {
    const match = line.match(VAR_ASSIGN_REGEX);
    if (match) {
      vars[match[1]] = parseFloat(match[2]);
    }
  }
  return vars;
}

// ========== PUBLIC API ==========

export function evaluateMathExpression(
  expr: string,
  variables: Record<string, number> = {}
): number | null {
  const tokens = tokenize(expr);
  if (!tokens) return null;
  const rpn = toRPN(tokens);
  if (!rpn) return null;
  return evaluateRPN(rpn, variables);
}

export function autoCalculateLine(line: string, content: string = ''): string | null {
  const trimmed = line.trimEnd();
  if (!trimmed.endsWith('=')) return null;

  const expr = trimmed.slice(0, -1).trim();
  if (!expr) return null;

  const variables = extractVariables(content);
  const result = evaluateMathExpression(expr, variables);
  if (result === null) return null;

  const formatted = Number.isInteger(result) ? String(result) : String(result);
  return trimmed + formatted;
}
