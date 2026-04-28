export type StockSource = "base" | "eastmoney" | "sina" | "tencent";

/**
 * Stable normalized stock quote.
 *
 * Minor releases may add optional fields, but existing fields keep their
 * meaning and type. Provider-specific raw payloads are intentionally not
 * exposed on this object.
 */
export interface Stock {
  /** Stock name. */
  name: string;
  /** Normalized stock code, such as SH510500, SZ000651, HK02020, or USDJI. */
  code: string;
  /** Current price. */
  now: number;
  /** Day low. */
  low: number;
  /** Day high. */
  high: number;
  /** Change rate. 0.01 means 1%. */
  percent: number;
  /** Previous close. */
  yesterday: number;
  /** Data source that produced the normalized quote. */
  source?: StockSource;
}

export default Stock;
