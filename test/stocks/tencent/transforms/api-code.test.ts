// Stock
const TencentApiCodeTransform = require("stocks/tencent/transforms/api-code").default;

describe("【腾讯】股票代码转换测试", () => {
  it("深交所股票代码转换", async () => {
    expect(() => (new TencentApiCodeTransform()).SZTransform("000000"))
      .toThrow(new Error("请检查股票代码是否正确"));

    expect((new TencentApiCodeTransform()).SZTransform("SZ000000"))
      .toBe("sz000000");
  });

  it("上交所股票代码转换", async () => {
    expect(() => (new TencentApiCodeTransform()).SHTransform("000000"))
      .toThrow(new Error("请检查股票代码是否正确"));

    expect((new TencentApiCodeTransform()).SHTransform("SH000000"))
      .toBe("sh000000");
  });

  it("港交所股票代码转换", async () => {
    expect(() => (new TencentApiCodeTransform()).HKTransform("000000"))
      .toThrow(new Error("请检查股票代码是否正确"));

    expect((new TencentApiCodeTransform()).HKTransform("HK000000"))
      .toBe("hk000000");
  });

  it("美交所股票代码转换", async () => {
    expect(() => (new TencentApiCodeTransform()).USTransform("000000"))
      .toThrow(new Error("请检查股票代码是否正确"));

    expect((new TencentApiCodeTransform()).USTransform("US000000"))
      .toBe("us000000");
  });

  it("交易所股票代码转换", async () => {
    expect((new TencentApiCodeTransform()).transform("SZ000000"))
      .toBe("sz000000");

    expect((new TencentApiCodeTransform()).transform("SH000000"))
      .toBe("sh000000");

    expect((new TencentApiCodeTransform()).transform("HK000000"))
      .toBe("hk000000");

    expect((new TencentApiCodeTransform()).transform("US000000"))
      .toBe("us000000");

    expect(() => (new TencentApiCodeTransform()).transform("000000"))
      .toThrow(new Error("请检查股票代码是否正确"));
  });

  it("交易所股票组代码转换", async () => {
    expect((new TencentApiCodeTransform()).transforms(["SZ000000"]))
      .toStrictEqual(["sz000000"]);

    expect((new TencentApiCodeTransform()).transforms(["SH000000"]))
      .toStrictEqual(["sh000000"]);

    expect((new TencentApiCodeTransform()).transforms(["HK000000"]))
      .toStrictEqual(["hk000000"]);

    expect((new TencentApiCodeTransform()).transforms(["US000000"]))
      .toStrictEqual(["us000000"]);

    expect(() => (new TencentApiCodeTransform()).transforms(["000000"]))
      .toThrow(new Error("请检查股票代码是否正确"));
  });
});
