// Stock
const Sina = require("stocks/sina").default;

describe("【新浪】股票代码接口", () => {
  it("需要获取的股票代码", async () => {
    await expect(Sina.getStock("SH510500"))
      .resolves
      .toMatchObject({ code: "SH510500", name: "500ETF" });
    await expect(Sina.getStock("SZ510500"))
      .resolves
      .toMatchObject({ code: "SZ510500", name: "---" });
  });

  it("需要获取的股票代码组", async () => {
    await expect(Sina.getStocks(["SH510500"]))
      .resolves
      .toMatchObject([{ code: "SH510500", name: "500ETF" }]);

    await expect(Sina.getStocks([]))
      .resolves
      .toMatchObject([]);

    await expect(Sina.getStocks(["SZ510500"]))
      .resolves
      .toMatchObject([{ code: "SZ510500", name: "---" }]);
  });

  it("搜索股票代码", async () => {
    await expect(Sina.searchStocks("510500"))
      .resolves
      .toMatchObject([{ code: "SZ510500", name: "---" }, { code: "SH510500", name: "500ETF" }]);

    await expect(Sina.searchStocks("苹果"))
      .resolves
      .toMatchObject([{ code: "USaapl", name: "苹果" }]);

    await expect(Sina.searchStocks("腾讯控股"))
      .resolves
      .toMatchObject([{ code: "HK00700", name: "腾讯控股" }]);


    await expect(Sina.searchStocks("000001"))
      .resolves
      .toMatchObject([
        { code: expect.stringMatching("000001$"), name: expect.stringMatching("[平安银行|上证指数]") },
        { code: expect.stringMatching("000001$"), name: expect.stringMatching("[平安银行|上证指数]") },
      ]);
  });
});
