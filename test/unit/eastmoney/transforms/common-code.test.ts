const EastmoneyCommonCodeTransform = require("stocks/eastmoney/transforms/common-code").default;

describe("【东方财富】统一代码转换测试", () => {
  it("转换 A 股代码", () => {
    expect(EastmoneyCommonCodeTransform.transform("SH600519")).toBe("1.600519");
    expect(EastmoneyCommonCodeTransform.transform("SZ000001")).toBe("0.000001");
    expect(EastmoneyCommonCodeTransform.transforms(["SH600519", "SZ000001"])).toStrictEqual([
      "1.600519",
      "0.000001",
    ]);
  });

  it("不支持未知市场和暂未启用的市场", () => {
    expect(() => EastmoneyCommonCodeTransform.transform("HK00700")).toThrow();
    expect(() => EastmoneyCommonCodeTransform.transform("USMSFT")).toThrow();
  });
});
