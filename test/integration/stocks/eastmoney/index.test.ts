const Eastmoney = require("stocks/eastmoney").default;

describe("【东方财富】股票代码接口", () => {
  it("需要获取的股票代码", async () => {
    await expect(Eastmoney.getStock("SH600519")).resolves.toMatchObject({
      code: "SH600519",
      name: expect.any(String),
      now: expect.any(Number),
      yesterday: expect.any(Number),
    });
  });

  it("需要获取的股票代码组", async () => {
    await expect(Eastmoney.getStocks(["SH600519"])).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "SH600519",
          name: expect.any(String),
          now: expect.any(Number),
          yesterday: expect.any(Number),
        }),
      ])
    );

    await expect(Eastmoney.getStocks([])).resolves.toEqual([]);
  });

  it("搜索股票代码", async () => {
    await expect(Eastmoney.searchStocks("贵州茅台")).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "SH600519", name: "贵州茅台" }),
      ])
    );
  });
});
