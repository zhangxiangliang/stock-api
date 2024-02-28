// Stocks
import BaseStockTransform from "../../../stocks/base/transforms/stock";

// Utils
import { DEFAULT_STRING, DEFAULT_NUMBER } from "../../../utils/constant";

// Types
import Stock from "../../../types/utils/stock";
import Dictionary from "../../../types/utils/dictionary";

/**
 * 网易股票数据解析
 */
class NeteaseStockTransform extends BaseStockTransform {
  /**
   * 构造函数
   */
  constructor(public code: string, public params: Dictionary<number | string>) {
    super();
  }

  /**
   * 获取代码
   */
  getCode(): string {
    return String(this.code).toUpperCase();
  }

  /**
   * 获取名称
   */
  getName(): string {
    return String(this.params.name || DEFAULT_STRING);
  }

  /**
   * 获取现价
   */
  getNow(): number {
    return Number(this.params.price || DEFAULT_NUMBER);
  }

  /**
   * 获取最低价
   */
  getLow(): number {
    return Number(this.params.low || DEFAULT_NUMBER);
  }

  /**
   * 获取最高价
   */
  getHigh(): number {
    return Number(this.params.high || DEFAULT_NUMBER);
  }

  /**
   * 获取昨日收盘价
   */
  getYesterday(): number {
    return Number(this.params.yestclose || DEFAULT_NUMBER);
  }

  /**
   * 获取涨跌
   */
  getPercent(): number {
    return this.getNow() ? this.getNow() / this.getYesterday() - 1 : 0;
  }

  /**
   * 获取股票数据
   */
  getStock(): Stock {
    return {
      code: this.getCode(),
      name: this.getName(),
      percent: this.getPercent(),

      now: this.getNow(),
      low: this.getLow(),
      high: this.getHigh(),
      yesterday: this.getYesterday(),
    };
  }
}

export default NeteaseStockTransform;
