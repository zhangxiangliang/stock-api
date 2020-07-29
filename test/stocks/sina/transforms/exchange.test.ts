// Stock
const SinaExchangeTransform = require("stocks/sina/transforms/exchange").default;

describe("【新浪】股票代码转换测试", () => {
  it("深交所股票代码转换", async () => {
    expect(() => (new SinaExchangeTransform()).SZExchangeTransform("000000"))
      .toThrow(new Error("请检查股票代码是否正确"));

    expect((new SinaExchangeTransform()).SZExchangeTransform("SZ000000"))
      .toBe("sz000000");
  });

  it("上交所股票代码转换", async () => {
    expect(() => (new SinaExchangeTransform()).SHExchangeTransform("000000"))
      .toThrow(new Error("请检查股票代码是否正确"));

    expect((new SinaExchangeTransform()).SHExchangeTransform("SH000000"))
      .toBe("sh000000");
  });

  it("港交所股票代码转换", async () => {
    expect(() => (new SinaExchangeTransform()).HKExchangeTransform("000000"))
      .toThrow(new Error("请检查股票代码是否正确"));

    expect((new SinaExchangeTransform()).HKExchangeTransform("HK000000"))
      .toBe("hk000000");
  });

  it("美交所股票代码转换", async () => {
    expect(() => (new SinaExchangeTransform()).USExchangeTransform("000000"))
      .toThrow(new Error("请检查股票代码是否正确"));

    expect((new SinaExchangeTransform()).USExchangeTransform("US000000"))
      .toBe("gb_000000");
  });

  it("交易所股票代码转换", async () => {
    expect((new SinaExchangeTransform()).transform("SZ000000"))
      .toBe("sz000000");

    expect((new SinaExchangeTransform()).transform("SH000000"))
      .toBe("sh000000");

    expect((new SinaExchangeTransform()).transform("HK000000"))
      .toBe("hk000000");

    expect((new SinaExchangeTransform()).transform("US000000"))
      .toBe("gb_000000");

    expect(() => (new SinaExchangeTransform()).transform("000000"))
      .toThrow(new Error("请检查股票代码是否正确"));
  });

  it("交易所股票组代码转换", async () => {
    expect((new SinaExchangeTransform()).transforms(["SZ000000"]))
      .toStrictEqual(["sz000000"]);

    expect((new SinaExchangeTransform()).transforms(["SH000000"]))
      .toStrictEqual(["sh000000"]);

    expect((new SinaExchangeTransform()).transforms(["HK000000"]))
      .toStrictEqual(["hk000000"]);

    expect((new SinaExchangeTransform()).transforms(["US000000"]))
      .toStrictEqual(["gb_000000"]);

    expect(() => (new SinaExchangeTransform()).transforms(["000000"]))
      .toThrow(new Error("请检查股票代码是否正确"));
  });
});
