// Stock
const XueqiuExchangeTransform = require("stocks/xueqiu/transforms/exchange").default;

describe("【雪球】股票代码转换测试", () => {
  it("深交所股票代码转换", async () => {
    expect(() => (new XueqiuExchangeTransform()).SZExchangeTransform("000000"))
      .toThrow(new Error("请检查股票代码是否正确"));

    expect((new XueqiuExchangeTransform()).SZExchangeTransform("SZ000000"))
      .toBe("SZ000000");
  });

  it("上交所股票代码转换", async () => {
    expect(() => (new XueqiuExchangeTransform()).SHExchangeTransform("000000"))
      .toThrow(new Error("请检查股票代码是否正确"));

    expect((new XueqiuExchangeTransform()).SHExchangeTransform("SH000000"))
      .toBe("SH000000");
  });

  it("港交所股票代码转换", async () => {
    expect(() => (new XueqiuExchangeTransform()).HKExchangeTransform("000000"))
      .toThrow(new Error("请检查股票代码是否正确"));

    expect((new XueqiuExchangeTransform()).HKExchangeTransform("HK000000"))
      .toBe("HK000000");
  });

  it("美交所股票代码转换", async () => {
    expect(() => (new XueqiuExchangeTransform()).USExchangeTransform("000000"))
      .toThrow(new Error("请检查股票代码是否正确"));

    expect((new XueqiuExchangeTransform()).USExchangeTransform("US000000"))
      .toBe("000000");
  });

  it("交易所股票代码转换", async () => {
    expect((new XueqiuExchangeTransform()).transform("SZ000000"))
      .toBe("SZ000000");

    expect((new XueqiuExchangeTransform()).transform("SH000000"))
      .toBe("SH000000");

    expect((new XueqiuExchangeTransform()).transform("HK000000"))
      .toBe("HK000000");

    expect((new XueqiuExchangeTransform()).transform("US000000"))
      .toBe("000000");

    expect(() => (new XueqiuExchangeTransform()).transform("000000"))
      .toThrow(new Error("请检查股票代码是否正确"));
  });

  it("交易所股票组代码转换", async () => {
    expect((new XueqiuExchangeTransform()).transforms(["SZ000000"]))
      .toStrictEqual(["SZ000000"]);

    expect((new XueqiuExchangeTransform()).transforms(["SH000000"]))
      .toStrictEqual(["SH000000"]);

    expect((new XueqiuExchangeTransform()).transforms(["HK000000"]))
      .toStrictEqual(["HK000000"]);

    expect((new XueqiuExchangeTransform()).transforms(["US000000"]))
      .toStrictEqual(["000000"]);

    expect(() => (new XueqiuExchangeTransform()).transforms(["000000"]))
      .toThrow(new Error("请检查股票代码是否正确"));
  });
});
