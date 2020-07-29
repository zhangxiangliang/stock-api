// Stock
import TencentExchangeTransform from "../../../src/stocks/tencent/exchangeTransform";

describe("【腾讯】股票代码转换测试", () => {
  it("深交所股票代码转换", async () => {
    expect(() => (new TencentExchangeTransform()).SZExchangeTransform("000000"))
      .toThrow(new Error("请检查股票代码是否正确"));

    expect((new TencentExchangeTransform()).SZExchangeTransform("SZ000000"))
      .toBe("sz000000");
  });

  it("上交所股票代码转换", async () => {
    expect(() => (new TencentExchangeTransform()).SHExchangeTransform("000000"))
      .toThrow(new Error("请检查股票代码是否正确"));

    expect((new TencentExchangeTransform()).SHExchangeTransform("SH000000"))
      .toBe("sh000000");
  });

  it("港交所股票代码转换", async () => {
    expect(() => (new TencentExchangeTransform()).HKExchangeTransform("000000"))
      .toThrow(new Error("请检查股票代码是否正确"));

    expect((new TencentExchangeTransform()).HKExchangeTransform("HK000000"))
      .toBe("hk000000");
  });

  it("美交所股票代码转换", async () => {
    expect(() => (new TencentExchangeTransform()).USExchangeTransform("000000"))
      .toThrow(new Error("请检查股票代码是否正确"));

    expect((new TencentExchangeTransform()).USExchangeTransform("US000000"))
      .toBe("us000000");
  });

  it("交易所股票代码转换", async () => {
    expect((new TencentExchangeTransform()).transform("SZ000000"))
      .toBe("sz000000");

    expect((new TencentExchangeTransform()).transform("SH000000"))
      .toBe("sh000000");

    expect((new TencentExchangeTransform()).transform("HK000000"))
      .toBe("hk000000");

    expect((new TencentExchangeTransform()).transform("US000000"))
      .toBe("us000000");

    expect(() => (new TencentExchangeTransform()).transform("000000"))
      .toThrow(new Error("请检查股票代码是否正确"));
  });

  it("交易所股票组代码转换", async () => {
    expect((new TencentExchangeTransform()).transforms(["SZ000000"]))
      .toStrictEqual(["sz000000"]);

    expect((new TencentExchangeTransform()).transforms(["SH000000"]))
      .toStrictEqual(["sh000000"]);

    expect((new TencentExchangeTransform()).transforms(["HK000000"]))
      .toStrictEqual(["hk000000"]);

    expect((new TencentExchangeTransform()).transforms(["US000000"]))
      .toStrictEqual(["us000000"]);

    expect(() => (new TencentExchangeTransform()).transforms(["000000"]))
      .toThrow(new Error("请检查股票代码是否正确"));
  });
});
