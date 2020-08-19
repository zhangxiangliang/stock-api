// Stock
const Base = require("stocks/base").default;

describe("【基础】股票代码接口", () => {
  it("需要获取的股票代码", async () => {
    await expect(Base.getStock("SZ000000"))
      .rejects
      .toThrow(new Error("未实现获取股票数据"));
  });

  it("需要获取的股票代码组", async () => {
    await expect(Base.getStocks(["SZ000000"]))
      .rejects
      .toThrow(new Error("未实现获取股票数据组"));
  });
});
