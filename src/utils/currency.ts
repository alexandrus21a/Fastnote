const RATES_KEY = 'fastnote:rates';
const RATES_TTL = 60 * 60 * 1000; // 1 hour

interface RatesCache {
  base: string;
  rates: Record<string, number>;
  timestamp: number;
}

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  RUB: '₽',
  CNY: '¥',
  KZT: '₸',
  UAH: '₴',
  TRY: '₺',
  INR: '₹',
  KRW: '₩',
  CHF: 'Fr',
  CAD: 'C$',
  AUD: 'A$',
  BRL: 'R$',
};

const SYMBOL_TO_CODE: Record<string, string> = {
  '$': 'USD',
  '€': 'EUR',
  '£': 'GBP',
  '¥': 'JPY',
  '₽': 'RUB',
  '₸': 'KZT',
  '₴': 'UAH',
  '₺': 'TRY',
  '₹': 'INR',
  '₩': 'KRW',
};

function loadCache(): RatesCache | null {
  try {
    const raw = localStorage.getItem(RATES_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as RatesCache;
    if (Date.now() - parsed.timestamp > RATES_TTL) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveCache(cache: RatesCache) {
  localStorage.setItem(RATES_KEY, JSON.stringify(cache));
}

export async function fetchRates(): Promise<RatesCache | null> {
  const cached = loadCache();
  if (cached) return cached;

  try {
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    if (!res.ok) return null;
    const data = await res.json();
    const cache: RatesCache = {
      base: data.base,
      rates: data.rates as Record<string, number>,
      timestamp: Date.now(),
    };
    saveCache(cache);
    return cache;
  } catch {
    return null;
  }
}

export function convert(amount: number, from: string, to: string, rates: Record<string, number>): number | null {
  const fromRate = rates[from];
  const toRate = rates[to];
  if (!fromRate || !toRate) return null;
  const inUSD = amount / fromRate;
  const result = inUSD * toRate;
  return Math.round(result * 100) / 100;
}

interface CurrencyAmount {
  amount: number;
  code: string;
  symbol: string;
}

function parseCurrencyAmount(str: string): CurrencyAmount | null {
  const trimmed = str.trim();

  // Symbol after number: 100$, 2€, 50£
  const symbolAfter = trimmed.match(/^([\d.]+)\s*([$€£¥₽₸₴₺₹₩])$/);
  if (symbolAfter) {
    const code = SYMBOL_TO_CODE[symbolAfter[2]];
    if (code) {
      return { amount: parseFloat(symbolAfter[1]), code, symbol: symbolAfter[2] };
    }
  }

  // Symbol before number: $100, €2
  const symbolBefore = trimmed.match(/^([$€£¥₽₸₴₺₹₩])\s*([\d.]+)$/);
  if (symbolBefore) {
    const code = SYMBOL_TO_CODE[symbolBefore[1]];
    if (code) {
      return { amount: parseFloat(symbolBefore[2]), code, symbol: symbolBefore[1] };
    }
  }

  // Code after number: 100 USD, 2 EUR
  const codeAfter = trimmed.match(/^([\d.]+)\s*([A-Z]{3})$/);
  if (codeAfter) {
    const code = codeAfter[2];
    const symbol = CURRENCY_SYMBOLS[code] || code;
    return { amount: parseFloat(codeAfter[1]), code, symbol };
  }

  return null;
}

/**
 * Parse a mixed currency expression like "100$+2€" or "50 GBP + 30 USD"
 * Returns parsed amounts and the operator between them.
 */
export function parseMixedCurrencyExpression(expr: string): {
  amounts: CurrencyAmount[];
  ops: string[];
} | null {
  // Split by + or - operators
  const parts = expr.split(/([+\-])/);
  if (parts.length < 1) return null;

  const amounts: CurrencyAmount[] = [];
  const ops: string[] = [];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].trim();
    if (!part) continue;

    if (part === '+' || part === '-') {
      ops.push(part);
      continue;
    }

    const amount = parseCurrencyAmount(part);
    if (!amount) return null;
    amounts.push(amount);
  }

  if (amounts.length === 0) return null;
  if (amounts.length > 1 && ops.length !== amounts.length - 1) return null;

  return { amounts, ops };
}

/**
 * Evaluate a currency expression.
 * Returns a formatted string like "= 108.50$" or null if invalid.
 */
export async function evaluateCurrencyExpression(expr: string): Promise<string | null> {
  const trimmed = expr.trim();
  if (!trimmed) return null;

  // Direct conversion: "100 USD to EUR" or "100$ to €"
  const directConv = trimmed.match(/^(.+?)\s+(?:to|в)\s+(.+)$/i);
  if (directConv) {
    const fromAmt = parseCurrencyAmount(directConv[1]);
    const toCode = parseCurrencyAmount(directConv[2])?.code || directConv[2].trim().toUpperCase();
    if (fromAmt && toCode) {
      const cache = await fetchRates();
      if (!cache) return null;
      const result = convert(fromAmt.amount, fromAmt.code, toCode, cache.rates);
      if (result === null) return null;
      const symbol = CURRENCY_SYMBOLS[toCode] || toCode;
      const formatted = Number.isInteger(result) ? String(result) : result.toFixed(2);
      return `= ${formatted}${symbol}`;
    }
  }

  // Mixed expression: "100$+2€" or "50 GBP - 20 EUR"
  const mixed = parseMixedCurrencyExpression(trimmed);
  if (mixed && mixed.amounts.length > 0) {
    const cache = await fetchRates();
    if (!cache) return null;

    // Convert everything to the first currency's code
    const targetCode = mixed.amounts[0].code;
    const targetSymbol = mixed.amounts[0].symbol;

    let total = mixed.amounts[0].amount;

    for (let i = 1; i < mixed.amounts.length; i++) {
      const converted = convert(mixed.amounts[i].amount, mixed.amounts[i].code, targetCode, cache.rates);
      if (converted === null) return null;
      const op = mixed.ops[i - 1];
      if (op === '+') total += converted;
      else if (op === '-') total -= converted;
    }

    total = Math.round(total * 100) / 100;
    const formatted = Number.isInteger(total) ? String(total) : total.toFixed(2);
    return `= ${formatted}${targetSymbol}`;
  }

  return null;
}

/**
 * Given a line ending with '=', try to evaluate it as currency.
 * Returns the full line with result appended, or null.
 */
export async function autoCalculateCurrencyLine(line: string): Promise<string | null> {
  const trimmed = line.trimEnd();
  if (!trimmed.endsWith('=')) return null;

  const expr = trimmed.slice(0, -1).trim();
  if (!expr) return null;

  const result = await evaluateCurrencyExpression(expr);
  if (result) {
    return trimmed + ' ' + result;
  }
  return null;
}
