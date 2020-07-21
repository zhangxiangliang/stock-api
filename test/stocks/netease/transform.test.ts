import NeteaseTransform from "../../../src/stocks/netease/transform";

describe("【网易】股票代码转换测试", () => {
  it("深交所股票代码转换", async () => {
    expect(() => {
      new NeteaseTransform().SZExchangeTransform("000000");
    }).toThrow(new Error("请检查股票代码是否正确"));

    expect(new NeteaseTransform().SZExchangeTransform("SZ000000")).toBe(
      "1000000"
    );
  });

  it("上交所股票代码转换", async () => {
    expect(() => {
      new NeteaseTransform().SHExchangeTransform("000000");
    }).toThrow(new Error("请检查股票代码是否正确"));

    expect(new NeteaseTransform().SHExchangeTransform("SH000000")).toBe(
      "0000000"
    );
  });

  it("港交所股票代码转换", async () => {
    expect(() => {
      new NeteaseTransform().HKExchangeTransform("000000");
    }).toThrow(new Error("请检查股票代码是否正确"));

    expect(new NeteaseTransform().HKExchangeTransform("HK000000")).toBe(
      "hk000000"
    );
  });

  it("美交所股票代码转换", async () => {
    expect(() => {
      new NeteaseTransform().USExchangeTransform("000000");
    }).toThrow(new Error("请检查股票代码是否正确"));

    expect(new NeteaseTransform().USExchangeTransform("US000000")).toBe(
      "US_000000"
    );
  });
});
