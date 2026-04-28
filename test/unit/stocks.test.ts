import stocks, { getSources } from "stocks";

describe("股票数据源入口", () => {
  it("列出可用数据源", () => {
    expect(getSources()).toEqual(["tencent", "sina", "eastmoney"]);
    expect(stocks.getSources()).toEqual(["tencent", "sina", "eastmoney"]);
  });

  it("返回数据源副本", () => {
    const sources = getSources();
    sources.push("sina");

    expect(getSources()).toEqual(["tencent", "sina", "eastmoney"]);
  });

  it("具体数据源导出诊断方法", () => {
    expect(typeof stocks.auto.inspectStock).toBe("function");
    expect(typeof stocks.tencent.inspectStock).toBe("function");
    expect(typeof stocks.sina.inspectStock).toBe("function");
    expect(typeof stocks.eastmoney.inspectStock).toBe("function");
  });
});
