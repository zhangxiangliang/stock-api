const EastmoneyStockTransform = require("stocks/eastmoney/transforms/stock").default;

describe("【东方财富】股票数据转换测试", () => {
  const code = "SH600519";
  const quote = {
    f43: 1458.49,
    f44: 1458.88,
    f45: 1413.1,
    f57: "600519",
    f58: "贵州茅台",
    f60: 1419,
    f170: 2.78,
  };

  it("获取股票代码", () => {
    expect(EastmoneyStockTransform.getCode(code)).toBe("SH600519");
  });

  it("获取股票名称", () => {
    expect(EastmoneyStockTransform.getName(quote)).toBe("贵州茅台");
  });

  it("获取股票现价", () => {
    expect(EastmoneyStockTransform.getNow(quote)).toBe(1458.49);
  });

  it("获取股票最低价", () => {
    expect(EastmoneyStockTransform.getLow(quote)).toBe(1413.1);
  });

  it("获取股票最高价", () => {
    expect(EastmoneyStockTransform.getHigh(quote)).toBe(1458.88);
  });

  it("获取股票昨日收盘价", () => {
    expect(EastmoneyStockTransform.getYesterday(quote)).toBe(1419);
  });

  it("获取股票涨跌", () => {
    expect(EastmoneyStockTransform.getPercent(quote)).toBe(0.0278);
  });

  it("获取股票数据", () => {
    expect(EastmoneyStockTransform.getStock(code, quote)).toStrictEqual({
      code: "SH600519",
      name: "贵州茅台",
      percent: 0.0278,
      now: 1458.49,
      low: 1413.1,
      high: 1458.88,
      yesterday: 1419,
    });
  });
});
