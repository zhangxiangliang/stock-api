// Utils
import {
  ERROR_UNDEFINED_GET_STOCK,
  ERROR_UNDEFINED_GET_STOCKS,
  ERROR_UNDEFINED_SEARCH_STOCK,
} from "../../utils/constant";

// Types
import Stock from "../../types/utils/stock";
import StockApi from "../../types/stocks/index";

/**
 * 基础股票代码接口
 */
const Base: StockApi = {
  /**
   * 获取股票数据
   * @param code 股票代码
   */
  async getStock(code: string): Promise<Stock> {
    throw new Error(ERROR_UNDEFINED_GET_STOCK);
  },

  /**
   * 获取股票数据组
   * @param codes 股票代码组
   */
  async getStocks(codes: string[]): Promise<Stock[]> {
    throw new Error(ERROR_UNDEFINED_GET_STOCKS);
  },

  /**
   * 搜索股票代码
   * @param key 关键字
   */
  async searchStocks(key: string): Promise<Stock[]> {
    throw new Error(ERROR_UNDEFINED_SEARCH_STOCK);
  },
};

export default Base;
