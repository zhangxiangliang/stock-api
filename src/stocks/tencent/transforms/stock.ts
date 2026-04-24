import Stock from "../../../types/utils/stock";
import { DEFAULT_NUMBER, DEFAULT_STRING } from "../../../utils/constant";

export function parseTencentStock(code: string, params: string[]): Stock {
  const now = getTencentStockNow(params);
  const yesterday = getTencentStockYesterday(params);

  return {
    code: getTencentStockCode(code),
    name: getTencentStockName(params),
    percent: now ? now / yesterday - 1 : DEFAULT_NUMBER,
    now,
    low: getTencentStockLow(params),
    high: getTencentStockHigh(params),
    yesterday,
  };
}

export function getTencentStockCode(code: string): string {
  return String(code).toUpperCase();
}

export function getTencentStockName(params: string[]): string {
  return String(params[1] || DEFAULT_STRING);
}

export function getTencentStockNow(params: string[]): number {
  return numberAt(params, 3);
}

export function getTencentStockLow(params: string[]): number {
  return numberAt(params, 34);
}

export function getTencentStockHigh(params: string[]): number {
  return numberAt(params, 33);
}

export function getTencentStockYesterday(params: string[]): number {
  return numberAt(params, 4);
}

export function getTencentStockPercent(params: string[]): number {
  const now = getTencentStockNow(params);
  const yesterday = getTencentStockYesterday(params);
  return now ? now / yesterday - 1 : DEFAULT_NUMBER;
}

const TencentStockTransform = {
  parse: parseTencentStock,
  getCode: getTencentStockCode,
  getName: getTencentStockName,
  getNow: getTencentStockNow,
  getLow: getTencentStockLow,
  getHigh: getTencentStockHigh,
  getYesterday: getTencentStockYesterday,
  getPercent: getTencentStockPercent,
  getStock: parseTencentStock,
};

function numberAt(params: string[], index: number): number {
  return Number(params[index] || DEFAULT_NUMBER);
}

export default TencentStockTransform;
