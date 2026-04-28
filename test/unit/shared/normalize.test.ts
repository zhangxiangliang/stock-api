import { normalizeStock } from "stocks/shared/normalize";

describe("标准股票数据", () => {
  const stock = {
    code: "SH600519",
    name: "贵州茅台",
    percent: 0.0278,
    now: 1458.49,
    low: 1413.1,
    high: 1458.88,
    yesterday: 1419,
  };

  it("补充数据源和兼容字段", () => {
    expect(normalizeStock(stock, "eastmoney"))
      .toStrictEqual({
        ...stock,
        source: "eastmoney",
      });
  });
});
