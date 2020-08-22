// Stock
const BaseStockTransform = require("stocks/base/transforms/stock").default;

describe("【基础】股票数据转换测试", () => {
  const {
    ERROR_UNDEFINED_GET_CODE,
    ERROR_UNDEFINED_GET_NAME,
    ERROR_UNDEFINED_GET_NOW,
    ERROR_UNDEFINED_GET_LOW,
    ERROR_UNDEFINED_GET_HIGH,
    ERROR_UNDEFINED_GET_STOCK,
    ERROR_UNDEFINED_GET_PERCENT,
    ERROR_UNDEFINED_GET_YESTERDAY,
  } = require("utils/constant");

  it("获取股票代码", async () => {
    expect(() => (new BaseStockTransform()).getCode())
      .toThrow(new Error(ERROR_UNDEFINED_GET_CODE));
  });

  it("获取股票名称", async () => {
    expect(() => (new BaseStockTransform()).getName())
      .toThrow(new Error(ERROR_UNDEFINED_GET_NAME));
  });

  it("获取股票现价", async () => {
    expect(() => (new BaseStockTransform()).getNow())
      .toThrow(new Error(ERROR_UNDEFINED_GET_NOW));
  });

  it("获取股票最低价", async () => {
    expect(() => (new BaseStockTransform()).getLow())
      .toThrow(new Error(ERROR_UNDEFINED_GET_LOW));
  });

  it("获取股票最高价", async () => {
    expect(() => (new BaseStockTransform()).getHigh())
      .toThrow(new Error(ERROR_UNDEFINED_GET_HIGH));
  });

  it("获取股票昨日收盘价", async () => {
    expect(() => (new BaseStockTransform()).getYesterday())
      .toThrow(new Error(ERROR_UNDEFINED_GET_YESTERDAY));
  });

  it("获取股票涨跌", async () => {
    expect(() => (new BaseStockTransform()).getPercent())
      .toThrow(new Error(ERROR_UNDEFINED_GET_PERCENT));
  });

  it("获取股票数据", async () => {
    expect(() => (new BaseStockTransform()).getStock())
      .toThrow(new Error(ERROR_UNDEFINED_GET_STOCK));
  });
});
