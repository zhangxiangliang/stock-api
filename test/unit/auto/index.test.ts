import { createAutoStockApi } from "stocks/auto";
import StockApi from "types/stocks";
import Stock from "types/utils/stock";

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
  return {
    name,
    api: {
      getStock: async () => missingStock(),
      getStocks: async () => [],
      searchStocks: async () => [],
      ...overrides,
    },
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
