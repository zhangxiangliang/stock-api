// Utils
import {
  ERROR_UNDEFINED_GET_STOCK,
  ERROR_UNDEFINED_GET_STOCKS,
  ERROR_UNDEFINED_GET_KLINES,
  ERROR_UNDEFINED_SEARCH_STOCK,
} from "../../utils/constant";

// Types
import Kline, { KlineOptions } from "../../types/utils/kline";
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
  async getStock(_code: string): Promise<Stock> {
    throw new Error(ERROR_UNDEFINED_GET_STOCK);
  },

  /**
   * 获取股票数据组
   * @param codes 股票代码组
   */
  async getStocks(_codes: string[]): Promise<Stock[]> {
    throw new Error(ERROR_UNDEFINED_GET_STOCKS);
  },

  /**
   * 获取 K 线数据
   * @param code 股票代码
   */
  async getKlines(_code: string, _options?: KlineOptions): Promise<Kline[]> {
    throw new Error(ERROR_UNDEFINED_GET_KLINES);
  },

  /**
   * 搜索股票代码
   * @param key 关键字
   */
  async searchStocks(_key: string): Promise<Stock[]> {
    throw new Error(ERROR_UNDEFINED_SEARCH_STOCK);
  },
};

export default Base;
