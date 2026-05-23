const Eastmoney = require("stocks/eastmoney").default;

describe("【东方财富】股票代码接口", () => {
  it("需要获取的股票代码", async () => {
    const stock = await requestEastmoney(() => Eastmoney.getStock("SH600519"));

    if (!stock) return;

    expect(stock).toMatchObject({
      code: "SH600519",
      name: expect.any(String),
      now: expect.any(Number),
      yesterday: expect.any(Number),
    });
  });

  it("需要获取的股票代码组", async () => {
    const stocks = await requestEastmoney(() => Eastmoney.getStocks(["SH600519"]));

    if (!stocks) return;

    expect(stocks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "SH600519",
          name: expect.any(String),
          now: expect.any(Number),
          yesterday: expect.any(Number),
        }),
      ])
    );

    await expect(Eastmoney.getStocks([])).resolves.toEqual([]);
  });

  it("搜索股票代码", async () => {
    const stocks = await requestEastmoney(() => Eastmoney.searchStocks("贵州茅台"));

    if (!stocks) return;

    expect(stocks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "SH600519", name: "贵州茅台" }),
      ])
    );
  });
});

async function requestEastmoney<T>(request: () => Promise<T>): Promise<T | undefined> {
  try {
    return await request();
  } catch (error) {
    if (isThirdPartyNetworkError(error)) {
      console.warn(`Skip Eastmoney live assertion: ${getErrorMessage(error)}`);
      return undefined;
    }

    throw error;
  }
}

function isThirdPartyNetworkError(error: unknown): boolean {
  const message = getErrorMessage(error);
  return (
    message.includes("fetch failed") ||
    message.includes("timed out") ||
    message.includes("aborted") ||
    message.includes("ECONNRESET") ||
    message.includes("ETIMEDOUT")
  );
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
