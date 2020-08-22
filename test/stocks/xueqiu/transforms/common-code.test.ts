// Stock
const XueqiuCommonCodeTransform = require("stocks/xueqiu/transforms/common-code").default;

describe("【雪球】统一代码转换股票代码", () => {
  const {
    ERROR_COMMON_CODE,
  } = require("utils/constant");

  it("深交所统一代码转换股票代码", async () => {
    expect(() => (new XueqiuCommonCodeTransform()).SZTransform("000000"))
      .toThrow(new Error(ERROR_COMMON_CODE));

    expect((new XueqiuCommonCodeTransform()).SZTransform("SZ000000"))
      .toBe("SZ000000");
  });

  it("上交所统一代码转换股票代码", async () => {
    expect(() => (new XueqiuCommonCodeTransform()).SHTransform("000000"))
      .toThrow(new Error(ERROR_COMMON_CODE));

    expect((new XueqiuCommonCodeTransform()).SHTransform("SH000000"))
      .toBe("SH000000");
  });

  it("港交所统一代码转换股票代码", async () => {
    expect(() => (new XueqiuCommonCodeTransform()).HKTransform("000000"))
      .toThrow(new Error(ERROR_COMMON_CODE));

    expect((new XueqiuCommonCodeTransform()).HKTransform("HK000000"))
      .toBe("HK000000");
  });

  it("美交所统一代码转换股票代码", async () => {
    expect(() => (new XueqiuCommonCodeTransform()).USTransform("000000"))
      .toThrow(new Error(ERROR_COMMON_CODE));

    expect((new XueqiuCommonCodeTransform()).USTransform("US000000"))
      .toBe("000000");
  });

  it("交易所统一代码转换股票代码", async () => {
    expect((new XueqiuCommonCodeTransform()).transform("SZ000000"))
      .toBe("SZ000000");

    expect((new XueqiuCommonCodeTransform()).transform("SH000000"))
      .toBe("SH000000");

    expect((new XueqiuCommonCodeTransform()).transform("HK000000"))
      .toBe("HK000000");

    expect((new XueqiuCommonCodeTransform()).transform("US000000"))
      .toBe("000000");

    expect(() => (new XueqiuCommonCodeTransform()).transform("000000"))
      .toThrow(new Error(ERROR_COMMON_CODE));
  });

  it("交易所统一代码组转换股票代码组", async () => {
    expect((new XueqiuCommonCodeTransform()).transforms(["SZ000000"]))
      .toStrictEqual(["SZ000000"]);

    expect((new XueqiuCommonCodeTransform()).transforms(["SH000000"]))
      .toStrictEqual(["SH000000"]);

    expect((new XueqiuCommonCodeTransform()).transforms(["HK000000"]))
      .toStrictEqual(["HK000000"]);

    expect((new XueqiuCommonCodeTransform()).transforms(["US000000"]))
      .toStrictEqual(["000000"]);

    expect(() => (new XueqiuCommonCodeTransform()).transforms(["000000"]))
      .toThrow(new Error(ERROR_COMMON_CODE));
  });
});
