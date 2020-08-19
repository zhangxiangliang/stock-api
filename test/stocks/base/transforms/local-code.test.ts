// Stock
const BaseLocalCodeTransform = require("stocks/base/transforms/local-code").default;

describe("【基础】股票代码转换统一码测试", () => {
  it("深交所股票代码转换统一码", async () => {
    expect(() => (new BaseLocalCodeTransform()).SZTransform("000000"))
      .toThrow(new Error("未实现深交所股票代码转换统一码"));

    expect(() => (new BaseLocalCodeTransform()).SZTransform("SZ000000"))
      .toThrow(new Error("未实现深交所股票代码转换统一码"));
  });

  it("上交所股票代码转换统一码", async () => {
    expect(() => (new BaseLocalCodeTransform()).SHTransform("000000"))
      .toThrow(new Error("未实现上交所股票代码转换统一码"));

    expect(() => (new BaseLocalCodeTransform()).SHTransform("SH000000"))
      .toThrow(new Error("未实现上交所股票代码转换统一码"));
  });

  it("港交所股票代码转换统一码", async () => {
    expect(() => new BaseLocalCodeTransform().HKTransform("000000"))
      .toThrow(new Error("未实现港交所股票代码转换统一码"));

    expect(() => new BaseLocalCodeTransform().HKTransform("HK000000"))
      .toThrow(new Error("未实现港交所股票代码转换统一码"));
  });

  it("美交所股票代码转换统一码", async () => {
    expect(() => (new BaseLocalCodeTransform()).USTransform("000000"))
      .toThrow(new Error("未实现美交所股票代码转换统一码"));

    expect(() => (new BaseLocalCodeTransform()).USTransform("US000000"))
      .toThrow(new Error("未实现美交所股票代码转换统一码"));
  });

  it("交易所股票代码转换统一码", async () => {
    expect(() => (new BaseLocalCodeTransform()).transform("000000"))
      .toThrow(new Error("未实现股票代码转换统一码"));

    expect(() => (new BaseLocalCodeTransform()).transform("SZ000000"))
      .toThrow(new Error("未实现股票代码转换统一码"));

    expect(() => (new BaseLocalCodeTransform()).transform("SH000000"))
      .toThrow(new Error("未实现股票代码转换统一码"));

    expect(() => (new BaseLocalCodeTransform()).transform("HK000000"))
      .toThrow(new Error("未实现股票代码转换统一码"));

    expect(() => (new BaseLocalCodeTransform()).transform("US000000"))
      .toThrow(new Error("未实现股票代码转换统一码"));
  });

  it("交易所股票组代码转换统一码", async () => {
    expect(() => (new BaseLocalCodeTransform()).transforms(["000000"]))
      .toThrow(new Error("未实现股票代码转换统一码"));

    expect(() => (new BaseLocalCodeTransform()).transforms(["SZ000000"]))
      .toThrow(new Error("未实现股票代码转换统一码"));

    expect(() => (new BaseLocalCodeTransform()).transforms(["SH000000"]))
      .toThrow(new Error("未实现股票代码转换统一码"));

    expect(() => (new BaseLocalCodeTransform()).transforms(["HK000000"]))
      .toThrow(new Error("未实现股票代码转换统一码"));

    expect(() => (new BaseLocalCodeTransform()).transforms(["US000000"]))
      .toThrow(new Error("未实现股票代码转换统一码"));
  });
});
