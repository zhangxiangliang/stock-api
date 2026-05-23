import { StockSource } from "./stock";

export type KlinePeriod = "day" | "month" | "week";
export type KlineAdjust = "hfq" | "none" | "qfq";

export type KlineOptions = {
  /** K-line period. Defaults to day. */
  period?: KlinePeriod;
  /** Number of rows to return. Defaults to 120. */
  count?: number;
  /** Price adjustment mode. Defaults to none. */
  adjust?: KlineAdjust;
};

/**
 * Stable normalized K-line row for charting.
 */
export interface Kline {
  /** Date, such as 2026-05-22. */
  date: string;
  /** Open price. */
  open: number;
  /** Close price. */
  close: number;
  /** Day high. */
  high: number;
  /** Day low. */
  low: number;
  /** Trading volume when provided by the upstream source. */
  volume?: number;
  /** Data source that produced the normalized K-line row. */
  source?: Exclude<StockSource, "base">;
}

export default Kline;
