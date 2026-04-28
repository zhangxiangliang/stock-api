export type StockSource = "base" | "eastmoney" | "sina" | "tencent";

export interface Stock {
  name: string;
  code: string;
  now: number;
  low: number;
  high: number;
  percent: number;
  yesterday: number;
  source?: StockSource;
}

export default Stock;
