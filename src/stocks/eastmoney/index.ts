import Stock from "../../types/utils/stock";
import { DEFAULT_STOCK } from "../../utils/constant";
import fetch from "../../utils/fetch";
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

const quoteFields = "f12,f14,f2,f3,f15,f16,f18";
const suggestToken = "D43BF722C8E33BDC906FB84D85E326E8";

async function getStocks(codes: string[]): Promise<Stock[]> {
  const normalizedCodes = normalizeCodes(codes);

  if (normalizedCodes.length === 0) {
    return [];
  }

  return Promise.all(normalizedCodes.map(fetchOneStock));
}

const Eastmoney: StockProviderApi = {
  async getStock(code: string): Promise<Stock> {
    const [stock] = await getStocks([code]);
    return stock || createMissingStock(code);
  },

  getStocks,

  async searchStocks(key: string): Promise<Stock[]> {
    const response = await requestJson<EastmoneySuggestResponse>(
      `https://searchapi.eastmoney.com/api/suggest/get?input=${encodeURIComponent(
        key
      )}&type=14&token=${suggestToken}`
    );
    const codes = (response.QuotationCodeTable?.Data || [])
      .map(parseSuggestCode)
      .filter(Boolean) as string[];

    return getStocks(codes);
  },

  async inspectStock(code: string) {
    return createStockInspection("eastmoney", code, Eastmoney.getStock);
  },
};

async function fetchOneStock(code: string): Promise<Stock> {
  const apiCode = EastmoneyCommonCodeTransform.transform(code);
  const response = await requestJson<EastmoneyQuoteResponse>(
    `https://push2.eastmoney.com/api/qt/ulist.np/get?fltt=2&secids=${encodeURIComponent(
      apiCode
    )}&fields=${quoteFields}`
  );
  const [quote] = getQuoteRows(response);

  if (!quote?.f12) {
    return createMissingStock(code);
  }

  return parseEastmoneyStock(code, quote);
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
    .set("Referer", "https://quote.eastmoney.com/");

  return JSON.parse(response.text) as T;
}

function getQuoteRows(response: EastmoneyQuoteResponse): EastmoneyQuote[] {
  const diff = response.data?.diff;
  if (!diff) return [];
  if (Array.isArray(diff)) return diff;

  return Object.values(diff);
}

export default Eastmoney;
