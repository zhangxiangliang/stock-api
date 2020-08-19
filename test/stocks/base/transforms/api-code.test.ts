// Stock
const BaseApiCodeTransform = require("stocks/base/transforms/api-code").default;

describe("【基础】股票代码转换统一代码", () => {
  it("深交所股票代码转换统一代码", async () => {
    expect(() => (new BaseApiCodeTransform()).SZTransform("000000"))
      .toThrow(new Error("未实现深交所股票代码转换统一代码"));

    expect(() => (new BaseApiCodeTransform()).SZTransform("SZ000000"))
      .toThrow(new Error("未实现深交所股票代码转换统一代码"));
  });

  it("上交所股票代码转换统一代码", async () => {
    expect(() => (new BaseApiCodeTransform()).SHTransform("000000"))
      .toThrow(new Error("未实现上交所股票代码转换统一代码"));

    expect(() => (new BaseApiCodeTransform()).SHTransform("SH000000"))
      .toThrow(new Error("未实现上交所股票代码转换统一代码"));
  });

  it("港交所股票代码转换统一代码", async () => {
    expect(() => new BaseApiCodeTransform().HKTransform("000000"))
      .toThrow(new Error("未实现港交所股票代码转换统一代码"));

    expect(() => new BaseApiCodeTransform().HKTransform("HK000000"))
      .toThrow(new Error("未实现港交所股票代码转换统一代码"));
  });

  it("美交所股票代码转换统一代码", async () => {
    expect(() => (new BaseApiCodeTransform()).USTransform("000000"))
      .toThrow(new Error("未实现美交所股票代码转换统一代码"));

    expect(() => (new BaseApiCodeTransform()).USTransform("US000000"))
      .toThrow(new Error("未实现美交所股票代码转换统一代码"));
  });

  it("交易所股票代码转换统一代码", async () => {
    expect(() => (new BaseApiCodeTransform()).transform("000000"))
      .toThrow(new Error("未实现股票代码转换统一代码"));

    expect(() => (new BaseApiCodeTransform()).transform("SZ000000"))
      .toThrow(new Error("未实现股票代码转换统一代码"));

    expect(() => (new BaseApiCodeTransform()).transform("SH000000"))
      .toThrow(new Error("未实现股票代码转换统一代码"));

    expect(() => (new BaseApiCodeTransform()).transform("HK000000"))
      .toThrow(new Error("未实现股票代码转换统一代码"));

    expect(() => (new BaseApiCodeTransform()).transform("US000000"))
      .toThrow(new Error("未实现股票代码转换统一代码"));
  });

  it("交易所股票组代码转换统一代码", async () => {
    expect(() => (new BaseApiCodeTransform()).transforms(["000000"]))
      .toThrow(new Error("未实现股票代码转换统一代码"));

    expect(() => (new BaseApiCodeTransform()).transforms(["SZ000000"]))
      .toThrow(new Error("未实现股票代码转换统一代码"));

    expect(() => (new BaseApiCodeTransform()).transforms(["SH000000"]))
      .toThrow(new Error("未实现股票代码转换统一代码"));

    expect(() => (new BaseApiCodeTransform()).transforms(["HK000000"]))
      .toThrow(new Error("未实现股票代码转换统一代码"));

    expect(() => (new BaseApiCodeTransform()).transforms(["US000000"]))
      .toThrow(new Error("未实现股票代码转换统一代码"));
  });
});
