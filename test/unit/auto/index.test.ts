import { createAutoStockApi } from "stocks/auto";
import StockApi from "types/stocks";
import Stock from "types/utils/stock";
import {
  StockInspectionStatus,
  StockProviderApi,
  StockProviderInspection,
} from "stocks/shared/provider";

describe("【自动】股票数据源", () => {
  const missingStock: Stock = {
    code: "SH600519",
    name: "---",
    percent: 0,
    now: 0,
    low: 0,
    high: 0,
    yesterday: 0,
  };

  const availableStock: Stock = {
    code: "SH600519",
    name: "贵州茅台",
    percent: 0.0278,
    now: 1458.49,
    low: 1413.1,
    high: 1458.88,
    yesterday: 1419,
  };

  it("单只股票会跳过失败和空结果", async () => {
    const api = createAutoStockApi([
      provider("tencent", { getStock: async () => missingStock }),
      provider("sina", { getStock: async () => { throw new Error("down"); } }),
      provider("eastmoney", { getStock: async () => availableStock }),
    ]);

    await expect(api.getStock("SH600519")).resolves.toMatchObject({
      code: "SH600519",
      name: "贵州茅台",
      source: "eastmoney",
    });
  });

  it("可以检查每个数据源的尝试结果", async () => {
    const api = createAutoStockApi([
      provider("tencent", { getStock: async () => missingStock }),
      provider("sina", { getStock: async () => { throw new Error("down"); } }),
      provider("eastmoney", { getStock: async () => availableStock }),
    ]);

    await expect(api.inspectStock("SH600519")).resolves.toMatchObject({
      code: "SH600519",
      source: "eastmoney",
      stock: {
        code: "SH600519",
        name: "贵州茅台",
        source: "eastmoney",
      },
      sources: [
        { source: "tencent", status: "empty" },
        { source: "sina", status: "error", error: "down" },
        { source: "eastmoney", status: "success" },
      ],
    });
  });

  it("所有数据源都不可用时返回基础空数据", async () => {
    const api = createAutoStockApi([
      provider("tencent", { getStock: async () => missingStock }),
    ]);

    await expect(api.inspectStock("SH600519")).resolves.toMatchObject({
      code: "SH600519",
      source: "base",
      stock: {
        code: "SH600519",
        name: "---",
        source: "base",
      },
      sources: [{ source: "tencent", status: "empty" }],
    });
  });

  it("自动诊断会检查全部数据源", async () => {
    const api = createAutoStockApi([
      provider("tencent", { getStock: async () => availableStock }),
      provider("sina", { getStock: async () => availableStock }),
    ]);

    await expect(api.inspectStock("SH600519")).resolves.toMatchObject({
      source: "tencent",
      sources: [
        { source: "tencent", status: "success" },
        { source: "sina", status: "success" },
      ],
    });
  });

  it("搜索会使用第一个有结果的数据源", async () => {
    const api = createAutoStockApi([
      provider("tencent", { searchStocks: async () => [] }),
      provider("sina", { searchStocks: async () => [availableStock] }),
    ]);

    await expect(api.searchStocks("贵州茅台")).resolves.toEqual([
      expect.objectContaining({
        code: "SH600519",
        name: "贵州茅台",
        source: "sina",
      }),
    ]);
  });
});

function provider(
  name: "eastmoney" | "sina" | "tencent",
  overrides: Partial<StockApi>
) {
  const api: StockProviderApi = {
    getStock: async () => missingStock(),
    getStocks: async () => [],
    inspectStock: async (code: string): Promise<StockProviderInspection> => {
      try {
        const getStock = overrides.getStock || (async () => missingStock());
        const stock = await getStock(code);
        const status: StockInspectionStatus =
          stock.name === "---" ? "empty" : "success";

        return {
          code,
          source: name,
          status,
          stock: { ...stock, source: name },
        };
      } catch (error) {
        return {
          code,
          source: name,
          status: "error",
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
    searchStocks: async () => [],
    ...overrides,
  };

  return {
    name,
    api,
  };
}

function missingStock(): Stock {
  return {
    code: "---",
    name: "---",
    percent: 0,
    now: 0,
    low: 0,
    high: 0,
    yesterday: 0,
  };
}
