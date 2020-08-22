// Stock
const XueqiuApiCodeTransform = require("stocks/xueqiu/transforms/api-code").default;

describe("【雪球】股票代码转换统一代码", () => {
  const {
    ERROR_API_CODE,
  } = require("utils/constant");

  it("深交所股票代码转换统一代码", async () => {
    expect(() => (new XueqiuApiCodeTransform()).SZTransform("000000"))
      .toThrow(new Error(ERROR_API_CODE));

    expect((new XueqiuApiCodeTransform()).SZTransform("SZ000000"))
      .toBe("SZ000000");
  });

  it("上交所股票代码转换统一代码", async () => {
    expect(() => (new XueqiuApiCodeTransform()).SHTransform("000000"))
      .toThrow(new Error(ERROR_API_CODE));

    expect((new XueqiuApiCodeTransform()).SHTransform("SH000000"))
      .toBe("SH000000");
  });

  it("港交所股票代码转换统一代码", async () => {
    expect(() => (new XueqiuApiCodeTransform()).HKTransform("000000"))
      .toThrow(new Error(ERROR_API_CODE));

    expect((new XueqiuApiCodeTransform()).HKTransform("HK000000"))
      .toBe("HK000000");
  });

  it("美交所股票代码转换统一代码", async () => {
    expect(() => (new XueqiuApiCodeTransform()).USTransform("SZ000000"))
      .toThrow(new Error(ERROR_API_CODE));

    expect((new XueqiuApiCodeTransform()).USTransform("000000"))
      .toBe("US000000");
  });

  it("交易所股票代码转换统一代码", async () => {
    expect((new XueqiuApiCodeTransform()).transform("SZ000000"))
      .toBe("SZ000000");

    expect((new XueqiuApiCodeTransform()).transform("SH000000"))
      .toBe("SH000000");

    expect((new XueqiuApiCodeTransform()).transform("HK000000"))
      .toBe("HK000000");

    expect((new XueqiuApiCodeTransform()).transform("000000"))
      .toBe("US000000");
  });

  it("交易所股票代码组转换统一代码组", async () => {
    expect((new XueqiuApiCodeTransform()).transforms(["SZ000000"]))
      .toStrictEqual(["SZ000000"]);

    expect((new XueqiuApiCodeTransform()).transforms(["SH000000"]))
      .toStrictEqual(["SH000000"]);

    expect((new XueqiuApiCodeTransform()).transforms(["HK000000"]))
      .toStrictEqual(["HK000000"]);

    expect((new XueqiuApiCodeTransform()).transforms(["000000"]))
      .toStrictEqual(["US000000"]);
  });
});
