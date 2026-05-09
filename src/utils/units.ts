// ========== UNIT CONVERSIONS ==========
// All conversions go through a base unit (SI or standard)

interface UnitDef {
  toBase: (v: number) => number;
  fromBase: (v: number) => number;
  symbol: string;
}

const LENGTH: Record<string, UnitDef> = {
  km: { toBase: (v) => v * 1000, fromBase: (v) => v / 1000, symbol: 'km' },
  m: { toBase: (v) => v, fromBase: (v) => v, symbol: 'm' },
  cm: { toBase: (v) => v / 100, fromBase: (v) => v * 100, symbol: 'cm' },
  mm: { toBase: (v) => v / 1000, fromBase: (v) => v * 1000, symbol: 'mm' },
  mi: { toBase: (v) => v * 1609.344, fromBase: (v) => v / 1609.344, symbol: 'mi' },
  ft: { toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048, symbol: 'ft' },
  in: { toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254, symbol: 'in' },
  yd: { toBase: (v) => v * 0.9144, fromBase: (v) => v / 0.9144, symbol: 'yd' },
  nm: { toBase: (v) => v * 1852, fromBase: (v) => v / 1852, symbol: 'nm' },
};

const WEIGHT: Record<string, UnitDef> = {
  kg: { toBase: (v) => v, fromBase: (v) => v, symbol: 'kg' },
  g: { toBase: (v) => v / 1000, fromBase: (v) => v * 1000, symbol: 'g' },
  mg: { toBase: (v) => v / 1_000_000, fromBase: (v) => v * 1_000_000, symbol: 'mg' },
  lb: { toBase: (v) => v * 0.453592, fromBase: (v) => v / 0.453592, symbol: 'lb' },
  oz: { toBase: (v) => v * 0.0283495, fromBase: (v) => v / 0.0283495, symbol: 'oz' },
  t: { toBase: (v) => v * 1000, fromBase: (v) => v / 1000, symbol: 't' },
};

const TEMPERATURE: Record<string, UnitDef> = {
  C: {
    toBase: (v) => v,
    fromBase: (v) => v,
    symbol: '°C',
  },
  F: {
    toBase: (v) => ((v - 32) * 5) / 9,
    fromBase: (v) => (v * 9) / 5 + 32,
    symbol: '°F',
  },
  K: {
    toBase: (v) => v - 273.15,
    fromBase: (v) => v + 273.15,
    symbol: 'K',
  },
};

const VOLUME: Record<string, UnitDef> = {
  L: { toBase: (v) => v, fromBase: (v) => v, symbol: 'L' },
  ml: { toBase: (v) => v / 1000, fromBase: (v) => v * 1000, symbol: 'ml' },
  gal: { toBase: (v) => v * 3.78541, fromBase: (v) => v / 3.78541, symbol: 'gal' },
  qt: { toBase: (v) => v * 0.946353, fromBase: (v) => v / 0.946353, symbol: 'qt' },
  pt: { toBase: (v) => v * 0.473176, fromBase: (v) => v / 0.473176, symbol: 'pt' },
  cup: { toBase: (v) => v * 0.236588, fromBase: (v) => v / 0.236588, symbol: 'cup' },
  floz: { toBase: (v) => v * 0.0295735, fromBase: (v) => v / 0.0295735, symbol: 'fl oz' },
};

const AREA: Record<string, UnitDef> = {
  m2: { toBase: (v) => v, fromBase: (v) => v, symbol: 'm²' },
  km2: { toBase: (v) => v * 1_000_000, fromBase: (v) => v / 1_000_000, symbol: 'km²' },
  ft2: { toBase: (v) => v * 0.092903, fromBase: (v) => v / 0.092903, symbol: 'ft²' },
  ac: { toBase: (v) => v * 4046.86, fromBase: (v) => v / 4046.86, symbol: 'ac' },
  ha: { toBase: (v) => v * 10_000, fromBase: (v) => v / 10_000, symbol: 'ha' },
};

const SPEED: Record<string, UnitDef> = {
  kph: { toBase: (v) => v, fromBase: (v) => v, symbol: 'km/h' },
  mph: { toBase: (v) => v * 1.60934, fromBase: (v) => v / 1.60934, symbol: 'mph' },
  ms: { toBase: (v) => v * 3.6, fromBase: (v) => v / 3.6, symbol: 'm/s' },
  kn: { toBase: (v) => v * 1.852, fromBase: (v) => v / 1.852, symbol: 'kn' },
};

const CATEGORIES = {
  length: LENGTH,
  weight: WEIGHT,
  temperature: TEMPERATURE,
  volume: VOLUME,
  area: AREA,
  speed: SPEED,
};

function findUnit(code: string): { category: string; unit: UnitDef } | null {
  for (const [category, units] of Object.entries(CATEGORIES)) {
    if (units[code]) {
      return { category, unit: units[code] };
    }
  }
  return null;
}

export function convertUnit(amount: number, from: string, to: string): { value: number; symbol: string } | null {
  const fromDef = findUnit(from);
  const toDef = findUnit(to);
  if (!fromDef || !toDef) return null;
  if (fromDef.category !== toDef.category) return null;

  // Temperature is special: we can't go through a simple base unit
  if (fromDef.category === 'temperature') {
    const celsius = fromDef.unit.toBase(amount);
    const result = toDef.unit.fromBase(celsius);
    return { value: Math.round(result * 100) / 100, symbol: toDef.unit.symbol };
  }

  const baseValue = fromDef.unit.toBase(amount);
  const result = toDef.unit.fromBase(baseValue);
  return { value: Math.round(result * 100) / 100, symbol: toDef.unit.symbol };
}

// ========== PARSE UNIT EXPRESSIONS ==========

interface UnitAmount {
  amount: number;
  code: string;
  symbol: string;
}

function parseUnitAmount(str: string): UnitAmount | null {
  const trimmed = str.trim();

  // Number followed by unit: 15km, 100lb
  const numFirst = trimmed.match(/^([\d.]+)\s*([a-zA-Z0-9²²°\/]+)$/);
  if (numFirst) {
    const code = numFirst[2].replace(/²/g, '2').replace(/°/g, '');
    const def = findUnit(code);
    if (def) {
      return { amount: parseFloat(numFirst[1]), code, symbol: def.unit.symbol };
    }
  }

  // Unit followed by number: km15 (less common)
  // Not supporting this for now

  return null;
}

/**
 * Parse expressions like "15km+3mi" or "100lb-20kg"
 */
export function parseMixedUnitExpression(expr: string): {
  amounts: UnitAmount[];
  ops: string[];
} | null {
  const parts = expr.split(/([+\-])/);
  if (parts.length < 1) return null;

  const amounts: UnitAmount[] = [];
  const ops: string[] = [];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].trim();
    if (!part) continue;

    if (part === '+' || part === '-') {
      ops.push(part);
      continue;
    }

    const amount = parseUnitAmount(part);
    if (!amount) return null;
    amounts.push(amount);
  }

  if (amounts.length === 0) return null;
  if (amounts.length > 1 && ops.length !== amounts.length - 1) return null;

  return { amounts, ops };
}

/**
 * Evaluate a unit expression.
 * Returns a formatted string like "= 18.2km" or null if invalid.
 */
export function evaluateUnitExpression(expr: string): string | null {
  const trimmed = expr.trim();
  if (!trimmed) return null;

  // Direct conversion: "15 km to mi" or "15km в mi"
  const directConv = trimmed.match(/^(.+?)\s+(?:to|в)\s+(.+)$/i);
  if (directConv) {
    const fromAmt = parseUnitAmount(directConv[1]);
    const toCode = directConv[2].trim().replace(/²/g, '2').replace(/°/g, '');
    if (fromAmt) {
      const result = convertUnit(fromAmt.amount, fromAmt.code, toCode);
      if (result) {
        const formatted = Number.isInteger(result.value) ? String(result.value) : result.value.toFixed(2);
        return `= ${formatted}${result.symbol}`;
      }
    }
  }

  // Mixed expression: "15km+3mi"
  const mixed = parseMixedUnitExpression(trimmed);
  if (mixed && mixed.amounts.length > 0) {
    const targetCode = mixed.amounts[0].code;
    const targetSymbol = mixed.amounts[0].symbol;

    let total = mixed.amounts[0].amount;

    for (let i = 1; i < mixed.amounts.length; i++) {
      const converted = convertUnit(mixed.amounts[i].amount, mixed.amounts[i].code, targetCode);
      if (!converted) return null;
      const op = mixed.ops[i - 1];
      if (op === '+') total += converted.value;
      else if (op === '-') total -= converted.value;
    }

    total = Math.round(total * 100) / 100;
    const formatted = Number.isInteger(total) ? String(total) : total.toFixed(2);
    return `= ${formatted}${targetSymbol}`;
  }

  return null;
}

/**
 * Given a line ending with '=', try to evaluate it as a unit conversion.
 * Returns the full line with result appended, or null.
 */
export function autoCalculateUnitLine(line: string): string | null {
  const trimmed = line.trimEnd();
  if (!trimmed.endsWith('=')) return null;

  const expr = trimmed.slice(0, -1).trim();
  if (!expr) return null;

  const result = evaluateUnitExpression(expr);
  if (result) {
    return trimmed + ' ' + result;
  }
  return null;
}
