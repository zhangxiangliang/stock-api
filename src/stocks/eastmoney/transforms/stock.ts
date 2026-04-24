import Stock from "../../../types/utils/stock";
import { DEFAULT_NUMBER, DEFAULT_STRING } from "../../../utils/constant";

export type EastmoneyQuote = {
  f2?: number | string;
  f3?: number | string;
  f12?: string;
  f14?: string;
  f15?: number | string;
  f16?: number | string;
  f18?: number | string;
  f43?: number | string;
  f44?: number | string;
  f45?: number | string;
  f57?: string;
  f58?: string;
  f60?: number | string;
  f170?: number | string;
};

export function parseEastmoneyStock(code: string, quote?: EastmoneyQuote): Stock {
  const now = getEastmoneyStockNow(quote);
  const yesterday = getEastmoneyStockYesterday(quote);
  const percentValue = numberValue(quote?.f170 ?? quote?.f3);

  return {
    code: getEastmoneyStockCode(code),
    name: getEastmoneyStockName(quote),
    percent: percentValue ? percentValue / 100 : now && yesterday ? now / yesterday - 1 : DEFAULT_NUMBER,
    now,
    low: getEastmoneyStockLow(quote),
    high: getEastmoneyStockHigh(quote),
    yesterday,
  };
}

export function getEastmoneyStockCode(code: string): string {
  return String(code).toUpperCase();
}

export function getEastmoneyStockName(quote?: EastmoneyQuote): string {
  return String(quote?.f58 || quote?.f14 || DEFAULT_STRING);
}

export function getEastmoneyStockNow(quote?: EastmoneyQuote): number {
  return numberValue(quote?.f43 ?? quote?.f2);
}

export function getEastmoneyStockLow(quote?: EastmoneyQuote): number {
  return numberValue(quote?.f45 ?? quote?.f16);
}

export function getEastmoneyStockHigh(quote?: EastmoneyQuote): number {
  return numberValue(quote?.f44 ?? quote?.f15);
}

export function getEastmoneyStockYesterday(quote?: EastmoneyQuote): number {
  return numberValue(quote?.f60 ?? quote?.f18);
}

export function getEastmoneyStockPercent(quote?: EastmoneyQuote): number {
  const percentValue = numberValue(quote?.f170 ?? quote?.f3);
  if (percentValue) return percentValue / 100;

  const now = getEastmoneyStockNow(quote);
  const yesterday = getEastmoneyStockYesterday(quote);
  return now && yesterday ? now / yesterday - 1 : DEFAULT_NUMBER;
}

const EastmoneyStockTransform = {
  parse: parseEastmoneyStock,
  getCode: getEastmoneyStockCode,
  getName: getEastmoneyStockName,
  getNow: getEastmoneyStockNow,
  getLow: getEastmoneyStockLow,
  getHigh: getEastmoneyStockHigh,
  getYesterday: getEastmoneyStockYesterday,
  getPercent: getEastmoneyStockPercent,
  getStock: parseEastmoneyStock,
};

function numberValue(value: number | string | undefined): number {
  if (value === undefined || value === null || value === "-") return DEFAULT_NUMBER;

  const next = Number(value);
  return Number.isFinite(next) ? next : DEFAULT_NUMBER;
}

export default EastmoneyStockTransform;
