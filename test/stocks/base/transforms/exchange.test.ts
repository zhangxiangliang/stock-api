// Stock
const BaseExchangeTransform = require("stocks/base/transforms/exchange").default;

describe("【基础】股票代码转换测试", () => {
  it("深交所股票代码转换", async () => {
    expect(() => (new BaseExchangeTransform()).SZExchangeTransform("000000"))
      .toThrow(new Error("请检查股票代码是否正确"));

    expect(() => (new BaseExchangeTransform()).SZExchangeTransform("SZ000000"))
      .toThrow(new Error("未实现深交所股票代码转换"));
  });

  it("上交所股票代码转换", async () => {
    expect(() => (new BaseExchangeTransform()).SHExchangeTransform("000000"))
      .toThrow(new Error("请检查股票代码是否正确"));

    expect(() => (new BaseExchangeTransform())
      .SHExchangeTransform("SH000000"))
      .toThrow(new Error("未实现上交所股票代码转换"));
  });

  it("港交所股票代码转换", async () => {
    expect(() => new BaseExchangeTransform().HKExchangeTransform("000000"))
      .toThrow(new Error("请检查股票代码是否正确"));

    expect(() => new BaseExchangeTransform().HKExchangeTransform("HK000000"))
      .toThrow(new Error("未实现港交所股票代码转换"));
  });

  it("美交所股票代码转换", async () => {
    expect(() => (new BaseExchangeTransform()).USExchangeTransform("000000"))
      .toThrow(new Error("请检查股票代码是否正确"));

    expect(() => (new BaseExchangeTransform()).USExchangeTransform("US000000"))
      .toThrow(new Error("未实现美交所股票代码转换"));
  });

  it("交易所股票代码转换", async () => {
    expect(() => (new BaseExchangeTransform()).transform("000000"))
      .toThrow(new Error("请检查股票代码是否正确"));

    expect(() => (new BaseExchangeTransform()).transform("SZ000000"))
      .toThrow(new Error("未实现深交所股票代码转换"));

    expect(() => (new BaseExchangeTransform()).transform("SH000000"))
      .toThrow(new Error("未实现上交所股票代码转换"));

    expect(() => (new BaseExchangeTransform()).transform("HK000000"))
      .toThrow(new Error("未实现港交所股票代码转换"));

    expect(() => (new BaseExchangeTransform()).transform("US000000"))
      .toThrow(new Error("未实现美交所股票代码转换"));
  });

  it("交易所股票组代码转换", async () => {
    expect(() => (new BaseExchangeTransform()).transforms(["000000"]))
      .toThrow(new Error("请检查股票代码是否正确"));

    expect(() => (new BaseExchangeTransform()).transforms(["SZ000000"]))
      .toThrow(new Error("未实现深交所股票代码转换"));

    expect(() => (new BaseExchangeTransform()).transforms(["SH000000"]))
      .toThrow(new Error("未实现上交所股票代码转换"));

    expect(() => (new BaseExchangeTransform()).transforms(["HK000000"]))
      .toThrow(new Error("未实现港交所股票代码转换"));

    expect(() => (new BaseExchangeTransform()).transforms(["US000000"]))
      .toThrow(new Error("未实现美交所股票代码转换"));
  });
});
