// Stock
const BaseStockTransform = require("stocks/base/transforms/stock").default;

describe("【基础】股票数据转换测试", () => {
  it("获取股票代码", async () => {
    expect(() => (new BaseStockTransform()).getCode())
      .toThrow(new Error("未实现获取代码"));
  });

  it("获取股票名称", async () => {
    expect(() => (new BaseStockTransform()).getName())
      .toThrow(new Error("未实现获取名称"));
  });

  it("获取股票现价", async () => {
    expect(() => (new BaseStockTransform()).getNow())
      .toThrow(new Error("未实现获取现价"));
  });

  it("获取股票最低价", async () => {
    expect(() => (new BaseStockTransform()).getLow())
      .toThrow(new Error("未实现获取最低价"));
  });

  it("获取股票最高价", async () => {
    expect(() => (new BaseStockTransform()).getHigh())
      .toThrow(new Error("未实现获取最高价"));
  });

  it("获取股票昨日收盘价", async () => {
    expect(() => (new BaseStockTransform()).getYesterday())
      .toThrow(new Error("未实现获取昨日收盘价"));
  });

  it("获取股票涨跌", async () => {
    expect(() => (new BaseStockTransform()).getPercent())
      .toThrow(new Error("未实现获取涨跌"));
  });

  it("获取股票数据", async () => {
    expect(() => (new BaseStockTransform()).getStock())
      .toThrow();
  });
});
