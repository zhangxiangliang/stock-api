import Kline, {
  KlineAdjust,
  KlineOptions,
  KlinePeriod,
} from "../../types/utils/kline";
import { StockSource } from "../../types/utils/stock";

const defaultOptions: Required<KlineOptions> = {
  adjust: "none",
  count: 120,
  period: "day",
};

export function normalizeKlineOptions(options: KlineOptions = {}): Required<KlineOptions> {
  return {
    adjust: normalizeAdjust(options.adjust),
    count: normalizeCount(options.count),
    period: normalizePeriod(options.period),
  };
}

export function parseKlineNumber(value: unknown): number {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

export function createKline(row: {
  close: unknown;
  date: string;
  high: unknown;
  low: unknown;
  open: unknown;
  source: Exclude<StockSource, "base">;
  volume?: unknown;
}): Kline {
  const kline: Kline = {
    close: parseKlineNumber(row.close),
    date: row.date,
    high: parseKlineNumber(row.high),
    low: parseKlineNumber(row.low),
    open: parseKlineNumber(row.open),
    source: row.source,
  };

  if (row.volume !== undefined) {
    kline.volume = parseKlineNumber(row.volume);
  }

  return kline;
}

export function isAvailableKlines(klines: Kline[]): boolean {
  return klines.length > 0;
}

function normalizePeriod(period: KlinePeriod | undefined): KlinePeriod {
  return period || defaultOptions.period;
}

function normalizeAdjust(adjust: KlineAdjust | undefined): KlineAdjust {
  return adjust || defaultOptions.adjust;
}

function normalizeCount(count: number | undefined): number {
  if (count === undefined) {
    return defaultOptions.count;
  }

  if (!Number.isFinite(count) || count <= 0) {
    return defaultOptions.count;
  }

  return Math.floor(count);
}
