// Stock
import NeteaseExchangeTransform from "../../../src/stocks/netease/exchangeTransform";

describe("【网易】股票代码转换测试", () => {
  it("深交所股票代码转换", async () => {
    expect(() => (new NeteaseExchangeTransform()).SZExchangeTransform("000000"))
      .toThrow(new Error("请检查股票代码是否正确"));

    expect((new NeteaseExchangeTransform()).SZExchangeTransform("SZ000000"))
      .toBe("1000000");
  });

  it("上交所股票代码转换", async () => {
    expect(() => (new NeteaseExchangeTransform()).SHExchangeTransform("000000"))
      .toThrow(new Error("请检查股票代码是否正确"));

    expect((new NeteaseExchangeTransform()).SHExchangeTransform("SH000000"))
      .toBe("0000000");
  });

  it("港交所股票代码转换", async () => {
    expect(() => (new NeteaseExchangeTransform()).HKExchangeTransform("000000"))
      .toThrow(new Error("请检查股票代码是否正确"));

    expect((new NeteaseExchangeTransform()).HKExchangeTransform("HK000000"))
      .toBe("hk000000");
  });

  it("美交所股票代码转换", async () => {
    expect(() => (new NeteaseExchangeTransform()).USExchangeTransform("000000"))
      .toThrow(new Error("请检查股票代码是否正确"));

    expect((new NeteaseExchangeTransform()).USExchangeTransform("US000000"))
      .toBe("US_000000");
  });

  it("交易所股票代码转换", async () => {
    expect((new NeteaseExchangeTransform()).transform("SZ000000"))
      .toBe("1000000");

    expect((new NeteaseExchangeTransform()).transform("SH000000"))
      .toBe("0000000");

    expect((new NeteaseExchangeTransform()).transform("HK000000"))
      .toBe("hk000000");

    expect((new NeteaseExchangeTransform()).transform("US000000"))
      .toBe("US_000000");

    expect(() => (new NeteaseExchangeTransform()).transform("000000"))
      .toThrow(new Error("请检查股票代码是否正确"));
  });

  it("交易所股票组代码转换", async () => {
    expect((new NeteaseExchangeTransform()).transforms(["SZ000000"]))
      .toStrictEqual(["1000000"]);

    expect((new NeteaseExchangeTransform()).transforms(["SH000000"]))
      .toStrictEqual(["0000000"]);

    expect((new NeteaseExchangeTransform()).transforms(["HK000000"]))
      .toStrictEqual(["hk000000"]);

    expect((new NeteaseExchangeTransform()).transforms(["US000000"]))
      .toStrictEqual(["US_000000"]);

    expect(() => (new NeteaseExchangeTransform()).transforms(["000000"]))
      .toThrow(new Error("请检查股票代码是否正确"));
  });
});
