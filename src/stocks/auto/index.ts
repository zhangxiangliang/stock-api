import { DEFAULT_STOCK } from "../../utils/constant";
import StockApi from "../../types/stocks";
import Stock, { StockSource } from "../../types/utils/stock";
import eastmoney from "../eastmoney";
import sina from "../sina";
import { normalizeStock } from "../shared/normalize";
import { normalizeCodes } from "../shared/provider";
import tencent from "../tencent";

export type AutoStockProvider = {
  name: Exclude<StockSource, "base">;
  api: StockApi;
};

const providers: AutoStockProvider[] = [
  { name: "tencent", api: tencent },
  { name: "sina", api: sina },
  { name: "eastmoney", api: eastmoney },
];

export function createAutoStockApi(autoProviders: AutoStockProvider[]): StockApi {
  const api: StockApi = {
    async getStock(code: string): Promise<Stock> {
      for (const provider of autoProviders) {
        const stock = await getProviderStock(provider, code);

        if (isAvailableStock(stock)) {
          return normalizeStock(stock, provider.name);
        }
      }

      return normalizeStock({ ...DEFAULT_STOCK, code }, "base");
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
  };

  return api;
}

const Auto = createAutoStockApi(providers);

async function getProviderStock(
  provider: AutoStockProvider,
  code: string
): Promise<Stock | undefined> {
  try {
    return await provider.api.getStock(code);
  } catch {
    return undefined;
  }
}

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
