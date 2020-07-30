// Stock
const Xueqiu = require("stocks/xueqiu").default;

describe("【雪球】股票代码接口", () => {
  it("需要获取的股票代码", async () => {
    await expect(new Xueqiu().getStock("SH510500"))
      .resolves
      .toMatchObject({ code: "SH510500", name: "中证500ETF" });
  });

  it("需要获取的股票组代码", async () => {
    await expect((new Xueqiu()).getStocks(["SH510500"]))
      .resolves
      .toMatchObject([{ code: "SH510500", name: "中证500ETF" }]);
  });
});
