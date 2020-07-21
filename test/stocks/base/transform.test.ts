import BaseTransform from "../../../src/stocks/base/transform";

describe("【基础】股票代码转换测试", () => {
  it("深交所股票代码转换", async () => {
    expect(() => {
      new BaseTransform().SZExchangeTransform("000000");
    }).toThrow(new Error("请检查股票代码是否正确"));

    expect(() => {
      new BaseTransform().SZExchangeTransform("SZ000000");
    }).toThrow(new Error("未实现深交所股票代码转换"));
  });

  it("上交所股票代码转换", async () => {
    expect(() => {
      new BaseTransform().SHExchangeTransform("000000");
    }).toThrow(new Error("请检查股票代码是否正确"));

    expect(() => {
      new BaseTransform().SHExchangeTransform("SH000000");
    }).toThrow(new Error("未实现上交所股票代码转换"));
  });

  it("港交所股票代码转换", async () => {
    expect(() => {
      new BaseTransform().HKExchangeTransform("000000");
    }).toThrow(new Error("请检查股票代码是否正确"));

    expect(() => {
      new BaseTransform().HKExchangeTransform("HK000000");
    }).toThrow(new Error("未实现港交所股票代码转换"));
  });

  it("美交所股票代码转换", async () => {
    expect(() => {
      new BaseTransform().USExchangeTransform("000000");
    }).toThrow(new Error("请检查股票代码是否正确"));

    expect(() => {
      new BaseTransform().USExchangeTransform("US000000");
    }).toThrow(new Error("未实现美交所股票代码转换"));
  });
});
