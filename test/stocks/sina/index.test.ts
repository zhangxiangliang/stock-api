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
    await expect(Sina.searchStocks("格力电器"))
      .resolves
      .toMatchObject([{ code: "SZ000651", name: "格力电器" }]);

    await expect(Sina.searchStocks("贵州茅台"))
      .resolves
      .toMatchObject([{ code: "SH600519", name: "贵州茅台" }]);

    await expect(Sina.searchStocks("安踏体育"))
      .resolves
      .toMatchObject([
        { code: expect.stringMatching(".*[02020|ANPDY].*"), name: expect.stringMatching(".*[安踏体育|\-].*") },
        { code: expect.stringMatching(".*[02020|ANPDY].*"), name: expect.stringMatching(".*[安踏体育|\-].*") },
      ]);
  });
});
