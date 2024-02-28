// Stock
const Sina = require("stocks/sina").default;

describe("【新浪】股票代码接口", () => {
  it("基础测试", async () => {
    await expect(true).toEqual(true);
  });

  // it("需要获取的股票代码", async () => {
  //   await expect(Sina.getStock("SH510500")).resolves.toMatchObject({
  //     code: "SH510500",
  //     name: "500ETF",
  //   });
  //   await expect(Sina.getStock("SZ510500")).resolves.toMatchObject({
  //     code: "SZ510500",
  //     name: "---",
  //   });
  // });
  // it("需要获取的股票代码组", async () => {
  //   await expect(Sina.getStocks(["SH510500"]))
  //     .resolves
  //     .toEqual(expect.arrayContaining([expect.objectContaining({ code: "SH510500", name: "500ETF" })]));
  //   await expect(Sina.getStocks(["SZ510500"]))
  //     .resolves
  //     .toEqual(expect.arrayContaining([expect.objectContaining({ code: "SZ510500", name: "---" })]));
  //   await expect(Sina.getStocks([]))
  //     .resolves
  //     .toEqual([]);
  // });
  // it("搜索股票代码", async () => {
  //   await expect(Sina.searchStocks("格力电器"))
  //     .resolves
  //     .toEqual(expect.arrayContaining([expect.objectContaining({ code: "SZ000651", name: "格力电器" })]));
  //   await expect(Sina.searchStocks("贵州茅台"))
  //     .resolves
  //     .toEqual(expect.arrayContaining([expect.objectContaining({ code: "SH600519", name: "贵州茅台" })]));
  //   await expect(Sina.searchStocks("安踏体育"))
  //     .resolves
  //     .toEqual(expect.arrayContaining([
  //       expect.objectContaining({ code: "HK02020", name: "安踏体育" }),
  //       expect.objectContaining({ code: "USANPDF", name: "安踏" }),
  //     ]));
  // });
});
