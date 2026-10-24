import Kline, { KlineOptions } from "../../types/utils/kline";
import { StockSource } from "../../types/utils/stock";
export declare function normalizeKlineOptions(options?: KlineOptions): Required<KlineOptions>;
export declare function parseKlineNumber(value: unknown): number;
export declare function createKline(row: {
    close: unknown;
    date: string;
    high: unknown;
    low: unknown;
    open: unknown;
    source: Exclude<StockSource, "base">;
    volume?: unknown;
}): Kline;
export declare function isAvailableKlines(klines: Kline[]): boolean;
