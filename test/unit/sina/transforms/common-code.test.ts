// Stock
const SinaCommonCodeTransform = require("stocks/sina/transforms/common-code").default;

describe("【新浪】统一代码转换股票代码", () => {
  const {
    ERROR_COMMON_CODE,
  } = require("utils/constant");

  it("深交所统一代码转换股票代码", async () => {
    expect(() => SinaCommonCodeTransform.SZTransform("000000"))
      .toThrow(new Error(ERROR_COMMON_CODE));

    expect(SinaCommonCodeTransform.SZTransform("SZ000000"))
      .toBe("sz000000");
  });

  it("上交所统一代码转换股票代码", async () => {
    expect(() => SinaCommonCodeTransform.SHTransform("000000"))
      .toThrow(new Error(ERROR_COMMON_CODE));

    expect(SinaCommonCodeTransform.SHTransform("SH000000"))
      .toBe("sh000000");
  });

  it("港交所统一代码转换股票代码", async () => {
    expect(() => SinaCommonCodeTransform.HKTransform("000000"))
      .toThrow(new Error(ERROR_COMMON_CODE));

    expect(SinaCommonCodeTransform.HKTransform("HK000000"))
      .toBe("hk000000");
  });

  it("美交所统一代码转换股票代码", async () => {
    expect(() => SinaCommonCodeTransform.USTransform("000000"))
      .toThrow(new Error(ERROR_COMMON_CODE));

    expect(SinaCommonCodeTransform.USTransform("US000000"))
      .toBe("gb_000000");
  });

  it("交易所统一代码转换股票代码", async () => {
    expect(SinaCommonCodeTransform.transform("SZ000000"))
      .toBe("sz000000");

    expect(SinaCommonCodeTransform.transform("SH000000"))
      .toBe("sh000000");

    expect(SinaCommonCodeTransform.transform("HK000000"))
      .toBe("hk000000");

    expect(SinaCommonCodeTransform.transform("US000000"))
      .toBe("gb_000000");

    expect(() => SinaCommonCodeTransform.transform("000000"))
      .toThrow(new Error(ERROR_COMMON_CODE));
  });

  it("交易所统一代码组转换股票代码组", async () => {
    expect(SinaCommonCodeTransform.transforms(["SZ000000"]))
      .toStrictEqual(["sz000000"]);

    expect(SinaCommonCodeTransform.transforms(["SH000000"]))
      .toStrictEqual(["sh000000"]);

    expect(SinaCommonCodeTransform.transforms(["HK000000"]))
      .toStrictEqual(["hk000000"]);

    expect(SinaCommonCodeTransform.transforms(["US000000"]))
      .toStrictEqual(["gb_000000"]);

    expect(() => SinaCommonCodeTransform.transforms(["000000"]))
      .toThrow(new Error(ERROR_COMMON_CODE));
  });
});
