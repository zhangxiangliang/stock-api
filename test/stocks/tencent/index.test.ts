// Stock
const Tencent = require("stocks/tencent").default;

describe("【腾讯】股票代码接口", () => {
  it("需要获取的股票代码", async () => {
    await expect(new Tencent().getStock("SH510500"))
      .resolves
      .toMatchObject({ code: "SH510500", name: "500ETF" });
  });

  it("需要获取的股票代码组", async () => {
    await expect((new Tencent()).getStocks(["SH510500"]))
      .resolves
      .toMatchObject([{ code: "SH510500", name: "500ETF" }]);
  });
});
