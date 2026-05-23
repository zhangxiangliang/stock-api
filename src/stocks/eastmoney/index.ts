import Stock from "../../types/utils/stock";
import Kline, { KlineOptions } from "../../types/utils/kline";
import { isBrowserRuntime, loadBrowserJsonp } from "../../utils/browser-script";
import { DEFAULT_STOCK } from "../../utils/constant";
import fetch from "../../utils/fetch";
import { assertProviderFeatureSupported } from "../shared/capabilities";
import {
  createKline,
  normalizeKlineOptions,
} from "../shared/kline";
import {
  createStockInspection,
  normalizeCodes,
  StockProviderApi,
} from "../shared/provider";
import EastmoneyCommonCodeTransform from "./transforms/common-code";
import {
  EastmoneyQuote,
  parseEastmoneyStock,
} from "./transforms/stock";

type EastmoneyQuoteResponse = {
  data?: {
    diff?: EastmoneyQuote[] | Record<string, EastmoneyQuote>;
  } | null;
};

type EastmoneySuggestItem = {
  Code?: string;
  Name?: string;
  MktNum?: string;
  QuoteID?: string;
};

type EastmoneySuggestResponse = {
  QuotationCodeTable?: {
    Data?: EastmoneySuggestItem[];
  };
};

type EastmoneyKlineResponse = {
  data?: {
    klines?: string[];
  } | null;
};

const quoteFields = "f12,f14,f2,f3,f15,f16,f18";
const klineFields = "f51,f52,f53,f54,f55,f56";
const suggestToken = "D43BF722C8E33BDC906FB84D85E326E8";
const requestTimeoutMs = 5000;

function getSuggestUrl(key: string): string {
  return `https://searchapi.eastmoney.com/api/suggest/get?input=${encodeURIComponent(
    key
  )}&type=14&token=${suggestToken}`;
}

async function getStocks(codes: string[]): Promise<Stock[]> {
  const normalizedCodes = normalizeCodes(codes);

  if (normalizedCodes.length === 0) {
    return [];
  }

  assertProviderFeatureSupported("eastmoney", "quote");

  return Promise.all(normalizedCodes.map(fetchOneStock));
}

const Eastmoney: StockProviderApi = {
  async getStock(code: string): Promise<Stock> {
    const [stock] = await getStocks([code]);
    return stock || createMissingStock(code);
  },

  getStocks,

  async getKlines(code: string, options?: KlineOptions): Promise<Kline[]> {
    return getKlines(code, options);
  },

  async searchStocks(key: string): Promise<Stock[]> {
    assertProviderFeatureSupported("eastmoney", "search");

    const response = await requestSuggestJson(key);
    const codes = (response.QuotationCodeTable?.Data || [])
      .map(parseSuggestCode)
      .filter(Boolean) as string[];

    return getStocks(codes);
  },

  async inspectStock(code: string) {
    return createStockInspection("eastmoney", code, Eastmoney.getStock);
  },
};

async function getKlines(code: string, options?: KlineOptions): Promise<Kline[]> {
  assertProviderFeatureSupported("eastmoney", "kline");

  const normalizedOptions = normalizeKlineOptions(options);
  const apiCode = EastmoneyCommonCodeTransform.transform(code);
  const url = `https://push2his.eastmoney.com/api/qt/stock/kline/get?fields1=f1,f2,f3,f4,f5,f6&fields2=${klineFields}&ut=7eea3edcaed734bea9cbfc24409ed989&klt=${getKlinePeriodCode(
    normalizedOptions.period
  )}&fqt=${getAdjustCode(normalizedOptions.adjust)}&secid=${encodeURIComponent(
    apiCode
  )}&beg=19700101&end=20500101&lmt=${normalizedOptions.count}`;
  const response = await requestKlineJson<EastmoneyKlineResponse>(url);
  const rows = response.data?.klines || [];

  return rows.map((line) => {
    const [date, open, close, high, low, volume] = line.split(",");
    return createKline({
      close,
      date,
      high,
      low,
      open,
      source: "eastmoney",
      volume,
    });
  });
}

async function fetchOneStock(code: string): Promise<Stock> {
  const apiCode = EastmoneyCommonCodeTransform.transform(code);
  const response = await requestJson<EastmoneyQuoteResponse>(
    `https://push2delay.eastmoney.com/api/qt/ulist.np/get?fltt=2&secids=${encodeURIComponent(
      apiCode
    )}&fields=${quoteFields}`
  );
  const [quote] = getQuoteRows(response);

  if (!quote?.f12) {
    return createMissingStock(code);
  }

  return parseEastmoneyStock(code, quote);
}

function getKlinePeriodCode(period: KlineOptions["period"]): string {
  switch (period) {
    case "week":
      return "102";
    case "month":
      return "103";
    case "day":
    default:
      return "101";
  }
}

function getAdjustCode(adjust: KlineOptions["adjust"]): string {
  switch (adjust) {
    case "qfq":
      return "1";
    case "hfq":
      return "2";
    case "none":
    default:
      return "0";
  }
}

async function requestSuggestJson(key: string): Promise<EastmoneySuggestResponse> {
  const url = getSuggestUrl(key);

  if (isBrowserRuntime()) {
    return loadBrowserJsonp<EastmoneySuggestResponse>({
      callbackParam: "cb",
      url,
    });
  }

  return requestJson<EastmoneySuggestResponse>(url);
}

function parseSuggestCode(item: EastmoneySuggestItem): string {
  const quoteId = item.QuoteID || "";
  const code = item.Code || quoteId.split(".")[1] || "";
  const market = item.MktNum || quoteId.split(".")[0] || "";

  if (!code) return "";
  if (market === "1") return `SH${code}`;
  if (market === "0") return `SZ${code}`;
  return "";
}

function createMissingStock(code: string): Stock {
  return { ...DEFAULT_STOCK, code };
}

async function requestJson<T>(url: string): Promise<T> {
  const response = await fetch
    .get(url)
    .set("Accept", "application/json,text/plain,*/*")
    .set("Referer", "https://quote.eastmoney.com/")
    .timeout(requestTimeoutMs);

  return JSON.parse(response.text) as T;
}

async function requestKlineJson<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);

  try {
    const response = await globalThis.fetch(url, {
      headers: createKlineHeaders(),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return JSON.parse(await response.text()) as T;
  } finally {
    clearTimeout(timeoutId);
  }
}

function createKlineHeaders(): Record<string, string> {
  if (isBrowserRuntime()) {
    return { Accept: "application/json,text/plain,*/*" };
  }

  return {
    Accept: "application/json,text/plain,*/*",
    Referer: "https://quote.eastmoney.com/",
  };
}

function getQuoteRows(response: EastmoneyQuoteResponse): EastmoneyQuote[] {
  const diff = response.data?.diff;
  if (!diff) return [];
  if (Array.isArray(diff)) return diff;

  return Object.values(diff);
}

export default Eastmoney;
