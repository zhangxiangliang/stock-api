// Stock
const TencentApiCodeTransform = require("stocks/tencent/transforms/api-code").default;

describe("【腾讯】股票代码转换统一代码", () => {
  const {
    ERROR_API_CODE,
  } = require("utils/constant");

  it("深交所股票代码转换统一代码", async () => {
    expect(() => (new TencentApiCodeTransform()).SZTransform("STOCKAPI"))
      .toThrow(new Error(ERROR_API_CODE));

    expect((new TencentApiCodeTransform()).SZTransform("sz000000"))
      .toBe("SZ000000");
  });

  it("上交所股票代码转换统一代码", async () => {
    expect(() => (new TencentApiCodeTransform()).SHTransform("STOCKAPI"))
      .toThrow(new Error(ERROR_API_CODE));

    expect((new TencentApiCodeTransform()).SHTransform("sh000000"))
      .toBe("SH000000");
  });

  it("港交所股票代码转换统一代码", async () => {
    expect(() => (new TencentApiCodeTransform()).HKTransform("STOCKAPI"))
      .toThrow(new Error(ERROR_API_CODE));

    expect((new TencentApiCodeTransform()).HKTransform("hk000000"))
      .toBe("HK000000");
  });

  it("美交所股票代码转换统一代码", async () => {
    expect(() => (new TencentApiCodeTransform()).USTransform("STOCKAPI"))
      .toThrow(new Error(ERROR_API_CODE));

    expect((new TencentApiCodeTransform()).USTransform("us000000"))
      .toBe("US000000");
  });

  it("交易所股票代码转换统一代码", async () => {
    expect((new TencentApiCodeTransform()).transform("sz000000"))
      .toBe("SZ000000");

    expect((new TencentApiCodeTransform()).transform("sh000000"))
      .toBe("SH000000");

    expect((new TencentApiCodeTransform()).transform("hk000000"))
      .toBe("HK000000");

    expect((new TencentApiCodeTransform()).transform("us000000"))
      .toBe("US000000");

    expect(() => (new TencentApiCodeTransform()).transform("STOCKAPI"))
      .toThrow(new Error(ERROR_API_CODE));
  });

  it("交易所股票代码组转换统一代码组", async () => {
    expect((new TencentApiCodeTransform()).transforms(["sz000000"]))
      .toStrictEqual(["SZ000000"]);

    expect((new TencentApiCodeTransform()).transforms(["sh000000"]))
      .toStrictEqual(["SH000000"]);

    expect((new TencentApiCodeTransform()).transforms(["hk000000"]))
      .toStrictEqual(["HK000000"]);

    expect((new TencentApiCodeTransform()).transforms(["us000000"]))
      .toStrictEqual(["US000000"]);

    expect(() => (new TencentApiCodeTransform()).transforms(["STOCKAPI"]))
      .toThrow(new Error(ERROR_API_CODE));
  });
});
