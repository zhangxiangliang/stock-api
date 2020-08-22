// Stock
const Xueqiu = require("stocks/xueqiu").default;

describe("【雪球】股票代码接口", () => {
  it("获取 Token", async () => {
    await expect(Xueqiu.getToken())
      .resolves
      .toContain('xq_a_token');
  });

  it("需要获取的股票代码", async () => {
    await expect(Xueqiu.getStock("SH510500"))
      .resolves
      .toMatchObject({ code: "SH510500", name: "中证500ETF" });

    await expect(Xueqiu.getStock("SZ510500"))
      .resolves
      .toMatchObject({ code: "SZ510500", name: "---" });
  });

  it("需要获取的股票代码组", async () => {
    await expect(Xueqiu.getStocks(["SH510500"]))
      .resolves
      .toMatchObject([{ code: "SH510500", name: "中证500ETF" }]);

    await expect(Xueqiu.getStocks(["SZ510500"]))
      .resolves
      .toMatchObject([{ code: "SZ510500", name: "---" }]);

    await expect(Xueqiu.getStocks([]))
      .resolves
      .toMatchObject([]);
  });

  it("搜索股票代码", async () => {
    await expect(Xueqiu.searchStocks("SH510500"))
      .resolves
      .toMatchObject([{ code: "SH510500", name: "中证500ETF" }]);
  });
});
