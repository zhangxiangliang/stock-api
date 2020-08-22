// Stock
const SinaApiCodeTransform = require("stocks/sina/transforms/api-code").default;

describe("【新浪】股票代码转换统一代码", () => {
  const {
    ERROR_API_CODE,
  } = require("utils/constant");

  it("深交所股票代码转换统一代码", async () => {
    expect(() => (new SinaApiCodeTransform()).SZTransform("STOCKAPI"))
      .toThrow(new Error(ERROR_API_CODE));

    expect((new SinaApiCodeTransform()).SZTransform("sz000000"))
      .toBe("SZ000000");
  });

  it("上交所股票代码转换统一代码", async () => {
    expect(() => (new SinaApiCodeTransform()).SHTransform("STOCKAPI"))
      .toThrow(new Error(ERROR_API_CODE));

    expect((new SinaApiCodeTransform()).SHTransform("sh000000"))
      .toBe("SH000000");
  });

  it("港交所股票代码转换统一代码", async () => {
    expect(() => (new SinaApiCodeTransform()).HKTransform("STOCKAPI"))
      .toThrow(new Error(ERROR_API_CODE));

    expect((new SinaApiCodeTransform()).HKTransform("hk000000"))
      .toBe("HK000000");
  });

  it("美交所股票代码转换统一代码", async () => {
    expect(() => (new SinaApiCodeTransform()).USTransform("STOCKAPI"))
      .toThrow(new Error(ERROR_API_CODE));

    expect((new SinaApiCodeTransform()).USTransform("gb_000000"))
      .toBe("US000000");
  });

  it("交易所股票代码转换统一代码", async () => {
    expect((new SinaApiCodeTransform()).transform("sz000000"))
      .toBe("SZ000000");

    expect((new SinaApiCodeTransform()).transform("sh000000"))
      .toBe("SH000000");

    expect((new SinaApiCodeTransform()).transform("hk000000"))
      .toBe("HK000000");

    expect((new SinaApiCodeTransform()).transform("gb_000000"))
      .toBe("US000000");

    expect(() => (new SinaApiCodeTransform()).transform("STOCKAPI"))
      .toThrow(new Error(ERROR_API_CODE));
  });

  it("交易所股票代码转换统一代码", async () => {
    expect((new SinaApiCodeTransform()).transforms(["sz000000"]))
      .toStrictEqual(["SZ000000"]);

    expect((new SinaApiCodeTransform()).transforms(["sh000000"]))
      .toStrictEqual(["SH000000"]);

    expect((new SinaApiCodeTransform()).transforms(["hk000000"]))
      .toStrictEqual(["HK000000"]);

    expect((new SinaApiCodeTransform()).transforms(["gb_000000"]))
      .toStrictEqual(["US000000"]);

    expect(() => (new SinaApiCodeTransform()).transforms(["STOCKAPI"]))
      .toThrow(new Error(ERROR_API_CODE));
  });
});
