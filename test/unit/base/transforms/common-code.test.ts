// Stock
const BaseCommonCodeTransform = require("stocks/base/transforms/common-code").default;

describe("【基础】统一代码转换股票代码", () => {
  const {
    ERROR_COMMON_CODE,
    ERROR_UNDEFINED_SZ_COMMON_CODE,
    ERROR_UNDEFINED_SH_COMMON_CODE,
    ERROR_UNDEFINED_HK_COMMON_CODE,
    ERROR_UNDEFINED_US_COMMON_CODE
  } = require("utils/constant");

  it("深交所统一代码转换股票代码", async () => {
    expect(() => BaseCommonCodeTransform.SZTransform("SZ000000"))
      .toThrow(new Error(ERROR_UNDEFINED_SZ_COMMON_CODE));
  });

  it("上交所统一代码转换股票代码", async () => {
    expect(() => BaseCommonCodeTransform.SHTransform("SH000000"))
      .toThrow(new Error(ERROR_UNDEFINED_SH_COMMON_CODE));
  });

  it("港交所统一代码转换股票代码", async () => {
    expect(() => BaseCommonCodeTransform.HKTransform("HK000000"))
      .toThrow(new Error(ERROR_UNDEFINED_HK_COMMON_CODE));
  });

  it("美交所统一代码转换股票代码", async () => {
    expect(() => BaseCommonCodeTransform.USTransform("US000000"))
      .toThrow(new Error(ERROR_UNDEFINED_US_COMMON_CODE));
  });

  it("交易所统一代码转换股票代码", async () => {
    expect(() => BaseCommonCodeTransform.transform("000000"))
      .toThrow(new Error(ERROR_COMMON_CODE));

    expect(() => BaseCommonCodeTransform.transform("SZ000000"))
      .toThrow(new Error(ERROR_UNDEFINED_SZ_COMMON_CODE));

    expect(() => BaseCommonCodeTransform.transform("SH000000"))
      .toThrow(new Error(ERROR_UNDEFINED_SH_COMMON_CODE));

    expect(() => BaseCommonCodeTransform.transform("HK000000"))
      .toThrow(new Error(ERROR_UNDEFINED_HK_COMMON_CODE));

    expect(() => BaseCommonCodeTransform.transform("US000000"))
      .toThrow(new Error(ERROR_UNDEFINED_US_COMMON_CODE));
  });

  it("交易所统一代码组转换股票代码组", async () => {
    expect(() => BaseCommonCodeTransform.transforms(["000000"]))
      .toThrow(new Error(ERROR_COMMON_CODE));

    expect(() => BaseCommonCodeTransform.transforms(["SZ000000"]))
      .toThrow(new Error(ERROR_UNDEFINED_SZ_COMMON_CODE));

    expect(() => BaseCommonCodeTransform.transforms(["SH000000"]))
      .toThrow(new Error("未实现上交所统一代码转换股票代码"));

    expect(() => BaseCommonCodeTransform.transforms(["HK000000"]))
      .toThrow(new Error(ERROR_UNDEFINED_HK_COMMON_CODE));

    expect(() => BaseCommonCodeTransform.transforms(["US000000"]))
      .toThrow(new Error(ERROR_UNDEFINED_US_COMMON_CODE));
  });
});
