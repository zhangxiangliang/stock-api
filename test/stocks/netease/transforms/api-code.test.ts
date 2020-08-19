// Stock
const NeteaseApiCodeTransform = require("stocks/netease/transforms/api-code").default;

describe("【网易】股票代码转换统一代码", () => {
  it("深交所股票代码转换统一代码", async () => {
    expect(() => (new NeteaseApiCodeTransform()).SZTransform("STOCKAPI"))
      .toThrow(new Error("请检查股票代码是否正确"));

    expect((new NeteaseApiCodeTransform()).SZTransform("1000000"))
      .toBe("SZ000000");
  });

  it("上交所股票代码转换统一代码", async () => {
    expect(() => (new NeteaseApiCodeTransform()).SHTransform("STOCKAPI"))
      .toThrow(new Error("请检查股票代码是否正确"));

    expect((new NeteaseApiCodeTransform()).SHTransform("0000000"))
      .toBe("SH000000");
  });

  it("港交所股票代码转换统一代码", async () => {
    expect(() => (new NeteaseApiCodeTransform()).HKTransform("STOCKAPI"))
      .toThrow(new Error("请检查股票代码是否正确"));

    expect((new NeteaseApiCodeTransform()).HKTransform("hk000000"))
      .toBe("HK000000");
  });

  it("美交所股票代码转换统一代码", async () => {
    expect(() => (new NeteaseApiCodeTransform()).USTransform("STOCKAPI"))
      .toThrow(new Error("请检查股票代码是否正确"));

    expect((new NeteaseApiCodeTransform()).USTransform("US_000000"))
      .toBe("US000000");
  });

  it("交易所股票代码转换统一代码", async () => {
    expect((new NeteaseApiCodeTransform()).transform("1000000"))
      .toBe("SZ000000");

    expect((new NeteaseApiCodeTransform()).transform("0000000"))
      .toBe("SH000000");

    expect((new NeteaseApiCodeTransform()).transform("hk000000"))
      .toBe("HK000000");

    expect((new NeteaseApiCodeTransform()).transform("US_000000"))
      .toBe("US000000");

    expect(() => (new NeteaseApiCodeTransform()).transform("STOCKAPI"))
      .toThrow(new Error("请检查股票代码是否正确"));
  });

  it("交易所股票组代码转换", async () => {
    expect((new NeteaseApiCodeTransform()).transforms(["1000000"]))
      .toStrictEqual(["SZ000000"]);

    expect((new NeteaseApiCodeTransform()).transforms(["0000000"]))
      .toStrictEqual(["SH000000"]);

    expect((new NeteaseApiCodeTransform()).transforms(["hk000000"]))
      .toStrictEqual(["HK000000"]);

    expect((new NeteaseApiCodeTransform()).transforms(["US_000000"]))
      .toStrictEqual(["US000000"]);

    expect(() => (new NeteaseApiCodeTransform()).transforms(["STOCKAPI"]))
      .toThrow(new Error("请检查股票代码是否正确"));
  });
});
