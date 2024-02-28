// Stock
const Netease = require("stocks/netease").default;

describe("【网易】股票代码接口", () => {
  it("基础测试", async () => {
    await expect(true).toEqual(true);
  });

  it("需要获取的股票代码", async () => {
    await expect(Netease.getStock("SH510500")).resolves.toMatchObject({
      code: "SH510500",
      name: "500ETF",
    });

    await expect(Netease.getStock("SZ510500")).resolves.toMatchObject({
      code: "SZ510500",
      name: "---",
    });
  });

  it("需要获取的股票代码组", async () => {
    await expect(Netease.getStocks(["SH510500"])).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "SH510500", name: "500ETF" }),
      ])
    );

    await expect(Netease.getStocks(["SZ510500"])).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "SZ510500", name: "---" }),
      ])
    );

    await expect(Netease.getStocks([])).resolves.toEqual([]);
  });

  it("搜索股票代码", async () => {
    await expect(Netease.searchStocks("格力电器")).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "SZ000651", name: "格力电器" }),
      ])
    );

    await expect(Netease.searchStocks("贵州茅台")).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "SH600519", name: "贵州茅台" }),
      ])
    );
  });
});
