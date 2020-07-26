// Stocks
import BaseTransform from "../../stocks/base/transform";

// Types
import Stock from "../../../types/stock";

/**
 * 基础股票代码接口
 */
class Base {
  /**
   * 构造函数
   */
  constructor(public transform: BaseTransform) { }

  /**
   * 获取股票数据
   * @param code 需要获取的股票代码
   */
  async getStock(code: string): Promise<Stock> {
    throw new Error("未实现获取股票数据");
  }

  /**
   * 获取股票组数据
   * @param codes 需要获取的股票组代码
   */
  async getStocks(codes: string[]): Promise<Stock[]> {
    throw new Error("未实现获取股票组数据");
  }
}

export default Base;
