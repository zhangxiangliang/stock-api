// Stock
const Xueqiu = require("stocks/xueqiu").default;

describe("【雪球】股票代码接口", () => {
  it("基础测试", async () => {
    await expect(true).toEqual(true);
  });

  // it("获取 Token", async () => {
  //   await expect(Xueqiu.getToken())
  //     .resolves
  //     .toContain('xq_a_token');
  // });
  // it("需要获取的股票代码", async () => {
  //   await expect(Xueqiu.getStock("SH510500"))
  //     .resolves
  //     .toMatchObject({ code: "SH510500", name: "中证500ETF" });
  //   await expect(Xueqiu.getStock("SZ510500"))
  //     .resolves
  //     .toMatchObject({ code: "SZ510500", name: "---" });
  // });
  // it("需要获取的股票代码组", async () => {
  //   await expect(Xueqiu.getStocks(["SH510500"]))
  //     .resolves
  //     .toEqual(expect.arrayContaining([expect.objectContaining({ code: "SH510500", name: "中证500ETF" })]));
  //   await expect(Xueqiu.getStocks(["SZ510500"]))
  //     .resolves
  //     .toEqual(expect.arrayContaining([expect.objectContaining({ code: "SZ510500", name: "---" })]));
  //   await expect(Xueqiu.getStocks([]))
  //     .resolves
  //     .toEqual([]);
  // });
  // it("搜索股票代码", async () => {
  //   await expect(Xueqiu.searchStocks("格力电器"))
  //     .resolves
  //     .toEqual(expect.arrayContaining([expect.objectContaining({ code: "SZ000651", name: "格力电器" })]));
  //   await expect(Xueqiu.searchStocks("贵州茅台"))
  //     .resolves
  //     .toEqual(expect.arrayContaining([expect.objectContaining({ code: "SH600519", name: "贵州茅台" })]));
  //   await expect(Xueqiu.searchStocks("安踏体育"))
  //     .resolves
  //     .toEqual(expect.arrayContaining([
  //       expect.objectContaining({ code: "HK02020", name: "安踏体育" }),
  //       expect.objectContaining({ code: "USANPDY", name: "安踏体育ADR" }),
  //     ]));
  // });
});
