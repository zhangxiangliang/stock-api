// Stock
const Xueqiu = require("stocks/xueqiu").default;

describe("【雪球】股票代码接口", () => {
  it("获取 Token", async () => {
    await expect(new Xueqiu().getToken())
      .resolves
      .toContain('xq_a_token');
  });

  it("需要获取的股票代码", async () => {
    await expect(new Xueqiu().getStock("SH510500"))
      .resolves
      .toMatchObject({ code: "SH510500", name: "中证500ETF" });
  });

  it("需要获取的股票代码组", async () => {
    await expect((new Xueqiu()).getStocks(["SH510500"]))
      .resolves
      .toMatchObject([{ code: "SH510500", name: "中证500ETF" }]);
  });
});
