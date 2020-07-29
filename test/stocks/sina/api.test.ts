// Stock
import Sina from "../../../src/stocks/sina/api";

describe("【新浪】股票代码接口", () => {
  it("需要获取的股票代码", async () => {
    await expect(new Sina().getStock("SH510500"))
      .resolves
      .toMatchObject({ code: "SH510500", name: "500ETF" });
  });

  it("需要获取的股票组代码", async () => {
    await expect((new Sina()).getStocks(["SH510500"]))
      .resolves
      .toMatchObject([{ code: "SH510500", name: "500ETF" }]);
  });
});
