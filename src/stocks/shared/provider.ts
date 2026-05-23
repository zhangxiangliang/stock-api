import { uniq } from "../../utils/array";
import { isBrowserRuntime } from "../../utils/browser-script";
import fetch from "../../utils/fetch";
import iconv from "../../utils/iconv";
import { DEFAULT_STOCK } from "../../utils/constant";
import StockApi from "../../types/stocks";
import Kline, { KlineOptions } from "../../types/utils/kline";
import Stock, { StockSource } from "../../types/utils/stock";
import { assertProviderFeatureSupported } from "./capabilities";
import { normalizeStock } from "./normalize";

type CodeTransform = {
  transform(code: string): string;
  transforms(codes: string[]): string[];
};

type Header = readonly [name: string, value: string];

type QuoteConfig = {
  browserRequestText?: (apiCodes: string[]) => Promise<string>;
  codeTransform: CodeTransform;
  delimiter: string;
  encoding: string;
  headers?: readonly Header[];
  getUrl(apiCodes: string[]): string;
  isMissing(row: string, apiCode: string): boolean;
  parseStock(code: string, params: string[]): Stock;
};

type SearchConfig = {
  browserRequestText?: (key: string) => Promise<string>;
  encoding: string;
  headers?: readonly Header[];
  getUrl(key: string): string;
  parseCodes(body: string): string[];
};

type KlineConfig = {
  getKlines(code: string, options?: KlineOptions): Promise<Kline[]>;
};

export type StockProviderConfig = {
  kline: KlineConfig;
  source: Exclude<StockSource, "base">;
  quote: QuoteConfig;
  search: SearchConfig;
};

export type StockInspectionStatus = "empty" | "error" | "success";

export type StockProviderInspection = {
  code: string;
  source: Exclude<StockSource, "base">;
  status: StockInspectionStatus;
  stock?: Stock;
  error?: string;
};

export interface StockProviderApi extends StockApi {
  inspectStock(code: string): Promise<StockProviderInspection>;
}

export function normalizeCodes(codes: string[]): string[] {
  return uniq(codes.filter((code) => code !== ""));
}

export function createMissingStock(code: string): Stock {
  return { ...DEFAULT_STOCK, code };
}

export function splitRows(body: string): string[] {
  return body.split(";\n").filter((row) => row !== "");
}

export function getAssignedValue(row: string): string {
  const [, value = ""] = row.split("=");
  return value;
}

export function getDelimitedParams(row: string, delimiter: string): string[] {
  return getAssignedValue(row).replace('"', "").split(delimiter);
}

export function createStockProvider(config: StockProviderConfig): StockProviderApi {
  async function getStocks(codes: string[]): Promise<Stock[]> {
    const normalizedCodes = normalizeCodes(codes);

    if (normalizedCodes.length === 0) {
      return [];
    }

    assertProviderFeatureSupported(config.source, "quote");

    const apiCodes = config.quote.codeTransform.transforms(normalizedCodes);
    const body = await requestQuoteText(config.quote, apiCodes);
    const rows = splitRows(body);

    return normalizedCodes.map((code, index) => {
      const apiCode = apiCodes[index];
      const row = rows.find((item) => item.includes(apiCode)) || "";

      if (config.quote.isMissing(row, apiCode)) {
        return createMissingStock(code);
      }

      const params = getDelimitedParams(row, config.quote.delimiter);
      return config.quote.parseStock(code, params);
    });
  }

  async function requestQuoteText(
    quote: QuoteConfig,
    apiCodes: string[]
  ): Promise<string> {
    if (isBrowserRuntime() && quote.browserRequestText) {
      return quote.browserRequestText(apiCodes);
    }

    return requestText({
      encoding: quote.encoding,
      headers: quote.headers,
      url: quote.getUrl(apiCodes),
    });
  }

  const api: StockProviderApi = {
    async getStock(code: string): Promise<Stock> {
      const [stock] = await getStocks([code]);
      return stock || createMissingStock(code);
    },

    getStocks,

    getKlines(code: string, options?: KlineOptions): Promise<Kline[]> {
      return config.kline.getKlines(code, options);
    },

    async searchStocks(key: string): Promise<Stock[]> {
      assertProviderFeatureSupported(config.source, "search");

      const body = await requestSearchText(config.search, key);
      return getStocks(config.search.parseCodes(body));
    },

    async inspectStock(code: string): Promise<StockProviderInspection> {
      return createStockInspection(config.source, code, api.getStock);
    },
  };

  return api;
}

async function requestSearchText(
  search: SearchConfig,
  key: string
): Promise<string> {
  if (isBrowserRuntime() && search.browserRequestText) {
    return search.browserRequestText(key);
  }

  return requestText({
    encoding: search.encoding,
    headers: search.headers,
    url: search.getUrl(key),
  });
}

export async function createStockInspection(
  source: Exclude<StockSource, "base">,
  code: string,
  getStock: (code: string) => Promise<Stock>
): Promise<StockProviderInspection> {
  try {
    const stock = normalizeStock(await getStock(code), source);

    return {
      code,
      source,
      status: isAvailableStock(stock) ? "success" : "empty",
      stock,
    };
  } catch (error) {
    return {
      code,
      source,
      status: "error",
      error: getErrorMessage(error),
    };
  }
}

function isAvailableStock(stock: Stock | undefined): stock is Stock {
  return Boolean(stock && stock.name !== DEFAULT_STOCK.name);
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function requestText(options: {
  encoding: string;
  headers?: readonly Header[];
  url: string;
}): Promise<string> {
  const req = fetch.get(options.url).responseType("blob");

  for (const [name, value] of options.headers || []) {
    req.set(name, value);
  }

  const res = await req;
  return iconv.decode(res.body, options.encoding);
}
