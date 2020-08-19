// Stock
const NeteaseApiCodeTransform = require("stocks/netease/transforms/api-code").default;

describe("【网易】股票代码转换测试", () => {
  it("深交所股票代码转换", async () => {
    expect(() => (new NeteaseApiCodeTransform()).SZTransform("000000"))
      .toThrow(new Error("请检查股票代码是否正确"));

    expect((new NeteaseApiCodeTransform()).SZTransform("SZ000000"))
      .toBe("1000000");
  });

  it("上交所股票代码转换", async () => {
    expect(() => (new NeteaseApiCodeTransform()).SHTransform("000000"))
      .toThrow(new Error("请检查股票代码是否正确"));

    expect((new NeteaseApiCodeTransform()).SHTransform("SH000000"))
      .toBe("0000000");
  });

  it("港交所股票代码转换", async () => {
    expect(() => (new NeteaseApiCodeTransform()).HKTransform("000000"))
      .toThrow(new Error("请检查股票代码是否正确"));

    expect((new NeteaseApiCodeTransform()).HKTransform("HK000000"))
      .toBe("hk000000");
  });

  it("美交所股票代码转换", async () => {
    expect(() => (new NeteaseApiCodeTransform()).USTransform("000000"))
      .toThrow(new Error("请检查股票代码是否正确"));

    expect((new NeteaseApiCodeTransform()).USTransform("US000000"))
      .toBe("US_000000");
  });

  it("交易所股票代码转换", async () => {
    expect((new NeteaseApiCodeTransform()).transform("SZ000000"))
      .toBe("1000000");

    expect((new NeteaseApiCodeTransform()).transform("SH000000"))
      .toBe("0000000");

    expect((new NeteaseApiCodeTransform()).transform("HK000000"))
      .toBe("hk000000");

    expect((new NeteaseApiCodeTransform()).transform("US000000"))
      .toBe("US_000000");

    expect(() => (new NeteaseApiCodeTransform()).transform("000000"))
      .toThrow(new Error("请检查股票代码是否正确"));
  });

  it("交易所股票组代码转换", async () => {
    expect((new NeteaseApiCodeTransform()).transforms(["SZ000000"]))
      .toStrictEqual(["1000000"]);

    expect((new NeteaseApiCodeTransform()).transforms(["SH000000"]))
      .toStrictEqual(["0000000"]);

    expect((new NeteaseApiCodeTransform()).transforms(["HK000000"]))
      .toStrictEqual(["hk000000"]);

    expect((new NeteaseApiCodeTransform()).transforms(["US000000"]))
      .toStrictEqual(["US_000000"]);

    expect(() => (new NeteaseApiCodeTransform()).transforms(["000000"]))
      .toThrow(new Error("请检查股票代码是否正确"));
  });
});
