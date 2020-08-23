// Stock
const Tencent = require("stocks/tencent").default;

describe("【腾讯】股票代码接口", () => {
  const {
    ERROR_UNDEFINED_SEARCH_STOCK,
  } = require("utils/constant");

  it("需要获取的股票代码", async () => {
    await expect(Tencent.getStock("SH510500"))
      .resolves
      .toMatchObject({ code: "SH510500", name: "500ETF" });

    await expect(Tencent.getStock("SZ510500"))
      .resolves
      .toMatchObject({ code: "SZ510500", name: "---" });
  });

  it("需要获取的股票代码组", async () => {
    await expect(Tencent.getStocks(["SH510500"]))
      .resolves
      .toMatchObject([{ code: "SH510500", name: "500ETF" }]);

    await expect(Tencent.getStocks(["SZ510500"]))
      .resolves
      .toMatchObject([{ code: "SZ510500", name: "---" }]);

    await expect(Tencent.getStocks([]))
      .resolves
      .toMatchObject([]);
  });

  it("搜索股票代码", async () => {
    await expect(Tencent.searchStocks("510500"))
      .resolves
      .toMatchObject([{ code: "SH510500", name: "500ETF" }]);

    await expect(Tencent.searchStocks("苹果"))
      .resolves
      .toMatchObject([{ code: "USaapl", name: "苹果" }]);

    await expect(Tencent.searchStocks("腾讯控股"))
      .resolves
      .toMatchObject([
        { code: expect.stringMatching("[HK00700|UStcehy]"), name: expect.stringMatching("腾讯控股") },
        { code: expect.stringMatching("[HK00700|UStcehy]"), name: expect.stringMatching("腾讯控股") },
      ]);
  });
});
