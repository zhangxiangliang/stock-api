// Types
import Stock from "../../utils/stock";

/**
 * 基础股票数据解析
 */
export interface StockTransform {
  /**
   * 获取代码
   */
  getCode(): string;
  /**
   * 获取名称
   */
  getName(): string;

  /**
   * 获取现价
   */
  getNow(): number;

  /**
   * 获取最低价
   */
  getLow(): number;

  /**
   * 获取最高价
   */
  getHigh(): number;

  /**
   * 获取昨日收盘价
   */
  getYesterday(): number;

  /**
   * 获取涨跌
   */
  getPercent(): number;

  /**
   * 获取股票数据
   */
  getStock(): Stock;
}

export default StockTransform;
