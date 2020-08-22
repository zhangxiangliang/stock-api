// Stock
const TencentCommonCodeTransform = require("stocks/tencent/transforms/common-code").default;

describe("【腾讯】统一代码转换股票代码", () => {
  const {
    ERROR_COMMON_CODE,
  } = require("utils/constant");

  it("深交所统一代码转换股票代码", async () => {
    expect(() => (new TencentCommonCodeTransform()).SZTransform("000000"))
      .toThrow(new Error(ERROR_COMMON_CODE));

    expect((new TencentCommonCodeTransform()).SZTransform("SZ000000"))
      .toBe("sz000000");
  });

  it("上交所统一代码转换股票代码", async () => {
    expect(() => (new TencentCommonCodeTransform()).SHTransform("000000"))
      .toThrow(new Error(ERROR_COMMON_CODE));

    expect((new TencentCommonCodeTransform()).SHTransform("SH000000"))
      .toBe("sh000000");
  });

  it("港交所统一代码转换股票代码", async () => {
    expect(() => (new TencentCommonCodeTransform()).HKTransform("000000"))
      .toThrow(new Error(ERROR_COMMON_CODE));

    expect((new TencentCommonCodeTransform()).HKTransform("HK000000"))
      .toBe("hk000000");
  });

  it("美交所统一代码转换股票代码", async () => {
    expect(() => (new TencentCommonCodeTransform()).USTransform("000000"))
      .toThrow(new Error(ERROR_COMMON_CODE));

    expect((new TencentCommonCodeTransform()).USTransform("US000000"))
      .toBe("us000000");
  });

  it("交易所统一代码转换股票代码", async () => {
    expect((new TencentCommonCodeTransform()).transform("SZ000000"))
      .toBe("sz000000");

    expect((new TencentCommonCodeTransform()).transform("SH000000"))
      .toBe("sh000000");

    expect((new TencentCommonCodeTransform()).transform("HK000000"))
      .toBe("hk000000");

    expect((new TencentCommonCodeTransform()).transform("US000000"))
      .toBe("us000000");

    expect(() => (new TencentCommonCodeTransform()).transform("000000"))
      .toThrow(new Error(ERROR_COMMON_CODE));
  });

  it("交易所统一代码组转换股票代码组", async () => {
    expect((new TencentCommonCodeTransform()).transforms(["SZ000000"]))
      .toStrictEqual(["sz000000"]);

    expect((new TencentCommonCodeTransform()).transforms(["SH000000"]))
      .toStrictEqual(["sh000000"]);

    expect((new TencentCommonCodeTransform()).transforms(["HK000000"]))
      .toStrictEqual(["hk000000"]);

    expect((new TencentCommonCodeTransform()).transforms(["US000000"]))
      .toStrictEqual(["us000000"]);

    expect(() => (new TencentCommonCodeTransform()).transforms(["000000"]))
      .toThrow(new Error(ERROR_COMMON_CODE));
  });
});
