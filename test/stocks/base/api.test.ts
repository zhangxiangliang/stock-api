// Stock
import Base from "../../../src/stocks/base/api";

describe("【基础】股票代码接口", () => {
  it("需要获取的股票代码", async () => {
    await expect(new Base().getStock("SZ000000"))
      .rejects
      .toThrow(new Error("未实现获取股票数据"));
  });

  it("需要获取的股票组代码", async () => {
    await expect(new Base().getStocks(["SZ000000"]))
      .rejects
      .toThrow(new Error("未实现获取股票组数据"));
  });
});
