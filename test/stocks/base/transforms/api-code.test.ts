// Stock
const BaseApiCodeTransform = require("stocks/base/transforms/api-code").default;

describe("【基础】股票代码转换统一代码", () => {
  const {
    ERROR_API_CODE,
    ERROR_UNDEFINED_SZ_API_CODE,
    ERROR_UNDEFINED_SH_API_CODE,
    ERROR_UNDEFINED_HK_API_CODE,
    ERROR_UNDEFINED_US_API_CODE
  } = require("utils/constant");

  it("深交所股票代码转换统一代码", async () => {
    expect(() => (new BaseApiCodeTransform()).SZTransform("SZ000000"))
      .toThrow(new Error(ERROR_UNDEFINED_SZ_API_CODE));
  });

  it("上交所股票代码转换统一代码", async () => {
    expect(() => (new BaseApiCodeTransform()).SHTransform("SH000000"))
      .toThrow(new Error(ERROR_UNDEFINED_SH_API_CODE));
  });

  it("港交所股票代码转换统一代码", async () => {
    expect(() => new BaseApiCodeTransform().HKTransform("HK000000"))
      .toThrow(new Error(ERROR_UNDEFINED_HK_API_CODE));
  });

  it("美交所股票代码转换统一代码", async () => {
    expect(() => (new BaseApiCodeTransform()).USTransform("US000000"))
      .toThrow(new Error(ERROR_UNDEFINED_US_API_CODE));
  });

  it("交易所股票代码转换统一代码", async () => {
    expect(() => (new BaseApiCodeTransform()).transform("000000"))
      .toThrow(new Error(ERROR_API_CODE));

    expect(() => (new BaseApiCodeTransform()).transform("SZ000000"))
      .toThrow(new Error(ERROR_UNDEFINED_SZ_API_CODE));

    expect(() => (new BaseApiCodeTransform()).transform("SH000000"))
      .toThrow(new Error(ERROR_UNDEFINED_SH_API_CODE));

    expect(() => (new BaseApiCodeTransform()).transform("HK000000"))
      .toThrow(new Error(ERROR_UNDEFINED_HK_API_CODE));

    expect(() => (new BaseApiCodeTransform()).transform("US000000"))
      .toThrow(new Error(ERROR_UNDEFINED_US_API_CODE));
  });

  it("交易所股票代码组转换统一代码组", async () => {
    expect(() => (new BaseApiCodeTransform()).transforms(["000000"]))
      .toThrow(new Error(ERROR_API_CODE));

    expect(() => (new BaseApiCodeTransform()).transforms(["SZ000000"]))
      .toThrow(new Error(ERROR_UNDEFINED_SZ_API_CODE));

    expect(() => (new BaseApiCodeTransform()).transforms(["SH000000"]))
      .toThrow(new Error(ERROR_UNDEFINED_SH_API_CODE));

    expect(() => (new BaseApiCodeTransform()).transforms(["HK000000"]))
      .toThrow(new Error(ERROR_UNDEFINED_HK_API_CODE));

    expect(() => (new BaseApiCodeTransform()).transforms(["US000000"]))
      .toThrow(new Error(ERROR_UNDEFINED_US_API_CODE));
  });
});
