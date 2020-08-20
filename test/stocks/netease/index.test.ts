// Stock
const Netease = require("stocks/netease").default;

describe("【网易】股票代码接口", () => {
  it("需要获取的股票代码", async () => {
    await expect(Netease.getStock("SH510500"))
      .resolves
      .toMatchObject({ code: "SH510500", name: "500ETF" });
  });

  it("需要获取的股票代码组", async () => {
    await expect(Netease.getStocks(["SH510500"]))
      .resolves
      .toMatchObject([{ code: "SH510500", name: "500ETF" }]);
  });

  it("搜索股票代码", async () => {
    await expect(Netease.searchStocks(["510500"]))
      .resolves
      .toMatchObject([{ code: "SH510500", name: "500ETF" }]);
  });
});
