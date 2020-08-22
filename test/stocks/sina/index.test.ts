// Stock
const Sina = require("stocks/sina").default;

describe("【新浪】股票代码接口", () => {
  it("需要获取的股票代码", async () => {
    await expect(Sina.getStock("SH510500"))
      .resolves
      .toMatchObject({ code: "SH510500", name: "500ETF" });
  });

  it("需要获取的股票代码组", async () => {
    await expect(Sina.getStocks(["SH510500"]))
      .resolves
      .toMatchObject([{ code: "SH510500", name: "500ETF" }]);
  });

  it("搜索股票代码", async () => {
    await expect(Sina.searchStocks("510500"))
      .resolves
      .toMatchObject([{ code: "SZ510500", name: "---" }, { code: "SH510500", name: "500ETF" }]);
  });
});
