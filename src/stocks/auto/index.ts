import { DEFAULT_STOCK } from "../../utils/constant";
import StockApi from "../../types/stocks";
import Stock, { StockSource } from "../../types/utils/stock";
import eastmoney from "../eastmoney";
import sina from "../sina";
import { normalizeStock } from "../shared/normalize";
import {
  normalizeCodes,
  StockProviderApi,
  StockProviderInspection,
} from "../shared/provider";
import tencent from "../tencent";

export type AutoStockProvider = {
  name: Exclude<StockSource, "base">;
  api: StockProviderApi;
};

export type AutoStockInspection = {
  code: string;
  source: StockSource;
  stock: Stock;
  sources: StockProviderInspection[];
};

export interface AutoStockApi extends StockApi {
  inspectStock(code: string): Promise<AutoStockInspection>;
}

const providers: AutoStockProvider[] = [
  { name: "tencent", api: tencent },
  { name: "sina", api: sina },
  { name: "eastmoney", api: eastmoney },
];

export function createAutoStockApi(autoProviders: AutoStockProvider[]): AutoStockApi {
  const api: AutoStockApi = {
    async getStock(code: string): Promise<Stock> {
      return (await api.inspectStock(code)).stock;
    },

    async getStocks(codes: string[]): Promise<Stock[]> {
      return Promise.all(normalizeCodes(codes).map((code) => api.getStock(code)));
    },

    async searchStocks(key: string): Promise<Stock[]> {
      for (const provider of autoProviders) {
        const stocks = await searchProviderStocks(provider, key);
        const availableStocks = stocks.filter(isAvailableStock);

        if (availableStocks.length > 0) {
          return availableStocks.map((stock) =>
            normalizeStock(stock, provider.name)
          );
        }
      }

      return [];
    },

    async inspectStock(code: string): Promise<AutoStockInspection> {
      const sources: StockProviderInspection[] = [];
      let selectedStock: Stock | undefined;
      let selectedSource: StockSource = "base";

      for (const provider of autoProviders) {
        const inspection = await provider.api.inspectStock(code);
        sources.push(inspection);

        if (!selectedStock && inspection.status === "success" && inspection.stock) {
          selectedStock = inspection.stock;
          selectedSource = inspection.source;
        }
      }

      const stock = selectedStock || normalizeStock({ ...DEFAULT_STOCK, code }, "base");

      return {
        code,
        source: selectedSource,
        stock,
        sources,
      };
    },
  };

  return api;
}

const Auto = createAutoStockApi(providers);

async function searchProviderStocks(
  provider: AutoStockProvider,
  key: string
): Promise<Stock[]> {
  try {
    return await provider.api.searchStocks(key);
  } catch {
    return [];
  }
}

function isAvailableStock(stock: Stock | undefined): stock is Stock {
  return Boolean(stock && stock.name !== DEFAULT_STOCK.name);
}

export default Auto;
