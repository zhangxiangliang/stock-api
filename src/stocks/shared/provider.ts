import { uniq } from "../../utils/array";
import fetch from "../../utils/fetch";
import iconv from "../../utils/iconv";
import { DEFAULT_STOCK } from "../../utils/constant";
import StockApi from "../../types/stocks";
import Stock, { StockSource } from "../../types/utils/stock";
import { normalizeStock } from "./normalize";

type CodeTransform = {
  transform(code: string): string;
  transforms(codes: string[]): string[];
};

type Header = readonly [name: string, value: string];

type QuoteConfig = {
  codeTransform: CodeTransform;
  delimiter: string;
  encoding: string;
  headers?: readonly Header[];
  getUrl(apiCodes: string[]): string;
  isMissing(row: string, apiCode: string): boolean;
  parseStock(code: string, params: string[]): Stock;
};

type SearchConfig = {
  encoding: string;
  headers?: readonly Header[];
  getUrl(key: string): string;
  parseCodes(body: string): string[];
};

export type StockProviderConfig = {
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

    const apiCodes = config.quote.codeTransform.transforms(normalizedCodes);
    const body = await requestText({
      encoding: config.quote.encoding,
      headers: config.quote.headers,
      url: config.quote.getUrl(apiCodes),
    });
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

  const api: StockProviderApi = {
    async getStock(code: string): Promise<Stock> {
      const [stock] = await getStocks([code]);
      return stock || createMissingStock(code);
    },

    getStocks,

    async searchStocks(key: string): Promise<Stock[]> {
      const body = await requestText({
        encoding: config.search.encoding,
        headers: config.search.headers,
        url: config.search.getUrl(key),
      });
      return getStocks(config.search.parseCodes(body));
    },

    async inspectStock(code: string): Promise<StockProviderInspection> {
      return createStockInspection(config.source, code, api.getStock);
    },
  };

  return api;
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
