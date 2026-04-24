// Stock
const SinaApiCodeTransform = require("stocks/sina/transforms/api-code").default;

describe("【新浪】股票代码转换统一代码", () => {
  const {
    ERROR_API_CODE,
  } = require("utils/constant");

  it("深交所股票代码转换统一代码", async () => {
    expect(() => SinaApiCodeTransform.SZTransform("STOCKAPI"))
      .toThrow(new Error(ERROR_API_CODE));

    expect(SinaApiCodeTransform.SZTransform("sz000000"))
      .toBe("SZ000000");
  });

  it("上交所股票代码转换统一代码", async () => {
    expect(() => SinaApiCodeTransform.SHTransform("STOCKAPI"))
      .toThrow(new Error(ERROR_API_CODE));

    expect(SinaApiCodeTransform.SHTransform("sh000000"))
      .toBe("SH000000");
  });

  it("港交所股票代码转换统一代码", async () => {
    expect(() => SinaApiCodeTransform.HKTransform("STOCKAPI"))
      .toThrow(new Error(ERROR_API_CODE));

    expect(SinaApiCodeTransform.HKTransform("hk000000"))
      .toBe("HK000000");
  });

  it("美交所股票代码转换统一代码", async () => {
    expect(() => SinaApiCodeTransform.USTransform("STOCKAPI"))
      .toThrow(new Error(ERROR_API_CODE));

    expect(SinaApiCodeTransform.USTransform("gb_000000"))
      .toBe("US000000");
  });

  it("交易所股票代码转换统一代码", async () => {
    expect(SinaApiCodeTransform.transform("sz000000"))
      .toBe("SZ000000");

    expect(SinaApiCodeTransform.transform("sh000000"))
      .toBe("SH000000");

    expect(SinaApiCodeTransform.transform("hk000000"))
      .toBe("HK000000");

    expect(SinaApiCodeTransform.transform("gb_000000"))
      .toBe("US000000");

    expect(() => SinaApiCodeTransform.transform("STOCKAPI"))
      .toThrow(new Error(ERROR_API_CODE));
  });

  it("交易所股票代码转换统一代码", async () => {
    expect(SinaApiCodeTransform.transforms(["sz000000"]))
      .toStrictEqual(["SZ000000"]);

    expect(SinaApiCodeTransform.transforms(["sh000000"]))
      .toStrictEqual(["SH000000"]);

    expect(SinaApiCodeTransform.transforms(["hk000000"]))
      .toStrictEqual(["HK000000"]);

    expect(SinaApiCodeTransform.transforms(["gb_000000"]))
      .toStrictEqual(["US000000"]);

    expect(() => SinaApiCodeTransform.transforms(["STOCKAPI"]))
      .toThrow(new Error(ERROR_API_CODE));
  });
});
