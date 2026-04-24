import {
  COMMON_HK,
  COMMON_SH,
  COMMON_SZ,
  COMMON_US,
} from "../../../stocks/base/utils/constant";
import Stock from "../../../types/utils/stock";
import { DEFAULT_NUMBER, DEFAULT_STRING } from "../../../utils/constant";

type SinaMarketFields = {
  name: number;
  now: number;
  low: number;
  high: number;
  yesterday: number;
};

const fieldMap: Record<string, SinaMarketFields> = {
  [COMMON_SH]: { name: 0, now: 3, low: 5, high: 4, yesterday: 2 },
  [COMMON_SZ]: { name: 0, now: 3, low: 5, high: 4, yesterday: 2 },
  [COMMON_HK]: { name: 1, now: 6, low: 5, high: 4, yesterday: 3 },
  [COMMON_US]: { name: 0, now: 1, low: 7, high: 6, yesterday: 26 },
};

export function parseSinaStock(code: string, params: string[]): Stock {
  const fields = fieldMap[code.slice(0, 2)];
  const now = fields ? numberAt(params, fields.now) : DEFAULT_NUMBER;
  const yesterday = fields ? numberAt(params, fields.yesterday) : DEFAULT_NUMBER;

  return {
    code: String(code).toUpperCase(),
    name: fields ? stringAt(params, fields.name) : DEFAULT_STRING,
    percent: now ? now / yesterday - 1 : DEFAULT_NUMBER,
    now,
    low: fields ? numberAt(params, fields.low) : DEFAULT_NUMBER,
    high: fields ? numberAt(params, fields.high) : DEFAULT_NUMBER,
    yesterday,
  };
}

export function getSinaStockCode(code: string): string {
  return String(code).toUpperCase();
}

export function getSinaStockName(code: string, params: string[]): string {
  const fields = fieldMap[code.slice(0, 2)];
  return fields ? stringAt(params, fields.name) : DEFAULT_STRING;
}

export function getSinaStockNow(code: string, params: string[]): number {
  return getSinaStockNumber(code, params, "now");
}

export function getSinaStockLow(code: string, params: string[]): number {
  return getSinaStockNumber(code, params, "low");
}

export function getSinaStockHigh(code: string, params: string[]): number {
  return getSinaStockNumber(code, params, "high");
}

export function getSinaStockYesterday(code: string, params: string[]): number {
  return getSinaStockNumber(code, params, "yesterday");
}

export function getSinaStockPercent(code: string, params: string[]): number {
  const now = getSinaStockNow(code, params);
  const yesterday = getSinaStockYesterday(code, params);
  return now ? now / yesterday - 1 : DEFAULT_NUMBER;
}

const SinaStockTransform = {
  parse: parseSinaStock,
  getCode: getSinaStockCode,
  getName: getSinaStockName,
  getNow: getSinaStockNow,
  getLow: getSinaStockLow,
  getHigh: getSinaStockHigh,
  getYesterday: getSinaStockYesterday,
  getPercent: getSinaStockPercent,
  getStock: parseSinaStock,
};

function getSinaStockNumber(
  code: string,
  params: string[],
  field: Exclude<keyof SinaMarketFields, "name">
): number {
  const fields = fieldMap[code.slice(0, 2)];
  return fields ? numberAt(params, fields[field]) : DEFAULT_NUMBER;
}

function numberAt(params: string[], index: number): number {
  return Number(params[index] || DEFAULT_NUMBER);
}

function stringAt(params: string[], index: number): string {
  return String(params[index] || DEFAULT_STRING);
}

export default SinaStockTransform;
