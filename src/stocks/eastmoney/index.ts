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
  data?: EastmoneyQuote | null;
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

const quoteFields = "f43,f44,f45,f57,f58,f60,f170";
const klineFields = "f51,f52,f53,f54,f55,f56";
const suggestToken = "D43BF722C8E33BDC906FB84D85E326E8";
const requestTimeoutMs = 4000;
const defaultPush2Host = "push2delay.eastmoney.com";
const defaultPush2HisHost = "push2his.eastmoney.com";
const push2HisHosts = [
  defaultPush2HisHost,
  "7.push2his.eastmoney.com",
  "33.push2his.eastmoney.com",
  "63.push2his.eastmoney.com",
  "91.push2his.eastmoney.com",
];

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
  const url = `https://${defaultPush2HisHost}/api/qt/stock/kline/get?fields1=f1,f2,f3,f4,f5,f6&fields2=${klineFields}&ut=7eea3edcaed734bea9cbfc24409ed989&klt=${getKlinePeriodCode(
    normalizedOptions.period
  )}&fqt=${getAdjustCode(normalizedOptions.adjust)}&secid=${encodeURIComponent(
    apiCode
  )}&beg=19700101&end=20500101&lmt=${normalizedOptions.count}`;
  const response = await requestJsonFromHosts<EastmoneyKlineResponse>(
    url,
    push2HisHosts
  );
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
  const url = `https://${defaultPush2Host}/api/qt/stock/get?fltt=2&invt=2&secid=${encodeURIComponent(
    apiCode
  )}&fields=${quoteFields}`;
  const quote = await requestQuote(url);

  if (!quote?.f57 && !quote?.f58) {
    return createMissingStock(code);
  }

  return parseEastmoneyStock(code, quote);
}

async function requestQuote(url: string): Promise<EastmoneyQuote | undefined> {
  const response = await requestJson<EastmoneyQuoteResponse>(url, 1);
  const quote = response.data;

  if (quote?.f57 || quote?.f58) {
    return quote;
  }

  return undefined;
}

async function requestJson<T>(url: string, retries = 0): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch
        .get(url)
        .set("Accept", "application/json,text/plain,*/*")
        .set("Referer", "https://quote.eastmoney.com/")
        .retries(0)
        .timeout(requestTimeoutMs);

      return JSON.parse(response.text) as T;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
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

  return requestJson<EastmoneySuggestResponse>(url, 1);
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

async function requestJsonFromHosts<T>(
  url: string,
  hosts: string[]
): Promise<T> {
  let lastError: unknown;

  for (const host of hosts) {
    try {
      return await requestJson<T>(replaceUrlHost(url, host));
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

function replaceUrlHost(url: string, host: string): string {
  const parsedUrl = new URL(url);
  parsedUrl.hostname = host;
  return parsedUrl.toString();
}

export default Eastmoney;
