// Stock
const SinaApiCodeTransform = require("stocks/sina/transforms/api-code").default;

describe("【新浪】股票代码转换测试", () => {
  it("深交所股票代码转换", async () => {
    expect(() => (new SinaApiCodeTransform()).SZTransform("000000"))
      .toThrow(new Error("请检查股票代码是否正确"));

    expect((new SinaApiCodeTransform()).SZTransform("SZ000000"))
      .toBe("sz000000");
  });

  it("上交所股票代码转换", async () => {
    expect(() => (new SinaApiCodeTransform()).SHTransform("000000"))
      .toThrow(new Error("请检查股票代码是否正确"));

    expect((new SinaApiCodeTransform()).SHTransform("SH000000"))
      .toBe("sh000000");
  });

  it("港交所股票代码转换", async () => {
    expect(() => (new SinaApiCodeTransform()).HKTransform("000000"))
      .toThrow(new Error("请检查股票代码是否正确"));

    expect((new SinaApiCodeTransform()).HKTransform("HK000000"))
      .toBe("hk000000");
  });

  it("美交所股票代码转换", async () => {
    expect(() => (new SinaApiCodeTransform()).USTransform("000000"))
      .toThrow(new Error("请检查股票代码是否正确"));

    expect((new SinaApiCodeTransform()).USTransform("US000000"))
      .toBe("gb_000000");
  });

  it("交易所股票代码转换", async () => {
    expect((new SinaApiCodeTransform()).transform("SZ000000"))
      .toBe("sz000000");

    expect((new SinaApiCodeTransform()).transform("SH000000"))
      .toBe("sh000000");

    expect((new SinaApiCodeTransform()).transform("HK000000"))
      .toBe("hk000000");

    expect((new SinaApiCodeTransform()).transform("US000000"))
      .toBe("gb_000000");

    expect(() => (new SinaApiCodeTransform()).transform("000000"))
      .toThrow(new Error("请检查股票代码是否正确"));
  });

  it("交易所股票组代码转换", async () => {
    expect((new SinaApiCodeTransform()).transforms(["SZ000000"]))
      .toStrictEqual(["sz000000"]);

    expect((new SinaApiCodeTransform()).transforms(["SH000000"]))
      .toStrictEqual(["sh000000"]);

    expect((new SinaApiCodeTransform()).transforms(["HK000000"]))
      .toStrictEqual(["hk000000"]);

    expect((new SinaApiCodeTransform()).transforms(["US000000"]))
      .toStrictEqual(["gb_000000"]);

    expect(() => (new SinaApiCodeTransform()).transforms(["000000"]))
      .toThrow(new Error("请检查股票代码是否正确"));
  });
});
