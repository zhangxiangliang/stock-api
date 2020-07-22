// Stock
import Netease from "../../../src/stocks/netease/api";

describe("【网易】股票代码接口", () => {
  it("需要获取的股票代码", async () => {
    await expect(new Netease().getStock("SH510500"))
      .resolves
      .toMatchObject({ code: "SH510500", name: "500ETF" });
  });

  it("需要获取的股票组代码", async () => {
    await expect((new Netease()).getStocks(["SH510500"]))
      .resolves
      .toMatchObject([{ code: "SH510500", name: "500ETF" }]);
  });
});
