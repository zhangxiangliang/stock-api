// Stock
const NeteaseCommonCodeTransform = require("stocks/netease/transforms/common-code").default;

describe("【网易】统一代码转换股票代码", () => {
  const {
    ERROR_COMMON_CODE,
  } = require("utils/constant");

  it("深交所统一代码转换股票代码", async () => {
    expect(() => (new NeteaseCommonCodeTransform()).SZTransform("STOCKAPI"))
      .toThrow(new Error(ERROR_COMMON_CODE));

    expect((new NeteaseCommonCodeTransform()).SZTransform("SZ000000"))
      .toBe("1000000");
  });

  it("上交所统一代码转换股票代码", async () => {
    expect(() => (new NeteaseCommonCodeTransform()).SHTransform("STOCKAPI"))
      .toThrow(new Error(ERROR_COMMON_CODE));

    expect((new NeteaseCommonCodeTransform()).SHTransform("SH000000"))
      .toBe("0000000");
  });

  it("港交所统一代码转换股票代码", async () => {
    expect(() => (new NeteaseCommonCodeTransform()).HKTransform("STOCKAPI"))
      .toThrow(new Error(ERROR_COMMON_CODE));

    expect((new NeteaseCommonCodeTransform()).HKTransform("HK000000"))
      .toBe("hk000000");
  });

  it("美交所统一代码转换股票代码", async () => {
    expect(() => (new NeteaseCommonCodeTransform()).USTransform("STOCKAPI"))
      .toThrow(new Error(ERROR_COMMON_CODE));

    expect((new NeteaseCommonCodeTransform()).USTransform("US000000"))
      .toBe("US_000000");
  });

  it("交易所统一代码转换股票代码", async () => {
    expect((new NeteaseCommonCodeTransform()).transform("SZ000000"))
      .toBe("1000000");

    expect((new NeteaseCommonCodeTransform()).transform("SH000000"))
      .toBe("0000000");

    expect((new NeteaseCommonCodeTransform()).transform("HK000000"))
      .toBe("hk000000");

    expect((new NeteaseCommonCodeTransform()).transform("US000000"))
      .toBe("US_000000");

    expect(() => (new NeteaseCommonCodeTransform()).transform("STOCKAPI"))
      .toThrow(new Error(ERROR_COMMON_CODE));
  });

  it("交易所统一代码组转换股票代码组", async () => {
    expect((new NeteaseCommonCodeTransform()).transforms(["SZ000000"]))
      .toStrictEqual(["1000000"]);

    expect((new NeteaseCommonCodeTransform()).transforms(["SH000000"]))
      .toStrictEqual(["0000000"]);

    expect((new NeteaseCommonCodeTransform()).transforms(["HK000000"]))
      .toStrictEqual(["hk000000"]);

    expect((new NeteaseCommonCodeTransform()).transforms(["US000000"]))
      .toStrictEqual(["US_000000"]);

    expect(() => (new NeteaseCommonCodeTransform()).transforms(["STOCKAPI"]))
      .toThrow(new Error(ERROR_COMMON_CODE));
  });
});
