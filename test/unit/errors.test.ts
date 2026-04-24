import {
  StockApiError,
  StockCodeError,
  StockParseError,
  StockRequestError,
} from "../../src/errors";

describe("错误类型", () => {
  it("保留 Error 行为并提供明确类型", () => {
    expect(new StockRequestError("request")).toBeInstanceOf(StockApiError);
    expect(new StockCodeError("code")).toBeInstanceOf(StockApiError);
    expect(new StockParseError("parse")).toBeInstanceOf(StockApiError);
    expect(new StockCodeError("code").message).toBe("code");
  });
});
