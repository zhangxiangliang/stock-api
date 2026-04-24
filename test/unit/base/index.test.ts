// Stock
const Base = require("stocks/base").default;

describe("【基础】股票代码接口", () => {
  const {
    ERROR_UNDEFINED_GET_STOCK,
    ERROR_UNDEFINED_GET_STOCKS,
    ERROR_UNDEFINED_SEARCH_STOCK,
  } = require("utils/constant");

  it("需要获取的股票代码", async () => {
    await expect(Base.getStock("SZ000000"))
      .rejects
      .toThrow(new Error(ERROR_UNDEFINED_GET_STOCK));
  });

  it("需要获取的股票代码组", async () => {
    await expect(Base.getStocks(["SZ000000"]))
      .rejects
      .toThrow(new Error(ERROR_UNDEFINED_GET_STOCKS));
  });

  it("搜索股票代码", async () => {
    await expect(Base.searchStocks("510500"))
      .rejects
      .toThrow(new Error(ERROR_UNDEFINED_SEARCH_STOCK));
  });
});
