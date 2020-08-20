// Types
import Stock from "types/utils/stock";
import StockApi from "types/stocks/index";

/**
 * 基础股票代码接口
 */
const Base: StockApi = {
  /**
   * 获取股票数据
   * @param code 股票代码
   */
  async getStock(code: string): Promise<Stock> {
    throw new Error("未实现获取股票数据");
  },

  /**
   * 获取股票数据组
   * @param codes 股票代码组
   */
  async getStocks(codes: string[]): Promise<Stock[]> {
    throw new Error("未实现获取股票数据组");
  },

  /**
   * 搜索股票代码
   * @param key 关键字
   */
  async searchStocks(key: string): Promise<Stock[]> {
    throw new Error("未实现搜索股票代码");
  }
};

export default Base;
