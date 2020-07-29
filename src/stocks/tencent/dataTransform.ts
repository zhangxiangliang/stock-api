// Stocks
import BaseDataTransform from "@stocks/base/dataTransform";

// Types
import { Stock } from "types/stock";

/**
 * 腾讯股票数据解析
 */
class TencentDataTransform extends BaseDataTransform {
  /**
   * 构造函数
   */
  constructor(public code: string, public params: string[]) {
    super();
  }

  /**
   * 获取代码
   */
  getCode(): string {
    return String(this.code);
  }

  /**
   * 获取名称
   */
  getName(): string {
    return String(this.params[1]);
  }

  /**
   * 获取现价
   */
  getNow(): number {
    return Number(this.params[3]);
  }

  /**
   * 获取最低价
   */
  getLow(): number {
    return Number(this.params[34]);
  }

  /**
   * 获取最高价
   */
  getHigh(): number {
    return Number(this.params[33]);
  }

  /**
   * 获取昨日收盘价
   */
  getYesterday(): number {
    return Number(this.params[4]);
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

export default TencentDataTransform;
