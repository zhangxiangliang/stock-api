// Stocks
import BaseStockTransform from "@stocks/base/transforms/stock";

// Utils
import { COMMON_SH, COMMON_SZ, COMMON_HK, COMMON_US } from "@stocks/base/utils/constant";

// Types
import Stock from "types/utils/stock";

/**
 * 新浪股票数据解析
 */
class SinaStockTransform extends BaseStockTransform {
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
    switch (this.code.slice(0, 2)) {
      case COMMON_SH:
        return String(this.params[0]);
      case COMMON_SZ:
        return String(this.params[0]);
      case COMMON_HK:
        return String(this.params[1]);
      case COMMON_US:
        return String(this.params[0]);
      default:
        throw new Error('不支持当前交易所');
    }
  }

  /**
   * 获取现价
   */
  getNow(): number {
    switch (this.code.slice(0, 2)) {
      case COMMON_SH:
        return Number(this.params[3]);
      case COMMON_SZ:
        return Number(this.params[3]);
      case COMMON_HK:
        return Number(this.params[6]);
      case COMMON_US:
        return Number(this.params[1]);
      default:
        throw new Error('不支持当前交易所');
    }
  }

  /**
   * 获取最低价
   */
  getLow(): number {
    switch (this.code.slice(0, 2)) {
      case COMMON_SH:
        return Number(this.params[5]);
      case COMMON_SZ:
        return Number(this.params[5]);
      case COMMON_HK:
        return Number(this.params[5]);
      case COMMON_US:
        return Number(this.params[7]);
      default:
        throw new Error('不支持当前交易所');
    }
  }

  /**
   * 获取最高价
   */
  getHigh(): number {
    switch (this.code.slice(0, 2)) {
      case COMMON_SH:
        return Number(this.params[4]);
      case COMMON_SZ:
        return Number(this.params[4]);
      case COMMON_HK:
        return Number(this.params[4]);
      case COMMON_US:
        return Number(this.params[6]);
      default:
        throw new Error('不支持当前交易所');
    }
  }

  /**
   * 获取昨日收盘价
   */
  getYesterday(): number {
    switch (this.code.slice(0, 2)) {
      case COMMON_SH:
        return Number(this.params[2]);
      case COMMON_SZ:
        return Number(this.params[2]);
      case COMMON_HK:
        return Number(this.params[3]);
      case COMMON_US:
        return Number(this.params[26]);
      default:
        throw new Error('不支持当前交易所');
    }
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

export default SinaStockTransform;
